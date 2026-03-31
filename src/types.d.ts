export interface SSEOptions<T> {
  interval?: number;
  onError?: (error: Error) => void;
  compareFn?: (a: T, b: T) => boolean;
  namespace?: string
  maxRetries?: number;
  cors?: boolean | CorsOptions
}

export interface CorsOptions {
  origin?: string | string[];
  credentials?: boolean;
  headers?: string;
}

export interface SSEHeaders {
  'Content-Type': string;
  'Cache-Control': string;
  'Connection': string;
  'X-Accel-Buffering': string;
  [key: string]: string;
}