import { run, bench, group } from 'mitata';
import { DataEqualCheckModule } from "../libs/compare";

const flatData1 = { id: 1, name: 'active', status: 'active' };
const flatData2 = { id: 1, name: 'active', status: 'inactive' };
const flatIdenticalData = { id: 1, name: "John Doe", status: 'active' };

const nestedData1 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 1 } } };
const nestedData2 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 2 } } };
const nestedIdenticalData = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 1 } } };

group('Comparison Logic Performance (Class Based)', () => {
  
  bench("Same Reference (Flat)", () => {
    DataEqualCheckModule.shallowCompare(flatIdenticalData, flatIdenticalData);
  });

  bench('Shallow Compare (Flat Data - Different)', () => {
    DataEqualCheckModule.shallowCompare(flatData1, flatData2);
  });

  bench('Deep Compare (Flat Data - Different)', () => {
    DataEqualCheckModule.deepCompare(flatData1, flatData2);
  });

  bench('Deep Compare (Nested Data - Identical)', () => {
    DataEqualCheckModule.deepCompare(nestedIdenticalData, nestedIdenticalData);
  });

  bench('Deep Compare (Nested Data - Different)', () => {
    DataEqualCheckModule.deepCompare(nestedData1, nestedData2);
  });

  bench('DepCheck Performance', () => {
    DataEqualCheckModule.depCheck(nestedData1);
  });
});

await run();