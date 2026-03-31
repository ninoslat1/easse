import { defaultCompareFn, shallowCompareFn } from "./libs/compare";
import { depCheck } from "./libs/depth-check";
import type { SSEOptions } from "./types";

export const createSSEResponse = <T>(
  fetchDataFn: () => Promise<T>,
  options: SSEOptions<T> = {}
): Response => {

  const { interval = 10000, onError, maxRetries = 3, namespace = "data", cors } = options;
  let intervalId: NodeJS.Timeout | number | undefined;
  let retryCount = 0;
  let activeCompareFn = options.compareFn;

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  })

  if (cors){
    if (typeof cors === "boolean"){
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Headers", "*");
    } else {
      if (cors.origin) headers.set("Access-Control-Allow-Origin", Array.isArray(cors.origin) ? cors.origin.join(",") : cors.origin);
      if (cors.credentials) headers.set("Access-Control-Allow-Credentials", "true");
      if (cors.headers) headers.set("Access-Control-Allow-Headers", cors.headers);
      else headers.set("Access-Control-Allow-Headers", "*");
    }
  }


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
            if (!activeCompareFn) {
              activeCompareFn = depCheck(newRes) ? defaultCompareFn : shallowCompareFn;
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

  return new Response(stream, {headers});
};