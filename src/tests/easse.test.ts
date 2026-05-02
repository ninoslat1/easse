import { createSSEResponse } from "../easse";

export async function runSSETest(assert: (a: any, b: any, msg?: string) => void) {
  const mockData = { hello: "world" };
  const response = createSSEResponse(async () => mockData, { 
    interval: 500,
    namespace: "data" 
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is empty");
  const decoder = new TextDecoder();

  const chunk1 = await reader.read();
  assert(decoder.decode(chunk1.value), ": connected\n\n", "Should send connected first");

  const chunk2 = await reader.read();
  assert(decoder.decode(chunk2.value), `data: ${JSON.stringify(mockData)}\n\n`, "Should send initial data");

  const chunk3 = await reader.read();
  assert(decoder.decode(chunk3.value), ": ping\n\n", "Should send ping on identical data");

  await reader.cancel();
}