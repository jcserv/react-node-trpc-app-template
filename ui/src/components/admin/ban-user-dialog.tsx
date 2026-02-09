import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

interface BanUserDialogProps {
  user: { id: string; email: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BanUserDialog({
  user,
  onClose,
  onSuccess,
}: BanUserDialogProps) {
  const [reason, setReason] = useState("");
  const [expiresInHours, setExpiresInHours] = useState("");

  const banMutation = trpc.admin.users.ban.useMutation({
    onSuccess: () => {
      setReason("");
      setExpiresInHours("");
      onSuccess();
    },
  });

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {user?.email} from the application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason (optional)</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for banning"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ban-expires">Expires in hours (optional)</Label>
            <Input
              id="ban-expires"
              type="number"
              min={1}
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(e.target.value)}
              placeholder="Leave empty for permanent ban"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={banMutation.isPending}
            onClick={() => {
              if (!user) return;
              banMutation.mutate({
                userId: user.id,
                banReason: reason || undefined,
                banExpiresIn: expiresInHours
                  ? Number(expiresInHours) * 3600
                  : undefined,
              });
            }}
          >
            {banMutation.isPending ? "Banning..." : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
