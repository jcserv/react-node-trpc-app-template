import type { IncomingHttpHeaders } from "node:http";

import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../auth.js";

export async function getAdminSession(headers: IncomingHttpHeaders) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });

  if (!session?.user) {
    return null;
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return null;
  }

  return session;
}
