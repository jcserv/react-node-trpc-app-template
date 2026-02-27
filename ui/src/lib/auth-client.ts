import { adminClient } from "better-auth/client/plugins";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || "/trpc";
// Extract origin from the tRPC URL (remove /trpc suffix)
const baseURL = apiUrl.replace(/\/trpc\/?$/, "");

export const authClient = createAuthClient({
  baseURL,
  plugins: [adminClient(), genericOAuthClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
