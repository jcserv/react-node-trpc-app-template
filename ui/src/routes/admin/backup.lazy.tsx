import { createLazyFileRoute } from "@tanstack/react-router";

import { AdminBackupPage } from "@/components/admin";

export const Route = createLazyFileRoute("/admin/backup")({
  component: AdminBackupPage,
});
