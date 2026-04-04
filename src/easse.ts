import { DataEqualCheckModule } from "./libs/compare";
import type { SSEOptions } from "./types";

class SSEResponseStream<T> {
  private intervalId?: Timer;
  private retryCount = 0;
  private encoder = new TextEncoder();
  private activeCompareFn: (a: T, b: T) => boolean;

  constructor(
    private fetchDataFn: () => Promise<T>,
    private options: SSEOptions<T>
  ) {
    this.activeCompareFn = options.compareFn!;
  }

  public create(): Response {
    const stream = new ReadableStream({
      start: (controller) => this.start(controller),
      cancel: () => this.stop(),
    });

    return new Response(stream, { headers: this.buildHeaders() });
  }

  private buildHeaders(): Headers {
    const { cors } = this.options;
    const h = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });

    if (cors) {
      if (typeof cors === "boolean") {
        h.set("Access-Control-Allow-Origin", "*");
      } else {
        if (cors.origin) h.set("Access-Control-Allow-Origin", Array.isArray(cors.origin) ? cors.origin.join(",") : cors.origin);
        if (cors.credentials) h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Headers", cors.headers || "*");
      }
    }
    return h;
  }

  private async start(controller: ReadableStreamDefaultController) {
    controller.enqueue(this.encoder.encode(": connected\n\n"));

    const { interval = 5000, namespace = "data" } = this.options;

    if (interval > 10000) {
      const intervalError = `event: error\ndata: ${JSON.stringify({ message: "Interval cannot exceed 10000ms" })}\n\n`;
      controller.enqueue(this.encoder.encode(intervalError));
      this.stop();
      controller.close();
      return;
    }

    const exec = async (lastRes: T | null): Promise<T | null> => {
      try {
        const newRes = await this.fetchDataFn();
        if (lastRes === null && !this.activeCompareFn) {
          this.activeCompareFn = DataEqualCheckModule.depCheck(newRes) 
          ? DataEqualCheckModule.deepCompare.bind(DataEqualCheckModule) 
          : DataEqualCheckModule.shallowCompare.bind(DataEqualCheckModule);
        }
        
        if (lastRes === null || !this.activeCompareFn(lastRes, newRes)) {
          const message = `${namespace}: ${JSON.stringify(newRes)}\n\n`;
          controller.enqueue(this.encoder.encode(message));
          this.retryCount = 0;
          return newRes;
        } else {
          controller.enqueue(this.encoder.encode(": ping\n\n"));
          return lastRes;
        }
      } catch (err) {
        return this.handleError(err, controller);
      }
    };

    let lastResult = await exec(null);

    this.intervalId = setInterval(async () => {
      lastResult = await exec(lastResult);
    }, interval);
  }

  private handleError(err: any, controller: ReadableStreamDefaultController): any {
    this.retryCount++;
    const error = err instanceof Error ? err : new Error(String(err));
    
    if (this.options.onError) this.options.onError(error);
    
    const errMessage = `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`;
    controller.enqueue(this.encoder.encode(errMessage));

    if (this.retryCount >= (this.options.maxRetries || 3)) {
      this.stop();
      controller.error(error);
      controller.close();
    }
    return null;
  }

  private stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const createSSEResponse = <T>(
  fetchDataFn: () => Promise<T>,
  options: SSEOptions<T> = {}
): Response => {
  return new SSEResponseStream(fetchDataFn, options).create();
};