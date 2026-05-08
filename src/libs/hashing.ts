import { createHash } from "crypto";

export class DataHashModule {
    private memo = new WeakMap<object, string>();

    constructor(){}

    private hashValue(val: any): string {
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return createHash("sha256").update(str).digest("hex");
    }

  public generateTreeMap(obj: any, path = "", map = new Map<string, string>()): Map<string, string> {
    if(typeof obj === "object" && obj !== null){
        if (this.memo.has(obj)){
            map.set(path, this.memo.get(obj)!)
            return map
        }
    }
    
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        this.generateTreeMap(value, currentPath, map);
      } else {
        map.set(currentPath, this.hashValue(value));
      }
    }
    
    const branchHashes = Array.from(map.values()).join("");
    map.set(path || "root", this.hashValue(branchHashes));
    
    if (typeof obj === "object" && obj !== null) {
        this.memo.set(obj, branchHashes);
    }

    return map;
  }

  public getDeltaLazy(oldObj: any, newObj: any, path = ""): any {
    if (oldObj === newObj) return null;

    if (typeof oldObj !== typeof newObj || typeof newObj !== 'object' || newObj === null) {
        return newObj;
    }

    const delta: any = {};
    let hasChanged = false;

    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key;
        
        const childDelta = this.getDeltaLazy(oldObj[key], newObj[key], currentPath);
        
        if (childDelta !== null) {
        delta[key] = childDelta;
        hasChanged = true;
        }
    }

    return hasChanged ? delta : null;
  }

  public getDelta(oldMap: Map<string, string>, newMap: Map<string, string>, newObj: any): any {
    const delta: any = {};
    let hasChanged = false;

    newMap.forEach((hash, path) => {
      if (path === "root") return;
      if (oldMap.get(path) !== hash) {
        this.setValueByPath(delta, path, this.getValueByPath(newObj, path));
        hasChanged = true;
      }
    });

    return hasChanged ? delta : null;
  }

  private getValueByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private setValueByPath(obj: any, path: string, value: any) {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
    target[last] = value;
  }
}