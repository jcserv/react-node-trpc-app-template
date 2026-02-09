import { useEffect, useState } from "react";

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
  PasswordInput,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

interface EditUserDialogProps {
  user: { id: string; name: string; email: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setNewPassword("");
      setError("");
    }
  }, [user]);

  const updateMutation = trpc.admin.users.update.useMutation({
    onError: (err) => setError(err.message),
  });

  const setPasswordMutation = trpc.admin.users.setPassword.useMutation({
    onError: (err) => setError(err.message),
  });

  const handleSave = async () => {
    if (!user) return;
    setError("");

    const nameChanged = name !== user.name;
    const emailChanged = email !== user.email;
    const passwordChanged = newPassword.length > 0;

    try {
      if (nameChanged || emailChanged) {
        await updateMutation.mutateAsync({
          userId: user.id,
          ...(nameChanged ? { name } : {}),
          ...(emailChanged ? { email } : {}),
        });
      }

      if (passwordChanged) {
        await setPasswordMutation.mutateAsync({
          userId: user.id,
          newPassword,
        });
      }

      onSuccess();
    } catch {
      // error is set by onError callbacks
    }
  };

  const isPending = updateMutation.isPending || setPasswordMutation.isPending;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update details for {user?.email}.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password</Label>
            <PasswordInput
              id="edit-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              minLength={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
