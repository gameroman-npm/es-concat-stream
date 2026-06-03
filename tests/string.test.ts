import assert from "node:assert";
import { test } from "node:test";

import concat from "es-concat-stream";

test("string -> buffer stream", async () => {
  await new Promise<void>((resolve) => {
    const strings = concat({ encoding: "buffer" }, (out) => {
      assert.ok(Buffer.isBuffer(out));
      assert.strictEqual(out.toString("utf8"), "nacho dogs");
      resolve();
    });
    strings.write("nacho ");
    strings.write("dogs");
    strings.end();
  });
});

test("string stream", async () => {
  await new Promise<void>((resolve) => {
    const strings = concat({ encoding: "string" }, (out) => {
      assert.strictEqual(typeof out, "string");
      assert.strictEqual(out, "nacho dogs");
      resolve();
    });
    strings.write("nacho ");
    strings.write("dogs");
    strings.end();
  });
});

test("end chunk", async () => {
  await new Promise<void>((resolve) => {
    const endchunk = concat({ encoding: "string" }, (out) => {
      assert.strictEqual(out, "this is the end");
      resolve();
    });
    endchunk.write("this ");
    endchunk.write("is the ");
    endchunk.end("end");
  });
});

test("string from mixed write encodings", async () => {
  await new Promise<void>((resolve) => {
    const strings = concat({ encoding: "string" }, (out) => {
      assert.strictEqual(typeof out, "string");
      assert.strictEqual(out, "nacho dogs");
      resolve();
    });
    strings.write("na");
    strings.write(Buffer.from("cho"));
    strings.write([32, 100]);

    const u8 = new Uint8Array(3);
    u8[0] = 111;
    u8[1] = 103;
    u8[2] = 115;
    strings.end(u8);
  });
});

test("string from buffers with multibyte characters", async () => {
  await new Promise<void>((resolve) => {
    const strings = concat({ encoding: "string" }, (out) => {
      assert.strictEqual(typeof out, "string");
      assert.strictEqual(out, "☃☃☃☃☃☃☃☃");
      resolve();
    });
    const snowman = Buffer.from("☃");
    for (let i = 0; i < 8; i++) {
      strings.write(snowman.subarray(0, 1));
      strings.write(snowman.subarray(1));
    }
    strings.end();
  });
});

test("string infer encoding with empty string chunk", async () => {
  await new Promise<void>((resolve) => {
    const strings = concat((out) => {
      assert.strictEqual(typeof out, "string");
      assert.strictEqual(out, "nacho dogs");
      resolve();
    });
    strings.write("");
    strings.write("nacho ");
    strings.write("dogs");
    strings.end();
  });
});

test("to string numbers", async () => {
  await new Promise<void>((resolve) => {
    const write = concat((str) => {
      assert.strictEqual(str, "a1000");
      resolve();
    });

    write.write("a");
    write.write(1000);
    write.end();
  });
});
