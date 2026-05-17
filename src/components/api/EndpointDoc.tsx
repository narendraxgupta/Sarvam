import { Zap } from "lucide-react";
import type { EndpointDoc as Doc, HttpMethod } from "@/data/endpoints";
import { cn } from "@/lib/utils";

interface Props {
  doc: Doc;
}

const METHOD_CHIP: Record<HttpMethod, string> = {
  GET: "bg-accent/10 text-accent border-accent/25",
  POST: "bg-ok/10 text-ok border-ok/25",
  DELETE: "bg-danger/10 text-danger border-danger/25",
};

export function EndpointDoc({ doc }: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center font-mono font-semibold text-[11px] uppercase px-2 h-6 rounded border",
            METHOD_CHIP[doc.method],
          )}
        >
          {doc.method}
        </span>
        <code className="font-mono text-[13.5px] text-ink bg-bg-elevated/60 border border-line/10 px-2.5 h-6 rounded inline-flex items-center">
          {doc.path}
        </code>
        {doc.streaming && (
          <span className="inline-flex items-center gap-1 text-[11px] text-accent border border-accent/25 bg-accent/5 rounded px-2 h-6">
            <Zap className="h-3 w-3" />
            Streaming
          </span>
        )}
      </div>
      <h1 className="font-serif text-[32px] leading-tight tracking-tightish text-ink">
        {doc.title}
      </h1>
      <p className="mt-2 text-[14.5px] text-ink-muted leading-relaxed max-w-prose">
        {doc.tagline}
      </p>
      <p className="mt-3 text-[13.5px] text-ink-muted leading-relaxed max-w-prose">
        {doc.description}
      </p>

      <div className="mt-7">
        <div className="hx-eyebrow text-accent mb-3">Parameters</div>
        <div className="hx-surface overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-subtle border-b border-line/8">
                <th className="text-left px-3 py-2.5">Name</th>
                <th className="text-left px-3 py-2.5">In</th>
                <th className="text-left px-3 py-2.5">Type</th>
                <th className="text-left px-3 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.params.map((p) => (
                <tr key={p.name} className="border-b border-line/6 last:border-b-0">
                  <td className="px-3 py-2.5 align-top">
                    <div className="font-mono text-ink">
                      {p.name}
                      {p.required && (
                        <span className="ml-1 text-[10px] text-danger font-mono">
                          *
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-ink-subtle font-mono">
                    {p.loc}
                  </td>
                  <td className="px-3 py-2.5 align-top text-ink-subtle font-mono">
                    {p.type}
                  </td>
                  <td className="px-3 py-2.5 align-top text-ink-muted">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
