"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LevyTab() {
  const years = useQuery(api.levy.listYears);
  const members = useQuery(api.members.listActive);
  const [year, setYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const currentYear = year ?? years?.[0]?.year ?? null;
  const levy = useQuery(
    api.levy.getForYear,
    currentYear !== null ? { year: currentYear } : "skip"
  );

  if (!years || !members) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const minAmount = years.find((y) => y.year === currentYear)?.minAmount ?? 50000;
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Tabs value={String(currentYear)} onValueChange={(v) => setYear(Number(v))}>
        <TabsList>
          {years.map((y) => (
            <TabsTrigger key={y.year} value={String(y.year)}>
              {y.year}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Minimum contribution: ₦{minAmount.toLocaleString()}
      </p>

      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="grid gap-3">
        {filteredMembers.map((member, i) => {
          const record = (levy ?? []).find((l) => l.memberId === member._id);
          const paid = record?.paid ?? false;

          return (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-card p-3",
                !paid && "red-flag-pulse border-destructive/40"
              )}
            >
              <div>
                <p className="font-medium">{member.name}</p>
                {record?.amount ? (
                  <p className="text-xs text-muted-foreground">
                    ₦{record.amount.toLocaleString()} paid
                  </p>
                ) : null}
              </div>
              <Badge variant={paid ? "default" : "destructive"}>
                {paid ? "Paid" : "Unpaid"}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
