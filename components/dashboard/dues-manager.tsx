"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export function DuesManager({ adminId }: { adminId: Id<"members"> }) {
  const years = useQuery(api.dues.listYears);
  const members = useQuery(api.members.list);
  const addYear = useMutation(api.dues.addYear);
  const setPaid = useMutation(api.dues.setPaid);

  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState("");

  const currentYear = year ?? years?.[0] ?? null;
  const dues = useQuery(
    api.dues.getForYear,
    currentYear !== null ? { year: currentYear } : "skip"
  );

  if (!years || !members) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={String(currentYear)} onValueChange={(v) => setYear(Number(v))}>
          <TabsList>
            {years.map((y) => (
              <TabsTrigger key={y} value={String(y)}>
                {y}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="ml-auto flex items-center gap-1">
          <Input
            placeholder="New year"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value.replace(/\D/g, ""))}
            className="w-24"
          />
          <Button
            size="icon-sm"
            variant="outline"
            onClick={async () => {
              if (!newYear) return;
              await addYear({ year: Number(newYear) });
              setYear(Number(newYear));
              setNewYear("");
              toast.success(`Added ${newYear} dues year.`);
            }}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, i) => (
            <SelectItem key={name} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid gap-2">
        {members.map((member) => {
          const record = (dues ?? []).find(
            (d) => d.memberId === member._id && d.month === month
          );
          const paid = record?.paid ?? false;

          return (
            <div
              key={member._id}
              className="flex items-center justify-between rounded-xl border bg-card p-3"
            >
              <p className="font-medium">{member.name}</p>
              <Button
                size="sm"
                variant={paid ? "default" : "outline"}
                className={cn(!paid && "text-destructive")}
                onClick={async () => {
                  if (currentYear === null) return;
                  await setPaid({
                    memberId: member._id,
                    year: currentYear,
                    month,
                    paid: !paid,
                    amount: paid ? undefined : 5000,
                    adminId,
                  });
                  toast.success(
                    `${member.name} marked ${!paid ? "paid" : "unpaid"} for ${MONTH_NAMES[month - 1]}.`
                  );
                }}
              >
                {paid ? "Paid" : "Mark Paid"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
