import { createLazyFileRoute } from "@tanstack/react-router";

import { AdminSettingsPage } from "@/components/admin";

export const Route = createLazyFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});
