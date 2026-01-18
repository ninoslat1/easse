import test from "node:test";
import assert from "node:assert";
import { createSSEResponse } from "../easse.ts";

test("Universal SSE Test in Node.js", async () => {
  const mockData = { runtime: "node" };
  const res = createSSEResponse(async () => mockData);
  
  if(res.body){
      const reader = res.body.getReader();
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      
      assert.strictEqual(text, `data: ${JSON.stringify(mockData)}\n\n`);
      await reader.cancel();
  } else {
    return
  }
});