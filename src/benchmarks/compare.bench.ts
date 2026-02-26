import { run, bench, group } from 'mitata';
import { shallowCompareFn, defaultCompareFn } from '../libs/compare';

const flatData1 = { id: 1, name: 'active', status: 'active' };
const flatData2 = { id: 1, name: 'active', status: 'inactive' };

const flatIdenticalData = {id: 1, name: "John Doe", status: 'active'};

const nestedData1 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 1 } } };
const nestedData2 = { id: 1, meta: { tags: ['a', 'b'], nested: { x: 2 } } };

const nestedIdenticalData = {id: 1, meta: {tags: ['a', 'b'], nested: {x: 1}}};

group('Comparison Logic Performance', () => {
  bench("Shallow Compare (Flat & Same Data)", () => {
    shallowCompareFn(flatIdenticalData, flatIdenticalData)
  })

  bench("Deep Compare (Flat & Same Data)", () => {
    defaultCompareFn(flatIdenticalData, flatIdenticalData)
  })

  bench('Deep Compare (Nested & Same Data)', () => {
    defaultCompareFn(nestedIdenticalData, nestedIdenticalData);
  });

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