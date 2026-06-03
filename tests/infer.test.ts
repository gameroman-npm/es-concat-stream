import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

await test("type inference works as expected", () => {
  const stream = concat();

  assert.strictEqual(stream.inferEncoding(["hello"]), "array");
  assert.strictEqual(stream.inferEncoding(Buffer.from("hello")), "buffer");
  assert.strictEqual(stream.inferEncoding(undefined), "buffer");
  assert.strictEqual(stream.inferEncoding(new Uint8Array(1)), "uint8array");
  assert.strictEqual(stream.inferEncoding("hello"), "string");
  assert.strictEqual(stream.inferEncoding(""), "string");
  assert.strictEqual(stream.inferEncoding({ hello: "world" }), "object");
  assert.strictEqual(stream.inferEncoding(1), "buffer");
});
