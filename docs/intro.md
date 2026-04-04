# What is Easse?

**Easse** is a lightweight adapter for building Server-Sent Events (SSE) in your backend applications.

It helps you handle real-time streaming responses with a simple and extensible API—without pulling in heavy dependencies.

---

## 🚀 Why Easse?

Building SSE manually can be tricky:

- Managing headers correctly
- Formatting events
- Handling multiple runtimes (Node, Bun, etc.)
#### Easse solves these problems with a minimal abstraction layer.

---

## ✨ Key Features

### 🔌 Plug & Play
Drop it into your existing controller or route handler.

### ⚡ Lightweight
No dependencies. No overhead.

### ➕ Extensible
Customize behavior based on your backend logic.

### ⚙️ Runtime Agnostic
Works across different JavaScript runtimes:
- Node.js
- Bun
- Deno (optional support)

---

## 📡 What is Server-Sent Events?

Server-Sent Events (SSE) is a standard for streaming data from server to client over HTTP.

Unlike WebSockets:
- One-way (server → client)
- Simpler to implement
- Works over standard HTTP

While SSE is simple and powerful, it comes with some trade-offs:

- Cannot send custom headers (e.g. Authorization Bearer token)
- One-way communication only (server → client)
- Limited concurrent connections per browser
- Text-only payload (no binary)
- Requires handling reconnect & event replay
- Can be affected by proxies and timeouts
---

## 🧠 When should you use Easse?

Use Easse when you need these feature:
- Live updates (dashboard, logs)
- Streaming APIs
- Notifications
- Real-time monitoring

---

## 🔗 Next Step

Go to [Quickstart](/onboard) to start using Easse in your project.