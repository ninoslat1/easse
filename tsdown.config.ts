// tsdown.config.ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/easse.ts"],
  format: ["cjs", "esm"],

  dts: true,

  clean: true,

  minify: true,

  sourcemap: true,
  target: "esnext",

  platform: "node",
});
