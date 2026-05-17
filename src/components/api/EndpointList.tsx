import { motion } from "framer-motion";
import type { EndpointDoc, HttpMethod } from "@/data/endpoints";
import { cn } from "@/lib/utils";

interface Props {
  endpoints: EndpointDoc[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const METHOD_CLS: Record<HttpMethod, string> = {
  GET: "text-accent",
  POST: "text-ok",
  DELETE: "text-danger",
};

export function EndpointList({ endpoints, selectedId, onSelect }: Props) {
  const groups = endpoints.reduce<Record<string, EndpointDoc[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  return (
    <nav className="flex flex-col gap-4" aria-label="API endpoints">
      {Object.entries(groups).map(([group, items], gi) => (
        <div key={group}>
          <div className="hx-eyebrow px-2 mb-1.5 text-ink-subtle">{group}</div>
          <ul className="flex flex-col gap-0.5">
            {items.map((e, i) => {
              const active = e.id === selectedId;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: gi * 0.1 + i * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(e.id)}
                    className={cn(
                      "w-full text-left px-2 py-2 rounded-md transition-colors flex items-start gap-2",
                      active
                        ? "bg-accent/[0.06] text-ink"
                        : "text-ink-muted hover:text-ink hover:bg-ink/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 inline-block w-12 text-[10px] font-mono font-semibold uppercase",
                        METHOD_CLS[e.method],
                      )}
                    >
                      {e.method}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-mono text-[11.5px] text-ink truncate">
                        {e.path}
                      </span>
                      <span className="block text-[11px] text-ink-subtle truncate">
                        {e.title}
                      </span>
                    </span>
                    {e.streaming && (
                      <span className="text-[9.5px] font-mono text-accent border border-accent/30 rounded px-1 py-0.5 shrink-0 mt-0.5">
                        SSE
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
