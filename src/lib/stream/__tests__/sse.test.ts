import { describe, expect, it } from "vitest";
import { SseParser } from "@/lib/stream/parseSSE";
import { unescapeSse } from "@/lib/stream/mockStream";

describe("SseParser", () => {
  it("parses a single data frame", () => {
    const p = new SseParser();
    const frames = p.feed("data: hello\n\n");
    expect(frames).toEqual([{ data: "hello" }]);
  });

  it("stitches a frame across multiple feed() calls", () => {
    const p = new SseParser();
    expect(p.feed("data: hel")).toEqual([]);
    expect(p.feed("lo\n\n")).toEqual([{ data: "hello" }]);
  });

  it("handles CRLF separators identically to LF", () => {
    const p = new SseParser();
    const frames = p.feed("data: alpha\r\n\r\ndata: beta\r\n\r\n");
    expect(frames.map((f) => f.data)).toEqual(["alpha", "beta"]);
  });

  it("ignores comment lines (starting with ':')", () => {
    const p = new SseParser();
    const frames = p.feed(": keep-alive\ndata: payload\n\n");
    expect(frames).toEqual([{ data: "payload" }]);
  });

  it("silently skips malformed frames", () => {
    const p = new SseParser();
    const frames = p.feed("not-a-valid-frame\n\ndata: ok\n\n");
    expect(frames).toEqual([{ data: "ok" }]);
  });

  it("flush() yields a frame held in the buffer with no trailing blank line", () => {
    const p = new SseParser();
    p.feed("data: trailing");
    expect(p.flush()).toEqual([{ data: "trailing" }]);
    // Buffer cleared after flush.
    expect(p.flush()).toEqual([]);
  });

  it("[DONE] is delivered as a normal frame for the consumer to handle", () => {
    const p = new SseParser();
    expect(p.feed("data: [DONE]\n\n")).toEqual([{ data: "[DONE]" }]);
  });
});

describe("unescapeSse round-trip", () => {
  it("converts \\n to newline", () => {
    expect(unescapeSse("first\\nsecond")).toBe("first\nsecond");
  });

  it("preserves a literal backslash that is NOT an escape", () => {
    // Two backslashes on the wire = one backslash in the payload.
    expect(unescapeSse("path\\\\to\\\\file")).toBe("path\\to\\file");
  });

  it("does not misread \\\\n as a newline", () => {
    // Wire: backslash backslash n  → unescape → backslash n (literal).
    expect(unescapeSse("\\\\n")).toBe("\\n");
  });

  it("supports CR escapes", () => {
    expect(unescapeSse("a\\rb")).toBe("a\rb");
  });
});
