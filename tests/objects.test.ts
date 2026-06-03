import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

test("writing objects", async () => {
  await new Promise<void>((resolve) => {
    const stream = concat({ encoding: "objects" }, concatted);

    function concatted(objs) {
      assert.strictEqual(objs.length, 2);
      assert.deepEqual(objs[0], { foo: "bar" });
      assert.deepEqual(objs[1], { baz: "taco" });
      resolve();
    }

    stream.write({ foo: "bar" });
    stream.write({ baz: "taco" });
    stream.end();
  });
});

test("switch to objects encoding if no encoding specified and objects are written", async () => {
  await new Promise<void>((resolve) => {
    const stream = concat(concatted);

    function concatted(objs) {
      assert.strictEqual(objs.length, 2);
      assert.deepEqual(objs[0], { foo: "bar" });
      assert.deepEqual(objs[1], { baz: "taco" });
      resolve();
    }

    stream.write({ foo: "bar" });
    stream.write({ baz: "taco" });
    stream.end();
  });
});
