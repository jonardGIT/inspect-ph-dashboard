import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";

import PermitBrowser from "./permit-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/permits",
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
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>,
  );
}

describe("PermitBrowser", () => {
  it("renders the permits heading and records card", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: null,
    } as never);

    renderWithProviders(<PermitBrowser />);

    expect(screen.getByText("Permits")).toBeInTheDocument();
    expect(screen.getByText("Permit records")).toBeInTheDocument();
    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
  });
});
