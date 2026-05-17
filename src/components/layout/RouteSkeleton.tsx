import { useLocation } from "react-router-dom";

export function RouteSkeleton() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/diff")) {
    return (
      <div className="px-4 lg:px-6 pt-4 pb-8 flex flex-col gap-3 min-h-screen">
        <div className="h-20 hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="h-16 hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_14px] gap-3 h-[70vh]">
          <div className="hx-surface animate-pulse bg-bg-elevated/60" />
          <div className="hx-surface animate-pulse bg-bg-elevated/60" />
          <div className="hx-surface animate-pulse bg-bg-elevated/60" />
        </div>
      </div>
    );
  }

  if (pathname.startsWith("/deploy")) {
    return (
      <div className="px-4 lg:px-6 pt-4 pb-8 grid gap-4 grid-cols-[260px_minmax(0,1fr)_320px]">
        <div className="h-[920px] hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="flex flex-col gap-4">
          <div className="h-[480px] hx-surface animate-pulse bg-bg-elevated/60" />
          <div className="h-[420px] hx-surface animate-pulse bg-bg-elevated/60" />
        </div>
        <div className="h-[920px] hx-surface animate-pulse bg-bg-elevated/60" />
      </div>
    );
  }

  if (
    pathname.startsWith("/observability") ||
    pathname.startsWith("/evals") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/api")
  ) {
    return (
      <div className="px-5 lg:px-8 pt-6 pb-16 max-w-[1400px] mx-auto flex flex-col gap-4">
        <div className="h-12 w-[260px] rounded-full bg-bg-elevated/60 animate-pulse" />
        <div className="h-20 max-w-2xl bg-bg-elevated/60 rounded-md animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 hx-surface animate-pulse bg-bg-elevated/60"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mt-2">
          <div className="h-[320px] hx-surface animate-pulse bg-bg-elevated/60" />
          <div className="h-[320px] hx-surface animate-pulse bg-bg-elevated/60" />
        </div>
        <div className="h-[420px] hx-surface animate-pulse bg-bg-elevated/60" />
      </div>
    );
  }

  if (pathname === "/" || pathname.startsWith("/welcome")) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <div className="h-5 w-32 bg-bg-elevated/60 rounded-full animate-pulse" />
          <div className="h-16 bg-bg-elevated/60 rounded-md animate-pulse" />
          <div className="h-16 bg-bg-elevated/60 rounded-md animate-pulse" />
          <div className="h-24 bg-bg-elevated/60 rounded-md animate-pulse mt-4" />
        </div>
      </div>
    );
  }

  // Default: playground silhouette.
  return (
    <div className="px-4 lg:px-6 pt-4 pb-8 grid gap-4 grid-cols-[240px_minmax(0,1fr)_320px]">
      <div className="h-[600px] hx-surface animate-pulse bg-bg-elevated/60" />
      <div className="flex flex-col gap-4">
        <div className="h-28 hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="h-[64vh] min-h-[440px] hx-surface animate-pulse bg-bg-elevated/60" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-44 hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="h-32 hx-surface animate-pulse bg-bg-elevated/60" />
        <div className="h-32 hx-surface animate-pulse bg-bg-elevated/60" />
      </div>
    </div>
  );
}
