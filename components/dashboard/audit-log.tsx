"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";

export function AuditLog() {
  const logs = useQuery(api.auditLog.list);

  if (!logs) return <Skeleton className="h-64 w-full" />;

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No admin activity yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {logs.map((log) => (
        <div key={log._id} className="rounded-xl border bg-card p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{log.details}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(log.date)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
