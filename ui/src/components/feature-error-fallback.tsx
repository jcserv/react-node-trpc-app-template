import type { ErrorComponentProps } from "@tanstack/react-router";

export function FeatureErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
      <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
      <p className="text-muted-foreground mb-2">
        An unexpected error occurred. You can try again.
      </p>
      {error instanceof Error && error.message && (
        <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted rounded-md px-3 py-2 break-all">
          {error.message}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
