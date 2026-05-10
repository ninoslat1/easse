import { createSSEResponse } from "../../dist/easse.cjs";

const PORT = 3000;

const HTML_UI = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Easse Demo</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f4f4f9; margin: 0; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 20px; text-align: center; min-width: 300px; }
  </style>
</head>
<body>
  <h1>Easse Live Stream</h1>
  <div id="stream-box"><div class="card">Connecting...</div></div>
  <script>
    const es = new EventSource('/sse/html');
    const box = document.getElementById('stream-box');
    es.onmessage = (e) => box.innerHTML = e.data;
    es.onerror = () => console.warn('SSE connection closed.');
  </script>
</body>
</html>`;

const handlers = {
  html: () =>
    createSSEResponse(
      async () => {
        const value = Math.random().toFixed(5);
        const isUp = Math.random() > 0.5;
        return `
          <div class="card" style="border-left: 5px solid ${isUp ? "#4caf50" : "#f44336"}">
            <h2>${isUp ? "📈" : "📉"} ${isUp ? "Up" : "Down"}</h2>
            <p style="font-size: 2rem">${value}</p>
            <small>${new Date().toLocaleTimeString()}</small>
          </div>`;
      },
      { minify: true, interval: 3000, engine: "delta" },
    ),

  json: () =>
    createSSEResponse(
      async () => ({
        status: "ok",
        value: Math.random(),
        timestamp: Date.now(),
      }),
      { interval: 2000, engine: "delta" },
    ),
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/")
      return new Response(HTML_UI, { headers: { "Content-Type": "text/html" } });
    if (pathname === "/sse/html") return handlers.html();
    if (pathname === "/sse/json") return handlers.json();

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`🚀 Easse running at http://localhost:${PORT}
  /sse/html  → HTML stream
  /sse/json  → JSON stream`);
