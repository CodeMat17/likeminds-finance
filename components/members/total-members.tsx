"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { UsersIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";

export function TotalMembers() {
  const members = useQuery(api.members.listActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <UsersIcon className="size-4 text-primary" />
      <span>
        Total members:{" "}
        <span className="font-semibold text-foreground">
          {members ? members.length : "…"}
        </span>
      </span>
    </motion.div>
  );
}
