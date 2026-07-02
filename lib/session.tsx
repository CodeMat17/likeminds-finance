"use client";

import { useQuery } from "convex/react";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const STORAGE_KEY = "likeminds-session-member-id";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function notify() {
  for (const listener of listeners) listener();
}

type SessionContextValue = {
  memberId: Id<"members"> | null;
  member: Doc<"members"> | null | undefined;
  isLoading: boolean;
  login: (id: Id<"members">) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const memberId = stored as Id<"members"> | null;

  const member = useQuery(
    api.members.get,
    memberId ? { id: memberId } : "skip"
  );

  const login = (id: Id<"members">) => {
    localStorage.setItem(STORAGE_KEY, id);
    notify();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  };

  return (
    <SessionContext.Provider
      value={{
        memberId,
        member,
        isLoading: memberId !== null && member === undefined,
        login,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
