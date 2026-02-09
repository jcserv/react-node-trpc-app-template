import { useEffect } from "react";

import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Lock, Zap } from "lucide-react";

import { Button } from "@/components/ui";
import { useSession } from "@/lib/auth-client";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && session?.user) {
      navigate({ to: "/notes" });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return null;
  }

  return (
    <section className="flex flex-col items-center justify-center px-6 py-24 text-center max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
        Your thoughts, organized.
      </h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        A simple, fast notes app. Create, edit, and manage your notes from
        anywhere. No clutter, no distractions.
      </p>
      <div className="flex gap-3 mb-16">
        <Link to="/signup">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="lg">
            Log In
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 text-left w-full">
        <div className="space-y-2">
          <Zap className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">Fast</h3>
          <p className="text-sm text-muted-foreground">
            Instant load times. No waiting around for your ideas.
          </p>
        </div>
        <div className="space-y-2">
          <FileText className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">Simple</h3>
          <p className="text-sm text-muted-foreground">
            Just notes. No folders, tags, or complicated setup.
          </p>
        </div>
        <div className="space-y-2">
          <Lock className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">Private</h3>
          <p className="text-sm text-muted-foreground">
            Your notes are yours. Authenticated and scoped to your account.
          </p>
        </div>
      </div>
    </section>
  );
}
