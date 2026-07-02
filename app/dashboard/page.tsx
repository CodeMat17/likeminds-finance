"use client";

import { RequireSession } from "@/components/require-session";
import { MembersHeader } from "@/components/members/members-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MembersManager } from "@/components/dashboard/members-manager";
import { DuesManager } from "@/components/dashboard/dues-manager";
import { LevyManager } from "@/components/dashboard/levy-manager";
import { AuditLog } from "@/components/dashboard/audit-log";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/session";

export default function DashboardPage() {
  return (
    <RequireSession requireAdmin>
      <DashboardContent />
    </RequireSession>
  );
}

function DashboardContent() {
  const { member } = useSession();
  if (!member) return null;

  return (
    <div className="flex flex-1 flex-col">
      <MembersHeader member={member} />

      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage members, dues, levies, and activity.
          </p>
        </div>

        <SummaryCards />

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="members" className="flex-1">
              Members
            </TabsTrigger>
            <TabsTrigger value="dues" className="flex-1">
              Dues
            </TabsTrigger>
            <TabsTrigger value="levy" className="flex-1">
              Levy
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex-1">
              Audit Log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="pt-4">
            <MembersManager adminId={member._id} />
          </TabsContent>
          <TabsContent value="dues" className="pt-4">
            <DuesManager adminId={member._id} />
          </TabsContent>
          <TabsContent value="levy" className="pt-4">
            <LevyManager adminId={member._id} />
          </TabsContent>
          <TabsContent value="audit" className="pt-4">
            <AuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
