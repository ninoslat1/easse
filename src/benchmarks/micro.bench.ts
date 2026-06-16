import { run, bench, group, summary } from "mitata";
import { DataEqualCheckModule } from "../libs/compare";
import { flatData1, flatIdenticalData, mockHTML, nestedData1, nestedData2 } from "./bench.data";
import { AutoDiffModule } from "../libs/auto-diffing";
import { HTMLModule } from "../libs/html";
import { DataHashModule } from "../libs/hashing";
import { StandardEngine } from "../engines/std";
import { DeltaEngine } from "../engines/delta";
import { createHash } from "crypto";

const hashMD5 = new DataHashModule("md5");
const hashSHA = new DataHashModule("sha256");
const hashXX = new DataHashModule("xxhash");

const minifyHtml = new HTMLModule();
const autoDiff = new AutoDiffModule(minifyHtml);
const hasher = new DataHashModule();

const stdEngine = new StandardEngine(new DataEqualCheckModule(autoDiff), autoDiff, false);
const deltaEngine = new DeltaEngine(hasher, autoDiff, false);

group("Hashing Performance (Small Flat Object)", () => {
  summary(() => {
    bench("MD5", () => {
      hashMD5.hashValue(flatData1);
    });
    bench("SHA-256", () => {
      hashSHA.hashValue(flatData1);
    });
    bench("xxHash3 (Native)", () => {
      hashXX.hashValue(flatData1);
    });
  });
});

group("Hashing Performance (Large HTML Payload)", () => {
  summary(() => {
    bench("MD5 (Crypto)", () => {
      createHash("md5").update(mockHTML).digest("hex");
    });

    bench("SHA-256 (Crypto)", () => {
      createHash("sha256").update(mockHTML).digest("hex");
    });

    bench("xxHash3 (Native)", () => {
      hashXX.hashLargePayload(mockHTML);
    });
  });
});

group("Tree Mapping Performance (Merkle Tree Construction)", () => {

  group("Merkle Tree MD5", () => {
    summary(() => {
      bench("V1", () => hashMD5.generateTreeMap(nestedData1));
      bench("V2 (FFI)", () => hashMD5.generateTreeMapV2(nestedData1));
    });
  });

  group("Merkle Tree SHA256", () => {
    summary(() => {
      bench("V1", () => hashSHA.generateTreeMap(nestedData1));
      bench("V2 (FFI)", () => hashSHA.generateTreeMapV2(nestedData1));
    });
  });

  group("Merkle Tree xxHash3", () => {
    summary(() => {
      bench("V1", () => hashXX.generateTreeMap(nestedData1));
      bench("V2 (FFI)", () => hashXX.generateTreeMapV2(nestedData1));
    });
  });

});

group("SSE Engine Full Workflow (V1 vs V2)", () => {
  summary(() => {
    bench("V1: Standard (Deep Compare)", async () => {
      await stdEngine.execute(nestedData1, nestedData2);
    });

    bench("V2: Delta (Merkle + xxHash)", async () => {
      await deltaEngine.execute(nestedData1, nestedData2);
    });
  });

  bench("V2: Short Circuit (Identical Data)", async () => {
    await deltaEngine.execute(flatIdenticalData, flatIdenticalData);
  });
});

group("HTML Processing & Minification", () => {
  
  group("HTML Sanitization", () => {
    summary(() => {
      bench("V1", () => {
        autoDiff.comparePayload(mockHTML, false);
      });
      bench("V2 (FFI)", () => {
        autoDiff.comparePayloadV2(mockHTML, false);
      });
    });
  });

  group("HTML Full Minify", () => {
    summary(() => {
      bench("V1", () => {
        autoDiff.comparePayload(mockHTML, true);
      });
      bench("V2 (FFI)", () => {
        autoDiff.comparePayloadV2(mockHTML, true);
      });
    });
  });

  group("JSON Stringify", () => {
    const jsonObject = { data: Array(20).fill({ name: "item", val: Math.random() }) };
    summary(() => {
      bench("V1 (Baseline)", () => {
        autoDiff.comparePayload(jsonObject, false);
      });
      bench("V2 (FFI)", () => {
        autoDiff.comparePayloadV2(jsonObject, false);
      });
    });
  });

});

group("Internal Utility Performance", () => {

  group("getDelta (Merkle-based)", () => {
    summary(() => {
      bench("V1 generateTreeMap", () => {
        const m1 = hashXX.generateTreeMap(nestedData1);
        const m2 = hashXX.generateTreeMap(nestedData2);
        hashXX.getDelta(m1, m2, nestedData2);
      });
      bench("V2 generateTreeMapV2 (FFI)", () => {
        const m1 = hashXX.generateTreeMapV2(nestedData1);
        const m2 = hashXX.generateTreeMapV2(nestedData2);
        hashXX.getDelta(m1, m2, nestedData2);
      });
    });
  });

  bench("getDeltaLazy (Recursive)", () => {
    hashXX.getDeltaLazy(nestedData1, nestedData2);
  });

});

await run();
