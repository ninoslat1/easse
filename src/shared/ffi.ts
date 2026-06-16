import { join } from "path";
import os from "os";
import type { BunPtrFn, FFILib } from "../types";

let _cache: FFILib | null = null;
let _loaded = false;
const BUN_PTR = Symbol.for("easse.bunPtr");

function getStoredPtr(): BunPtrFn | undefined {
  return (globalThis as Record<symbol, unknown>)[BUN_PTR] as BunPtrFn | undefined;
}

function setStoredPtr(ptr: BunPtrFn): void {
  (globalThis as Record<symbol, unknown>)[BUN_PTR] = ptr;
}

export function bunPtr(buf: Buffer): number {
  if (typeof Bun === "undefined") return 0;

  try {
    let ptr = getStoredPtr();

    if (!ptr) {
      getFFI();
      ptr = getStoredPtr();
    }

    return ptr?.(buf) ?? 0;
  } catch {
    return 0;
  }
}

function _getBunFFI(): any {
  if (typeof Bun === "undefined") return null;
  try {
    if (typeof import.meta.require === "function") {
      return import.meta.require("bun:ffi");
    }
    if (typeof require === "function") {
      return new Function("m", "return require(m)")("bun:ffi");
    }
    return null;
  } catch {
    return null;
  }
}

export function getFFI(): FFILib | null {
  if (_loaded) return _cache;
  _loaded = true;

  if (typeof Bun === "undefined") return null;

  try {
    const bunFfi = _getBunFFI();
    if (!bunFfi) return null;

    const { dlopen, FFIType, ptr } = bunFfi;

    const dir = join(import.meta.dir ?? __dirname, "bin");
    const libPath = (() => {
      switch (process.platform) {
        case "win32":
          return join(dir, "hashutils.dll");
        case "linux":
          return join(dir, "libhashutils.so");
        case "darwin":
          return join(dir, `libhashutils.${os.arch()}.dylib`);
        default:
          throw new Error(`Unsupported platform: ${process.platform}`);
      }
    })();

    const lib = dlopen(libPath, {
      combine_bytes: {
        args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr],
        returns: FFIType.void,
      },
      normalize_string: {
        args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr],
        returns: FFIType.void,
      },
      collect_tree_paths: {
        args: [
          FFIType.ptr,
          FFIType.u32,
          FFIType.ptr,
          FFIType.ptr,
          FFIType.ptr,
          FFIType.u32,
          FFIType.ptr,
        ],
        returns: FFIType.i32,
      },
    });

    setStoredPtr(ptr);
    _cache = lib.symbols as FFILib;
    return _cache;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[easse] FFI unavailable (${msg}), using pure JS`);
    return null;
  }
}
