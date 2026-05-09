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

### Using deno

```bash
deno install @ninoslat1/easse
```

---

## Basic Example

Here is the basic setup for native JavaScript Runtimes setup

**Bun**

```bun
if (req.url.endsWith("/sse")) {
  return createSSEResponse(
    async () => {
      // Fetch your real-time data here
      return {
        timestamp: Date.now(),
        status: "active"
      };
    },
    {
      interval: 1000, // Poll every 1s
      cors: true,
    }
  );
}
```

**NodeJS**

```javascript
import { createSSEResponse } from "@ninoslat1/easse";

if (req.method === "GET" && req.url === "/sse/updates") {
  const response = await createSSEResponse(async () => ({ data: "Your real-time payload" }), {
    interval: 2000,
    cors: {
      origin: "[https://your-app.com](https://your-app.com)",
      methods: ["GET"],
    },
  });
  // Put your handle response here
}
```

## Configuration

Easse is designed to be "plug-and-play," but you can fine-tune its behavior to match your application's needs.

## `SSEOptions`

The `createSSEResponse` function accepts an optional second argument of type `SSEOptions`.

| Property     | Type                     | Default  | Description                                                                 |
| :----------- | :----------------------- | :------- | :-------------------------------------------------------------------------- |
| `interval`   | `number`                 | `1000`   | The frequency of data polling in milliseconds.                              |
| `cors`       | `boolean \| CORSOptions` | `false`  | Enables Cross-Origin Resource Sharing. Pass an object for specific rules.   |
| `minify`     | `boolean`                | `false`  | If `true`, HTML payloads will be aggressively minified before transmission. |
| `namespace`  | `string`                 | `"data"` | The event name sent to the client (e.g., `event: data`).                    |
| `maxRetries` | `number`                 | `3`      | Maximum reconnection attempts on client failure.                            |

---

## Detailed Options

### Interval

The `interval` determines how often your data provider function is executed.

- **Low Latency:** Set to `500` or lower for real-time dashboards.
- **Resource Saving:** Set to `5000+` for data that doesn't change often.

### CORS Configuration

If you set `cors: true`, Easse will allow all origins (`*`). For production, it is recommended to use an object:

```typescript
const options = {
  cors: {
    origin: "[https://yourdomain.com](https://yourdomain.com)",
    methods: ["GET"],
    credentials: true,
  },
};
```

For further example for framework, check this [link]("https://github.com/ninoslat1/easse/tree/main/src/examples")
