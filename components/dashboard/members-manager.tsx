"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MemberFormSheet } from "@/components/dashboard/member-form-sheet";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export function MembersManager({ adminId }: { adminId: Id<"members"> }) {
  const members = useQuery(api.members.list);
  const remove = useMutation(api.members.remove);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doc<"members"> | null>(null);
  const [deleting, setDeleting] = useState<Doc<"members"> | null>(null);

  if (!members) {
    return <Skeleton className="h-64 w-full" />;
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          size="sm"
          className="ml-auto gap-1"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <PlusIcon className="size-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-2">
        {filtered.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div>
              <p className="font-medium">
                {m.name}{" "}
                {m.role === "admin" && (
                  <Badge variant="secondary" className="ml-1">
                    Admin
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{m.umunna}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(m);
                  setFormOpen(true);
                }}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleting(m)}
              >
                <Trash2Icon className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <MemberFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editing}
        adminId={adminId}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the member and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                await remove({ id: deleting._id, adminId });
                toast.success("Member deleted.");
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
