import { useEffect } from "react";

import { useNavigate } from "@tanstack/react-router";

import { useSession } from "@/lib/auth-client";

export function useRequireAuth() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({ to: "/login" });
    }
  }, [session, isPending, navigate]);

  return { session, isPending, isAuthenticated: !!session?.user };
}
