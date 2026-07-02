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
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export function LevyManager({ adminId }: { adminId: Id<"members"> }) {
  const years = useQuery(api.levy.listYears);
  const members = useQuery(api.members.list);
  const addYear = useMutation(api.levy.addYear);
  const setPaid = useMutation(api.levy.setPaid);

  const [year, setYear] = useState<number | null>(null);
  const [newYear, setNewYear] = useState("");

  const currentYear = year ?? years?.[0]?.year ?? null;
  const levy = useQuery(
    api.levy.getForYear,
    currentYear !== null ? { year: currentYear } : "skip"
  );
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  if (!years || !members) return <Skeleton className="h-64 w-full" />;

  const minAmount =
    years.find((y) => y.year === currentYear)?.minAmount ?? 50000;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={String(currentYear)} onValueChange={(v) => setYear(Number(v))}>
          <TabsList>
            {years.map((y) => (
              <TabsTrigger key={y.year} value={String(y.year)}>
                {y.year}
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
              await addYear({ year: Number(newYear), minAmount: 50000 });
              setYear(Number(newYear));
              setNewYear("");
              toast.success(`Added ${newYear} levy year.`);
            }}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {members.map((member) => {
          const record = (levy ?? []).find((l) => l.memberId === member._id);
          const paid = record?.paid ?? false;
          const amountValue =
            amounts[member._id] ?? String(record?.amount ?? minAmount);

          return (
            <div
              key={member._id}
              className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3"
            >
              <p className="font-medium">{member.name}</p>
              <div className="flex items-center gap-2">
                {!paid && (
                  <Input
                    type="number"
                    min={minAmount}
                    value={amountValue}
                    onChange={(e) =>
                      setAmounts((prev) => ({
                        ...prev,
                        [member._id]: e.target.value,
                      }))
                    }
                    className="w-28"
                  />
                )}
                <Button
                  size="sm"
                  variant={paid ? "default" : "outline"}
                  className={cn(!paid && "text-destructive")}
                  onClick={async () => {
                    if (currentYear === null) return;
                    const amount = paid
                      ? undefined
                      : Number(amountValue) || minAmount;
                    await setPaid({
                      memberId: member._id,
                      year: currentYear,
                      paid: !paid,
                      amount,
                      adminId,
                    });
                    toast.success(
                      `${member.name} marked ${!paid ? "paid" : "unpaid"} for ${currentYear} levy.`
                    );
                  }}
                >
                  {paid ? "Paid" : "Mark Paid"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
