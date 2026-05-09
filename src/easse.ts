import { ISSEEngine } from "./engines";
import { DeltaEngine } from "./engines/delta";
import { StandardEngine } from "./engines/std";
import { AutoDiffModule } from "./libs/auto-diffing";
import { DataEqualCheckModule } from "./libs/compare";
import { DataHashModule } from "./libs/hashing";
import { HTMLModule } from "./libs/html";
import type { SSEOptions } from "./types";

export class SSEResponseStream<T> {
  private intervalId?: ReturnType<typeof setInterval>;
  private encoder = new TextEncoder();
  private lastData: T | null = null;
  private engine: ISSEEngine<T>;
  private retryCount: number = 0;

  constructor(
    private fetchDataFn: () => Promise<T>,
    private options: SSEOptions<T>,
  ) {
    const minifyHtml = new HTMLModule();
    const autoDiff = new AutoDiffModule(minifyHtml);
    const minify = options.minify ?? false;

    if (options.engine === "standard") {
      this.engine = new StandardEngine(
        new DataEqualCheckModule(autoDiff),
        autoDiff,
        minify,
        options.compareFn,
      );
    } else {
      this.engine = new DeltaEngine(new DataHashModule(), autoDiff, minify);
    }
  }

  public create(): Response {
    const stream = new ReadableStream({
      start: (controller) => this.start(controller),
      cancel: () => this.stop(),
    });

    return new Response(stream, { headers: this.buildHeaders() });
  }

  public static async adaptResponse(webRes: Response, res?: any) {
    if (res && res.write && typeof res.on === "function") {
      res.writeHead(webRes.status, Object.fromEntries(webRes.headers));

      if (!webRes.body) return res.end();

      const reader = webRes.body.getReader();

      res.on("close", () => reader.cancel());

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
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    if (cors) {
      if (typeof cors === "boolean") {
        h.set("Access-Control-Allow-Origin", "*");
      } else {
        if (cors.origin)
          h.set(
            "Access-Control-Allow-Origin",
            Array.isArray(cors.origin) ? cors.origin.join(",") : cors.origin,
          );
        if (cors.credentials) h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Headers", cors.headers || "*");
      }
    }
    return h;
  }

  private async execute(controller: ReadableStreamDefaultController) {
    try {
      const newData = await this.fetchDataFn();
      const payload = await this.engine.execute(newData, this.lastData);

      if (payload) {
        const namespace = this.options.namespace ?? "data";
        controller.enqueue(this.encoder.encode(`${namespace}: ${payload}\n\n`));
      } else {
        controller.enqueue(this.encoder.encode(": ping\n\n"));
      }

      this.lastData = newData;
    } catch (err) {
      this.handleError(err, controller);
    }
  }

  private async start(controller: ReadableStreamDefaultController) {
    controller.enqueue(this.encoder.encode(": connected\n\n"));
    const { interval = 5000 } = this.options;

    if (interval > 10000) {
      this.handleError("Interval cannot exceed 10000ms", controller);
      return;
    }

    await this.execute(controller);

    this.intervalId = setInterval(() => this.execute(controller), interval);
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
  options: SSEOptions<T> = {},
): Promise<Response> => {
  const streamInstance = new SSEResponseStream(fetchDataFn, {
    ...options,
  });

  const webRes = streamInstance.create();
  return await SSEResponseStream.adaptResponse(webRes, options.res);
};
