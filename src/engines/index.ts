export interface ISSEEngine<T> {
  execute(newData: T, lastData: T | null): Promise<string | null>;
  init?(): Promise<void>;
}
