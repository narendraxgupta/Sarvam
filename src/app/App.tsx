import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { useOnlineDetector } from "@/lib/hooks/useOnline";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { useThemeEffect } from "@/store/themeStore";
import { useApplyShareState } from "@/lib/share/useApplyShareState";
import { RouteSkeleton } from "@/components/layout/RouteSkeleton";

const PlaygroundPage = lazy(() =>
  import("@/pages/PlaygroundPage").then((m) => ({ default: m.PlaygroundPage })),
);
const DiffPage = lazy(() =>
  import("@/pages/DiffPage").then((m) => ({ default: m.DiffPage })),
);
const DeployPage = lazy(() =>
  import("@/pages/DeployPage").then((m) => ({ default: m.DeployPage })),
);
const ObservabilityPage = lazy(() =>
  import("@/pages/ObservabilityPage").then((m) => ({
    default: m.ObservabilityPage,
  })),
);
const EvalsPage = lazy(() =>
  import("@/pages/EvalsPage").then((m) => ({ default: m.EvalsPage })),
);
const LibraryPage = lazy(() =>
  import("@/pages/LibraryPage").then((m) => ({ default: m.LibraryPage })),
);
const ApiExplorerPage = lazy(() =>
  import("@/pages/ApiExplorerPage").then((m) => ({
    default: m.ApiExplorerPage,
  })),
);
const WelcomePage = lazy(() =>
  import("@/pages/WelcomePage").then((m) => ({ default: m.WelcomePage })),
);

export function App() {
  useOnlineDetector();
  useReducedMotion();
  useThemeEffect();
  useApplyShareState();

  return (
    <TooltipProvider delayDuration={140} skipDelayDuration={200}>
      <AppRoutes />
    </TooltipProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const path = location.pathname;

  // /welcome so that hitting localhost always shows the landing.
  if (path === "/" || path === "/welcome") {
    return (
      <Suspense fallback={<RouteSkeleton />}>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AppShell>
      <Suspense fallback={<RouteSkeleton />}>
        <Routes>
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/diff" element={<DiffPage />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="/observability" element={<ObservabilityPage />} />
          <Route path="/evals" element={<EvalsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/api" element={<ApiExplorerPage />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
