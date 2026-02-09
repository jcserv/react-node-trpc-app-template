import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

interface UserSessionsDialogProps {
  user: { id: string; email: string } | null;
  onClose: () => void;
}

export function UserSessionsDialog({ user, onClose }: UserSessionsDialogProps) {
  const { data: sessions, refetch } = trpc.admin.users.listSessions.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user },
  );

  const revokeMutation = trpc.admin.users.revokeSession.useMutation({
    onSuccess: () => refetch(),
  });

  const revokeAllMutation = trpc.admin.users.revokeSessions.useMutation({
    onSuccess: () => refetch(),
  });

  const sessionList = (sessions ?? []) as Array<{
    token: string;
    expiresAt: Date;
    createdAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }>;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription>Sessions for {user?.email}</DialogDescription>
        </DialogHeader>

        {sessionList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No active sessions
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionList.map((s) => {
                    const expired = new Date(s.expiresAt) < new Date();
                    return (
                      <TableRow key={s.token}>
                        <TableCell className="text-sm">
                          {new Date(s.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(s.expiresAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.ipAddress ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={expired ? "secondary" : "outline"}>
                            {expired ? "Expired" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={revokeMutation.isPending}
                            onClick={() =>
                              revokeMutation.mutate({ sessionToken: s.token })
                            }
                          >
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                disabled={revokeAllMutation.isPending}
                onClick={() => {
                  if (!user) return;
                  revokeAllMutation.mutate({ userId: user.id });
                }}
              >
                {revokeAllMutation.isPending
                  ? "Revoking..."
                  : "Revoke All Sessions"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
