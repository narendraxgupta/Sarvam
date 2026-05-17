import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { EndpointDoc } from "@/data/endpoints";

interface Props {
  doc: EndpointDoc;
}

interface StreamEntry {
  id: number;
  t: number;
  event: string;
  data: string;
}

export function ResponseViewer({ doc }: Props) {
  const [running, setRunning] = useState(false);
  const [stream, setStream] = useState<StreamEntry[]>([]);
  const timersRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  const reset = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setStream([]);
    setRunning(false);
  };

  useEffect(() => {
    reset();
    return reset;
  }, [doc.id]);

  const send = () => {
    reset();
    setRunning(true);
    startTimeRef.current = performance.now();
    if (doc.streaming && doc.exampleEvents) {
      doc.exampleEvents.forEach((e, i) => {
        const id = window.setTimeout(() => {
          setStream((s) => [
            ...s,
            { id: i, t: e.t, event: e.event, data: e.data },
          ]);
          if (e.event === "done" || i === doc.exampleEvents!.length - 1) {
            setRunning(false);
          }
        }, e.t);
        timersRef.current.push(id);
      });
    } else {
      // Simulate a short network delay then drop the JSON in one go.
      const id = window.setTimeout(() => {
        setStream([
          {
            id: 0,
            t: 180 + Math.floor(Math.random() * 80),
            event: "200",
            data: JSON.stringify(doc.exampleResponse ?? {}, null, 2),
          },
        ]);
        setRunning(false);
      }, 200);
      timersRef.current.push(id);
    }
  };

  return (
    <section className="hx-surface overflow-hidden">
      <header className="px-5 pt-4 pb-3 border-b border-line/8 flex items-center justify-between gap-3">
        <div>
          <div className="hx-eyebrow text-accent">Response</div>
          <div className="text-[12.5px] text-ink-muted">
            {doc.streaming
              ? "Mock SSE stream — events play back with their real timings"
              : "Mock response — typical payload from the live service"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!running && stream.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={reset}
              className="h-7 gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="text-[11.5px]">Reset</span>
            </Button>
          )}
          {running ? (
            <Button
              size="sm"
              variant="danger"
              onClick={reset}
              className="h-7 gap-1.5"
            >
              <Square className="h-3 w-3" />
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              variant="accent"
              onClick={send}
              className="h-7 gap-1.5"
            >
              <Play className="h-3 w-3" />
              Send request
            </Button>
          )}
        </div>
      </header>

      <div className="p-5 min-h-[280px] max-h-[480px] overflow-auto scrollbar-thin">
        {stream.length === 0 && !running && (
          <div className="text-center py-16">
            <div className="hx-eyebrow text-ink-dim mb-1.5">No response yet</div>
            <p className="text-[12.5px] text-ink-subtle">
              Hit <span className="font-mono text-ink">Send request</span> to
              simulate{doc.streaming ? " the SSE stream" : " a response"}.
            </p>
          </div>
        )}

        {doc.streaming ? (
          <ol className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {stream.map((entry) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-[64px_1fr] gap-3 items-start font-mono text-[11.5px] py-1"
                >
                  <span className="text-ink-subtle tabular-nums">
                    +{entry.t}ms
                  </span>
                  <span
                    className={cn(
                      "text-ink",
                      entry.event === "error"
                        ? "text-danger"
                        : entry.event === "done"
                        ? "text-ok"
                        : "",
                    )}
                  >
                    <span className="text-accent">{entry.event}</span>
                    <span className="text-ink-subtle">:</span>{" "}
                    {entry.data}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
            {running && (
              <motion.li
                key="cursor"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="grid grid-cols-[64px_1fr] gap-3 font-mono text-[11.5px] py-1 text-ink-subtle"
              >
                <span className="tabular-nums">···</span>
                <span>waiting for next event…</span>
              </motion.li>
            )}
          </ol>
        ) : (
          stream.length > 0 && (
            <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink">
{stream[0].data}
            </pre>
          )
        )}
      </div>
    </section>
  );
}
