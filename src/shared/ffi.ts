// ffi.ts
import { dlopen, FFIType, ptr, toArrayBuffer } from "bun:ffi";
import { join } from "path";
import os from "os";

const libPath = () => {
  const currentDir =
    typeof import.meta !== "undefined" && import.meta.dir
      ? import.meta.dir
      : typeof __dirname !== "undefined"
        ? __dirname
        : process.cwd();

  const dir = join(currentDir, "bin");

  switch (process.platform) {
    case "win32":
      return join(dir, "hashutils.dll");
    case "linux":
      return join(dir, "libhashutils.so");
    case "darwin": {
      const arch = os.arch();
      return join(dir, `libhashutils.${arch}.dylib`);
    }
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
};

const lib = dlopen(libPath(), {
  combine_bytes: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  normalize_string: {
    args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.u32],
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

export const { combine_bytes, normalize_string, collect_tree_paths } = lib.symbols;
