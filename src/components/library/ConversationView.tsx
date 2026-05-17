import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, MessageSquarePlus, Send, Square, Trash2 } from "lucide-react";
import {
  conversationToJSON,
  conversationToMarkdown,
  downloadFile,
  exportTimestamp,
} from "@/lib/export";
import { toast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/data/models";
import { useLibraryStore } from "@/store/libraryStore";
import type { ModelId } from "@/types";
import type { Conversation } from "@/types/library";
import { cn } from "@/lib/utils";
import { combo } from "@/lib/keyboard/platform";
import { Kbd } from "@/components/shared/Kbd";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function ConversationView({ conversations, activeId, onSelect }: Props) {
  const startConversation = useLibraryStore((s) => s.startConversation);
  const sendTurn = useLibraryStore((s) => s.sendTurn);
  const cancel = useLibraryStore((s) => s.cancelConversation);
  const deleteConv = useLibraryStore((s) => s.deleteConversation);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const streaming = active?.turns.some((t) => t.streaming) ?? false;

  const turnCount = active?.turns.length ?? 0;
  const lastContent = active?.turns[active.turns.length - 1]?.content ?? "";

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turnCount, lastContent]);

  const send = async () => {
    if (!input.trim() || !active) return;
    const text = input;
    setInput("");
    await sendTurn(text);
  };

  const exportMd = () => {
    if (!active) return;
    const md = conversationToMarkdown({
      title: active.title,
      model: active.model,
      createdAt: active.createdAt,
      turns: active.turns.map((t) => ({
        role: t.role,
        content: t.content,
        createdAt: t.createdAt,
        model: t.model,
      })),
    });
    downloadFile(
      md,
      `helix-conversation-${exportTimestamp()}.md`,
      "text/markdown",
    );
    toast.success("Conversation exported", "Saved as a Markdown transcript.");
  };

  const exportJson = () => {
    if (!active) return;
    const json = conversationToJSON({
      title: active.title,
      model: active.model,
      createdAt: active.createdAt,
      turns: active.turns.map((t) => ({
        role: t.role,
        content: t.content,
        createdAt: t.createdAt,
        model: t.model,
      })),
    });
    downloadFile(
      json,
      `helix-conversation-${exportTimestamp()}.json`,
      "application/json",
    );
    toast.success("Conversation exported", "Saved as structured JSON.");
  };

  return (
    <section className="hx-surface flex flex-col h-[600px] overflow-hidden">
      <header className="h-12 px-4 flex items-center gap-3 border-b border-line/8 shrink-0">
        <div className="hx-eyebrow text-accent">Conversation</div>
        <div className="flex-1 min-w-0">
          <span className="text-[12.5px] text-ink truncate block">
            {active?.title ?? "Start a new chat to test multi-turn flows"}
          </span>
        </div>
        {active && active.turns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export conversation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={exportMd}>
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={exportJson}>
                JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const id = startConversation("helix-m");
            onSelect(id);
          }}
          className="gap-1.5"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[160px] shrink-0 border-r border-line/8 overflow-auto scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="px-3 py-4 text-[11px] text-ink-dim">
              No chats yet.
            </div>
          ) : (
            <ul className="flex flex-col p-2 gap-0.5">
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "relative group rounded transition-colors",
                      isActive
                        ? "bg-accent/10 text-ink"
                        : "text-ink-muted hover:bg-ink/[0.03] hover:text-ink",
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      aria-label={`Open conversation: ${c.title}`}
                      onClick={() => onSelect(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(c.id);
                        }
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-[11.5px] cursor-pointer pr-7",
                        "outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      )}
                    >
                      <span className="truncate font-medium block">
                        {c.title}
                      </span>
                      <div className="font-mono text-[9.5px] text-ink-subtle">
                        {c.model} · {c.turns.length} turns
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConv(c.id);
                      }}
                      className={cn(
                        "absolute top-1.5 right-1.5 p-0.5 rounded",
                        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                        "text-ink-dim hover:text-danger",
                        "outline-none focus-visible:ring-2 focus-visible:ring-danger",
                      )}
                      aria-label={`Delete conversation: ${c.title}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          {!active ? (
            <div className="flex-1 grid place-items-center p-6 text-center">
              <div>
                <div className="hx-eyebrow text-ink-dim mb-2">
                  No chat selected
                </div>
                <p className="text-[12.5px] text-ink-subtle max-w-[300px] mx-auto leading-relaxed mb-4">
                  Start a multi-turn conversation to feel out a prompt over
                  several exchanges. Every turn streams just like the
                  Playground.
                </p>
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    const id = startConversation("helix-m");
                    onSelect(id);
                  }}
                  className="gap-1.5"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" /> New conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 h-8 flex items-center gap-2 border-b border-line/6 shrink-0">
                <span className="hx-eyebrow text-ink-subtle">Model</span>
                <select
                  value={active.model}
                  onChange={(e) => {
                    useLibraryStore.setState((s) => ({
                      conversations: s.conversations.map((c) =>
                        c.id === active.id
                          ? { ...c, model: e.target.value as ModelId }
                          : c,
                      ),
                    }));
                  }}
                  className="bg-transparent text-[11.5px] font-mono text-ink outline-none"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}
                    </option>
                  ))}
                </select>
                {streaming && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-6 gap-1.5"
                    onClick={() => cancel()}
                  >
                    <Square className="h-3 w-3" /> Stop
                  </Button>
                )}
              </div>

              <div
                ref={scrollerRef}
                className="flex-1 min-h-0 overflow-auto scrollbar-thin px-4 py-4 flex flex-col gap-4"
              >
                <AnimatePresence initial={false}>
                  {active.turns.length === 0 ? (
                    <div className="text-[12.5px] text-ink-subtle italic">
                      Send a message to start the conversation.
                    </div>
                  ) : (
                    active.turns.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "max-w-[90%]",
                          t.role === "user"
                            ? "self-end bg-accent/10 border border-accent/20"
                            : "self-start bg-bg-elevated/60 border border-line/8",
                          "rounded-xl px-3.5 py-2.5",
                        )}
                      >
                        <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-subtle mb-1 flex items-center gap-1.5">
                          {t.role === "user" ? "You" : `Helix · ${t.model ?? active.model}`}
                          {t.streaming && (
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          )}
                        </div>
                        <div className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
                          {t.content}
                          {t.streaming && (
                            <span className="caret" aria-hidden />
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="border-t border-line/8 p-3 flex items-end gap-2 shrink-0"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  rows={2}
                  placeholder="Type a message…"
                  disabled={streaming}
                  className={cn(
                    "flex-1 bg-bg-elevated/40 border border-line/10 rounded-md p-2.5",
                    "text-[13px] text-ink resize-none outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
                  )}
                />
                <div className="flex flex-col items-end gap-1">
                  <Button
                    type="submit"
                    size="sm"
                    variant="accent"
                    disabled={!input.trim() || streaming}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                  <span className="text-[10px] text-ink-dim font-mono">
                    <Kbd>{combo("Enter")}</Kbd>
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
