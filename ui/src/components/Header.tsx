import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Menu, Notebook, Shield, StickyNote } from "lucide-react";

import { ModeToggle } from "@/components";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import { signOut, useSession } from "@/lib/auth-client";

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin =
    session?.user && (session.user as Record<string, unknown>).role === "admin";

  const navLinks = (
    <>
      <Link
        to="/notes"
        className="inline-flex items-center gap-1 hover:underline text-sm"
        onClick={() => setOpen(false)}
      >
        <Notebook className="h-4 w-4" />
        Notes
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 hover:underline text-sm"
          onClick={() => setOpen(false)}
        >
          <Shield className="h-4 w-4" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="flex items-center justify-between m-4">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <StickyNote className="h-6 w-6" />
        <h1 className="scroll-m-20 text-2xl font-bold tracking-tight">
          Notes
        </h1>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center space-x-2">
        {session?.user ? (
          <>
            {navLinks}
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

      {/* Mobile nav */}
      <div className="flex md:hidden items-center gap-2">
        <ModeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Notes
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6">
              {session?.user ? (
                <>
                  {navLinks}
                  <hr />
                  <span className="text-sm text-muted-foreground truncate">
                    {session.user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
