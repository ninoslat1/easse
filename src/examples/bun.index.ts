import { createSSEResponse } from '../../dist/easse.cjs';

// --- Constants & Templates ---
const PORT = 3000;

const HTML_UI = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Easse HTML Stream Mockup</title>
    <style>
      body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f4f4f9; margin: 0; }
      #stream-box { min-width: 300px; transition: all 0.3s ease; }
      .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 20px; text-align: center; }
    </style>
  </head>
  <body>
    <h1>Easse Live Stream</h1>
    <div id="stream-box">
      <div class="card">Menghubungkan ke stream...</div>
    </div>
    <script>
      const eventSource = new EventSource('/sse/html');
      const box = document.getElementById('stream-box');
      eventSource.onmessage = (e) => box.innerHTML = e.data;
      eventSource.onerror = () => console.log("Koneksi terputus.");
    </script>
  </body>
  </html>
`;

const SSEHandlers = {
  handleHTML: () => createSSEResponse(async () => {
    const num = Math.random().toFixed(5);
    const isUp = Math.random() > 0.5;

    return `
      <div class="card" style="border-left: 5px solid ${isUp ? '#4caf50' : '#f44336'}">
        <h2 style="margin:0">Indicator: ${isUp ? '📈' : '📉'}</h2>
        <p style="font-size: 2rem; margin: 10px 0;">${num}</p>
        <small style="color: #666">Server Time: ${new Date().toLocaleTimeString()}</small>
      </div>
    `;
  }, { interval: 2000 }), // Pakai fitur minify bawaan easse

  // Handler untuk JSON Static
  handleStatic: () => createSSEResponse(async () => ({ status: "ok" }), {
    interval: 5000 
  }),

  // Handler untuk JSON Dynamic
  handleDynamic: () => createSSEResponse(async () => ({ 
    status: "ok", 
    number: Math.random() 
  }), { interval: 2000 })
};

// --- Server Configuration ---
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Static UI Route
    if (url.pathname === "/") {
      return new Response(HTML_UI, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // 2. SSE Routes
    if (url.pathname === "/sse/html") return SSEHandlers.handleHTML();
    if (url.pathname === "/sse/static") return SSEHandlers.handleStatic();
    if (url.pathname === "/sse/dynamic") return SSEHandlers.handleDynamic();

    // 3. Fallback 404
    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  },
});

console.log(`
  🚀 Easse Bun Server Running
  ---------------------------
  🖥️  UI      : http://localhost:${PORT}
  📡 HTML    : http://localhost:${PORT}/sse/html
  📡 Static  : http://localhost:${PORT}/sse/static
  📡 Dynamic : http://localhost:${PORT}/sse/dynamic
`);