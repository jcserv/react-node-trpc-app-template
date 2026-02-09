import { db } from "../db/index.js";
import { auditLog } from "../db/schema.js";

interface AuditEntry {
  userId?: string | null;
  action: string;
  resource?: string | null;
  detail?: string | null;
  ipAddress?: string | null;
}

export function logAudit(entry: AuditEntry): void {
  try {
    db.insert(auditLog)
      .values({
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource ?? null,
        detail: entry.detail ?? null,
        ipAddress: entry.ipAddress ?? null,
      })
      .run();
  } catch {
    // Fire-and-forget: don't let audit failures break the request
    console.error("Failed to write audit log");
  }
}
