import { AutoDiffModule } from "./libs/auto-diffing";
import { DataEqualCheckModule } from "./libs/compare";
import { HTMLModule } from "./libs/html";
import type { SSEOptions } from "./types";

class SSEResponseStream<T> {
  private intervalId?: ReturnType<typeof setInterval>;
  private retryCount = 0;
  private minifyHtml = new HTMLModule()
  private encoder = new TextEncoder();
  private customCompareFn: ((a: T, b: T) => boolean) | undefined;
  private minify = false;
  private autoDiff = new AutoDiffModule(this.minifyHtml);
  private checker = new DataEqualCheckModule(this.autoDiff);

  constructor(
    private fetchDataFn: () => Promise<T>,
    private options: SSEOptions<T>
  ) {
    this.customCompareFn = options.compareFn;
    this.minify = options.minify ?? false;
  }

  public create(): Response {
    const stream = new ReadableStream({
      start: (controller) => this.start(controller),
      cancel: () => this.stop(),
    });

    return new Response(stream, { headers: this.buildHeaders() });
  }

  public static async adaptResponse(webRes: Response, res?: any) {
    if (res && res.write && typeof res.on === 'function') {
        res.writeHead(webRes.status, Object.fromEntries(webRes.headers));

        if (!webRes.body) return res.end();
        
        const reader = webRes.body.getReader();
        
        res.on('close', () => reader.cancel());

        try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        } finally {
        res.end();
        }
        return;
    }

    return webRes;
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

  private resolveCompareFn(lastRes: T, newRes: T): (a: T, b: T) => boolean {
    if (this.customCompareFn) return this.customCompareFn;
    return this.checker.resolveCompareFn(lastRes, newRes);
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

        const format = this.autoDiff.comparePayload(newRes, this.minify);

        if (lastRes === null) {
          const message = `${namespace}: ${format}\n\n`;
          controller.enqueue(this.encoder.encode(message));
          this.retryCount = 0;
          return newRes;
        }

        const compareFn = this.resolveCompareFn(lastRes, newRes);

        if (!compareFn(lastRes, newRes)) {
          const message = `${namespace}: ${format}\n\n`;
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


export const createSSEResponse = async <T>(
  fetchDataFn: () => Promise<T>,
  options: SSEOptions<T> = {}
): Promise<Response> => {
  const streamInstance = new SSEResponseStream(fetchDataFn, options);
  const webRes = streamInstance.create();
  return await SSEResponseStream.adaptResponse(webRes, options.res);
};