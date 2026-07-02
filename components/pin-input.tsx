"use client";

import { motion } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export function PinInput({
  onComplete,
  shake,
  disabled,
}: {
  onComplete: (pin: string) => void;
  shake: boolean;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<string[]>(Array(LENGTH).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const next = [...values];
    next[index] = digit;
    setValues(next);

    if (digit && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every((v) => v !== "")) {
      onComplete(next.join(""));
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setValues(next);
    const focusIndex = Math.min(digits.length, LENGTH - 1);
    inputs.current[focusIndex]?.focus();
    if (digits.length === LENGTH) onComplete(digits);
  }

  return (
    <motion.div
      className="flex gap-2 sm:gap-3"
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "size-12 sm:size-14 rounded-xl border-2 border-input bg-card text-center text-xl font-bold",
            "text-foreground outline-none transition-colors focus:border-primary",
            "focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
          )}
        />
      ))}
    </motion.div>
  );
}
