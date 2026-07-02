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
import type { Doc } from "@/convex/_generated/dataModel";
import { MemberDuesSheet } from "@/components/members/member-dues-sheet";

type MonthlyDue = Doc<"monthlyDues">;

function getDueStatus(
  member: Doc<"members">,
  year: number,
  memberDues: MonthlyDue[]
) {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;

  const [joinYear, joinMonth] = member.joinDate
    ? member.joinDate.split("-").map(Number)
    : [todayYear, 1];

  // Member hasn't joined yet as of this year, or the year is in the future.
  if (year < joinYear || year > todayYear) {
    return { dueMonths: 0, unpaidMonths: 0 };
  }

  const startMonth = year === joinYear ? joinMonth : 1;
  const endMonth = year === todayYear ? todayMonth : 12;

  let dueMonths = 0;
  let unpaidMonths = 0;
  for (let m = startMonth; m <= endMonth; m++) {
    dueMonths++;
    const paid = memberDues.some((d) => d.month === m && d.paid);
    if (!paid) unpaidMonths++;
  }
  return { dueMonths, unpaidMonths };
}

export function DuesTab() {
  const years = useQuery(api.dues.listYears);
  const members = useQuery(api.members.list);
  const [year, setYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeMember, setActiveMember] = useState<Doc<"members"> | null>(null);

  const currentYear = year ?? years?.[0] ?? null;
  const dues = useQuery(
    api.dues.getForYear,
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

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Tabs
        value={String(currentYear)}
        onValueChange={(v) => setYear(Number(v))}
      >
        <TabsList>
          {years.map((y) => (
            <TabsTrigger key={y} value={String(y)}>
              {y}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="grid gap-3">
        {filteredMembers.map((member, i) => {
          const memberDues = (dues ?? []).filter((d) => d.memberId === member._id);
          const paidMonths = memberDues.filter((d) => d.paid).length;
          const { dueMonths, unpaidMonths } =
            currentYear !== null
              ? getDueStatus(member, currentYear, memberDues)
              : { dueMonths: 0, unpaidMonths: 0 };
          const isBehind = unpaidMonths > 0;

          return (
            <motion.button
              key={member._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              onClick={() => setActiveMember(member)}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40",
                isBehind && "red-flag-pulse border-destructive/40"
              )}
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.min(paidMonths, dueMonths)}/{dueMonths} months paid
                </p>
              </div>
              <Badge variant={isBehind ? "destructive" : "default"}>
                {isBehind ? `${unpaidMonths} behind` : "Up to date"}
              </Badge>
            </motion.button>
          );
        })}
      </div>

      <MemberDuesSheet
        member={activeMember}
        year={currentYear}
        dues={dues ?? []}
        onClose={() => setActiveMember(null)}
      />
    </div>
  );
}
