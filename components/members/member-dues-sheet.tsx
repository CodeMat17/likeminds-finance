"use client";

import { useQuery } from "convex/react";
import { CheckIcon, XIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MONTH_NAMES, formatDate, formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

type DuesRecord = {
  memberId: string;
  month: number;
  paid: boolean;
  amount?: number;
};

export function MemberDuesSheet({
  member,
  year,
  dues,
  onClose,
}: {
  member: Doc<"members"> | null;
  year: number | null;
  dues: DuesRecord[];
  onClose: () => void;
}) {
  const history = useQuery(
    api.dues.getHistoryForMember,
    member ? { memberId: member._id } : "skip"
  );

  const memberDues = member
    ? dues.filter((d) => d.memberId === member._id)
    : [];

  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {member && (
          <>
            <SheetHeader>
              <SheetTitle>{member.name}</SheetTitle>
              <SheetDescription>
                Monthly dues status for {year}
              </SheetDescription>
            </SheetHeader>

            <div className='grid grid-cols-3 gap-2 px-4'>
              {MONTH_NAMES.map((name, idx) => {
                const month = idx + 1;
                const record = memberDues.find((d) => d.month === month);
                const paid = record?.paid ?? false;
                return (
                  <div
                    key={month}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs",
                      paid
                        ? "border-primary/30 bg-primary/10"
                        : "border-destructive/30 bg-destructive/5",
                    )}>
                    {paid ? (
                      <CheckIcon className='size-4 text-primary' />
                    ) : (
                      <XIcon className='size-4 text-destructive' />
                    )}
                    <span>{name.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="px-4">
              <p className='text-sm text-muted-foreground'>
                Joined:{" "}
                {member.joinDate ? formatMonthYear(member.joinDate) : "Unknown"}
              </p>
            </div>

            {/* <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Payment History
              </p>
              {!history && (
                <p className="text-sm text-muted-foreground">Loading…</p>
              )}
              {history?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              )}
              {history
                ?.filter((h) => h.type === "dues")
                .map((h) => (
                  <div
                    key={h._id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span>
                      {h.year}
                      {h.month ? ` · ${MONTH_NAMES[h.month - 1]}` : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {h.amount > 0 && (
                        <Badge variant="secondary">₦{h.amount.toLocaleString()}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(h.date)}
                      </span>
                    </div>
                  </div>
                ))}
            </div> */}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
