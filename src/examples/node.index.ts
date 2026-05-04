import http from 'http';
import { createSSEResponse } from '../../dist/easse.cjs';

const server = http.createServer(async (req, res) => {
  if (req.url === '/sse/native' && req.method === 'GET') {
    try {
      await createSSEResponse(
        async () => ({ time: new Date().toISOString(), type: 'native' }),
        { 
          res,
          interval: 2000,
          minify: true 
        }
      );
    } catch (err) {
      res.writeHead(500);
      res.end('SSE Error');
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => console.log('Node.js SSE: http://localhost:3000/sse/native'));