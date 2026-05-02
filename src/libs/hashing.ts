import { createHash } from "crypto";

export class DataHashModule {
    constructor(){}

    public hashData(data: any) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        return createHash("md5").update(str).digest("hex")
    }
}