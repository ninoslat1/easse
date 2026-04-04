import { createSSEResponse } from '../../dist/easse.cjs'

const server = Bun.serve({
  port: 3000,
  routes: {
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