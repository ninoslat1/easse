# Easse

Lightweight SSE adapter for backend.

## Key Features

- 🌎 Universal Compatibility
- 🔌 Seamless Integration
- ⚡ Lightweight
- ➕ Extensible

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

## **If you are using an LLM to build with @ninoslat1/easse, please refer to [llms.txt](./llms.txt) for optimized context.**

## Release Notes

### v0.1.4

- Migrated from recursive deep comparison to Merkle Tree, achieving a 2.7x speed increase in change detection
- Integrated WeakMap memoization and Uint8Array buffers to eliminate string overhead and prevent memory leaks
- Leveraged Bun’s native xxHash3, resulting in 16x faster payload processing compared to legacy methods
- Optimized short-circuit logic for identical data, making it 90% faster
- Optimize Merkle with Uint8Array to optimize string overhead

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

| Test Case                   | ops/sec ↑      | avg latency ↓ |
| --------------------------- | -------------- | ------------- |
| xxHash3 (Identical Data)    | **2,957,880**  | 338.08 ns     |
| xxHash3 (Nested Data)       | **2,506,643**  | 398.94 ns     |
| Merkle Tree (MD5)           | **8,325,008**  | 120.12 ns     |
| Merkle Tree (SHA)           | **12,274,457** | 81.47 ns      |
| Merkle Tree (xxHash3)       | **12,716,175** | 78.64 ns      |
| V1: Standard (Deep Compare) | **884,956**    | 0.0011 ms     |
| V2: Delta (Merkle + xxHash) | **2,935,995**  | 340.60 ns     |

### 🌐 HTML Processing Performance

| Test Case                 | ops/sec ↑   | avg (ms) ↓ | size (bytes) | reduction |
| ------------------------- | ----------- | ---------- | ------------ | --------- |
| HTML Sanitization         | **243,309** | 0.0041 ms  | 3,032        | 3.19%     |
| HTML Full Minify          | **58,514**  | 0.0171 ms  | 1,428        | 54.41%    |
| JSON Stringify (Baseline) | **500,000** | 0.0020 ms  | 3,132        | -         |

---

## License

MIT
