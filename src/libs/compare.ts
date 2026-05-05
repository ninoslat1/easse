import { createHash } from "crypto";
import { AutoDiffModule } from "./auto-diffing";
import { DataHashModule } from "./hashing";

export class DataEqualCheckModule {
  constructor(
    private autoDiff: AutoDiffModule,
    // private hash: DataHashModule
  ){}
  /**
   * Checking object depth to mark it as shallow or nested for compare function
   * @param {object} obj - object data passed for check the object depth in data
   * @returns {boolean} - return boolean to qualify the compare (if true use default, and vice versa)
   **
  */
  depCheck(obj: any): boolean {
    if (obj === null || typeof obj !== 'object') return false;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    return values.some(val => val !== null && typeof val === 'object');
  }

  resolveCompareFn<T>(a: T, b: T): (x: T, y: T) => boolean {
    const needsDeep = this.depCheck(a) || this.depCheck(b);
    return needsDeep
      ? this.autoDiff.deepCompare.bind(this.autoDiff)
      : this.autoDiff.shallowCompare.bind(this.autoDiff);
  }

  // resolveCompareFnV2<T>(a: T, _: T): (_: T, y: T) => boolean {
  //   const strA = JSON.stringify(a);
  //   const isLarge = strA.length > 102400;

  //   if (isLarge) {
  //     const hashA = this.hash.hashData(strA)
  //     return (_, y: T) => {
  //       return hashA === this.hash.hashData(y);
  //     };
  //   }

  //   return typeof a === "object" && a !== null 
  //     ? this.autoDiff.deepCompare.bind(this) 
  //     : this.autoDiff.shallowCompare.bind(this);
  // }
}