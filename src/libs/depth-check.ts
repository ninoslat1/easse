/**
 * Checking object depth to mark it as shallow or nested for compare function
 * @param {object} obj - object data passed for check the object depth in data
 * @returns {boolean} - return boolean to qualify the compare (if true use default, and vice versa)
 ** @example
 * ```ts
 * import {depCheck} from "@digiworks/easse"
 * const qualifyCompareFn = depCheck(newRes) ? defaultCompareFn : shallowCompareFn;
 * ```
 */

export const depCheck = (obj: any): boolean => {
  if (obj === null || typeof obj !== 'object') return false;
  
  const values = Array.isArray(obj) ? obj : Object.values(obj);
  return values.some(val => val !== null && typeof val === 'object');
};