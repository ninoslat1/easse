import { test } from "node:test";
import assert from "node:assert";
import { runSSETest } from "./easse.test.ts"; 

test("Universal SSE Suite on Node.js", async () => {
  await runSSETest((actual, expected, msg) => {
    assert.strictEqual(actual, expected, msg);
  });
});