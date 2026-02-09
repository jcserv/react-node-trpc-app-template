import { createLazyFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/about")({
  component: () => <Navigate to="/" />,
});
