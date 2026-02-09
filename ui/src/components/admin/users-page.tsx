import { useState } from "react";

import { Search } from "lucide-react";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

import { BanUserDialog } from "./ban-user-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserSessionsDialog } from "./user-sessions-dialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date;
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [banTarget, setBanTarget] = useState<UserRow | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [sessionsTarget, setSessionsTarget] = useState<UserRow | null>(null);
  const limit = 25;

  const { data, refetch } = trpc.admin.users.list.useQuery({
    limit,
    offset: page * limit,
    searchField: "email",
    searchValue: search || undefined,
  });

  const unbanMutation = trpc.admin.users.unban.useMutation({
    onSuccess: () => refetch(),
  });
  const removeMutation = trpc.admin.users.remove.useMutation({
    onSuccess: () => refetch(),
  });

  const users = (data?.users ?? []) as UserRow[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role ?? "user"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTarget(u)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleTarget(u)}>
                          Change Role
                        </DropdownMenuItem>
                        {u.banned ? (
                          <DropdownMenuItem
                            onClick={() =>
                              unbanMutation.mutate({ userId: u.id })
                            }
                          >
                            Unban
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setBanTarget(u)}>
                            Ban
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setSessionsTarget(u)}>
                          View Sessions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Delete user ${u.email}?`)) {
                              removeMutation.mutate({ userId: u.id });
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EditUserDialog
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null);
          refetch();
        }}
      />
      <BanUserDialog
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onSuccess={() => {
          setBanTarget(null);
          refetch();
        }}
      />
      <ChangeRoleDialog
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSuccess={() => {
          setRoleTarget(null);
          refetch();
        }}
      />
      <UserSessionsDialog
        user={sessionsTarget}
        onClose={() => setSessionsTarget(null)}
      />
    </div>
  );
}
