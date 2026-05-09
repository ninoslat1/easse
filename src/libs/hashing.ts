export class DataHashModule {
  private memo = new WeakMap<object, string>();
  private mode: "md5" | "sha256" | "xxhash" = "md5";

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
