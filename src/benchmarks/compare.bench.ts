import { run, bench, group } from 'mitata';
import { shallowCompareFn, defaultCompareFn } from '../libs/compare';

const flatData1 = { id: 1, name: 'Gemini', status: 'active' };
const flatData2 = { id: 1, name: 'Gemini', status: 'inactive' };

const nestedData1 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 1 } } };
const nestedData2 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 2 } } };

group('Comparison Logic Performance', () => {
  bench('Shallow Compare (Flat Data)', () => {
    shallowCompareFn(flatData1, flatData2);
  });

  bench('Deep Compare (Flat Data)', () => {
    defaultCompareFn(flatData1, flatData2);
  });

  bench('Deep Compare (Nested Data)', () => {
    defaultCompareFn(nestedData1, nestedData2);
  });
});

await run();