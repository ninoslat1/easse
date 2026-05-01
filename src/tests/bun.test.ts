import { test, expect } from "bun:test";
import { runSSETest } from "./easse.test";

test("Universal SSE Suite on Bun", async () => {
  await runSSETest((actual, expected, msg) => {
    expect(actual).toBe(expected);
  });
});