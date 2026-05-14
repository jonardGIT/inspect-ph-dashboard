import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useInspectionLookups } from "@/hooks/use-inspection-lookups";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import InspectionBrowser from "./inspection-browser";

vi.mock("next/navigation", () => ({
  usePathname: () => "/inspections",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-browser-query-params", () => ({
  useBrowserQueryParams: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-browser", () => ({
  useInspectionBrowser: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-lookups", () => ({
  useInspectionLookups: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("InspectionBrowser", () => {
  beforeEach(() => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      logout: vi.fn(),
      session: {
        tokens: {
          accessToken: "token",
          expiresIn: 900,
          refreshToken: "refresh",
        },
        user: {
          createdAt: "2026-05-13T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          officeIds: ["office-1"],
          role: "admin",
          roleProfile: {
            accessScope: "global",
            label: "BPLO Admin",
            permissions: ["inspection:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useBrowserQueryParams).mockReturnValue({
      activeCount: 2,
      clearValues: vi.fn(),
      page: 1,
      setPage: vi.fn(),
      setValue: vi.fn(),
      values: {
        businessId: "biz-1",
        from: "",
        inspectorId: "inspector-1",
        lguId: "lgu-1",
        officeId: "office-1",
        status: "all",
        to: "",
      },
    } as unknown as ReturnType<typeof useBrowserQueryParams>);
    vi.mocked(useInspectionBrowser).mockReturnValue({
      createInspectionMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      inspectionsQuery: {
        data: {
          data: [
            {
              business: { businessName: "Acme Foods", id: "biz-1" },
              completedAt: undefined,
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "inspection-1",
              inspectorId: "inspector-1",
              location: { latitude: 17.6132, longitude: 121.7269 },
              notes: undefined,
              office: {
                code: "BPLO-HQ",
                id: "office-1",
                lguId: "lgu-1",
                name: "BPLO Headquarters",
              },
              permit: { id: "permit-1", permitNumber: "PERMIT-123" },
              scheduledAt: "2026-05-14T08:00:00.000Z",
              startedAt: undefined,
              status: "scheduled",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      summaryQuery: {
        data: {
          canceled: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
          scheduled: 1,
          total: 1,
        },
        error: null,
      },
    } as unknown as ReturnType<typeof useInspectionBrowser>);
    vi.mocked(useInspectionLookups).mockReturnValue({
      businessesQuery: {
        data: {
          data: [
            {
              addressLine: "Main St",
              barangay: "Centro",
              businessName: "Acme Foods",
              city: "Tuguegarao",
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "biz-1",
              ownerName: "A. Owner",
              province: "Cagayan",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        isLoading: false,
      },
      inspectorsQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-13T08:00:00.000Z",
              email: "inspector@example.com",
              id: "inspector-1",
              name: "Jane Inspector",
              officeIds: ["office-1"],
              role: "inspector",
              roleProfile: {
                accessScope: "assigned",
                label: "Field Inspector",
                permissions: ["inspection:read"],
              },
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        isLoading: false,
      },
      lgusQuery: {
        data: {
          data: [
            {
              city: "Tuguegarao City",
              code: "TUG-01",
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "lgu-1",
              name: "Tuguegarao City LGU",
              province: "Cagayan",
              region: "Region II",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 25, page: 1, total: 1 },
        },
        isLoading: false,
      },
      officesQuery: {
        data: {
          data: [
            {
              code: "BPLO-HQ",
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 25, page: 1, total: 1 },
        },
        isLoading: false,
      },
      permitsQuery: {
        data: {
          data: [
            {
              applicationDate: "2026-05-13T08:00:00.000Z",
              business: { businessName: "Acme Foods", id: "biz-1" },
              createdAt: "2026-05-13T08:00:00.000Z",
              expirationDate: "2027-05-13T08:00:00.000Z",
              id: "permit-1",
              lineOfBusiness: "Food service",
              permitNumber: "PERMIT-123",
              status: "pending_inspection",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useInspectionLookups>);
  });

  it("renders the login prompt and queue heading", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      logout: vi.fn(),
      session: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<InspectionBrowser />);

    expect(screen.getByText("Inspections")).toBeInTheDocument();
    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
    expect(screen.getByText("Inspection queue")).toBeInTheDocument();
  });

  it("shows friendly filter labels and the schedule form for admins", () => {
    renderWithProviders(<InspectionBrowser />);

    expect(
      screen.getByText((_content, element) => {
        const className =
          typeof element?.className === "string" ? element.className : "";
        const textContent = element?.textContent ?? "";

        return (
          className.includes("ant-tag") &&
          textContent.includes("Business: Acme Foods")
        );
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        const className =
          typeof element?.className === "string" ? element.className : "";
        const textContent = element?.textContent ?? "";

        return (
          className.includes("ant-tag") &&
          textContent.includes("LGU: Tuguegarao City LGU · TUG-01")
        );
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        const className =
          typeof element?.className === "string" ? element.className : "";
        const textContent = element?.textContent ?? "";

        return (
          className.includes("ant-tag") &&
          textContent.includes(
            "Inspector: Jane Inspector · inspector@example.com",
          )
        );
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        const className =
          typeof element?.className === "string" ? element.className : "";
        const textContent = element?.textContent ?? "";

        return (
          className.includes("ant-tag") &&
          textContent.includes("Office: BPLO Headquarters · BPLO-HQ")
        );
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Schedule inspection")).toHaveLength(2);
    expect(screen.getByText("Open map")).toBeInTheDocument();
  });
});
