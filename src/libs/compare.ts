export class DataEqualCheckModule {
  /**
   * Checking object depth to mark it as shallow or nested for compare function
   * @param {object} obj - object data passed for check the object depth in data
   * @returns {boolean} - return boolean to qualify the compare (if true use default, and vice versa)
   **
  */
  static depCheck(obj: any): boolean {
    if (obj === null || typeof obj !== 'object') return false;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    return values.some(val => val !== null && typeof val === 'object');
  }

  static shallowCompare(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return a === b;

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    return keysA.every(key => a[key] === b[key]);
  }

  static deepCompare(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null || typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((val, i) => this.deepCompare(val, b[i]));
    }

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    return keysA.every(key => 
      Object.prototype.hasOwnProperty.call(b, key) && this.deepCompare(a[key], b[key])
    );
  }
}