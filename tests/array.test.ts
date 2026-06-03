import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

test("array stream", () => {
  const arrays = concat({ encoding: "array" }, (out) => {
    assert.deepEqual(out, [1, 2, 3, 4, 5, 6]);
  });

  arrays.write([1, 2, 3]);
  arrays.write([4, 5, 6]);
  arrays.end();
});
