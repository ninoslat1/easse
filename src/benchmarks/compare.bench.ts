import { run, bench, group, summary } from 'mitata';
import { DataEqualCheckModule } from "../libs/compare";
import { flatData1, flatData2, flatIdenticalData, mockHTML, nestedData1, nestedData2, nestedIdenticalData } from './bench.data';
import { AutoDiffModule } from '../libs/auto-diffing';
import { HTMLModule } from '../libs/html';
import { SSEResponseStream } from '../easse';

const minifyHtml = new HTMLModule()
const autoDiff = new AutoDiffModule(minifyHtml);
const rawSize = new TextEncoder().encode(mockHTML).length;
const sanitized = autoDiff.comparePayload(mockHTML, false);
const minified = autoDiff.comparePayload(mockHTML, true);
const sanitizedSize = new TextEncoder().encode(sanitized).length;
const minifiedSize = new TextEncoder().encode(minified).length;
const saved = ((rawSize - minifiedSize) / rawSize * 100).toFixed(2);
const sseInstance = new SSEResponseStream(async () => nestedData1, { 
  minify: true,
  namespace: "test" 
});

group('Comparison Logic Performance (Class Based) V1', () => {
  summary(() => {
    bench('Shallow Compare (Flat Data - Different)', () => {
      autoDiff.shallowCompare(flatData1, flatData2);
    });
  
    bench('Deep Compare (Flat Data - Different)', () => {
      autoDiff.deepCompare(flatData1, flatData2);
    });
  })

  bench('Deep Compare (Nested Data - Different)', () => {
    autoDiff.deepCompare(nestedData1, nestedData2);
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

group('SSE Engine: V1 (Deep) vs V2 (Merkle Tree)', () => {

  summary(() => {
    bench('V1: Full Scan & Full Payload (Nested)', async () => {
      await (sseInstance as any).benchmarkV1(nestedData2, nestedData1);
    });

    bench('V2: Merkle Tree & Delta Payload (Nested)', async () => {
      await (sseInstance as any).benchmarkV2(nestedData2, nestedData1);
    });
  });

  group('Identical Data Performance', () => {
    summary(() => {
      bench('V1 Identical: Deep Compare Scan', async () => {
        await (sseInstance as any).benchmarkV1(nestedIdenticalData, nestedIdenticalData);
      });
  
      bench('V2 Identical: Merkle Tree Scan', async () => {
        await (sseInstance as any).benchmarkV2(nestedIdenticalData, nestedIdenticalData);
      });
    })
  });

  group('Flat Data Performance', () => {
    summary(() => {
      bench('V1 Flat: Shallow Compare Scan', async () => {
        await (sseInstance as any).benchmarkV1(flatData2, flatData1);
      });
  
      bench('V2 Flat: Merkle Tree Scan', async () => {
        await (sseInstance as any).benchmarkV2(flatData2, flatData1);
      });
    })
  });
});

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


await run();