"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/lib/session";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireSession({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const { member, isLoading, memberId } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!memberId || member === null) {
      router.replace("/");
      return;
    }
    if (requireAdmin && member && member.role !== "admin") {
      router.replace("/members");
    }
  }, [isLoading, memberId, member, requireAdmin, router]);

  if (isLoading || !member || (requireAdmin && member.role !== "admin")) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
