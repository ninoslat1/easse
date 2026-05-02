
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

## Release Notes

### v0.1.0
- Optimize HTML streaming performance
- Improve efficiency for realtime content delivery

### v0.0.1
- Optimize auto diffing mechanism

## Benchmark

Generated from mitata benchmark

---

### 🧠 Comparison Logic Performance

| Test Case | ops/sec ↑ | avg (ms) ↓ |
|-----------|----------|------------|
| Same Reference (Flat) | 2,550,499,898 | 0.000000 |
| Shallow Compare (Flat Data - Different) | 10,490,978 | 0.000095 |
| Deep Compare (Flat Data - Different) | 5,775,339 | 0.000173 |
| Deep Compare (Nested Data - Identical) | 2,447,501,101 | 0.000000 |
| Deep Compare (Nested Data - Different) | 3,472,102 | 0.000288 |
| DepCheck Performance | 9,061,254 | 0.000110 |

### 🌐 HTML Processing Performance

| Test Case | ops/sec ↑ | avg (ms) ↓ |
|-----------|----------|------------|
| HTML Sanitization Only (Minify: false) | 237,530 | 0.004210 |
| HTML Full Minify (Minify: true) | 57,537 | 0.017380 |
| JSON Stringify (Baseline) | 485,437 | 0.002060 |

## License

MIT

