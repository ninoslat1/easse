export interface SSEOptions<T> {
  /** * Time interval for pooling data fetch function
   * @default 10000 
   */
  interval?: number;
  onError?: (error: Error) => void;
  /** * Custom functions for compare the old data and the new data 
   * If `true`, the data will not send.
   */
  compareFn?: (a: T, b: T) => boolean;
  namespace?: string
  /** Maximum retries if error happen before cancel the readable stream
   * @default 3
   */
  maxRetries?: number;
  /** CORS configuration for custom headers
   * @default false
   * Origin header for the whitelist/blacklist the request origin
   * Credentials for the cookie authentication in SSE
   */
  cors?: boolean | CorsOptions
  minify?: boolean
  res?: any
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