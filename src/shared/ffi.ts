import { join } from "path";
import os from "os";
import type { FFILib } from "../types";

let _cache: FFILib | null = null;
let _loaded = false;

function safeBunRequire() {
  if (typeof Bun === "undefined") return null;

  try {
    const prefix = "bun";
    const suffix = "ffi";
    return require(`${prefix}:${suffix}`);
  } catch {
    return null;
  }
}

export function bunPtr(buf: Buffer): number {
  if (typeof Bun === "undefined") return 0;
  const { ptr } = new Function("m", "return require(m)")("bun:ffi");
  return ptr(buf);
}

export function getFFI(): FFILib | null {
  if (_loaded) return _cache;
  _loaded = true;

  if (typeof Bun === "undefined") return null;

  try {
    const bunFfi = safeBunRequire();
    if (!bunFfi) return null;

    const { dlopen, FFIType } = require("bun:ffi");

    const dir = join(__dirname, "bin");
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

    _cache = lib.symbols as FFILib;
    return _cache;
  } catch (e) {
    console.warn("[easse] FFI unavailable, using pure JS:", e);
    return null;
  }
}
