import { createLazyFileRoute } from "@tanstack/react-router";

import { AdminAuditPage } from "@/components/admin";

export const Route = createLazyFileRoute("/admin/audit")({
  component: AdminAuditPage,
});
