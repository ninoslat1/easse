import { readFileSync, writeFileSync } from "fs";

const input = readFileSync("./bench.txt", "utf-8");

type Row = {
  name: string;
  avgMs: number;
  ops: number;
};

function parseTimeToMs(value: number, unit: string): number {
  switch (unit) {
    case "ps": return value / 1e9;
    case "ns": return value / 1e6;
    case "µs": return value / 1e3;
    case "ms": return value;
    default: return value;
  }
}

const lines = input.split("\n");
const rows: Row[] = [];

for (const line of lines) {
  const clean = line.replace(/\x1b\[[0-9;]*m/g, "").trim();

  const match = clean.match(/^(.+?)\s+([\d.]+)\s?(ps|ns|µs|ms)\/iter/);

  if (match) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);
    const unit = match[3];

    const avgMs = parseTimeToMs(value, unit);
    const ops = Math.round(1000 / avgMs);

    rows.push({ name, avgMs, ops });
  }
}

const comparison = rows.filter(r =>
  r.name.toLowerCase().includes("compare") ||
  r.name.toLowerCase().includes("depcheck") ||
  r.name.toLowerCase().includes("reference") ||
  r.name.toLowerCase().includes("merkle") ||
  r.name.toLowerCase().includes("hash") ||
  r.name.toLowerCase().includes("scan")
);

const html = rows.filter(r =>
  r.name.toLowerCase().includes("html") ||
  r.name.toLowerCase().includes("json")
);

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function generateTable(title: string, data: Row[]) {
  let md = `### ${title}\n\n`;
  md += `| Test Case | ops/sec ↑ | avg (ms) ↓ |\n`;
  md += `|-----------|----------|------------|\n`;

  for (const r of data) {
    md += `| ${r.name} | ${formatNumber(r.ops)} | ${r.avgMs.toFixed(6)} |\n`;
  }

  return md + "\n";
}

let output = `## Benchmark\n\nGenerated from mitata benchmark\n\n---\n\n`;

output += generateTable("🧠 Comparison Logic Performance", comparison);
output += generateTable("🌐 HTML Processing Performance", html);
const fastest = [...rows].sort((a, b) => b.ops - a.ops)[0];
if (fastest) {
  output += `---\n\n### ⚡ Highlight\n`;
  output += `🔥 Fastest: **${fastest.name}** (${formatNumber(fastest.ops)} ops/sec)\n\n`;
}

output += `### 📌 Notes\n`;
output += `- Higher ops/sec = better throughput\n`;
output += `- Lower avg latency = better performance\n`;

writeFileSync("./benchmark.md", output);

console.log("✅ benchmark.md generated!");