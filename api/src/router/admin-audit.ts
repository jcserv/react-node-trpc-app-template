import { and, count, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { auditLog } from "../db/schema.js";
import { adminProcedure, router } from "../trpc.js";

export const adminAuditRouter = router({
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.action) {
        conditions.push(like(auditLog.action, `%${input.action}%`));
      }
      if (input.userId) {
        conditions.push(eq(auditLog.userId, input.userId));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(auditLog)
          .where(where)
          .orderBy(desc(auditLog.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: count() })
          .from(auditLog)
          .where(where),
      ]);

      return {
        items,
        total: totalResult[0]?.count ?? 0,
      };
    }),
});
