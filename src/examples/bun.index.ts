import { createSSEResponse } from '../../dist/easse.cjs'

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Easse HTML Stream Mockup</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f4f4f9; }
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

          eventSource.onmessage = (e) => {
            // Langsung inject HTML dari server
            box.innerHTML = e.data;
          };

          eventSource.onerror = () => {
            console.log("Koneksi terputus, mencoba menyambung kembali...");
          };
        </script>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } }),
    "/sse/html": () => createSSEResponse(async () => {
      const num = Math.random().toFixed(5);
      const isUp = Math.random() > 0.5;

      return `
        <div class="card" style="border-left: 5px solid ${isUp ? '#4caf50' : '#f44336'}">
          <h2 style="margin:0">Indicator: ${isUp ? '📈' : '📉'}</h2>
          <p style="font-size: 2rem; margin: 10px 0;">${num}</p>
          <small style="color: #666">Server Time: ${new Date().toLocaleTimeString()}</small>
        </div>
      `.replace(/\n/g, "");
    }, {
      interval: 2000,
      cors: false
    }),
    "/sse/static": () => createSSEResponse(async () => ({ status: "ok" }), {
                        cors: false,
                        interval: 2000,
                    }),
    "/sse/dynamic": () => createSSEResponse(async () => ({ status: "ok", number: Math.random() }), {
                        cors: false,
                        interval: 2000,
                    }),
    }
});

console.log(`Listening on ${server.url}`)