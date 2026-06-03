import assert from "node:assert";
import { Readable } from "node:stream";
import { test } from "node:test";

import concat from "es-concat-stream";

test("stream buffering with mock readable", async () => {
  await new Promise<void>((resolve) => {
    const mockStream = new Readable({
      read() {
        this.push("chunk one\n");
        this.push("chunk two\n");
        this.push(null);
      },
    });

    mockStream.pipe(
      concat((out) => {
        const expected = "chunk one\nchunk two\n";
        assert.strictEqual(out.toString("utf8"), expected);
        resolve();
      }),
    );
  });
});
