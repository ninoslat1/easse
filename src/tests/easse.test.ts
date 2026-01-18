import {createSSEResponse } from "../easse"

export async function testSSE() {
  const mockData = { hello: "world" };
  const response = createSSEResponse(async () => mockData, { interval: 1000 });

  const contentType = response.headers.get("Content-Type");
  if (contentType !== "text/event-stream") {
    throw new Error(`Expected text/event-stream, got ${contentType}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is empty");

  const { value } = await reader.read();
  const decoded = new TextDecoder().decode(value);

  const expected = `data: ${JSON.stringify(mockData)}\n\n`;
  if (decoded !== expected) {
    throw new Error(`Expected ${expected}, got ${decoded}`);
  }

  await reader.cancel();
  console.log("✅ SSE Test Passed!");
}