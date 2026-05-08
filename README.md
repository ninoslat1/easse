
# Easse
Lightweight SSE adapter for backend.

## Key Features

* 🌎 Universal Compatibility
* 🔌 Seamless Integration
* ⚡ Lightweight
* ➕ Extensible

Easse is a lightweight, zero-dependency library for managing Server-Sent Events (SSE). It features an universal compatibility with JavaScript Runtimes (currently work in NodeJS and Bun), easily extend with CORS configuration and data pooling interval, and zero dependency for the lightweight performance.

## Installation

```bash
bun add @ninoslat1/easse
# or
npm install @ninoslat1/easse
# or
deno install @ninoslat1/easse
# or
npx jsr add @ninoslat1/easse
```
    
## Documentation

For the documentation, see https://ninoslat1.github.io/easse/

---

## Release Notes

### v0.1.4
- Migrate from recursive deep comparison to Merkle Tree
    - 90% Instant Scan on Identical Data
    - 48% Better Performance on Flat Data
- Add memoization with WeakMap for prevent memory leak

### v0.1.3
- Fixing this.deepCompare error

### v0.1.0
- Optimize HTML streaming performance
- Improve efficiency for realtime content delivery

### v0.0.1
- Optimize auto diffing mechanism

---

## Benchmark

Generated from mitata benchmark

### 🧠 Comparison Logic Performance

| Test Case | ops/sec ↑ | avg (ms) ↓ |
|-----------|----------|------------|
| Shallow Compare (Flat Data - Different) | 23,798,191 | 0.000042 |
| Deep Compare (Flat Data - Different) | 11,114,816 | 0.000090 |
| Deep Compare (Nested Data - Different) | 2,575,328 | 0.000388 |
| V1: Full Scan & Full Payload (Nested) | 746,269 | 0.001340 |
| V2: Merkle Tree & Delta Payload (Nested) | 224,719 | 0.004450 |
| V1 Identical: Deep Compare Scan | 1,752,910 | 0.000570 |
| V2 Identical: Merkle Tree Scan | 3,520,631 | 0.000284 |
| V1 Flat: Shallow Compare Scan | 1,066,724 | 0.000937 |
| V2 Flat: Merkle Tree Scan | 1,455,689 | 0.000687 |

### 🌐 HTML Processing Performance

| Test Case | ops/sec ↑ | avg (ms) ↓ | size (bytes) | reduction |
|-----------|----------|------------|------------|------------|
| HTML Sanitization Only (Minify: false) | 243,902 | 0.004100 | 3,032 | 3.19% |
| HTML Full Minify (Minify: true) | 56,786 | 0.017610 | 1,428 | 54.41% |
| JSON Stringify (Baseline) | 483,092 | 0.002070 | 3,132 | - |

---

## License

MIT

