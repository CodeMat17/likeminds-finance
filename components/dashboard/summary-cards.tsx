"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CalendarHeartIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDob } from "@/lib/date";

export function SummaryCards() {
  const members = useQuery(api.members.list);
  const duesYears = useQuery(api.dues.listYears);
  const currentYear = new Date().getFullYear();
  const dues = useQuery(
    api.dues.getForYear,
    duesYears ? { year: currentYear } : "skip"
  );

  if (!members || !duesYears || dues === undefined) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const totalCollected = dues
    .filter((d) => d.paid)
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const upToDateCount = members.filter((m) => {
    const paidMonths = dues.filter((d) => d.memberId === m._id && d.paid).length;
    return paidMonths >= 12;
  }).length;
  const pctUpToDate = members.length
    ? Math.round((upToDateCount / members.length) * 100)
    : 0;

  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);
  const upcomingBirthdays = members.filter((m) => {
    const { month, day } = parseDob(m.dob);
    const bday = new Date(today.getFullYear(), month - 1, day);
    if (bday < today) bday.setFullYear(today.getFullYear() + 1);
    return bday >= today && bday <= in7Days;
  }).length;

  const cards = [
    {
      label: `${currentYear} Collected`,
      value: `₦${totalCollected.toLocaleString()}`,
      icon: TrendingUpIcon,
    },
    {
      label: "Members Up-to-date",
      value: `${pctUpToDate}%`,
      icon: UsersIcon,
    },
    {
      label: "Birthdays This Week",
      value: upcomingBirthdays,
      icon: CalendarHeartIcon,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">
                {c.label}
              </CardTitle>
              <c.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
