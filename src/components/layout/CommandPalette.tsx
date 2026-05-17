import { Command } from "cmdk";
import {
  Activity,
  Accessibility,
  Bell,
  BookMarked,
  Clock,
  Code2,
  Compass,
  Copy,
  FlaskConical,
  GitCompare,
  History,
  Keyboard,
  Link2,
  MessageCircle,
  PlayCircle,
  RefreshCcw,
  Rocket,
  Sparkle,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { MODELS } from "@/data/models";
import { SAMPLE_PROMPTS } from "@/data/samplePrompts";
import { useUiStore } from "@/store/uiStore";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { useDiffStore } from "@/store/diffStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useCoachmarkStore } from "@/store/coachmarkStore";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Kbd } from "@/components/shared/Kbd";
import { ENTER_LABEL, ESC_LABEL, combo } from "@/lib/keyboard/platform";
import { toast } from "@/lib/toast";
import { buildShareUrl, copyToClipboard } from "@/lib/share/url";
import { seedDemoWorkspace } from "@/lib/demo/seedDemoWorkspace";

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const setReducedMotion = useUiStore((s) => s.setReducedMotion);
  const setKbdOverlayOpen = useUiStore((s) => s.setKbdOverlayOpen);
  const setChangelogOpen = useUiStore((s) => s.setChangelogOpen);
  const setFeedbackOpen = useUiStore((s) => s.setFeedbackOpen);
  const recentCommandIds = useUiStore((s) => s.recentCommands);
  const pushRecentCommand = useUiStore((s) => s.pushRecentCommand);
  const setModel = usePlaygroundStore((s) => s.setModel);
  const setPrompt = usePlaygroundStore((s) => s.setPrompt);
  const runInference = usePlaygroundStore((s) => s.runInference);
  const lastOutput = usePlaygroundStore((s) => s.output);
  const lastPrompt = usePlaygroundStore((s) => s.prompt);
  const currentModel = usePlaygroundStore((s) => s.model);
  const currentTemp = usePlaygroundStore((s) => s.temperature);
  const currentMaxTokens = usePlaygroundStore((s) => s.maxTokens);
  const toggleHistory = usePlaygroundStore((s) => s.toggleHistory);
  const toggleDiagnostics = usePlaygroundStore((s) => s.toggleDiagnostics);
  const historyOpen = usePlaygroundStore((s) => s.historyOpen);
  const diagnosticsOpen = usePlaygroundStore((s) => s.diagnosticsOpen);
  const loadDiffSample = useDiffStore((s) => s.loadSample);
  const startTour = useOnboardingStore((s) => s.start);
  const startCoach = useCoachmarkStore((s) => s.start);
  const navigate = useNavigate();

  useEffect(() => {
    const isTyping = (t: HTMLElement | null) => {
      if (!t) return false;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (t.isContentEditable) return true;
      return Boolean(
        t.closest('[role="textbox"], [role="searchbox"], [role="combobox"]'),
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target as HTMLElement | null)) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const close = () => setOpen(false);

  const track = (id: string) => pushRecentCommand(id);

  const go = (path: string, id: string) => {
    track(id);
    navigate(path);
    close();
  };

  const runSample = (prompt: string, id: string) => {
    track(id);
    setPrompt(prompt);
    navigate("/playground");
    close();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runInference();
      });
    });
  };

  const runLastPrompt = () => {
    track("run-last");
    if (!lastPrompt.trim()) {
      toast.warn("No prior prompt", "Type one in the Playground first.");
      close();
      return;
    }
    navigate("/playground");
    close();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runInference();
      });
    });
  };

  const copyShare = async () => {
    track("share-link");
    const url = buildShareUrl({
      v: 1,
      prompt: lastPrompt,
      model: currentModel,
      temperature: currentTemp,
      maxTokens: currentMaxTokens,
    });
    const ok = await copyToClipboard(url);
    if (ok) toast.success("Share link copied");
    else toast.danger("Couldn't copy link");
    close();
  };

  interface Action {
    id: string;
    icon: React.ReactNode;
    label: string;
    hint?: string;
    onSelect: () => void;
  }

  const actions = useMemo<Action[]>(() => {
    const a: Action[] = [
      {
        id: "go-playground",
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: "Inference playground",
        hint: "g p",
        onSelect: () => go("/playground", "go-playground"),
      },
      {
        id: "go-diff",
        icon: <GitCompare className="h-3.5 w-3.5" />,
        label: "Token-level diff",
        hint: "g d",
        onSelect: () => go("/diff", "go-diff"),
      },
      {
        id: "go-deploy",
        icon: <Rocket className="h-3.5 w-3.5" />,
        label: "Deploy console",
        hint: "g f",
        onSelect: () => go("/deploy", "go-deploy"),
      },
      {
        id: "go-observability",
        icon: <Activity className="h-3.5 w-3.5 text-accent" />,
        label: "Observability",
        hint: "g o",
        onSelect: () => go("/observability", "go-observability"),
      },
      {
        id: "go-evals",
        icon: <FlaskConical className="h-3.5 w-3.5 text-accent" />,
        label: "Eval harness",
        hint: "g e",
        onSelect: () => go("/evals", "go-evals"),
      },
      {
        id: "go-library",
        icon: <BookMarked className="h-3.5 w-3.5 text-accent" />,
        label: "Prompt library",
        hint: "g l",
        onSelect: () => go("/library", "go-library"),
      },
      {
        id: "go-api",
        icon: <Code2 className="h-3.5 w-3.5 text-accent" />,
        label: "API explorer",
        hint: "g a",
        onSelect: () => go("/api", "go-api"),
      },
      {
        id: "run-last",
        icon: <PlayCircle className="h-3.5 w-3.5 text-accent" />,
        label: "Run last prompt",
        hint: "in playground",
        onSelect: runLastPrompt,
      },
      {
        id: "share-link",
        icon: <Link2 className="h-3.5 w-3.5 text-accent" />,
        label: "Copy share link · playground",
        onSelect: copyShare,
      },
      {
        id: "copy-output",
        icon: <Copy className="h-3.5 w-3.5" />,
        label: "Copy last output",
        onSelect: async () => {
          track("copy-output");
          close();
          if (!lastOutput) {
            toast.warn("Nothing to copy", "Run a prompt first.");
            return;
          }
          const ok = await copyToClipboard(lastOutput);
          if (ok) toast.success("Output copied");
          else toast.danger("Couldn't copy output", "Clipboard access denied.");
        },
      },
      {
        id: "reload-diff",
        icon: <RefreshCcw className="h-3.5 w-3.5" />,
        label: "Re-load diff sample",
        onSelect: () => {
          track("reload-diff");
          loadDiffSample();
          go("/diff", "reload-diff");
        },
      },
      {
        id: "toggle-history",
        icon: <History className="h-3.5 w-3.5" />,
        label: historyOpen ? "Hide history panel" : "Show history panel",
        onSelect: () => {
          track("toggle-history");
          toggleHistory();
          close();
        },
      },
      {
        id: "toggle-diagnostics",
        icon: <Terminal className="h-3.5 w-3.5" />,
        label: diagnosticsOpen
          ? "Hide diagnostics panel"
          : "Show diagnostics panel",
        onSelect: () => {
          track("toggle-diagnostics");
          toggleDiagnostics();
          close();
        },
      },
      {
        id: "tour",
        icon: <Compass className="h-3.5 w-3.5 text-accent" />,
        label: "Open product tour",
        onSelect: () => {
          track("tour");
          startTour();
          close();
        },
      },
      {
        id: "coach-tour",
        icon: <Compass className="h-3.5 w-3.5 text-ok" />,
        label: "Quick coachmark tour",
        hint: "in-app spotlight",
        onSelect: () => {
          track("coach-tour");
          startCoach();
          close();
        },
      },
      {
        id: "kbd-overlay",
        icon: <Keyboard className="h-3.5 w-3.5" />,
        label: "Show keyboard shortcuts",
        hint: "?",
        onSelect: () => {
          track("kbd-overlay");
          setKbdOverlayOpen(true);
          close();
        },
      },
      {
        id: "changelog",
        icon: <Bell className="h-3.5 w-3.5" />,
        label: "What's new in Helix",
        onSelect: () => {
          track("changelog");
          setChangelogOpen(true);
          close();
        },
      },
      {
        id: "feedback",
        icon: <MessageCircle className="h-3.5 w-3.5" />,
        label: "Send feedback",
        onSelect: () => {
          track("feedback");
          setFeedbackOpen(true);
          close();
        },
      },
      {
        id: "demo-seed",
        icon: <Sparkle className="h-3.5 w-3.5 text-accent" />,
        label: "Load demo workspace",
        hint: "seed all stores",
        onSelect: () => {
          track("demo-seed");
          seedDemoWorkspace();
          close();
        },
      },
      {
        id: "reduced-motion",
        icon: <Accessibility className="h-3.5 w-3.5" />,
        label: reducedMotion ? "Disable reduced motion" : "Enable reduced motion",
        onSelect: () => {
          track("reduced-motion");
          setReducedMotion(!reducedMotion);
          close();
        },
      },
    ];
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    historyOpen,
    diagnosticsOpen,
    reducedMotion,
    lastOutput,
    lastPrompt,
    currentModel,
    currentTemp,
    currentMaxTokens,
  ]);

  const recentActions = useMemo(() => {
    const map = new Map(actions.map((a) => [a.id, a]));
    return recentCommandIds
      .map((id) => map.get(id))
      .filter((a): a is Action => Boolean(a))
      .slice(0, 5);
  }, [actions, recentCommandIds]);

  const jumpActions = actions.filter((a) => a.id.startsWith("go-"));
  const workspaceActions = actions.filter((a) => !a.id.startsWith("go-"));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 w-full max-w-xl overflow-hidden hx-glass flex flex-col"
        hideClose
        aria-label="Command palette"
      >
        <Command
          label="Command palette"
          loop
          className="bg-transparent flex flex-col min-h-0 flex-1"
        >
          <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line/8 relative shrink-0">
            <div className="grid h-7 w-7 place-items-center rounded bg-accent/10 border border-accent/20">
              <Wand2 className="h-3.5 w-3.5 text-accent shrink-0" />
            </div>
            <Command.Input
              autoFocus
              placeholder="Search · run command · jump to view…"
              className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-subtle outline-none"
            />
            <Kbd>{ESC_LABEL}</Kbd>
          </div>
          <Command.List className="flex-1 min-h-0 max-h-[460px] overflow-auto p-2 scrollbar-thin">
            <Command.Empty className="px-3 py-8 text-center text-xs text-ink-subtle">
              No matches. Try <span className="font-mono text-ink">Helix-M</span>,{" "}
              <span className="font-mono text-ink">deploy</span>, or{" "}
              <span className="font-mono text-ink">RAG</span>.
            </Command.Empty>

            {recentActions.length > 0 && (
              <Command.Group heading="Recent">
                {recentActions.map((a) => (
                  <Item
                    key={`recent-${a.id}`}
                    value={`recent-${a.id} ${a.label}`}
                    icon={<Clock className="h-3.5 w-3.5 text-ink-subtle" />}
                    label={a.label}
                    hint={a.hint}
                    onSelect={a.onSelect}
                  />
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Jump to">
              {jumpActions.map((a) => (
                <Item
                  key={a.id}
                  icon={a.icon}
                  label={a.label}
                  hint={a.hint}
                  onSelect={a.onSelect}
                />
              ))}
            </Command.Group>

            <Command.Group heading="Active model">
              {MODELS.map((m) => (
                <Item
                  key={m.id}
                  icon={<Activity className="h-3.5 w-3.5 text-warn" />}
                  label={`Use ${m.name}`}
                  hint={`${m.parameters} · ${m.modalities.join(" + ")}`}
                  onSelect={() => {
                    track(`model-${m.id}`);
                    setModel(m.id);
                    close();
                  }}
                />
              ))}
            </Command.Group>

            <Command.Group heading="Run sample prompt">
              {SAMPLE_PROMPTS.map((p) => (
                <Item
                  key={p.id}
                  icon={<PlayCircle className="h-3.5 w-3.5 text-accent" />}
                  label={p.title}
                  hint={p.langLabel}
                  onSelect={() => runSample(p.prompt, `sample-${p.id}`)}
                />
              ))}
            </Command.Group>

            <Command.Group heading="Workspace">
              {workspaceActions.map((a) => (
                <Item
                  key={a.id}
                  icon={a.icon}
                  label={a.label}
                  hint={a.hint}
                  onSelect={a.onSelect}
                />
              ))}
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between px-4 h-10 border-t border-line/8 bg-bg/40 shrink-0">
            <div className="flex items-center gap-3 text-2xs text-ink-subtle">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>{ENTER_LABEL}</Kbd> select
              </span>
              <span className="flex items-center gap-1">
                <Kbd>{ESC_LABEL}</Kbd> dismiss
              </span>
            </div>
            <span className="text-2xs text-ink-subtle font-mono">helix · {combo("K")}</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function Item({
  icon,
  label,
  hint,
  onSelect,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-ink-muted cursor-default
                 data-[selected='true']:bg-ink/[0.05]
                 data-[selected='true']:text-ink"
    >
      <span className="grid h-6 w-6 place-items-center rounded-md bg-bg-elevated border border-line/8 text-ink-muted">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="text-2xs text-ink-subtle font-mono">{hint}</span>
      )}
    </Command.Item>
  );
}
