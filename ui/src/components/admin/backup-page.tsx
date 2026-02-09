import { useState } from "react";

import { AlertTriangle, Database, Download } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/trpc";
  const baseURL = apiUrl.replace(/\/trpc\/?$/, "");

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${baseURL}/api/admin/backup`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Backup failed: ${res.statusText}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "backup.db";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Backup download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5" />
            Database Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download a copy of the SQLite database file. This includes all user
            data, notes, sessions, and audit logs.
          </p>

          <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              The backup file contains sensitive data including password hashes
              and session tokens. Store it securely.
            </span>
          </div>

          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4 mr-1" />
            {downloading ? "Downloading..." : "Download Backup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
