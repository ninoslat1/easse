import http, { IncomingMessage, ServerResponse } from 'http'
import { createSSEResponse } from '../../dist/easse.cjs'

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/sse/static') {
    return createSSEResponse(async () => ({status: "ok"}), {
      interval: 2000,
      cors: false
    })
  } else if (req.method === "GET" && req.url === "/sse/dynamic") {
    return createSSEResponse(async () => ({ status: "ok", number: Math.random() }), {
      cors: false,
      interval: 2000,
    })
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})