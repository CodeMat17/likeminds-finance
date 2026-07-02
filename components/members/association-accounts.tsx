"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CheckIcon, CopyIcon, LandmarkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCOUNTS = [
  {
    key: "main",
    label: "Main Account",
    purpose: "Monthly dues, project levy, fines & other statutory payments",
    accountName: "Nomeh Unateze Community Development likemind 1980-86 Association Enugu",
    bank: "United Bank For Africa (UBA)",
    accountNumber: "1027433365",
  },
  {
    key: "social",
    label: "Social Account",
    purpose: "Social contributions e.g. birthdays, etc.",
    accountName: "Nomeh Unateze Community Development likemind 1980-86 Association Enugu",
    bank: "Fidelity Bank",
    accountNumber: "5601662658",
  },
];

export function AssociationAccounts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {ACCOUNTS.map(({ key, ...account }) => (
        <AccountCard key={key} {...account} />
      ))}
    </motion.div>
  );
}

function AccountCard({
  label,
  purpose,
  accountName,
  bank,
  accountNumber,
}: {
  label: string;
  purpose: string;
  accountName: string;
  bank: string;
  accountNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex-row items-center gap-2">
        <LandmarkIcon className="size-4 text-primary" />
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{purpose}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Account name:</span>{" "}
            <span className="font-medium">{accountName}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Bank:</span>{" "}
            <span className="font-medium">{bank}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Account no:</span>
            <span className="font-mono font-semibold">{accountNumber}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(copied && "text-primary")}
              onClick={handleCopy}
              aria-label="Copy account number"
            >
              {copied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
