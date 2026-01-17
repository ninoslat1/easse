export const createSSEResponse = <T>(
  fetchDataFn: () => Promise<T>,
  options: { interval?: number; compareFn?: (a: any, b: any) => boolean } = {}
): Response => {
  const { interval = 10000, compareFn = (a, b) => JSON.stringify(a) === JSON.stringify(b) } = options;
  let intervalId: any;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        let lastResult = await fetchDataFn();
        send(lastResult);

        intervalId = setInterval(async () => {
          try {
            const newResult = await fetchDataFn();
            if (!compareFn(lastResult, newResult)) {
              send(newResult);
              lastResult = newResult;
            }
          } catch (err) {
            controller.error(err);
            clearInterval(intervalId);
          }
        }, interval);
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", 
    },
  });
};