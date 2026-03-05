import { useState } from "react";

import { Pencil, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

import { EditNoteDialog } from "./edit-note-dialog";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function NoteCard({ note }: { note: Note }) {
  const [editOpen, setEditOpen] = useState(false);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="line-clamp-1">{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {note.content}
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <DeleteConfirmDialog
            itemName={note.title}
            onConfirm={() => deleteMutation.mutate({ id: note.id })}
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            }
          />
        </CardFooter>
      </Card>

      <EditNoteDialog note={note} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
