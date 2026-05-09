import type { ISSEEngine } from "./index";
import { DataHashModule } from "../libs/hashing";
import { AutoDiffModule } from "../libs/auto-diffing";

export class DeltaEngine<T> implements ISSEEngine<T> {
  private lastTreeMap: Map<string, string> | null = null;

  constructor(
    private hash: DataHashModule,
    private autoDiff: AutoDiffModule,
    private minify: boolean,
  ) {}

  async execute(newData: T, lastData: T | null): Promise<string | null> {
    if (newData === lastData) return null;

    if (typeof newData === "object" && newData !== null) {
      const newMap = this.hash.generateTreeMap(newData);
      if (this.lastTreeMap && newMap.get("root") === this.lastTreeMap.get("root")) {
        return null;
      }

      const delta = this.lastTreeMap
        ? this.hash.getDelta(this.lastTreeMap, newMap, newData)
        : newData;

      this.lastTreeMap = newMap;
      return this.autoDiff.comparePayload(delta, this.minify);
    }

    if (String(newData) === String(lastData)) {
      return null;
    }

    this.lastTreeMap = null;
    return this.autoDiff.comparePayload(newData, this.minify);
  }
}
