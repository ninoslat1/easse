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
  summary(() => {
    bench("Merkle Tree (MD5)", () => {
      hashMD5.generateTreeMap(nestedData1);
    });
    bench("Merkle Tree (SHA)", () => {
      hashSHA.generateTreeMap(nestedData1);
    });
    bench("Merkle Tree (xxHash3)", () => {
      hashXX.generateTreeMap(nestedData1);
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
  summary(() => {
    bench("HTML Sanitization", () => {
      autoDiff.comparePayload(mockHTML, false);
    });
    bench("HTML Full Minify", () => {
      autoDiff.comparePayload(mockHTML, true);
    });
  });

  const jsonObject = { data: Array(20).fill({ name: "item", val: Math.random() }) };
  bench("JSON Stringify (Baseline)", () => {
    autoDiff.comparePayload(jsonObject, false);
  });
});

group("Internal Utility Performance", () => {
  bench("getDelta (Merkle-based)", () => {
    const m1 = hashXX.generateTreeMap(nestedData1);
    const m2 = hashXX.generateTreeMap(nestedData2);
    hashXX.getDelta(m1, m2, nestedData2);
  });

  bench("getDeltaLazy (Recursive)", () => {
    hashXX.getDeltaLazy(nestedData1, nestedData2);
  });
});

await run();
