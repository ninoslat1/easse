import { readFileSync, writeFileSync } from "fs";

const input = readFileSync("./bench.txt", "utf-8");

type Row = {
  name: string;
  avgMs: number;
  ops: number;
};

function parseTimeToMs(value: number, unit: string): number {
  switch (unit) {
    case "ps":
      return value / 1_000_000_000;
    case "ns":
      return value / 1_000_000;
    case "µs":
      return value / 1_000;
    case "ms":
      return value;
    default:
      return value;
  }
}

const lines = input.split("\n");
const rows: Row[] = [];
let payloadStats = "";
let capturePayload = false;

for (const line of lines) {
  if (line.includes("Payload Size Comparison")) {
    capturePayload = true;
    payloadStats += "### 📊 Payload Size Comparison\n\n```text\n";
    continue;
  }

  if (capturePayload) {
    if (line.includes("---") && payloadStats.split("\n").length > 5) {
      payloadStats += line.replace(/[^| \-a-zA-Z0-9%()]/g, "") + "\n```\n\n";
      capturePayload = false;
    } else {
      payloadStats += line.replace(/\x1b\[[0-9;]*m/g, "") + "\n";
    }
  }

  const clean = line
    .replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/•/g, "")
    .trim();
  const match = clean.match(/^(.+?)\s{2,}([\d\.]+)\s+(ps|ns|µs|ms)\/iter/);

  if (match) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);
    const unit = match[3];
    const avgMs = parseTimeToMs(value, unit);
    const ops = Math.round(1000 / avgMs);

    rows.push({ name, avgMs, ops });
  }
}

const hashAndLogic = rows.filter((r) => /hash|merkle|compare|delta|v1|v2/i.test(r.name));
const htmlAndCompression = rows.filter((r) => /html|json|minify|sanitize/i.test(r.name));

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function generateTable(title: string, data: Row[]) {
  if (data.length === 0) return "";
  let md = `### ${title}\n\n`;
  md += `| Test Case | ops/sec ↑ | avg latency ↓ |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const r of data) {
    const latencyStr =
      r.avgMs < 0.001 ? `${(r.avgMs * 1_000_000).toFixed(2)} ns` : `${r.avgMs.toFixed(4)} ms`;
    md += `| ${r.name} | **${formatNumber(r.ops)}** | ${latencyStr} |\n`;
  }
  return md + "\n";
}

let finalOutput = `## 🚀 Benchmark & Payload Analysis\n\n`;
finalOutput += `Generated on: ${new Date().toLocaleString()}\n\n---\n\n`;

if (payloadStats) {
  finalOutput += payloadStats + "---\n\n";
}

finalOutput += generateTable("🧠 Engine Performance (V1 vs V2)", hashAndLogic);
finalOutput += generateTable("🌐 HTML & Compression Performance", htmlAndCompression);

const fastest = [...rows].sort((a, b) => b.ops - a.ops)[0];
if (fastest) {
  finalOutput += `### ⚡ Performance Highlight\n`;
  finalOutput += `🔥 **Fastest Overall**: \`${fastest.name}\` with **${formatNumber(fastest.ops)}** ops/sec.\n\n`;
}

writeFileSync("./benchmark.md", finalOutput);
console.log("✅ benchmark.md generated");
