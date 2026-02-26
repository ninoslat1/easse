export interface SSEOptions<T> {
  interval?: number;
  onError?: (error: Error) => void;
  compareFn?: (a: T, b: T) => boolean;
  namespace?: string
  maxRetries?: number;
}

export interface SSEHeaders {
  'Content-Type': string;
  'Cache-Control': string;
  'Connection': string;
  'X-Accel-Buffering': string;
  [key: string]: string;
}