import { testSSE } from "./easse.test.ts";

Deno.test("Universal SSE Test", async () => {
  await testSSE();
});