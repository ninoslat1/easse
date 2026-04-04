# Quickstart

Get started with **Easse** in minutes.

---

## 📦 Installation

### Using npm
```bash
npm install @ninoslat1/easse
```

### Using Bun
```bash
bun add @ninoslat1/easse
```

### Using jsr
```bash
npx jsr add @ninoslat1/easse
```

## Basic Example

Here is the simple Bun setup

```bash
"/sse/static": () => createSSEResponse(async () => ({ status: "ok" }), {
                        cors: false,
                        interval: 2000,
                    }),
```

For further example, check this [link]("https://github.com/ninoslat1/easse/tree/main/src/examples")