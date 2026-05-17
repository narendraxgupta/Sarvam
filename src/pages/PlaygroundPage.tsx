import { InputDock } from "@/components/playground/InputDock";
import { StreamView } from "@/components/playground/StreamView";
import { MetricsRail } from "@/components/playground/MetricsRail";
import { DiagnosticsPanel } from "@/components/playground/DiagnosticsPanel";
import { HistoryDrawer } from "@/components/playground/HistoryDrawer";
import { PlaygroundHero } from "@/components/playground/PlaygroundHero";
import { StaggerReveal } from "@/components/shared/StaggerReveal";
import { Button } from "@/components/ui/Button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { PanelLeft, BarChart3 } from "lucide-react";
import { usePlaygroundStore, getModelMeta } from "@/store/playgroundStore";

export function PlaygroundPage() {
  const phase = usePlaygroundStore((s) => s.phase);
  const hasOutput = usePlaygroundStore((s) => s.output.length > 0);
  const historyOpen = usePlaygroundStore((s) => s.historyOpen);
  const toggleHistory = usePlaygroundStore((s) => s.toggleHistory);
  const diagnosticsOpen = usePlaygroundStore((s) => s.diagnosticsOpen);
  const toggleDiagnostics = usePlaygroundStore((s) => s.toggleDiagnostics);
  const model = usePlaygroundStore((s) => s.model);
  const modelMeta = getModelMeta(model);

  const isEmpty = phase === "idle" && !hasOutput;

  if (isEmpty) {
    return (
      <StaggerReveal className="relative min-w-0">
        <PlaygroundHero />
      </StaggerReveal>
    );
  }

  const railHeight = "calc(100vh - var(--topbar-h, 56px) - 80px)";

  return (
    <StaggerReveal className="relative min-w-0 px-4 lg:px-6 pt-4 pb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-ok relative">
            <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
          </span>
          <span className="hx-eyebrow text-ink-subtle">
            {modelMeta.name}
          </span>
        </div>
        <div className="flex-1" />
        <Button
          variant={historyOpen ? "secondary" : "ghost"}
          size="sm"
          className="h-7"
          onClick={toggleHistory}
          aria-pressed={historyOpen}
        >
          <PanelLeft className="h-3.5 w-3.5" />
          <span className="text-xs">History</span>
        </Button>
        <Button
          variant={diagnosticsOpen ? "secondary" : "ghost"}
          size="sm"
          className="h-7"
          onClick={toggleDiagnostics}
          aria-pressed={diagnosticsOpen}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-xs">Diagnostics</span>
        </Button>
      </div>

      <div
        className="hidden xl:block"
        style={{ height: railHeight, minHeight: 540 }}
      >
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="hx-playground-cols-v2"
        >
          {historyOpen && (
            <>
              <ResizablePanel defaultSize={18} minSize={14} maxSize={32}>
                <HistoryDrawer />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}
          <ResizablePanel defaultSize={historyOpen ? 60 : 76} minSize={40}>
            {diagnosticsOpen ? (
              <ResizablePanelGroup
                direction="vertical"
                autoSaveId="hx-playground-main-v2"
              >
                <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                  <div className="flex flex-col gap-3 h-full pr-1">
                    <InputDock />
                  </div>
                </ResizablePanel>
                <ResizableHandle direction="vertical" />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="min-w-0 h-full pr-1">
                    <StreamView />
                  </div>
                </ResizablePanel>
                <ResizableHandle direction="vertical" />
                <ResizablePanel defaultSize={20} minSize={15} maxSize={50}>
                  <div className="min-w-0 h-full pr-1">
                    <DiagnosticsPanel />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="flex flex-col gap-3 h-full pr-1">
                <InputDock />
                <div className="min-w-0 flex-1 min-h-0">
                  <StreamView />
                </div>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={22} minSize={18} maxSize={36}>
            <div className="h-full overflow-auto scrollbar-thin pl-1">
              <MetricsRail />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="xl:hidden flex flex-col gap-4 min-w-0">
        <InputDock />
        <div className="h-[60vh] min-h-[420px]">
          <StreamView />
        </div>
        {diagnosticsOpen && (
          <div className="h-[240px]">
            <DiagnosticsPanel />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[460px]">
            <MetricsRail />
          </div>
          {historyOpen && (
            <div className="h-[460px]">
              <HistoryDrawer />
            </div>
          )}
        </div>
      </div>
    </StaggerReveal>
  );
}
