import { readFileSync, writeFileSync } from "fs";

const input = readFileSync("./bench.txt", "utf-8");

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "").replace(/•/g, "").trim();
}

function parseTimeToMs(value: number, unit: string): number {
  switch (unit) {
    case "ps": return value / 1_000_000_000;
    case "ns": return value / 1_000_000;
    case "µs": return value / 1_000;
    case "ms": return value;
    default:   return value;
  }
}

function formatLatency(avgMs: number): string {
  if (avgMs < 0.000001)  return `${(avgMs * 1_000_000_000).toFixed(2)} ps`;
  if (avgMs < 0.001)     return `${(avgMs * 1_000_000).toFixed(2)} ns`;
  if (avgMs < 1)         return `${(avgMs * 1_000).toFixed(3)} µs`;
  return `${avgMs.toFixed(4)} ms`;
}

function formatOps(avgMs: number): string {
  const ops = 1000 / avgMs;
  if (ops >= 1_000_000_000) return `${(ops / 1_000_000_000).toFixed(2)}B`;
  if (ops >= 1_000_000)     return `${(ops / 1_000_000).toFixed(2)}M`;
  if (ops >= 1_000)         return `${(ops / 1_000).toFixed(2)}K`;
  return ops.toFixed(0);
}


type Row = {
  name: string;
  avgMs: number;
  rawValue: number;
  unit: string;
};

type SummaryEntry = {
  winner: string;
  comparisons: { name: string; ratio: number }[];
};

type Group = {
  title: string;
  rows: Row[];
  summary: SummaryEntry | null;
};


const lines = input.split("\n");
const groups: Group[] = [];

let currentGroup: Group | null = null;
let inSummary = false;
let summaryWinner = "";
let summaryComparisons: { name: string; ratio: number }[] = [];

for (const raw of lines) {
  const line = stripAnsi(raw);


  const stripped = raw.replace(/\x1b\[[0-9;]*m/g, "").trim();
  if (stripped.startsWith("•")) {
    if (currentGroup && inSummary) {
      currentGroup.summary = { winner: summaryWinner, comparisons: summaryComparisons };
    }

    const title = stripped.replace(/^•\s*/, "").trim();
    currentGroup = { title, rows: [], summary: null };
    groups.push(currentGroup);
    inSummary = false;
    summaryWinner = "";
    summaryComparisons = [];
    continue;
  }

  if (line === "summary") {
    inSummary = true;
    summaryWinner = "";
    summaryComparisons = [];
    continue;
  }

  if (inSummary && summaryWinner === "") {
    const winnerMatch = line.match(/^\s+(.+?)\s*$/);
    if (winnerMatch && !line.match(/[\d.]+x faster/)) {
      summaryWinner = winnerMatch[1].trim();
      continue;
    }
  }

  if (inSummary) {
    const compMatch = line.match(/^\s*([\d.]+)x faster than\s+(.+?)\s*$/);
    if (compMatch) {
      summaryComparisons.push({
        ratio: parseFloat(compMatch[1]),
        name: compMatch[2].trim(),
      });
      continue;
    }
    if (line === "" || line.startsWith("---")) {
      if (currentGroup) {
        currentGroup.summary = { winner: summaryWinner, comparisons: summaryComparisons };
      }
      inSummary = false;
    }
  }

  const benchMatch = line.match(/^(.+?)\s{2,}([\d.]+)\s+(ps|ns|µs|ms)\/iter/);
  if (benchMatch && currentGroup) {
    const name     = benchMatch[1].trim();
    const rawValue = parseFloat(benchMatch[2]);
    const unit     = benchMatch[3];
    const avgMs    = parseTimeToMs(rawValue, unit);
    currentGroup.rows.push({ name, avgMs, rawValue, unit });
  }
}

if (currentGroup && inSummary) {
  currentGroup.summary = { winner: summaryWinner, comparisons: summaryComparisons };
}


function generateGroupMd(group: Group): string {
  let md = `## ${group.title}\n\n`;

  if (group.rows.length === 0) return md;

  const fastest = [...group.rows].sort((a, b) => a.avgMs - b.avgMs)[0];

  md += `| Benchmark | Avg Latency | ops/sec | vs fastest |\n`;
  md += `| :--- | ---: | ---: | :--- |\n`;

  for (const row of group.rows) {
    const isFastest = row === fastest;
    const ratio     = row.avgMs / fastest.avgMs;
    const badge     = isFastest ? "🏆 fastest" : `${ratio.toFixed(2)}x slower`;
    md += `| \`${row.name}\` | ${formatLatency(row.avgMs)} | **${formatOps(row.avgMs)}/s** | ${badge} |\n`;
  }

  // Summary block
  if (group.summary && group.summary.winner) {
    md += `\n> 🏆 **Winner: \`${group.summary.winner}\`**`;
    if (group.summary.comparisons.length > 0) {
      const parts = group.summary.comparisons.map(
        (c) => `**${c.ratio}x** faster than \`${c.name}\``
      );
      md += ` — ${parts.join(", ")}`;
    }
    md += "\n";
  }

  return md + "\n";
}


const allRows = groups.flatMap((g) => g.rows);
const globalFastest = [...allRows].sort((a, b) => a.avgMs - b.avgMs)[0];
const globalSlowest = [...allRows].sort((a, b) => b.avgMs - a.avgMs)[0];

let md = `# 🚀 Benchmark Results\n\n`;
md += `> Generated: ${new Date().toLocaleString()}\n\n`;
md += `> Runtime: bun 1.3.14 (x64-win32) · AMD Ryzen 7 5700G · ~2.19 GHz\n\n`;
md += `---\n\n`;

md += `## Table of Contents\n\n`;
groups.forEach((g, i) => {
  const anchor = g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  md += `${i + 1}. [${g.title}](#${anchor})\n`;
});
md += `\n---\n\n`;

// Groups
for (const group of groups) {
  md += generateGroupMd(group);
  md += `---\n\n`;
}

// Global summary
if (globalFastest && globalSlowest) {
  const speedup = globalSlowest.avgMs / globalFastest.avgMs;
  md += `## ⚡ Overall Summary\n\n`;
  md += `| | Benchmark | Latency | ops/sec |\n`;
  md += `| :--- | :--- | ---: | ---: |\n`;
  md += `| 🏆 Fastest | \`${globalFastest.name}\` | ${formatLatency(globalFastest.avgMs)} | **${formatOps(globalFastest.avgMs)}/s** |\n`;
  md += `| 🐢 Slowest | \`${globalSlowest.name}\` | ${formatLatency(globalSlowest.avgMs)} | **${formatOps(globalSlowest.avgMs)}/s** |\n\n`;
  md += `> 🔥 Fastest is **${speedup.toFixed(1)}x** faster than slowest.\n\n`;
}

writeFileSync("./benchmark.md", md);
console.log("✅ benchmark.md generated");