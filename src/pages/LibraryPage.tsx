import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PromptGrid } from "@/components/library/PromptGrid";
import { PromptEditor } from "@/components/library/PromptEditor";
import { VersionTimeline } from "@/components/library/VersionTimeline";
import { ConversationView } from "@/components/library/ConversationView";
import { TagFilterBar } from "@/components/library/TagFilterBar";
import {
  useLibraryStore,
  filterPrompts,
  selectAllTags,
} from "@/store/libraryStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

type Tab = "library" | "conversations";

export function LibraryPage() {
  const prompts = useLibraryStore((s) => s.prompts);
  const selectedId = useLibraryStore((s) => s.selectedPromptId);
  const select = useLibraryStore((s) => s.selectPrompt);
  const create = useLibraryStore((s) => s.createPrompt);
  const togglePin = useLibraryStore((s) => s.togglePin);
  const query = useLibraryStore((s) => s.query);
  const setQuery = useLibraryStore((s) => s.setQuery);
  const activeTags = useLibraryStore((s) => s.activeTags);
  const toggleTag = useLibraryStore((s) => s.toggleTag);
  const clearTags = useLibraryStore((s) => s.clearTags);
  const conversations = useLibraryStore((s) => s.conversations);
  const activeConversationId = useLibraryStore((s) => s.activeConversationId);
  const selectConversation = useLibraryStore((s) => s.selectConversation);
  const reduced = useReducedMotion();

  const [tab, setTab] = useState<Tab>("library");

  const allTags = useMemo(() => selectAllTags(prompts), [prompts]);
  const filtered = useMemo(
    () => filterPrompts(prompts, query, activeTags),
    [prompts, query, activeTags],
  );

  const selected = useMemo(
    () => prompts.find((p) => p.id === selectedId) ?? null,
    [prompts, selectedId],
  );

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
            <BookMarked className="h-3 w-3" />
            Library
          </span>
          <span className="text-2xs text-ink-subtle font-mono">
            {prompts.length} prompts · {conversations.length} conversations
          </span>
        </div>
        <h1 className="text-[44px] sm:text-[56px] leading-[0.98] font-serif tracking-tightish text-ink">
          Your <span className="italic text-accent">prompt vault</span>.
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted max-w-2xl leading-relaxed">
          Save the prompts that work, version every revision, and replay them
          as multi-turn conversations when you need to feel how they land.
        </p>
      </motion.header>

      <motion.div
        role="tablist"
        aria-label="Library sections"
        className="mb-5 flex items-center gap-1 border-b border-line/8"
        variants={fadeUp}
      >
        <TabButton
          active={tab === "library"}
          onClick={() => setTab("library")}
          controls="library-panel-prompts"
        >
          Library
          <span className="ml-2 text-[10.5px] font-mono text-ink-subtle">
            {prompts.length}
          </span>
        </TabButton>
        <TabButton
          active={tab === "conversations"}
          onClick={() => setTab("conversations")}
          controls="library-panel-conversations"
        >
          Conversations
          <span className="ml-2 text-[10.5px] font-mono text-ink-subtle">
            {conversations.length}
          </span>
        </TabButton>
      </motion.div>

      {tab === "library" ? (
        <div
          id="library-panel-prompts"
          role="tabpanel"
          aria-labelledby="library-tab-library"
        >
          <motion.section className="mb-5 flex flex-col gap-3" variants={fadeUp}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-bg-elevated/50 border border-line/10 rounded-lg px-3 h-9 focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/30 transition">
                <Search className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, body, tag…"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-subtle"
                />
              </div>
              <Button
                size="sm"
                variant="accent"
                onClick={() => create({ title: "Untitled prompt", body: "" })}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                New prompt
              </Button>
            </div>
            <TagFilterBar
              allTags={allTags}
              activeTags={activeTags}
              onToggle={toggleTag}
              onClear={clearTags}
            />
          </motion.section>

          {selected ? (
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 mb-6"
              variants={fadeUp}
            >
              <PromptEditor prompt={selected} />
              <div className="h-[600px]">
                <VersionTimeline prompt={selected} />
              </div>
            </motion.section>
          ) : null}

          <motion.section variants={fadeUp}>
            <PromptGrid
              prompts={filtered}
              selectedId={selectedId}
              onSelect={select}
              onTogglePin={togglePin}
            />
          </motion.section>
        </div>
      ) : (
        <motion.section
          id="library-panel-conversations"
          role="tabpanel"
          aria-labelledby="library-tab-conversations"
          variants={fadeUp}
        >
          <ConversationView
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={selectConversation}
          />
        </motion.section>
      )}
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  controls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  // Derive a stable id from the panel id so `aria-labelledby` resolves.
  const tabId = controls.replace("panel", "tab").replace(/^library-tab-prompts$/, "library-tab-library");
  return (
    <button
      type="button"
      id={tabId}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        "relative px-4 h-9 text-[13px] font-medium transition-colors rounded-t",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
      {active && (
        <motion.span
          layoutId="library-tab-indicator"
          className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent rounded-t"
        />
      )}
    </button>
  );
}
