import { useRequireAuth } from "@/hooks/use-require-auth";
import { trpc } from "@/lib/trpc";

import { PageSkeleton } from "../skeletons";
import { CreateNoteDialog } from "./create-note-dialog";
import { NoteCard } from "./note-card";

export function NotesPage() {
  const {
    session,
    isPending: sessionLoading,
    isAuthenticated,
  } = useRequireAuth();

  const { data: notes, isLoading } = trpc.notes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (sessionLoading) {
    return <PageSkeleton />;
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

      {isLoading && <PageSkeleton />}

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
