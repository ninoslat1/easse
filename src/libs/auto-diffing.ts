import { ptr } from "bun:ffi";
import { normalize_string } from "../shared/ffi";
import { HTMLModule } from "./html";

export class AutoDiffModule {
  constructor(private minifyHtml: HTMLModule) {}

  public shallowCompare(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return a === b;

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    return keysA.every((key) => a[key] === b[key]);
  }

  public deepCompare(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null || typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((val, i) => this.deepCompare(val, b[i]));
    }

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    return keysA.every(
      (key) => Object.prototype.hasOwnProperty.call(b, key) && this.deepCompare(a[key], b[key]),
    );
  }

  public comparePayload(payload: any, minify: boolean = false): string {
    if (payload === null || payload === undefined) return "";

    if (typeof payload === "string") {
      if (minify && this.minifyHtml.isHTML(payload)) {
        return this.minifyHtml.minifyHTML(payload);
      }
      return payload.replace(/\r?\n|\r/g, "").trim();
    }

    if (typeof payload === "object") {
      return JSON.stringify(payload);
    }

    return String(payload);
  }

  public comparePayloadV2(payload: any, minify: boolean = false): string {
    if (payload === null || payload === undefined) return "";

    if (typeof payload === "string") {
      if (minify && this.minifyHtml.isHTML(payload)) {
        return this.minifyHtml.minifyHTML(payload);
      }

      // FFI: strip newlines + trim natively
      const input = Buffer.from(payload, "utf8");
      const out = Buffer.alloc(input.length);
      const outLen = new BigInt64Array(1);

      normalize_string(ptr(input), input.length, ptr(out), ptr(outLen));
      return out.subarray(0, Number(outLen[0])).toString("utf8");
    }

    if (typeof payload === "object") return JSON.stringify(payload);
    return String(payload);
  }
}
