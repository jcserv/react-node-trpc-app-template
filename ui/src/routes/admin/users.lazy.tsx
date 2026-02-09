import { createLazyFileRoute } from "@tanstack/react-router";

import { AdminUsersPage } from "@/components/admin";

export const Route = createLazyFileRoute("/admin/users")({
  component: AdminUsersPage,
});
