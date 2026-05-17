import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { EndpointList } from "@/components/api/EndpointList";
import { EndpointDoc } from "@/components/api/EndpointDoc";
import { RequestBuilder } from "@/components/api/RequestBuilder";
import { CodeSnippets } from "@/components/api/CodeSnippets";
import { ResponseViewer } from "@/components/api/ResponseViewer";
import { ENDPOINTS, getEndpoint } from "@/data/endpoints";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ApiExplorerPage() {
  const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id);
  const [valuesById, setValuesById] = useState<
    Record<string, Record<string, string>>
  >(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const e of ENDPOINTS) {
      const v: Record<string, string> = {};
      for (const p of e.params) {
        v[p.name] =
          p.defaultValue !== undefined ? String(p.defaultValue) : "";
      }
      out[e.id] = v;
    }
    return out;
  });
  const reduced = useReducedMotion();

  const doc = getEndpoint(selectedId) ?? ENDPOINTS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [doc.id, reduced]);

  const values = valuesById[doc.id] ?? {};
  const onChange = (name: string, value: string) => {
    setValuesById((s) => ({ ...s, [doc.id]: { ...s[doc.id], [name]: value } }));
  };

  const visibleEndpoints = useMemo(() => ENDPOINTS, []);

  return (
    <motion.div
      className="min-w-0 px-5 lg:px-8 pt-6 pb-16 max-w-[1400px] mx-auto"
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.header className="mb-8" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent font-medium">
            <Code2 className="h-3 w-3" />
            API
          </span>
          <span className="text-2xs text-ink-subtle font-mono">
            v1 · OpenAPI 3.1
          </span>
        </div>
        <h1 className="text-[44px] sm:text-[56px] leading-[0.98] font-serif tracking-tightish text-ink">
          The Helix <span className="italic text-accent">REST</span> surface.
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted max-w-2xl leading-relaxed">
          Every endpoint, every parameter, every response shape — live, runnable,
          and copy-paste ready in the language of your choice.
        </p>
      </motion.header>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6"
        variants={fadeUp}
      >
        <aside className="lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-auto scrollbar-thin">
          <EndpointList
            endpoints={visibleEndpoints}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <motion.div
          key={doc.id}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 min-w-0"
        >
          <EndpointDoc doc={doc} />
          <RequestBuilder doc={doc} values={values} onChange={onChange} />
          <CodeSnippets doc={doc} values={values} />
          <ResponseViewer doc={doc} />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
