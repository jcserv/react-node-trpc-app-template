import { createLazyFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/")({
  component: () => <Navigate to="/admin/users" />,
});
