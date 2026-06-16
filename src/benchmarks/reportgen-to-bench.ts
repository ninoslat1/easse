import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const benchmarkMd = readFileSync(join(import.meta.dir, "../../benchmark.md"), "utf-8");
const readmeMd    = readFileSync(join(import.meta.dir, "../../benchmarks.md"), "utf-8");

// Deduplicate groups (SSE appears twice in mitata output)
function deduplicateGroups(md: string): string {
  const lines   = md.split("\n");
  const seen    = new Set<string>();
  const result: string[] = [];
  let skip = false;

  for (const line of lines) {
    const headingMatch = line.match(/^## (.+)/);
    if (headingMatch) {
      const title = headingMatch[1];
      if (seen.has(title)) {
        skip = true;
        continue;
      }
      seen.add(title);
      skip = false;
    }
    if (!skip) result.push(line);
  }

  return result.join("\n");
}

const cleanBenchmark = deduplicateGroups(benchmarkMd);

const now = new Date().toLocaleString();

const newBenchmarkSection = `## 📊 Benchmark

> Last updated: ${now}
> Results are generated from automated mitata benchmarks on real hardware.
> "V2 (FFI)" variants use Zig native bindings via Bun FFI. Node.js falls back to pure JS.

### Environment

| | |
| :--- | :--- |
| Runtime | bun 1.3.14 (x64-win32) |
| CPU | AMD Ryzen 7 5700G ~2.19 GHz |
| OS | Windows x64 |

---

${cleanBenchmark
  .split("\n")
  // strip the top-level title and TOC from benchmark.md
  .filter((l) => !l.startsWith("# 🚀") && !l.startsWith("> Generated") && !l.startsWith("> Runtime"))
  .join("\n")
  // remove TOC block
  .replace(/## Table of Contents[\s\S]*?---/, "")
  .trim()
}
`;

const BENCH_START = "<!-- BENCHMARK_START -->";
const BENCH_END   = "<!-- BENCHMARK_END -->";

let updated: string;

if (readmeMd.includes(BENCH_START) && readmeMd.includes(BENCH_END)) {
  updated = readmeMd.replace(
    new RegExp(`${BENCH_START}[\\s\\S]*?${BENCH_END}`),
    `${BENCH_START}\n${newBenchmarkSection}\n${BENCH_END}`
  );
  console.log("✅ Injected into benchmarks.md");
} else {
  console.error("❌ Markers not found in benchmarks.md");
  process.exit(1);
}

// write to benchmarks.md, NOT README.md
writeFileSync(join(import.meta.dir, "../../benchmarks.md"), updated);
console.log("✅ benchmarks.md updated");