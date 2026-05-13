import type { Metadata } from "next";

import DashboardShellGate from "@/components/dashboard-shell-gate";
import Providers from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Inspect PH Dashboard",
  description: "Admin dashboard scaffold for Inspect PH.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <DashboardShellGate>{children}</DashboardShellGate>
        </Providers>
      </body>
    </html>
  );
}
