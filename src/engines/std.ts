import type { ISSEEngine } from "./index";
import { DataEqualCheckModule } from "../libs/compare";
import { AutoDiffModule } from "../libs/auto-diffing";

export class StandardEngine<T> implements ISSEEngine<T> {
  constructor(
    private checker: DataEqualCheckModule,
    private autoDiff: AutoDiffModule,
    private minify: boolean,
    private customCompare?: (a: T, b: T) => boolean,
  ) {}

  async execute(newData: T, lastData: T | null): Promise<string | null> {
    const compareFn = this.customCompare || this.checker.resolveCompareFn(lastData, newData);

    if (lastData === null || !compareFn(lastData, newData)) {
      return this.autoDiff.comparePayload(newData, this.minify);
    }
    return null;
  }
}
