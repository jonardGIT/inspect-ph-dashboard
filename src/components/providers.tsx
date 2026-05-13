"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { useState } from "react";

import { AuthSessionProvider } from "@/components/auth-session-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 18,
          colorBgLayout: "#eef3ea",
          colorPrimary: "#2d6a4f",
          colorTextBase: "#193126",
          fontFamily: "Segoe UI, sans-serif",
        },
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
