import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/trpc";
// Extract origin from the tRPC URL (remove /trpc suffix)
const baseURL = apiUrl.replace(/\/trpc\/?$/, "");

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
