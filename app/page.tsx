"use client";

import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { PinInput } from "@/components/pin-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/session";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { login } = useSession();
  const convex = useConvex();
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const [key, setKey] = useState(0);

  async function handleComplete(pin: string) {
    setChecking(true);
    try {
      const member = await convex.query(api.members.login, { pin });
      if (member) {
        login(member._id);
        toast.success(`Welcome, ${member.name.split(" ")[0]}!`);
        router.push("/members");
      } else {
        setShake(true);
        toast.error("Incorrect PIN. Try again.");
        setTimeout(() => {
          setShake(false);
          setChecking(false);
          setKey((k) => k + 1);
        }, 400);
      }
    } catch {
      toast.error("Something went wrong. Try again.");
      setChecking(false);
      setKey((k) => k + 1);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 bg-gradient-to-br from-primary/10 via-background to-highlight/10 px-6 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 text-center"
      >
     
        <Image alt='logo' priority src='/logo.jpg' width={100} height={100} className="border-4 rounded-full border-emerald-900" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          LikeMinds Age Grade 80-86
        </h1>
        <p className="text-muted-foreground">Finance Records</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-sm font-medium text-muted-foreground">
          Enter your 6-digit PIN
        </p>
        <PinInput key={key} onComplete={handleComplete} shake={shake} disabled={checking} />

        <AnimatePresence>
          {checking && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="absolute bottom-4 text-xs text-muted-foreground">
        <a href="https://www.likemindsofficial.org" className="hover:text-primary">
          www.likemindsofficial.org
        </a>
        {" · "}
        <a href="mailto:info@likemindsofficial.org" className="hover:text-primary">
          info@likemindsofficial.org
        </a>
      </p>
    </div>
  );
}
