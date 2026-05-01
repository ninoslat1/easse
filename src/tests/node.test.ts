import { test } from "node:test";
import assert from "node:assert";
// Tambahkan ekstensi .ts secara eksplisit
import { runSSETest } from "./easse.test.ts"; 

test("Universal SSE Suite on Node.js", async () => {
  await runSSETest((actual, expected, msg) => {
    assert.strictEqual(actual, expected, msg);
  });
});