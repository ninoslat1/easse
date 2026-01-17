export interface SSEOptions {
  interval?: number;
  onError?: (error: any) => void;
  compareFn?: (oldData: any, newData: any) => boolean;
}

export interface SSEHeaders {
  'Content-Type': string;
  'Cache-Control': string;
  'Connection': string;
  'X-Accel-Buffering': string;
  [key: string]: string;
}