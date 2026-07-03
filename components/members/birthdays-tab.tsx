"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MONTH_NAMES, getBirthdayState, parseDob } from "@/lib/date";

const STATE_LABEL: Record<string, string> = {
  next: "Next to be celebrated",
  today: "Celebrating today",
  celebrated: "Celebrated",
  upcoming: "",
};

const STATE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  next: "secondary",
  today: "default",
  celebrated: "outline",
  upcoming: "outline",
};

export function BirthdaysTab() {
  const members = useQuery(api.members.listActive);

  if (!members) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const byMonth = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    month,
    members: members
      .filter((m) => parseDob(m.dob).month === month)
      .sort((a, b) => parseDob(a.dob).day - parseDob(b.dob).day),
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {byMonth
        .filter((group) => group.members.length > 0)
        .map((group) => (
          <div key={group.month} className="space-y-2">
            <h3 className="text-sm font-semibold text-primary">
              {MONTH_NAMES[group.month - 1]}
            </h3>
            <div className="grid gap-2">
              {group.members.map((member, i) => {
                const state = getBirthdayState(member.dob);
                const { day } = parseDob(member.dob);
                return (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="flex items-center justify-between rounded-xl border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {MONTH_NAMES[group.month - 1]} {day}
                      </p>
                    </div>
                    {STATE_LABEL[state] && (
                      <Badge variant={STATE_VARIANT[state]}>
                        {STATE_LABEL[state]}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
