import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { notes } from "../db/schema.js";

export function listNotes(userId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(notes.createdAt);
}

export function getNoteById(id: number, userId: string) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

export function createNote(data: { title: string; content: string; userId: string }) {
  return db.insert(notes).values(data).returning();
}

export function updateNote(id: number, userId: string, data: { title: string; content: string }) {
  return db
    .update(notes)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
}

export function deleteNote(id: number, userId: string) {
  return db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
}
