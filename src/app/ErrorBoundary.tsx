import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this would ship to Sentry / our log sink.
    console.error("Helix caught:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 grid place-items-center bg-bg p-8">
        <div className="hx-elevated max-w-md p-6 text-center">
          <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-ink">
            Helix hit an unexpected error
          </div>
          <div className="mt-1 text-xs text-ink-muted leading-relaxed">
            The session state is preserved. Reloading the view will retry
            rendering — no inference history is lost.
          </div>
          <pre className="mt-4 text-left text-2xs text-ink-subtle font-mono whitespace-pre-wrap p-2 rounded-md border border-line bg-bg-elevated max-h-32 overflow-auto">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="primary" size="sm" onClick={this.reset}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry view
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Full reload
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
