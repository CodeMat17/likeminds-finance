"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type FormState = {
  name: string;
  pin: string;
  dob: string;
  joinDate: string;
  phone: string;
  umunna: string;
  role: "member" | "admin";
};

const EMPTY: FormState = {
  name: "",
  pin: "",
  dob: "",
  joinDate: "",
  phone: "",
  umunna: "",
  role: "member",
};

function toFormState(m: Doc<"members">): FormState {
  return {
    name: m.name,
    pin: m.pin,
    dob: m.dob,
    joinDate: m.joinDate ?? "",
    phone: m.phone ?? "",
    umunna: m.umunna,
    role: m.role,
  };
}

function generateUniquePin(usedPins: Set<string>): string {
  let pin: string;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (usedPins.has(pin));
  return pin;
}

export function MemberFormSheet({
  open,
  onOpenChange,
  member,
  adminId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Doc<"members"> | null;
  adminId: Id<"members">;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        {open && (
          <MemberForm
            key={member?._id ?? "new"}
            member={member}
            adminId={adminId}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function dobToDate(dob: string): Date | undefined {
  if (!dob) return undefined;
  const [year, month, day] = dob.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function dateToDob(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function MemberForm({
  member,
  adminId,
  onDone,
}: {
  member: Doc<"members"> | null;
  adminId: Id<"members">;
  onDone: () => void;
}) {
  const pins = useQuery(api.members.listPins);
  const [form, setForm] = useState<FormState>(() =>
    member ? toFormState(member) : EMPTY
  );
  const [pinSeeded, setPinSeeded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [joinDateOpen, setJoinDateOpen] = useState(false);
  const create = useMutation(api.members.create);
  const update = useMutation(api.members.update);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function usedPins(): Set<string> {
    const used = new Set(pins ?? []);
    if (member) used.delete(member.pin);
    return used;
  }

  function regeneratePin() {
    set("pin", generateUniquePin(usedPins()));
  }

  if (!member && !pinSeeded && pins !== undefined) {
    setPinSeeded(true);
    setForm((f) => ({ ...f, pin: generateUniquePin(new Set(pins)) }));
  }

  async function handleSubmit() {
    if (!form.name || form.pin.length !== 6 || !form.dob) {
      toast.error("Name, 6-digit PIN, and date of birth are required.");
      return;
    }
    const payload = {
      name: form.name,
      pin: form.pin,
      dob: form.dob,
      joinDate: form.joinDate || undefined,
      phone: form.phone || undefined,
      umunna: form.umunna,
      role: form.role,
      adminId,
    };

    setSubmitting(true);
    try {
      if (member) {
        await update({ id: member._id, ...payload });
        toast.success("Member updated.");
      } else {
        await create(payload);
        toast.success("Member created.");
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
        <SheetHeader>
          <SheetTitle>{member ? "Edit Member" : "Add Member"}</SheetTitle>
          <SheetDescription>
            Manage profile and PIN.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <Field label="Full Name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="6-digit PIN">
            <div className="flex gap-2">
              <Input
                value={form.pin}
                maxLength={6}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Generate unique PIN"
                onClick={regeneratePin}
                disabled={pins === undefined}
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </Field>
          <Field label="Date of Birth">
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  {form.dob || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  startMonth={new Date(1980, 0)}
                  endMonth={new Date(1986, 11)}
                  defaultMonth={dobToDate(form.dob) ?? new Date(1980, 0)}
                  selected={dobToDate(form.dob)}
                  onSelect={(date) => {
                    if (date) {
                      set("dob", dateToDob(date));
                      setDobOpen(false);
                    }
                  }}
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field label="Join Date">
            <Popover open={joinDateOpen} onOpenChange={setJoinDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  {form.joinDate || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  startMonth={new Date(2000, 0)}
                  endMonth={new Date()}
                  defaultMonth={dobToDate(form.joinDate) ?? new Date()}
                  selected={dobToDate(form.joinDate)}
                  onSelect={(date) => {
                    if (date) {
                      set("joinDate", dateToDob(date));
                      setJoinDateOpen(false);
                    }
                  }}
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Umunna">
            <Input value={form.umunna} onChange={(e) => set("umunna", e.target.value)} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onValueChange={(v) => set("role", v as "member" | "admin")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {member ? "Save Changes" : "Create Member"}
          </Button>
        </SheetFooter>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
