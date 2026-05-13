import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AuthSessionProvider } from "@/components/auth-session-provider";

import BusinessBrowser from "./business-browser";

vi.mock("next/navigation", () => ({
  usePathname: () => "/businesses",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient();

  return render(
    <ConfigProvider>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <AuthSessionProvider>{ui}</AuthSessionProvider>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>,
  );
}

describe("BusinessBrowser", () => {
  it("renders the businesses heading and registry card", () => {
    renderWithProviders(<BusinessBrowser />);

    expect(screen.getByText("Businesses")).toBeInTheDocument();
    expect(screen.getByText("Business registry")).toBeInTheDocument();
    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
  });
});
