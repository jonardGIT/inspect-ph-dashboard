import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";

import AuthorizePage from "./page";

const push = vi.fn();
let searchParams = new URLSearchParams({
  client_id: "client-123",
  redirect_uri: "https://partner.example/callback",
  response_type: "code",
  scope: "permit:read",
  state: "abc123",
});

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/components/oauth-consent-page", () => ({
  OAuthConsentPage: ({
    clientId,
    redirectUri,
    responseType,
    scope,
  }: {
    clientId: string;
    redirectUri: string;
    responseType: string;
    scope: string;
  }) => (
    <div>
      OAuth consent page {clientId} {redirectUri} {responseType} {scope}
    </div>
  ),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

describe("AuthorizePage", () => {
  beforeEach(() => {
    push.mockReset();
    searchParams = new URLSearchParams({
      client_id: "client-123",
      redirect_uri: "https://partner.example/callback",
      response_type: "code",
      scope: "permit:read",
      state: "abc123",
    });
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token-123",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: null,
      user: null,
    } as never);
  });

  it("renders the OAuth consent flow when auth and request params are present", () => {
    render(<AuthorizePage />);

    expect(
      screen.getByText(
        "OAuth consent page client-123 https://partner.example/callback code permit:read",
      ),
    ).toBeInTheDocument();
  });

  it("shows a login prompt when the dashboard session is missing", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: null,
      user: null,
    } as never);

    render(<AuthorizePage />);

    expect(screen.getByText("Sign in required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to login" }));
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("shows an authorization error when required query params are missing", () => {
    searchParams = new URLSearchParams({
      client_id: "client-123",
      response_type: "code",
    });

    render(<AuthorizePage />);

    expect(screen.getByText("Authorization Error")).toBeInTheDocument();
    expect(
      screen.getByText("The authorization request is missing redirect_uri."),
    ).toBeInTheDocument();
  });
});
