"use client";

import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import DashboardAppShell, {
  isProtectedDashboardPath,
} from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { User } from "@shared/types/api";

interface DashboardShellGateProps {
  children: React.ReactNode;
}

export function shouldRedirectProtectedDashboardRole(
  role: User["role"] | undefined,
) {
  return role === "business_owner" || role === "citizen";
}

export default function DashboardShellGate({
  children,
}: DashboardShellGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, session } = useAuthSession();

  const isProtected = isProtectedDashboardPath(pathname);

  useEffect(() => {
    if (isHydrated && isProtected && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (
      isHydrated &&
      isProtected &&
      session &&
      shouldRedirectProtectedDashboardRole(session.user.role)
    ) {
      router.replace("/");
    }
  }, [isHydrated, isProtected, session, router, pathname]);

  if (!isProtected) {
    return <>{children}</>;
  }

  // Show a loading indicator while the client hydrates or while an auth
  // redirect is in flight — avoids the jarring blank-screen flash.
  if (
    !isHydrated ||
    !session ||
    shouldRedirectProtectedDashboardRole(session.user.role)
  ) {
    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          minHeight: "100dvh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <DashboardAppShell>{children}</DashboardAppShell>;
}
