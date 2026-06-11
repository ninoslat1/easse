import { combine_bytes, normalize_string, collect_tree_paths } from "../shared/ffi";
import { ptr } from "bun:ffi";

export class DataHashModule {
  private memo = new WeakMap<object, string>();
  private mode: "md5" | "sha256" | "xxhash" = "md5";
  private NODE_ENTRY_SIZE = 16;
  private MAX_NODES = 4096;
  private PATH_BUF_SIZE = 65536;

  constructor(mode: "md5" | "sha256" | "xxhash" = "xxhash") {
    this.mode = mode ?? "xxhash";
  }

  public hashValue(val: any): string {
    if (this.mode === "xxhash") {
      if (val instanceof Uint8Array) return Bun.hash.xxHash3(val).toString(16);

      const input = typeof val === "object" ? JSON.stringify(val) : String(val);
      return Bun.hash.xxHash3(input).toString(16);
    }

    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    return new Bun.CryptoHasher(this.mode).update(str).digest("hex");
  }

  public hashMerkleNodesV2(hashes: string[]): string {
    if (hashes.length === 0) return "";

    const byteArrays = hashes.map((h) => Buffer.from(h, "hex"));
    const totalLength = byteArrays.reduce((acc, b) => acc + b.length, 0);

    const outBuf = Buffer.alloc(totalLength);
    const outLen = new BigInt64Array(1);

    const ptrBuf = new BigUint64Array(byteArrays.length);
    const lenBuf = new BigUint64Array(byteArrays.length);
    byteArrays.forEach((b, i) => {
      ptrBuf[i] = BigInt(ptr(b));
      lenBuf[i] = BigInt(b.length);
    });

    combine_bytes(ptr(ptrBuf), ptr(lenBuf), byteArrays.length, ptr(outBuf), ptr(outLen));

    const combined = outBuf.subarray(0, Number(outLen[0]));

    if (this.mode === "xxhash") return Bun.hash.xxHash3(combined).toString(16);
    return new Bun.CryptoHasher(this.mode).update(combined).digest("hex");
  }

  public hashMerkleNodes(hashes: string[]): string {
    if (hashes.length === 0) return "";

    const byteArrays = hashes.map((h) => Buffer.from(h, "hex"));
    const totalLength = byteArrays.reduce((acc, curr) => acc + curr.length, 0);

    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of byteArrays) {
      combined.set(arr, offset);
      offset += arr.length;
    }

    if (this.mode === "xxhash") {
      return Bun.hash.xxHash3(combined).toString(16);
    }
    return new Bun.CryptoHasher(this.mode).update(combined).digest("hex");
  }

  public generateTreeMap(
    obj: any,
    path = "",
    map = new Map<string, string>(),
  ): Map<string, string> {
    if (typeof obj === "object" && obj !== null) {
      if (this.memo.has(obj)) {
        map.set(path, this.memo.get(obj)!);
        return map;
      }
    }

    const childHash: string[] = [];
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        this.generateTreeMap(value, currentPath, map);
        childHash.push(map.get(currentPath)!);
      } else {
        const h = this.hashValue(value);
        map.set(currentPath, h);
        childHash.push(h);
      }
    }

    const finalHash = this.hashMerkleNodes(childHash);
    map.set(path || "root", finalHash);

    if (typeof obj === "object" && obj !== null) {
      this.memo.set(obj, finalHash);
    }

    return map;
  }

  public generateTreeMapV2(
    obj: any,
    path = "",
    map = new Map<string, string>(),
  ): Map<string, string> {
    if (typeof obj === "object" && obj !== null) {
      if (this.memo.has(obj)) {
        map.set(path, this.memo.get(obj)!);
        return map;
      }
    }

    // Serialize obj to JSON for Zig
    const json = Buffer.from(JSON.stringify(obj), "utf8");

    // Allocate buffers
    const entriesBuf = Buffer.alloc(this.MAX_NODES * this.NODE_ENTRY_SIZE);
    const outCount = Buffer.alloc(4); // u32
    const pathBuf = Buffer.alloc(this.PATH_BUF_SIZE);
    const pathBufUsed = Buffer.alloc(4); // u32

    const ok = collect_tree_paths(
      ptr(json),
      json.length,
      ptr(entriesBuf),
      ptr(outCount),
      ptr(pathBuf),
      this.PATH_BUF_SIZE,
      ptr(pathBufUsed),
    );

    if (ok !== 0) {
      // fallback to pure JS on error
      return this.generateTreeMap(obj, path, map);
    }

    const count = outCount.readUInt32LE(0);

    // Now hash leaves and build merkle bottom-up
    const hashCache = new Map<string, string>();

    for (let i = 0; i < count; i++) {
      const offset = i * this.NODE_ENTRY_SIZE;
      // Read path from flat buffer
      const pathLen = entriesBuf.readUInt32LE(offset + 8);
      const pathStart = Number(entriesBuf.readBigUInt64LE(offset)) - Number(BigInt(ptr(pathBuf)));
      const nodePath = pathBuf.subarray(pathStart, pathStart + pathLen).toString("utf8") || "root";
      const isLeaf = entriesBuf.readUInt8(offset + 12) === 1;

      if (isLeaf) {
        const value = this.getValueByPath(obj, nodePath);
        const h = this.hashValue(value);
        map.set(nodePath, h);
        hashCache.set(nodePath, h);
      }
    }

    this.buildInternalHashes(obj, path || "root", map);

    if (typeof obj === "object" && obj !== null) {
      this.memo.set(obj, map.get(path || "root")!);
    }

    return map;
  }

  private buildInternalHashes(obj: any, path: string, map: Map<string, string>): string {
    const childHashes: string[] = [];

    for (const key in obj) {
      const currentPath = path === "root" ? key : `${path}.${key}`;
      const value = obj[key];

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const childHash = this.buildInternalHashes(value, currentPath, map);
        childHashes.push(childHash);
      } else {
        const h = map.get(currentPath) ?? this.hashValue(value);
        childHashes.push(h);
      }
    }

    const finalHash = this.hashMerkleNodesV2(childHashes);
    map.set(path, finalHash);
    return finalHash;
  }

  hashLargePayload(data: string | Buffer): string {
    if (this.mode === "xxhash") {
      return this.hashValue(data);
    }
    const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return new Bun.CryptoHasher("md5").update(input).digest("hex");
  }

  public getDeltaLazy(oldObj: any, newObj: any, path = ""): any {
    if (oldObj === newObj) return null;

    if (typeof oldObj !== typeof newObj || typeof newObj !== "object" || newObj === null) {
      return newObj;
    }

    const delta: any = {};
    let hasChanged = false;

    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;

      const childDelta = this.getDeltaLazy(oldObj[key], newObj[key], currentPath);

      if (childDelta !== null) {
        delta[key] = childDelta;
        hasChanged = true;
      }
    }

    return hasChanged ? delta : null;
  }

  public getDelta(oldMap: Map<string, string>, newMap: Map<string, string>, newObj: any): any {
    const delta: any = {};
    let hasChanged = false;

    newMap.forEach((hash, path) => {
      if (path === "root") return;
      if (oldMap.get(path) !== hash) {
        this.setValueByPath(delta, path, this.getValueByPath(newObj, path));
        hasChanged = true;
      }
    });

    return hasChanged ? delta : null;
  }

  private getValueByPath(obj: any, path: string) {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  private setValueByPath(obj: any, path: string, value: any) {
    const parts = path.split(".");
    const last = parts.pop()!;
    const target = parts.reduce((acc, part) => (acc[part] = acc[part] || {}), obj);
    target[last] = value;
  }
}
