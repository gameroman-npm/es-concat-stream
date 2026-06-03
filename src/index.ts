import { Writable } from "node:stream";

type InferredEncoding = "string" | "uint8array" | "buffer" | "array" | "object";
type Encoding = InferredEncoding | "u8" | "uint8";

type Callback = (buf: ArrayLike<unknown>) => void;

class ConcatStream extends Writable {
  declare encoding?: InferredEncoding;
  declare shouldInferEncoding: boolean;
  body: unknown[];

  constructor(opts?: { encoding?: Encoding } | Callback, cb?: Callback) {
    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    opts ??= {};

    super({ objectMode: true });

    let encoding = opts.encoding;
    let shouldInferEncoding = false;

    if (!encoding) {
      shouldInferEncoding = true;
    } else {
      // @ts-expect-error
      encoding = String(encoding).toLowerCase();
      if (encoding === "u8" || encoding === "uint8") {
        encoding = "uint8array";
      }
    }

    this.encoding = encoding as InferredEncoding;
    this.shouldInferEncoding = shouldInferEncoding;
    this.body = [];

    if (cb) {
      this.on("finish", () => {
        cb(this.getBody());
      });
    }
  }

  override _write(chunk: unknown, _enc: unknown, next: () => void): void {
    this.body.push(chunk);
    next();
  }

  inferEncoding(buff?: unknown): InferredEncoding {
    const firstBuffer = buff === undefined ? this.body[0] : buff;
    if (Buffer.isBuffer(firstBuffer)) return "buffer";
    if (firstBuffer instanceof Uint8Array) return "uint8array";
    if (Array.isArray(firstBuffer)) return "array";
    if (typeof firstBuffer === "string") return "string";
    if (Object.prototype.toString.call(firstBuffer) === "[object Object]")
      return "object";
    return "buffer";
  }

  getBody(): ArrayLike<unknown> {
    if (!this.encoding && this.body.length === 0) return [];
    if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
    // @ts-expect-error
    if (this.encoding === "array") return arrayConcat(this.body);
    // @ts-expect-error
    if (this.encoding === "string") return stringConcat(this.body);
    // @ts-expect-error
    if (this.encoding === "buffer") return bufferConcat(this.body);
    // @ts-expect-error
    if (this.encoding === "uint8array") return u8Concat(this.body);
    return this.body;
  }
}

// Helper functions for concatenation
function isArrayish(arr: unknown): boolean {
  return Object.prototype.toString.call(arr).endsWith("Array]");
}

function isBufferish(p: unknown) {
  return (
    typeof p === "string" ||
    isArrayish(p) ||
    // @ts-expect-error
    (p && typeof p.subarray === "function")
  );
}

function stringConcat(parts: string[]) {
  const strings = [];

  for (const p of parts) {
    if (typeof p === "string" || Buffer.isBuffer(p)) {
      strings.push(p);
    } else if (isBufferish(p)) {
      strings.push(Buffer.from(p));
    } else {
      strings.push(Buffer.from(String(p)));
    }
  }

  if (Buffer.isBuffer(parts[0])) {
    return Buffer.concat(strings as Buffer[]).toString("utf8");
  }

  return strings.join("");
}

function bufferConcat(parts: Buffer[]) {
  const bufs = [];
  for (const p of parts) {
    if (Buffer.isBuffer(p)) {
      bufs.push(p);
    } else if (isBufferish(p)) {
      bufs.push(Buffer.from(p));
    } else {
      bufs.push(Buffer.from(String(p)));
    }
  }
  return Buffer.concat(bufs);
}

function arrayConcat(parts: bigint[][]) {
  const res = [];
  for (const part of parts) {
    res.push(...part);
  }
  return res;
}

function u8Concat(parts: Uint8Array[]) {
  let len = 0;
  for (let i = 0; i < parts.length; i++) {
    if (typeof parts[i] === "string") {
      // @ts-expect-error
      parts[i] = Buffer.from(parts[i]);
    }
    // @ts-expect-error
    len += parts[i].length;
  }
  const u8 = new Uint8Array(len);
  let offset = 0;
  for (const part of parts) {
    u8.set(part, offset);
    offset += part.length;
  }
  return u8;
}

function concat(cb?: (buf: Buffer) => void): ConcatStream;
function concat(cb?: (buf: string) => void): ConcatStream;
function concat(cb?: (buf: bigint[]) => void): ConcatStream;
function concat(cb?: (buf: Uint8Array) => void): ConcatStream;
function concat(cb?: (buf: object[]) => void): ConcatStream;
function concat(
  opts: { encoding: "buffer" | undefined } | {},
  cb: (buf: Buffer) => void,
): ConcatStream;
function concat(
  opts: { encoding: "string" },
  cb: (buf: string) => void,
): ConcatStream;
function concat(
  opts: { encoding: "array" },
  cb: (buf: bigint[]) => void,
): ConcatStream;
function concat(
  opts: { encoding: "uint8array" | "u8" | "uint8" },
  cb: (buf: Uint8Array) => void,
): ConcatStream;
function concat(
  opts: { encoding: "object" },
  cb: (buf: object[]) => void,
): ConcatStream;

function concat(opts?: unknown, cb?: unknown): ConcatStream {
  // @ts-expect-error
  return new ConcatStream(opts, cb);
}

export default concat;
export { ConcatStream };
