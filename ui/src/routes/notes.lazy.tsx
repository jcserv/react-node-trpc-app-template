import { createLazyFileRoute } from "@tanstack/react-router";

import { NotesPage } from "@/components/notes";

export const Route = createLazyFileRoute("/notes")({
  component: NotesPage,
});
