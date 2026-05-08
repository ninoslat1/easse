import { AutoDiffModule } from "./libs/auto-diffing";
import { DataEqualCheckModule } from "./libs/compare";
import { DataHashModule } from "./libs/hashing";
import { HTMLModule } from "./libs/html";
import type { SSEOptions } from "./types";

export class SSEResponseStream<T> {
  private intervalId?: ReturnType<typeof setInterval>;
  private retryCount = 0;
  private minifyHtml = new HTMLModule()
  private encoder = new TextEncoder();
  private customCompareFn: ((a: T, b: T) => boolean) | undefined;
  private minify = false;
  private hash = new DataHashModule()
  private autoDiff = new AutoDiffModule(this.minifyHtml);
  private checker = new DataEqualCheckModule(this.autoDiff);
  private lastTreeMap = new Map<string, string>();
  private lastData: T | null = null;
  private namespace: string

  constructor(
    private fetchDataFn: () => Promise<T>,
    private options: SSEOptions<T>
  ) {
    this.customCompareFn = options.compareFn;
    this.minify = options.minify ?? false;
    this.namespace = options.namespace ?? "data"
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

  private resolveCompareFn(lastRes: T | null, newRes: T): (a: T, b: T) => boolean {
    if (this.customCompareFn) return this.customCompareFn;
    return this.checker.resolveCompareFn(lastRes, newRes);
  }

  private async execV2(
    lastRes: T | null, 
    controller: ReadableStreamDefaultController, 
    namespace: string
  ): Promise<T | null> {
    const newRes = await this.fetchDataFn();

    if (lastRes === null) {
      const format = this.autoDiff.comparePayload(newRes, this.minify);
      controller.enqueue(this.encoder.encode(`${namespace}: ${format}\n\n`));
      return newRes;
    }

    const delta = this.hash.getDeltaLazy(lastRes, newRes);

    if (!delta) {
      controller.enqueue(this.encoder.encode(": ping\n\n"));
      return lastRes;
    }

    const format = this.autoDiff.comparePayload(delta, this.minify);
    controller.enqueue(this.encoder.encode(`${namespace}: ${format}\n\n`));
    
    return newRes;
  }

  // private async execV2(controller: ReadableStreamDefaultController): Promise<void> {
  //   try {
  //     const { namespace = "data" } = this.options;
  //     const newRes = await this.fetchDataFn();
      
  //     const newTreeMap = this.hash.generateTreeMap(newRes);
  //     const rootHash = newTreeMap.get("root");
  //     const lastRootHash = this.lastTreeMap.get("root");

  //     if (lastRootHash === rootHash) {
  //       controller.enqueue(this.encoder.encode(": ping\n\n"));
  //       return;
  //     }

  //     const payload = this.lastData 
  //       ? this.hash.getDeltaLazy(this.lastTreeMap, newTreeMap, newRes)
  //       : newRes;

  //     const format = this.autoDiff.comparePayload(payload, this.minify);
  //     const message = `${namespace}: ${format}\n\n`;
  //     controller.enqueue(this.encoder.encode(message));

  //     this.lastTreeMap = newTreeMap;
  //     this.lastData = newRes;
  //     this.retryCount = 0;

  //   } catch (err) {
  //     this.handleError(err, controller);
  //   }
  // }

  private async execV1(newData: T, lastData: T | null) {
    const compareFn = this.resolveCompareFn(lastData, newData);

    if (lastData === null || !compareFn(lastData, newData)) {
      return this.autoDiff.comparePayload(newData, this.minify);
    }

    return null;
  }

  private async start(controller: ReadableStreamDefaultController) {
    controller.enqueue(this.encoder.encode(": connected\n\n"));
    const { interval = 5000 } = this.options;

    if (interval > 10000) {
      this.handleError("Interval cannot exceed 10000ms", controller);
      return;
    }

    await this.execV2(this.lastData, controller, this.namespace);

    this.intervalId = setInterval(() => this.execV2(this.lastData, controller, this.namespace), interval);
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

  public async benchmarkV1(newData: T, lastData: T | null) {
    const compareFn = this.resolveCompareFn(lastData, newData);
    if (lastData === null || !compareFn(lastData, newData)) {
      return this.autoDiff.comparePayload(newData, this.minify);
    }
    return null;
  }

  public async benchmarkV2(newData: T, lastData: T | null) {
    if (lastData === null) return newData;
    return this.hash.getDeltaLazy(lastData, newData);
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