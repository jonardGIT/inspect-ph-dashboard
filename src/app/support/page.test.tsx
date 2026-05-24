import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SupportPage from "./page";

vi.mock("@/components/providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/owner-support-desk", () => ({
  default: () => <div>Owner support desk</div>,
}));
vi.mock("@/components/public-permit-lookup", () => ({
  default: () => <div>Public permit lookup</div>,
}));
vi.mock("@/components/public-fire-safety-certificate-lookup", () => ({
  default: () => <div>Public certificate lookup</div>,
}));
vi.mock("@/components/public-issue-report-lookup", () => ({
  default: () => <div>Track an issue report</div>,
}));
vi.mock("@/components/public-payment-lookup", () => ({
  default: () => <div>Public payment lookup</div>,
}));

describe("SupportPage", () => {
  it("renders the owner support lookup workspace", () => {
    render(<SupportPage />);

    expect(screen.getByText("Support lookups")).toBeInTheDocument();
    expect(screen.getByText("Public permit lookup")).toBeInTheDocument();
    expect(screen.getByText("Public certificate lookup")).toBeInTheDocument();
    expect(screen.getByText("Track an issue report")).toBeInTheDocument();
    expect(screen.getByText("Public payment lookup")).toBeInTheDocument();
  });
});
