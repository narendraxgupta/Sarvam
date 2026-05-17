import { cn } from "@/lib/utils";

const labels: Record<string, { glyph: string; name: string }> = {
  en: { glyph: "EN", name: "English" },
  code: { glyph: "{ }", name: "Code" },
  json: { glyph: "JSON", name: "Schema" },
  doc: { glyph: "DOC", name: "Doc" },
};

export function LangBadge({
  lang,
  className,
}: {
  lang: string;
  className?: string;
}) {
  const meta = labels[lang] ?? { glyph: lang.toUpperCase(), name: lang };
  return (
    <span
      className={cn("hx-chip", className)}
      title={meta.name}
      aria-label={meta.name}
    >
      <span className="font-mono text-[10px]">{meta.glyph}</span>
      <span className="text-[10px]">{meta.name}</span>
    </span>
  );
}
