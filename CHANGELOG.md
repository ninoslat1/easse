## Changelogs

### v0.2.2

- Add k6 test
- Remove global types for Bun FFI

### v0.2.1

- Supress package warn for dlopen module in NodeJS Runtime

### v0.2.0

- Fixing FFI module on NodeJS Runtime

### v0.1.9

- Trying FFI module

### v0.1.5

- Drop xxHash WASM package

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
