"use client";

import { usePathname } from "next/navigation";

import DashboardAppShell, {
  isProtectedDashboardPath,
} from "@/components/dashboard-app-shell";

interface DashboardShellGateProps {
  children: React.ReactNode;
}

export default function DashboardShellGate({
  children,
}: DashboardShellGateProps) {
  const pathname = usePathname();

  if (!isProtectedDashboardPath(pathname)) {
    return <>{children}</>;
  }

  return <DashboardAppShell>{children}</DashboardAppShell>;
}
