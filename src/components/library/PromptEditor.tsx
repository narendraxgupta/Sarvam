import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  PlayCircle,
  Save,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { toast } from "@/lib/toast";
import { MODELS } from "@/data/models";
import type { ModelId } from "@/types";
import type { SavedPrompt } from "@/types/library";
import { cn } from "@/lib/utils";

interface Props {
  prompt: SavedPrompt;
}

export function PromptEditor({ prompt }: Props) {
  const updatePrompt = useLibraryStore((s) => s.updatePrompt);
  const commitVersion = useLibraryStore((s) => s.commitVersion);
  const deletePrompt = useLibraryStore((s) => s.deletePrompt);
  const startConversation = useLibraryStore((s) => s.startConversation);
  const setPlaygroundPrompt = usePlaygroundStore((s) => s.setPrompt);
  const setPlaygroundModel = usePlaygroundStore((s) => s.setModel);
  const navigate = useNavigate();

  const [title, setTitle] = useState(prompt.title);
  const [body, setBody] = useState(prompt.body);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTitle(prompt.title);
    setBody(prompt.body);
    setTagInput("");
  }, [prompt.id, prompt.title, prompt.body]);

  const dirty = title !== prompt.title || body !== prompt.body;

  const save = () => {
    updatePrompt(prompt.id, { title, body });
    commitVersion(prompt.id, "manual save");
    toast.success("Prompt saved", "A new version has been snapshotted.");
  };

  const removeTag = (t: string) => {
    updatePrompt(prompt.id, {
      tags: prompt.tags.filter((x) => x !== t),
    });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || prompt.tags.includes(t)) {
      setTagInput("");
      return;
    }
    updatePrompt(prompt.id, { tags: [...prompt.tags, t] });
    setTagInput("");
  };

  const openInPlayground = () => {
    setPlaygroundPrompt(body);
    if (prompt.model) setPlaygroundModel(prompt.model);
    toast.info("Loaded into Playground");
    navigate("/playground");
  };

  const openAsConversation = () => {
    const id = startConversation(prompt.model ?? "helix-m", body);
    toast.info("Conversation started", "Your prompt is the system context.");
    void id;
  };

  return (
    <section className="hx-surface flex flex-col h-full overflow-hidden">
      <header className="px-5 pt-4 pb-3 border-b border-line/8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="hx-eyebrow text-accent">Editor</div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={openInPlayground}
              className="gap-1.5"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in playground</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={openAsConversation}
              className="gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Start chat</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                deletePrompt(prompt.id);
                toast.warn("Prompt deleted");
              }}
              className="gap-1.5 text-danger"
              aria-label="Delete prompt"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled prompt"
          className="w-full bg-transparent text-[18px] font-medium text-ink placeholder:text-ink-dim outline-none"
        />
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-5 py-4 scrollbar-thin">
        <div className="hx-eyebrow mb-2 text-ink-subtle">Body</div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className={cn(
            "w-full bg-bg-elevated/40 border border-line/10 rounded-md p-3",
            "text-[13px] text-ink font-mono leading-relaxed resize-y min-h-[220px]",
            "outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
          )}
        />

        <div className="mt-5">
          <div className="hx-eyebrow mb-2 text-ink-subtle">Tags</div>
          <div className="flex items-center gap-2 flex-wrap">
            {prompt.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full bg-bg-elevated border border-line/8 text-ink-muted"
              >
                <Hash className="h-2.5 w-2.5" />
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-ink-dim hover:text-danger"
                  aria-label={`Remove tag ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="add a tag…"
              className="h-7 px-2 bg-transparent border-b border-line/10 text-[11.5px] outline-none focus:border-accent placeholder:text-ink-dim"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="hx-eyebrow mb-2 text-ink-subtle">Default model</div>
          <div className="flex items-center gap-2 flex-wrap">
            {MODELS.map((m) => {
              const active = (prompt.model ?? "helix-m") === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    updatePrompt(prompt.id, { model: m.id as ModelId })
                  }
                  className={cn(
                    "px-2.5 h-7 rounded-md text-[11px] font-mono border transition-all",
                    active
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "border-line/10 text-ink-muted hover:text-ink",
                  )}
                >
                  {m.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="px-5 py-3 border-t border-line/8 flex items-center justify-between gap-3">
        <span className="text-[11px] text-ink-subtle">
          {prompt.versions.length} version{prompt.versions.length === 1 ? "" : "s"}{" "}
          · {body.length} chars
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px]",
              dirty ? "text-warn" : "text-ink-subtle",
            )}
          >
            {dirty ? "unsaved changes" : "saved"}
          </span>
          <Button
            size="sm"
            variant="accent"
            onClick={save}
            disabled={!dirty}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save version
          </Button>
        </div>
      </footer>
    </section>
  );
}
