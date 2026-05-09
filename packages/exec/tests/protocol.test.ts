/**
 * Tests for the FD3 line-delimited JSON protocol used between the
 * runtime parent and the action loader child. Pure-data tests: no
 * sockets, no spawn, no FD plumbing.
 */

import { describe, expect, test } from "vite-plus/test";

import {
  encodeFrame,
  parseFrameLine,
  ProtocolStreamParser,
  PROTOCOL_MAX_LINE_BYTES,
} from "../src/protocol.ts";
import { ExecError } from "../src/errors.ts";

describe("encodeFrame", () => {
  test("appends a trailing newline", () => {
    const out = encodeFrame({ type: "output", name: "foo", value: "bar" });
    expect(out.endsWith("\n")).toBe(true);
  });

  test("round-trips through parseFrameLine", () => {
    const frame = { type: "output" as const, name: "foo", value: "bar" };
    const line = encodeFrame(frame);
    const parsed = parseFrameLine(line.replace(/\n$/, ""));
    expect(parsed).toEqual(frame);
  });
});

describe("parseFrameLine", () => {
  test("accepts each known frame type", () => {
    expect(parseFrameLine('{"type":"output","name":"a","value":"b"}')).toEqual({
      type: "output",
      name: "a",
      value: "b",
    });
    expect(parseFrameLine('{"type":"log","level":"info","message":"hi"}')).toEqual({
      type: "log",
      level: "info",
      message: "hi",
    });
    expect(parseFrameLine('{"type":"error","message":"boom"}')).toEqual({
      type: "error",
      message: "boom",
    });
    expect(parseFrameLine('{"type":"error","message":"boom","stack":"at x"}')).toEqual({
      type: "error",
      message: "boom",
      stack: "at x",
    });
  });

  test("rejects invalid JSON", () => {
    expect(() => parseFrameLine("not json")).toThrow(ExecError);
  });

  test("rejects unknown frame types", () => {
    expect(() => parseFrameLine('{"type":"weird","foo":1}')).toThrow(ExecError);
  });

  test("rejects malformed output frame (missing fields)", () => {
    expect(() => parseFrameLine('{"type":"output","name":"a"}')).toThrow(ExecError);
  });

  test("rejects malformed log frame (bad level)", () => {
    expect(() => parseFrameLine('{"type":"log","level":"banana","message":"hi"}')).toThrow(
      ExecError,
    );
  });
});

describe("ProtocolStreamParser", () => {
  test("emits one frame per newline-terminated chunk", () => {
    const frames: unknown[] = [];
    const errs: unknown[] = [];
    const parser = new ProtocolStreamParser({
      onFrame: (f) => frames.push(f),
      onError: (e) => errs.push(e),
    });
    parser.push(encodeFrame({ type: "output", name: "a", value: "1" }));
    parser.push(encodeFrame({ type: "output", name: "b", value: "2" }));
    parser.end();
    expect(frames).toHaveLength(2);
    expect(errs).toHaveLength(0);
  });

  test("buffers partial lines across pushes", () => {
    const frames: unknown[] = [];
    const parser = new ProtocolStreamParser({ onFrame: (f) => frames.push(f), onError: () => {} });
    const full = encodeFrame({ type: "output", name: "a", value: "1" });
    parser.push(full.slice(0, 5));
    parser.push(full.slice(5));
    parser.end();
    expect(frames).toHaveLength(1);
  });

  test("multiple frames in one chunk produce multiple events", () => {
    const frames: unknown[] = [];
    const parser = new ProtocolStreamParser({ onFrame: (f) => frames.push(f), onError: () => {} });
    parser.push(
      encodeFrame({ type: "log", level: "info", message: "1" }) +
        encodeFrame({ type: "log", level: "info", message: "2" }),
    );
    parser.end();
    expect(frames).toHaveLength(2);
  });

  test("invalid JSON line invokes onError but parser keeps going", () => {
    const frames: unknown[] = [];
    const errs: unknown[] = [];
    const parser = new ProtocolStreamParser({
      onFrame: (f) => frames.push(f),
      onError: (e) => errs.push(e),
    });
    parser.push("garbage line\n");
    parser.push(encodeFrame({ type: "output", name: "a", value: "1" }));
    parser.end();
    expect(errs).toHaveLength(1);
    expect(errs[0]).toBeInstanceOf(ExecError);
    expect(frames).toHaveLength(1);
  });

  test("over-long line raises ExecError and resets the buffer", () => {
    const frames: unknown[] = [];
    const errs: unknown[] = [];
    const parser = new ProtocolStreamParser({
      onFrame: (f) => frames.push(f),
      onError: (e) => errs.push(e),
    });
    parser.push("x".repeat(PROTOCOL_MAX_LINE_BYTES + 1) + "\n");
    parser.end();
    expect(errs).toHaveLength(1);
    expect(errs[0]).toBeInstanceOf(ExecError);
  });

  test("partial line at end emits a single onError (warning) and drops the data", () => {
    const errs: unknown[] = [];
    const parser = new ProtocolStreamParser({ onFrame: () => {}, onError: (e) => errs.push(e) });
    parser.push("not terminated");
    parser.end();
    expect(errs).toHaveLength(1);
    expect(errs[0]).toBeInstanceOf(ExecError);
  });
});
