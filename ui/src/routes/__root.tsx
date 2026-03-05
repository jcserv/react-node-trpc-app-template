import { Component, type ReactNode } from "react";

import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Footer, Header } from "@/components";
import { FeatureErrorFallback } from "@/components/feature-error-fallback";

function RootErrorFallback(props: ErrorComponentProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <hr />
      <main className="flex-1 flex items-center justify-center">
        <FeatureErrorFallback {...props} />
      </main>
      <Footer />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <hr />
          <main className="flex-1 flex items-center justify-center">
            <FeatureErrorFallback
              error={this.state.error ?? new Error("Unknown error")}
              reset={() => window.location.reload()}
            />
          </main>
          <Footer />
        </div>
      );
    }

    return this.props.children;
  }
}

export const Route = createRootRoute({
  component: () => (
    <RootErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <hr />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <TanStackRouterDevtools />
      </div>
    </RootErrorBoundary>
  ),
  errorComponent: RootErrorFallback,
});
