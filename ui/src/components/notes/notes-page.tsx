import { useEffect } from "react";

import { useNavigate } from "@tanstack/react-router";

import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";

import { CreateNoteDialog } from "./create-note-dialog";
import { NoteCard } from "./note-card";

export function NotesPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      navigate({ to: "/login" });
    }
  }, [session, sessionLoading, navigate]);

  const { data: notes, isLoading } = trpc.notes.list.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (sessionLoading) {
    return (
      <section className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground text-center py-12">Loading...</p>
      </section>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
        <CreateNoteDialog />
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center py-12">
          Loading notes...
        </p>
      )}

      {!isLoading && notes?.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No notes yet. Create your first note!
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  );
}
