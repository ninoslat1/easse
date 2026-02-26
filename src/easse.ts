import { defaultCompareFn, shallowCompareFn } from "./libs/compare";
import { depCheck } from "./libs/depth-check";
import type { SSEOptions } from "./types";

export const createSSEResponse = <T>(
  fetchDataFn: () => Promise<T>,
  options: SSEOptions<T> = {}
): Response => {

  const { interval = 10000, onError, maxRetries = 3, namespace = "data" } = options;
  let intervalId: NodeJS.Timeout | number | undefined;
  let retryCount = 0;
  let activeCompareFn = options.compareFn;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const send = (data: T) => {
        const message = `${namespace}: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const sendError = (error: Error) => {
        const errorMessage = `event: error\n${namespace}: ${JSON.stringify({
          message: error.message,
          timestamp: Date.now()
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
      }

      const fetchAndCompare = async (lastRes: T | null): Promise<T> => {
        try {
          const newRes = await fetchDataFn();

          if (lastRes === null) {
            // Pertama kali fetch, tentukan compareFn jika belum ada
            if (!activeCompareFn) {
              activeCompareFn = depCheck(newRes) ? defaultCompareFn : shallowCompareFn;
              // console.log(`[SSE] Auto-selected: ${isDeep(newRes) ? 'Deep' : 'Shallow'} Compare`);
            }
            send(newRes);
          } else if (!activeCompareFn!(lastRes, newRes)) {
            send(newRes);
            retryCount = 0;
          }

          return newRes;
        } catch (err) {
          retryCount++;
          const error = err instanceof Error ? err : new Error(String(err));
          
          if (onError) onError(error);
          sendError(error);
          
          if (retryCount >= maxRetries) {
            clearInterval(intervalId);
            controller.error(error);
          }
          
          throw error;
        }
      }

       try {
        let lastResult = await fetchAndCompare(null);

        intervalId = setInterval(async () => {
          try {
            lastResult = await fetchAndCompare(lastResult);
          } catch {

          }
        }, interval);
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        controller.error(error);
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