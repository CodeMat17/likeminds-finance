"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/session";
import type { Doc } from "@/convex/_generated/dataModel";

export function MembersHeader({ member }: { member: Doc<"members"> }) {
  const router = useRouter();
  const { logout } = useSession();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs text-muted-foreground">Welcome back,</p>
        <h1 className="text-lg font-bold text-primary sm:text-xl">
          {member.name.split(" ")[0]} 👋
        </h1>
      </motion.div>

      <div className="flex items-center gap-1 sm:gap-2">
        {member.role === "admin" && (
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/dashboard" aria-label="Admin dashboard">
              <LayoutDashboardIcon className="size-5" />
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Log out"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOutIcon className="size-5" />
        </Button>
      </div>
    </header>
  );
}
