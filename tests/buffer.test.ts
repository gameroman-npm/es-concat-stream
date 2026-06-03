import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

test("buffer stream", () => {
  const buffers = concat((out) => {
    assert.ok(Buffer.isBuffer(out));
    assert.strictEqual(
      out.toString("utf8"),
      "pizza Array is not a stringy cat",
    );
  });

  buffers.write(Buffer.from("pizza Array is not a ", "utf8"));
  buffers.write(Buffer.from("stringy cat"));
  buffers.end();
});

test("buffer mixed writes", () => {
  const buffers = concat((out) => {
    assert.ok(Buffer.isBuffer(out));
    assert.strictEqual(
      out.toString("utf8"),
      "pizza Array is not a stringy cat555",
    );
  });

  buffers.write(Buffer.from("pizza"));
  buffers.write(" Array is not a ");
  buffers.write([115, 116, 114, 105, 110, 103, 121]);

  // Natively use Uint8Array directly
  const u8 = new Uint8Array(4);
  u8[0] = 32;
  u8[1] = 99;
  u8[2] = 97;
  u8[3] = 116;
  buffers.write(u8);

  buffers.write(555);
  buffers.end();
});
