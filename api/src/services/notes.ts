import { TRPCError } from "@trpc/server";

import * as notesRepo from "../repositories/notes.js";

export async function listNotes(userId: string) {
  return notesRepo.listNotes(userId);
}

export async function getNoteById(id: number, userId: string) {
  const result = await notesRepo.getNoteById(id, userId);
  return result[0] ?? null;
}

export async function createNote(userId: string, data: { title: string; content: string }) {
  const result = await notesRepo.createNote({ ...data, userId });
  return result[0];
}

export async function updateNote(id: number, userId: string, data: { title: string; content: string }) {
  const result = await notesRepo.updateNote(id, userId, data);
  if (!result[0]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
  }
  return result[0];
}

export async function deleteNote(id: number, userId: string) {
  const result = await notesRepo.deleteNote(id, userId);
  if (!result[0]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
  }
  return { success: true };
}
