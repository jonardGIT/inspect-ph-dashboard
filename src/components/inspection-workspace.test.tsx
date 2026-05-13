import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInspectionLookups } from "@/hooks/use-inspection-lookups";
import { useInspectionWorkspace } from "@/hooks/use-inspection-workspace";
import { useAuthSession } from "@/hooks/use-auth-session";
import InspectionWorkspace from "./inspection-workspace";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-lookups", () => ({
  useInspectionLookups: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-workspace", () => ({
  useInspectionWorkspace: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("InspectionWorkspace", () => {
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
          role: "admin",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useInspectionLookups).mockReturnValue({
      inspectorsQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-13T08:00:00.000Z",
              email: "inspector@example.com",
              id: "inspector-1",
              name: "Jane Inspector",
              role: "inspector",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useInspectionLookups>);
    vi.mocked(useInspectionWorkspace).mockReturnValue({
      assignInspectionMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      attachmentsQuery: {
        data: [
          {
            createdAt: "2026-05-13T10:00:00.000Z",
            fileName: "frontage.jpg",
            fileSizeBytes: 2048,
            id: "attachment-1",
            inspectionId: "inspection-123",
            mimeType: "image/jpeg",
            storageKey: "attachments/frontage.jpg",
            updatedAt: "2026-05-13T10:00:00.000Z",
          },
        ],
        error: null,
        isLoading: false,
      },
      checklistQuery: {
        data: [
          {
            createdAt: "2026-05-13T09:00:00.000Z",
            id: "check-1",
            inspectionId: "inspection-123",
            remarks: "All good",
            status: "pass",
            template: {
              code: "F001",
              id: "template-1",
              module: "bplo",
              title: "Fire exit",
            },
            updatedAt: "2026-05-13T09:00:00.000Z",
          },
        ],
        error: null,
        isLoading: false,
      },
      createAttachmentDownloadIntentMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
        variables: undefined,
      },
      findingsQuery: {
        data: [
          {
            createdAt: "2026-05-13T09:30:00.000Z",
            description: "Blocked egress near the kitchen",
            id: "finding-1",
            inspectionId: "inspection-123",
            severity: "high",
            title: "Blocked exit",
            updatedAt: "2026-05-13T09:30:00.000Z",
          },
        ],
        error: null,
        isLoading: false,
      },
      historyQuery: {
        data: [
          {
            detail: "Blocked egress near the kitchen",
            entityId: "finding-1",
            occurredAt: "2026-05-13T09:30:00.000Z",
            title: "Finding logged: Blocked exit",
            type: "finding_logged",
          },
        ],
        error: null,
        isLoading: false,
      },
      inspectionQuery: {
        data: {
          business: { businessName: "Acme Foods", id: "biz-1" },
          completedAt: undefined,
          createdAt: "2026-05-13T08:00:00.000Z",
          id: "inspection-123",
          inspectorId: "inspector-1",
          location: {
            accuracyMeters: 5,
            latitude: 17.6132,
            longitude: 121.7269,
          },
          notes: "Routine inspection",
          permit: { id: "permit-1", permitNumber: "PERMIT-123" },
          scheduledAt: "2026-05-14T08:00:00.000Z",
          startedAt: "2026-05-13T08:30:00.000Z",
          status: "in_progress",
          updatedAt: "2026-05-13T10:00:00.000Z",
        },
        error: null,
        isLoading: false,
      },
      uploadAttachmentMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
    } as unknown as ReturnType<typeof useInspectionWorkspace>);
  });

  it("renders the login prompt before data is loaded", () => {
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

    renderWithProviders(<InspectionWorkspace inspectionId="inspection-123" />);

    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("you@example.gov.ph"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Inspection queries stay idle until you sign in."),
    ).toBeInTheDocument();
  });

  it("renders activity history and preview controls when inspection data is loaded", () => {
    renderWithProviders(<InspectionWorkspace inspectionId="inspection-123" />);

    expect(screen.getByText("Inspection activity")).toBeInTheDocument();
    expect(
      screen.getByText("Finding logged: Blocked exit"),
    ).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Open inspection map")).toBeInTheDocument();
  });
});
