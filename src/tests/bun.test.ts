import { expect, test } from "bun:test";
import { createSSEResponse } from "../easse";

test("Universal SSE Test in Bun", async () => {
  const mockData = { status: "ok" };
  const res = createSSEResponse(async () => mockData);
  
  const reader = res.body!.getReader();
  const { value } = await reader.read();
  const text = new TextDecoder().decode(value);
  
  expect(text).toBe(`data: ${JSON.stringify(mockData)}\n\n`);
  await reader.cancel();
});

test("SSE emits new data for each interval", async () => {
    let callCount = 0;

  const fetchData = async () => {
    callCount++;
    return { value: callCount };
  };

  const res = createSSEResponse(fetchData, {
    interval: 5,
    compareFn: (a, b) => a.value === b.value,
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  const first = await reader.read();
  const firstText = decoder.decode(first.value);

  expect(firstText).toBe(`data: ${JSON.stringify({ value: 1 })}\n\n`);

  await Bun.sleep(10);

  const second = await reader.read();
  const secondText = decoder.decode(second.value);

  expect(secondText).toBe(`data: ${JSON.stringify({ value: 2 })}\n\n`);

  await reader.cancel();
})