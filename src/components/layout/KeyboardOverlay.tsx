import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Kbd } from "@/components/shared/Kbd";
import { useUiStore } from "@/store/uiStore";
import { MOD_LABEL, ENTER_LABEL, ESC_LABEL } from "@/lib/keyboard/platform";
import { Keyboard } from "lucide-react";

interface ShortcutEntry {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: [MOD_LABEL, "K"], label: "Open command palette" },
      { keys: ["/"], label: "Open command palette (no modifier)" },
      { keys: ["?"], label: "Show keyboard shortcuts" },
      { keys: [MOD_LABEL, "\\"], label: "Toggle sidebar" },
      { keys: [ESC_LABEL], label: "Dismiss any overlay" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "P"], label: "Go to Playground" },
      { keys: ["G", "D"], label: "Go to Diff" },
      { keys: ["G", "F"], label: "Go to Deploy" },
      { keys: ["G", "O"], label: "Go to Observability" },
      { keys: ["G", "E"], label: "Go to Evals" },
      { keys: ["G", "L"], label: "Go to Library" },
      { keys: ["G", "A"], label: "Go to API Explorer" },
    ],
  },
  {
    title: "Playground",
    shortcuts: [
      { keys: [MOD_LABEL, ENTER_LABEL], label: "Run inference" },
      { keys: [MOD_LABEL, "."], label: "Abort stream" },
    ],
  },
  {
    title: "Diff",
    shortcuts: [
      { keys: ["J"], label: "Next change" },
      { keys: ["K"], label: "Previous change" },
    ],
  },
];

export function KeyboardOverlay() {
  const open = useUiStore((s) => s.kbdOverlayOpen);
  const setOpen = useUiStore((s) => s.setKbdOverlayOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 border border-accent/20 text-accent">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-[15px] font-semibold">
              Keyboard shortcuts
            </DialogTitle>
            <DialogDescription className="text-[12px] mt-0.5">
              Every action in Helix is one keystroke away.
            </DialogDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-h-[60vh] overflow-auto pr-2 scrollbar-thin">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <div className="hx-eyebrow mb-3 text-accent">{group.title}</div>
              <ul className="flex flex-col">
                {group.shortcuts.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3 py-2 border-b border-line/6 last:border-b-0"
                  >
                    <span className="text-[12.5px] text-ink">{s.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {s.keys.map((k, i) => (
                        <Kbd key={`${s.label}-${k}-${i}`}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-line/8 flex items-center justify-between text-[11px] text-ink-subtle">
          <span>Press <Kbd>?</Kbd> any time to open this panel</span>
          <span className="font-mono">{GROUPS.length} groups</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
