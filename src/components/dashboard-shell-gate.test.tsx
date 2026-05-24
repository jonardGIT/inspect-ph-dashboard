import { describe, expect, it } from "vitest";

import { shouldRedirectProtectedDashboardRole } from "@/components/dashboard-shell-gate";

describe("shouldRedirectProtectedDashboardRole", () => {
  it("redirects business owners and citizens away from protected dashboard routes", () => {
    expect(shouldRedirectProtectedDashboardRole("business_owner")).toBe(true);
    expect(shouldRedirectProtectedDashboardRole("citizen")).toBe(true);
  });

  it("does not redirect dashboard and field staff roles", () => {
    expect(shouldRedirectProtectedDashboardRole("admin")).toBe(false);
    expect(shouldRedirectProtectedDashboardRole("lgu_admin")).toBe(false);
    expect(shouldRedirectProtectedDashboardRole("office_supervisor")).toBe(
      false,
    );
    expect(shouldRedirectProtectedDashboardRole("office_clerk")).toBe(false);
    expect(shouldRedirectProtectedDashboardRole("inspector")).toBe(false);
  });
});
