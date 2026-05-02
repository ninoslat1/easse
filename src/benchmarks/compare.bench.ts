import { run, bench, group, summary } from 'mitata';
import { DataEqualCheckModule } from "../libs/compare";
import { flatData1, flatData2, flatIdenticalData, mockHTML, nestedData1, nestedData2, nestedIdenticalData } from './bench.data';
import { AutoDiffModule } from '../libs/auto-diffing';
import { HTMLModule } from '../libs/html';

const minifyHtml = new HTMLModule()
const autoDiff = new AutoDiffModule(minifyHtml);
const checker = new DataEqualCheckModule(autoDiff);
const rawSize = new TextEncoder().encode(mockHTML).length;
const sanitized = autoDiff.comparePayload(mockHTML, false);
const minified = autoDiff.comparePayload(mockHTML, true);

const sanitizedSize = new TextEncoder().encode(sanitized).length;
const minifiedSize = new TextEncoder().encode(minified).length;

const saved = ((rawSize - minifiedSize) / rawSize * 100).toFixed(2);

group('Comparison Logic Performance (Class Based) V1', () => {
  
  bench("Same Reference (Flat)", () => {
    autoDiff.shallowCompare(flatIdenticalData, flatIdenticalData);
  });

  summary(() => {
    bench('Shallow Compare (Flat Data - Different)', () => {
      autoDiff.shallowCompare(flatData1, flatData2);
    });
  
    bench('Deep Compare (Flat Data - Different)', () => {
      autoDiff.deepCompare(flatData1, flatData2);
    });
  })

  bench('Deep Compare (Nested Data - Identical)', () => {
    autoDiff.deepCompare(nestedIdenticalData, nestedIdenticalData);
  });

  bench('Deep Compare (Nested Data - Different)', () => {
    autoDiff.deepCompare(nestedData1, nestedData2);
  });

  bench('DepCheck Performance', () => {
    checker.depCheck(nestedData1);
  });
});

console.log(`
📊 **Payload Size Comparison:**
---------------------------------------------
| Type         | Size (Bytes) | Reduction    |
|--------------|--------------|--------------|
| Raw HTML     | ${rawSize.toLocaleString()} B      | -            |
| Sanitized    | ${sanitizedSize.toLocaleString()} B      | ${((rawSize - sanitizedSize) / rawSize * 100).toFixed(2)}%        |
| Minified     | ${minifiedSize.toLocaleString()} B      | ${saved}%       |
---------------------------------------------
`);

group("HTML Processing Performance", () => {
  summary(() => {
    bench("HTML Sanitization Only (Minify: false)", () => {
      autoDiff.comparePayload(mockHTML, false);
    });
  
    bench("HTML Full Minify (Minify: true)", () => {
      autoDiff.comparePayload(mockHTML, true);
    });
  })

  const jsonObject = { data: Array(20).fill({ name: "item", val: Math.random() }) };
  bench("JSON Stringify (Baseline)", () => {
    autoDiff.comparePayload(jsonObject, false);
  });
});

// group("Comparison Logic Performance (Class Based) V2", () => {
  
//   summary(() => {
//     bench("Comparison Resolver V1 (Flat Data - Identical)", () => {
//       const fn = checker.resolveCompareFn(flatIdenticalData, flatIdenticalData);
//       fn(flatIdenticalData, flatIdenticalData)
//     })
  
//     bench("Comparison Resolver V2 (Flat Data - Identical)", () => {
//       const fn = checker.resolveCompareFnV2(flatIdenticalData, flatIdenticalData);
//       fn(flatIdenticalData, flatIdenticalData);
//     });
//   })

//   summary(() => {
//     bench("Comparison Resolver V1 (Flat Data - Different)", () => {
//       const fn = checker.resolveCompareFn(flatData1, flatData2);
//       fn(flatData1, flatData2)
//     })
  
//     bench("Comparison Resolver V2 (Flat Data - Different)", () => {
//       const fn = checker.resolveCompareFnV2(flatData1, flatData2);
//       fn(flatData1, flatData2);
//     });
//   })

//   summary(() => {
//     bench("V1: Deep Compare (Static 60KB)", () => {
//       autoDiff.deepCompare(LARGE_STATIC, [...LARGE_STATIC]);
//     });

//     bench("V2: Smart Detect Hashing (Static 60KB)", () => {
//       const fn = checker.resolveCompareFnV2(LARGE_STATIC, [...LARGE_STATIC]);
//       fn(LARGE_STATIC, [...LARGE_STATIC]);
//     });
//   });

//   summary(() => {
//     bench("V1: Deep Compare (Dynamic 60KB)", () => {
//       autoDiff.deepCompare(dynamicA, dynamicB);
//     });

//     bench("V2: Smart Detect Hashing (Dynamic 60KB)", () => {
//       const fn = checker.resolveCompareFnV2(dynamicA, dynamicB);
//       fn(dynamicA, dynamicB);
//     });
//   });
// });

await run();