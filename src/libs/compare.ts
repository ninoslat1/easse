import { AutoDiffModule } from "./auto-diffing";

export class DataEqualCheckModule {
  constructor(private autoDiff: AutoDiffModule) {}
  /**
   * Checking object depth to mark it as shallow or nested for compare function
   * @param {object} obj - object data passed for check the object depth in data
   * @returns {boolean} - return boolean to qualify the compare (if true use default, and vice versa)
   **
   */
  depCheck(obj: any): boolean {
    if (obj === null || typeof obj !== "object") return false;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    return values.some((val) => val !== null && typeof val === "object");
  }

  resolveCompareFn<T>(a: T, b: T): (x: T, y: T) => boolean {
    const needsDeep = this.depCheck(a) || this.depCheck(b);
    return needsDeep
      ? this.autoDiff.deepCompare.bind(this.autoDiff)
      : this.autoDiff.shallowCompare.bind(this.autoDiff);
  }
}
