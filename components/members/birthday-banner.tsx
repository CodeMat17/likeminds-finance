"use client";

import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopperIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { isBirthdayToday } from "@/lib/date";

export function BirthdayBanner() {
  const members = useQuery(api.members.list);
  const celebrants = (members ?? []).filter((m) => isBirthdayToday(m.dob));

  return (
    <AnimatePresence>
      {celebrants.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-highlight/20 via-accent/20 to-primary/20 px-4 py-3 sm:mx-6">
            <motion.span
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              <PartyPopperIcon className="size-5 text-highlight" />
            </motion.span>
            <p className="text-sm font-semibold">
              Happy Birthday to{" "}
              {celebrants.map((c) => c.name).join(", ")}!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
