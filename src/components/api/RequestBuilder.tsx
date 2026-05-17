import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { EndpointDoc, EndpointParam } from "@/data/endpoints";

interface Props {
  doc: EndpointDoc;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function RequestBuilder({ doc, values, onChange }: Props) {
  const headers = doc.params.filter((p) => p.loc === "header");
  const query = doc.params.filter((p) => p.loc === "query");
  const body = doc.params.filter((p) => p.loc === "body");

  const bodyJson = useMemo(() => buildJsonBody(body, values), [body, values]);

  return (
    <section className="hx-surface p-5 flex flex-col gap-5">
      <header>
        <div className="hx-eyebrow text-accent">Try it</div>
        <div className="text-[13px] text-ink-muted">
          Edit any parameter — the live preview updates instantly.
        </div>
      </header>

      {headers.length > 0 && <Group title="Headers" params={headers} values={values} onChange={onChange} />}
      {query.length > 0 && <Group title="Query" params={query} values={values} onChange={onChange} />}
      {body.length > 0 && <Group title="Body" params={body} values={values} onChange={onChange} />}

      <div>
        <div className="hx-eyebrow text-ink-subtle mb-2">JSON body preview</div>
        <pre className="bg-bg-elevated/60 border border-line/10 rounded-md p-3 text-[11.5px] font-mono text-ink overflow-x-auto leading-relaxed">
{bodyJson}
        </pre>
      </div>
    </section>
  );
}

function Group({
  title,
  params,
  values,
  onChange,
}: {
  title: string;
  params: EndpointParam[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div>
      <div className="hx-eyebrow text-ink-subtle mb-2">{title}</div>
      <div className="flex flex-col gap-3">
        {params.map((p) => (
          <Field key={p.name} param={p} value={values[p.name] ?? ""} onChange={(v) => onChange(p.name, v)} />
        ))}
      </div>
    </div>
  );
}

function Field({
  param,
  value,
  onChange,
}: {
  param: EndpointParam;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start">
      <label className="font-mono text-[12px] text-ink pt-2.5 truncate">
        {param.name}
        {param.required && <span className="text-danger ml-1">*</span>}
      </label>
      <div>
        {param.type === "enum" && param.options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full bg-bg-elevated/60 border border-line/10 rounded-md px-3 h-9",
              "text-[12.5px] text-ink font-mono outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
            )}
          >
            {param.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : param.type === "boolean" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-bg-elevated/60 border border-line/10 rounded-md px-3 h-9 text-[12.5px] text-ink font-mono outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : param.type === "json" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className={cn(
              "w-full bg-bg-elevated/60 border border-line/10 rounded-md p-2.5",
              "text-[12px] text-ink font-mono leading-relaxed resize-y",
              "outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
            )}
          />
        ) : (
          <input
            type={param.type === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full bg-bg-elevated/60 border border-line/10 rounded-md px-3 h-9",
              "text-[12.5px] text-ink font-mono outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
            )}
          />
        )}
        <div className="mt-1 text-[11px] text-ink-subtle leading-snug">
          {param.description}
        </div>
      </div>
    </div>
  );
}

function coerce(value: string, type: EndpointParam["type"]): unknown {
  if (type === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (type === "boolean") return value === "true";
  if (type === "json") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function buildJsonBody(
  body: EndpointParam[],
  values: Record<string, string>,
): string {
  if (body.length === 0) return "{}  // no body";
  const obj: Record<string, unknown> = {};
  for (const p of body) {
    const v = values[p.name];
    if (v === undefined || v === "") continue;
    obj[p.name] = coerce(v, p.type);
  }
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "{}";
  }
}
