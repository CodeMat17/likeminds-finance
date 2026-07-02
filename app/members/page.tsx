"use client";

import Image from "next/image";
import { RequireSession } from "@/components/require-session";
import { MembersHeader } from "@/components/members/members-header";
import { BirthdayBanner } from "@/components/members/birthday-banner";
import { AssociationAccounts } from "@/components/members/association-accounts";
import { DuesTab } from "@/components/members/dues-tab";
import { LevyTab } from "@/components/members/levy-tab";
import { BirthdaysTab } from "@/components/members/birthdays-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/session";

export default function MembersPage() {
  return (
    <RequireSession>
      <MembersPageContent />
    </RequireSession>
  );
}

function MembersPageContent() {
  const { member } = useSession();
  if (!member) return null;

  return (
    <div className="flex flex-1 flex-col">
      <MembersHeader member={member} />
      <BirthdayBanner />

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-4 sm:px-6">
        <AssociationAccounts />

        <Tabs defaultValue="dues" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="dues" className="flex-1">
              Monthly Dues
            </TabsTrigger>
            <TabsTrigger value="levy" className="flex-1">
              Project Levy
            </TabsTrigger>
            <TabsTrigger value="birthdays" className="flex-1">
              Birthdays
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dues">
            <DuesTab />
          </TabsContent>
          <TabsContent value="levy">
            <LevyTab />
          </TabsContent>
          <TabsContent value="birthdays">
            <BirthdaysTab />
          </TabsContent>
        </Tabs>
      </div>

      <Image
        src="/logo.jpg"
        alt="LikeMinds Finance logo"
        width={56}
        height={56}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
      />
    </div>
  );
}
