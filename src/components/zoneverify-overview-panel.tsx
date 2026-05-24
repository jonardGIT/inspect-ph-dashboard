"use client";

import Link from "next/link";
import { Alert, Card, Empty, Space, Spin, Tag, Typography } from "antd";

import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value?: string) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const statusColors: Record<string, string> = {
  canceled: "default",
  completed: "green",
  in_progress: "gold",
  overdue: "red",
  scheduled: "blue",
};

export default function ZoneVerifyOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  const { inspectionsQuery, summaryQuery } = useInspectionBrowser({
    accessToken: input.accessToken,
    officeId: input.officeId,
    page: 1,
  });

  const inspections = inspectionsQuery.data?.data ?? [];
  const summary = summaryQuery.data;

  return (
    <Card
      title="Zoning compliance operations snapshot"
      className="glass-card dashboard-data-card"
      style={{ marginBottom: 20 }}
    >
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Monitor the current zoning and land use compliance queue for{" "}
          {input.officeLabel} before dropping into the shared inspection
          workspace.
        </Typography.Paragraph>

        {summary ? (
          <Space wrap>
            <Tag color="blue">Scheduled {summary.scheduled}</Tag>
            <Tag color="gold">In progress {summary.inProgress}</Tag>
            <Tag color="green">Completed {summary.completed}</Tag>
            <Tag color="red">Overdue {summary.overdue}</Tag>
          </Space>
        ) : null}

        {inspectionsQuery.isLoading ? <Spin size="large" /> : null}

        {inspectionsQuery.error || summaryQuery.error ? (
          <Alert
            type="error"
            showIcon
            title={getApiErrorMessage(
              inspectionsQuery.error || summaryQuery.error,
            )}
          />
        ) : null}

        {!inspectionsQuery.isLoading &&
        !inspectionsQuery.error &&
        !summaryQuery.error &&
        !inspections.length ? (
          <Empty description="No ZoneVerify inspections found for this office yet" />
        ) : null}

        {!inspectionsQuery.isLoading &&
        !inspectionsQuery.error &&
        !summaryQuery.error
          ? inspections.slice(0, 3).map((inspection) => (
              <Card
                key={inspection.id}
                type="inner"
                title={inspection.permit.permitNumber}
              >
                <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                  <Space wrap>
                    <Tag color={statusColors[inspection.status] || "default"}>
                      {inspection.status.replace("_", " ")}
                    </Tag>
                    <Tag color="blue">{inspection.business.businessName}</Tag>
                  </Space>
                  <Typography.Text>
                    Scheduled {formatDate(inspection.scheduledAt)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Office {inspection.office.name}
                  </Typography.Text>
                  {inspection.notes ? (
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {inspection.notes}
                    </Typography.Paragraph>
                  ) : null}
                  <Link href={`/inspections/${inspection.id}`}>
                    Open inspection workspace
                  </Link>
                </Space>
              </Card>
            ))
          : null}
      </Space>
    </Card>
  );
}
