import { unescapeSse } from "./mockStream";

export interface SseFrame {
  data: string;
}

export class SseParser {
  private buffer = "";

  feed(chunk: string): SseFrame[] {
    this.buffer += chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const frames: SseFrame[] = [];
    let idx: number;
    while ((idx = this.buffer.indexOf("\n\n")) !== -1) {
      const raw = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 2);
      const frame = parseFrame(raw);
      if (frame) frames.push(frame);
    }
    return frames;
  }

  flush(): SseFrame[] {
    if (!this.buffer.trim()) return [];
    const frame = parseFrame(this.buffer);
    this.buffer = "";
    return frame ? [frame] : [];
  }
}

function parseFrame(raw: string): SseFrame | null {
  if (!raw) return null;
  const lines = raw.split("\n");
  let data: string | null = null;
  for (const line of lines) {

    if (line.length === 0 || line.startsWith(":")) continue;
    if (line.startsWith("data:")) {
      const payload = line.slice(5).replace(/^ /, "");
      data = data === null ? payload : data + "\n" + payload;
    }
  }
  if (data === null) return null;
  return { data: unescapeSse(data) };
}
