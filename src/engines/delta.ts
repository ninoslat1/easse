import type { ISSEEngine } from "./index";
import { DataHashModule } from "../libs/hashing";
import { AutoDiffModule } from "../libs/auto-diffing";

export class DeltaEngine<T> implements ISSEEngine<T> {
  private lastTreeMap: Map<string, string> | null = null;
  private lastHash: string | null = null;

  constructor(
    private hash: DataHashModule,
    private autoDiff: AutoDiffModule,
    private minify: boolean,
  ) {}

  async execute(newData: T, lastData: T | null): Promise<string | null> {
    if (newData === lastData) return null;

    if (typeof newData === "object" && newData !== null) {
      const newMap = this.hash.generateTreeMapV2(newData);
      const currentHash = newMap.get("root") || null;

      if (this.lastHash && currentHash === this.lastHash) return null;

      const delta = this.lastTreeMap
        ? this.hash.getDelta(this.lastTreeMap, newMap, newData)
        : newData;

      this.lastHash = currentHash;
      this.lastTreeMap = newMap;
      return this.autoDiff.comparePayloadV2(delta, this.minify);
    }

    if (String(newData) === String(lastData)) {
      return null;
    }

    this.lastTreeMap = null;
    return this.autoDiff.comparePayloadV2(newData, this.minify);
  }
}
