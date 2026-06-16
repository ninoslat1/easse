import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/easse.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: false,
  target: "esnext",
  platform: "node",
  deps: {
    neverBundle: ["bun:ffi"],
  },
});
