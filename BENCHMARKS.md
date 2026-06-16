## Benchmarks

<!-- BENCHMARK_START -->

## 📊 Benchmark

> Last updated: 6/14/2026, 12:39:10 PM
> Results are generated from automated mitata benchmarks on real hardware.
> "V2 (FFI)" variants use Zig native bindings via Bun FFI. Node.js falls back to pure JS.

### Environment

|         |                             |
| :------ | :-------------------------- |
| Runtime | bun 1.3.14 (x64-win32)      |
| CPU     | AMD Ryzen 7 5700G ~2.19 GHz |
| OS      | Windows x64                 |

---

---

## Hashing Performance (Small Flat Object)

| Benchmark          | Avg Latency |     ops/sec | vs fastest   |
| :----------------- | ----------: | ----------: | :----------- |
| `MD5`              |   819.95 ns | **1.22M/s** | 4.28x slower |
| `SHA-256`          |   866.56 ns | **1.15M/s** | 4.52x slower |
| `xxHash3 (Native)` |   191.52 ns | **5.22M/s** | 🏆 fastest   |

---

## Hashing Performance (Large HTML Payload)

| Benchmark          | Avg Latency |       ops/sec | vs fastest    |
| :----------------- | ----------: | ------------: | :------------ |
| `MD5 (Crypto)`     |    4.820 µs | **207.47K/s** | 18.88x slower |
| `SHA-256 (Crypto)` |    2.900 µs | **344.83K/s** | 11.36x slower |
| `xxHash3 (Native)` |   255.31 ns |   **3.92M/s** | 🏆 fastest    |

---

## Merkle Tree MD5

| Benchmark  | Avg Latency |      ops/sec | vs fastest   |
| :--------- | ----------: | -----------: | :----------- |
| `V1`       |    87.68 ns | **11.41M/s** | 1.76x slower |
| `V2 (FFI)` |    49.92 ns | **20.03M/s** | 🏆 fastest   |

---

## Merkle Tree SHA256

| Benchmark  | Avg Latency |      ops/sec | vs fastest   |
| :--------- | ----------: | -----------: | :----------- |
| `V1`       |    60.44 ns | **16.55M/s** | 1.08x slower |
| `V2 (FFI)` |    55.74 ns | **17.94M/s** | 🏆 fastest   |

---

## Merkle Tree xxHash3

| Benchmark  | Avg Latency |      ops/sec | vs fastest   |
| :--------- | ----------: | -----------: | :----------- |
| `V1`       |    57.57 ns | **17.37M/s** | 1.06x slower |
| `V2 (FFI)` |    54.48 ns | **18.36M/s** | 🏆 fastest   |

---

## SSE Engine Full Workflow (V1 vs V2)

| Benchmark                     | Avg Latency |     ops/sec | vs fastest   |
| :---------------------------- | ----------: | ----------: | :----------- |
| `V1: Standard (Deep Compare)` |   731.44 ns | **1.37M/s** | 2.04x slower |
| `V2: Delta (Merkle + xxHash)` |   357.96 ns | **2.79M/s** | 🏆 fastest   |

---

## HTML Sanitization

| Benchmark  | Avg Latency |       ops/sec | vs fastest   |
| :--------- | ----------: | ------------: | :----------- |
| `V1`       |    2.000 µs | **500.00K/s** | 🏆 fastest   |
| `V2 (FFI)` |    3.170 µs | **315.46K/s** | 1.58x slower |

---

## HTML Full Minify

| Benchmark  | Avg Latency |       ops/sec | vs fastest   |
| :--------- | ----------: | ------------: | :----------- |
| `V1`       |   10.220 µs |  **97.85K/s** | 1.04x slower |
| `V2 (FFI)` |    9.870 µs | **101.32K/s** | 🏆 fastest   |

---

## JSON Stringify

| Benchmark       | Avg Latency |       ops/sec | vs fastest   |
| :-------------- | ----------: | ------------: | :----------- |
| `V1 (Baseline)` |    1.510 µs | **662.25K/s** | 1.01x slower |
| `V2 (FFI)`      |    1.500 µs | **666.67K/s** | 🏆 fastest   |

---

<!-- BENCHMARK_END -->
