"use client";

import { useMutation } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login, type AuthSession } from "@/lib/api/auth";
import { normalizeUser } from "@/lib/role-profiles";

const AUTH_SESSION_STORAGE_KEY = "inspect-ph-dashboard-session";

interface AuthSessionContextValue {
  accessToken: string;
  isHydrated: boolean;
  loginMutation: ReturnType<
    typeof useMutation<AuthSession, Error, { email: string; password: string }>
  >;
  logout: () => void;
  session: AuthSession | null;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(rawValue) as AuthSession);
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() =>
    readStoredSession(),
  );

  useEffect(() => {
    queueMicrotask(() => {
      setIsHydrated(true);
    });
  }, []);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (nextSession) => {
      const normalizedSession = normalizeUser(nextSession);
      window.localStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify(normalizedSession),
      );
      setSession(normalizedSession);
    },
  });

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      accessToken: session?.tokens.accessToken || "",
      isHydrated,
      loginMutation,
      logout: () => {
        window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        setSession(null);
      },
      session,
    }),
    [isHydrated, loginMutation, session],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSessionContext() {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return value;
}
