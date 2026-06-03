import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

await test("no callback stream", () => {
  const stream = concat();
  stream.write("space");
  stream.end(" cats");
});

await test("no encoding set, no data", async () => {
  await new Promise<void>((resolve) => {
    const stream = concat((data) => {
      assert.deepEqual(data, []);
      resolve();
    });
    stream.end();
  });
});

await test("encoding set to string, no data", async () => {
  await new Promise<void>((resolve) => {
    const stream = concat({ encoding: "string" }, (data) => {
      assert.deepEqual(data, "");
      resolve();
    });
    stream.end();
  });
});
