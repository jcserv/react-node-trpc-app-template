import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { auth } from "../auth.js";
import { db } from "../db/index.js";
import { user } from "../db/schema.js";

export async function seedAdmin(): Promise<void> {
  const admins = db
    .select()
    .from(user)
    .where(eq(user.role, "admin"))
    .all();

  if (admins.length > 0) return;

  const { config } = await import("../config.js");
  const email = config.ADMIN_EMAIL;
  const password = randomBytes(16).toString("hex");

  try {
    const ctx = await auth.api.signUpEmail({
      body: { email, password, name: "Admin" },
    });

    if (ctx?.user?.id) {
      db.update(user)
        .set({ role: "admin" })
        .where(eq(user.id, ctx.user.id))
        .run();
    }

    console.log("");
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║           ADMIN ACCOUNT CREATED                 ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log(`║  Email:    ${email.padEnd(38)}║`);
    console.log(`║  Password: ${password.padEnd(38)}║`);
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║  Save these credentials — they won't be shown   ║");
    console.log("║  again. Change the password after first login.  ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log("");
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}
