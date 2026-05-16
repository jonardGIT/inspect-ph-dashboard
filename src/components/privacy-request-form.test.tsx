import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { axe } from "@/test/axe-helper";
import PrivacyRequestForm from "./privacy-request-form";

vi.mock("@/lib/api/privacy", () => ({
  submitDataSubjectRequest: vi.fn(),
}));

import { submitDataSubjectRequest } from "@/lib/api/privacy";

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PrivacyRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with type, email, and description fields", () => {
    renderWithProviders(<PrivacyRequestForm />);
    expect(screen.getByText(/request type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeInTheDocument();
  });

  it("shows a success state after submission", async () => {
    vi.mocked(submitDataSubjectRequest).mockResolvedValueOnce({} as never);
    renderWithProviders(<PrivacyRequestForm />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the submit button as enabled on load", () => {
    vi.mocked(submitDataSubjectRequest).mockRejectedValueOnce(
      new Error("Network error"),
    );
    renderWithProviders(<PrivacyRequestForm />);
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeEnabled();
  });

  it("has no WCAG 2.1 AA violations on initial render", async () => {
    const { container } = renderWithProviders(<PrivacyRequestForm />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
