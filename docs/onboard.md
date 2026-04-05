# Quickstart

Get started with **Easse** in minutes.

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

### Using deno
```bash
deno install @ninoslat1/easse
```

## Basic Example

Here is the basic setup for native JavaScript Runtimes setup

**Bun**
```javascript
"/sse/static": () => createSSEResponse(async () => ({ status: "ok" }), {
                        cors: false,
                        interval: 2000,
                    }),
```

**NodeJS**
```javascript
if (req.method === 'GET' && req.url === '/sse/static') {
    return createSSEResponse(async () => ({status: "ok"}), {
      interval: 2000,
      cors: false
    })
}
```

For further example for framework, check this [link](https://github.com/ninoslat1/easse/tree/main/src/examples)