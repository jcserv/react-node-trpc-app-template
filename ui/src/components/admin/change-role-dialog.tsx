import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

interface ChangeRoleDialogProps {
  user: { id: string; email: string; role?: string | null } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeRoleDialog({
  user,
  onClose,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<"admin" | "user">("user");

  const setRoleMutation = trpc.admin.users.setRole.useMutation({
    onSuccess,
  });

  // Sync role when user changes
  const currentRole = (user?.role as "admin" | "user") ?? "user";
  if (user && role !== currentRole && !setRoleMutation.isPending) {
    setRole(currentRole);
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>Change role for {user?.email}.</DialogDescription>
        </DialogHeader>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as "admin" | "user")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={setRoleMutation.isPending}
            onClick={() => {
              if (!user) return;
              setRoleMutation.mutate({ userId: user.id, role });
            }}
          >
            {setRoleMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
