import http from "http";
import { createSSEResponse } from "../../dist/easse.cjs";

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  if (req.url === "/sse/json") {
    try {
      await createSSEResponse(
        async () => ({
          status: "ok",
          value: Math.random(),
          timestamp: Date.now(),
        }),
        { res, interval: 2000, engine: "delta" },
      );
    } catch {
      res.writeHead(500);
      res.end("SSE Error");
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () =>
  console.log(`🚀 Easse running at http://localhost:${PORT}
  /sse/json  → JSON stream`),
);
