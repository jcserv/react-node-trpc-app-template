import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Database, FileText, Settings, Shield, Users } from "lucide-react";

import { Button } from "@/components/ui";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin/users" as const, label: "Users", icon: Users },
  { to: "/admin/audit" as const, label: "Audit Log", icon: FileText },
  { to: "/admin/settings" as const, label: "Settings", icon: Settings },
  { to: "/admin/backup" as const, label: "Backup", icon: Database },
];

function AdminLayout() {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isAdmin =
    session?.user && (session.user as Record<string, unknown>).role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You need admin privileges to access this page.
        </p>
        <Link to="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <aside className="w-56 border-r p-4 space-y-1">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Admin</span>
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </aside>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
