import { Link } from "@tanstack/react-router";
import { Notebook, Shield, StickyNote } from "lucide-react";

import { ModeToggle } from "@/components";
import { Button } from "@/components/ui";
import { signOut, useSession } from "@/lib/auth-client";

export const Header: React.FC = () => {
  const { data: session } = useSession();

  const isAdmin =
    session?.user && (session.user as Record<string, unknown>).role === "admin";

  return (
    <header className="flex items-center justify-between m-4">
      <Link to="/" className="flex items-center gap-2">
        <StickyNote className="h-6 w-6" />
        <h1 className="scroll-m-20 text-2xl font-bold tracking-tight">Notes</h1>
      </Link>
      <div className="flex items-center space-x-2">
        {session?.user ? (
          <>
            <Link
              to="/notes"
              className="inline-flex items-center hover:underline text-sm"
            >
              <Notebook className="h-4 w-4" />
              Notes
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 hover:underline text-sm"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
};
