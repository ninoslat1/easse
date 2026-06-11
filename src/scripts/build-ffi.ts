import { spawnSync } from "bun";
import { mkdirSync, renameSync, existsSync } from "fs";
import { join } from "path";

const SRC = "src/shared/hash_utils.zig";
const OUT = "src/shared/bin";

mkdirSync(OUT, { recursive: true });

const targets = [
  {
    name: "Windows",
    target: "x86_64-windows",
    built: ["hashutils.dll", "hashutils.lib", "hashutils.pdb"],
    keep: "hashutils.dll",
    output: "hashutils.dll",
  },
  {
    name: "Linux",
    target: "x86_64-linux-gnu",
    built: ["libhashutils.so"],
    keep: "libhashutils.so",
    output: "libhashutils.so",
  },
  {
    name: "macOS (x86)",
    target: "x86_64-macos",
    built: ["libhashutils.dylib"],
    keep: "libhashutils.dylib",
    output: "libhashutils.x86_64.dylib",
  },
  {
    name: "macOS (ARM)",
    target: "aarch64-macos",
    built: ["libhashutils.dylib"],
    keep: "libhashutils.dylib",
    output: "libhashutils.aarch64.dylib",
  },
] as const;

for (const t of targets) {
  process.stdout.write(`Building for ${t.name}... `);

  const result = Bun.spawnSync([
    "zig",
    "build-lib",
    SRC,
    "-dynamic",
    "-OReleaseFast",
    "--name",
    "hashutils",
    "-target",
    t.target,
    "--cache-dir",
    ".zig-cache",
  ]);

  if (result.exitCode !== 0) {
    console.error(`❌ Failed\n${result.stderr.toString()}`);
    process.exit(1);
  }

  // Move the one we want to bin/, delete the rest
  for (const file of t.built) {
    if (!existsSync(file)) continue;
    if (file === t.keep) {
      renameSync(file, join(OUT, t.output)); // move to bin/
    } else {
      Bun.file(file).delete(); // delete .lib .pdb etc
    }
  }

  console.log(`✅ → ${OUT}/${t.output}`);
}

console.log("\n✅ All builds complete!");
