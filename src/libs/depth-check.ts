export const depCheck = (obj: any): boolean => {
  if (obj === null || typeof obj !== 'object') return false;
  
  const values = Array.isArray(obj) ? obj : Object.values(obj);
  return values.some(val => val !== null && typeof val === 'object');
};