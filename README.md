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

### v0.1.9
- Fixing Bun FFI module interop for NodeJS Runtime

### v0.1.8
- Add Bun FFI module interop with Zig

### v0.1.5
- Drop xxHash3 WASM

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

## License

MIT
