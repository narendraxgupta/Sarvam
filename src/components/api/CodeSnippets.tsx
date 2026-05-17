import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { copyToClipboard } from "@/lib/share/url";
import type { EndpointDoc } from "@/data/endpoints";

type Lang = "curl" | "ts" | "python" | "go";

interface Props {
  doc: EndpointDoc;
  values: Record<string, string>;
}

const LANG_LABEL: Record<Lang, string> = {
  curl: "cURL",
  ts: "TypeScript",
  python: "Python",
  go: "Go",
};

export function CodeSnippets({ doc, values }: Props) {
  const [lang, setLang] = useState<Lang>("curl");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => buildSnippet(lang, doc, values), [lang, doc, values]);

  // Hold the "copied" badge timeout in a ref so it can be cancelled if

  const copiedTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const copy = async () => {
    const ok = await copyToClipboard(code);
    if (!ok) {
      toast.danger("Couldn't copy snippet");
      return;
    }
    setCopied(true);
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimerRef.current = null;
    }, 1500);
    toast.success(`${LANG_LABEL[lang]} snippet copied`);
  };

  return (
    <section className="hx-surface overflow-hidden">
      <header className="flex items-center gap-1 border-b border-line/8 px-2">
        {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={cn(
              "relative h-9 px-3 text-[12px] font-medium transition-colors",
              lang === l ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {LANG_LABEL[l]}
            {lang === l && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent rounded-t" />
            )}
          </button>
        ))}
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="h-7 gap-1.5 mr-1"
        >
          {copied ? (
            <Check className="h-3 w-3 text-ok" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="text-[11.5px]">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </header>
      <pre className="p-4 text-[12px] font-mono leading-relaxed text-ink overflow-x-auto bg-bg-sunken/40 max-h-[460px]">
{code}
      </pre>
    </section>
  );
}

function bodyValueFor(
  doc: EndpointDoc,
  values: Record<string, string>,
): string {
  const body = doc.params.filter((p) => p.loc === "body");
  if (body.length === 0) return "";
  const obj: Record<string, unknown> = {};
  for (const p of body) {
    const v = values[p.name];
    if (v === undefined || v === "") continue;
    if (p.type === "number") obj[p.name] = Number(v);
    else if (p.type === "boolean") obj[p.name] = v === "true";
    else if (p.type === "json") {
      try {
        obj[p.name] = JSON.parse(v);
      } catch {
        obj[p.name] = v;
      }
    } else obj[p.name] = v;
  }
  return JSON.stringify(obj, null, 2);
}

function headersFor(
  doc: EndpointDoc,
  values: Record<string, string>,
): { name: string; value: string }[] {
  return doc.params
    .filter((p) => p.loc === "header")
    .map((p) => ({ name: p.name, value: values[p.name] ?? "" }));
}

function queryStringFor(
  doc: EndpointDoc,
  values: Record<string, string>,
): string {
  const qs = new URLSearchParams();
  for (const p of doc.params.filter((p) => p.loc === "query")) {
    const v = values[p.name];
    if (v) qs.set(p.name, v);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function buildSnippet(
  lang: Lang,
  doc: EndpointDoc,
  values: Record<string, string>,
): string {
  const base = "https://api.helix.dev";
  const url = `${base}${doc.path}${queryStringFor(doc, values)}`;
  const headers = headersFor(doc, values);
  const body = bodyValueFor(doc, values);

  switch (lang) {
    case "curl": {
      const headerArgs = headers
        .map((h) => `  -H '${h.name}: ${h.value}'`)
        .join(" \\\n");
      const bodyArg =
        doc.method !== "GET" && body
          ? ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`
          : "";
      return `curl -X ${doc.method} '${url}' \\\n${headerArgs}${bodyArg}`;
    }
    case "ts": {
      const headerObj = headers
        .map((h) => `    "${h.name}": "${h.value}"`)
        .join(",\n");
      return `const res = await fetch("${url}", {
  method: "${doc.method}",
  headers: {
${headerObj}
  }${
        doc.method !== "GET" && body
          ? `,\n  body: JSON.stringify(${body})`
          : ""
      }
});
${doc.streaming ? `for await (const event of parseSse(res.body!)) {\n  console.log(event);\n}` : "const data = await res.json();\nconsole.log(data);"}`;
    }
    case "python": {
      const headerLines = headers
        .map((h) => `    "${h.name}": "${h.value}"`)
        .join(",\n");
      return `import httpx

headers = {
${headerLines}
}
${doc.method !== "GET" && body ? `payload = ${body}\n\n` : ""}with httpx.stream("${doc.method}", "${url}", headers=headers${
        doc.method !== "GET" && body ? ", json=payload" : ""
      }) as r:
${
  doc.streaming
    ? `    for line in r.iter_lines():\n        if line:\n            print(line)`
    : `    print(r.json())`
}`;
    }
    case "go": {
      const headerLines = headers
        .map((h) => `\treq.Header.Set("${h.name}", "${h.value}")`)
        .join("\n");
      return `package main

import (
\t"bytes"
\t"fmt"
\t"io"
\t"net/http"
)

func main() {
\tpayload := []byte(${JSON.stringify(body || "")})
\treq, _ := http.NewRequest("${doc.method}", "${url}", bytes.NewBuffer(payload))
${headerLines}
\tres, err := http.DefaultClient.Do(req)
\tif err != nil { panic(err) }
\tdefer res.Body.Close()
\tb, _ := io.ReadAll(res.Body)
\tfmt.Println(string(b))
}`;
    }
  }
}
