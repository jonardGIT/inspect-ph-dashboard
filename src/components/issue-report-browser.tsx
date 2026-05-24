"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { IssueReportRecord } from "@shared/types/api";

import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useIssueReportBrowser } from "@/hooks/use-issue-report-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const categoryOptions = [
  { label: "All categories", value: "" },
  { label: "Fire hazard", value: "fire_hazard" },
  { label: "Sanitation", value: "sanitation" },
  { label: "Structural", value: "structural" },
  { label: "Public safety", value: "public_safety" },
  { label: "Other", value: "other" },
];

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Submitted", value: "submitted" },
  { label: "Under review", value: "under_review" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

const statusColors: Record<string, string> = {
  dismissed: "default",
  resolved: "green",
  submitted: "blue",
  under_review: "gold",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function IssueReportBrowser() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IssueReportRecord["category"] | "">(
    "",
  );
  const [status, setStatus] = useState<IssueReportRecord["status"] | "">("");
  const { accessToken, session } = useAuthSession();
  const effectiveCategory = category === "" ? undefined : category;
  const effectiveStatus = status === "" ? undefined : status;
  const { issueReportsQuery, updateIssueReportStatusMutation } =
    useIssueReportBrowser({
      accessToken,
      category: effectiveCategory,
      page,
      search: search || undefined,
      status: effectiveStatus,
    });

  const issueReports = issueReportsQuery.data?.data ?? [];
  const meta = issueReportsQuery.data?.meta;

  return (
    <InspectionRouteShell
      eyebrow="Public participation inbox"
      title="Issue reports"
      description="Review public issue submissions, search by reference or subject, and monitor what has been reported into the system."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search report number or subject"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <Select
              options={categoryOptions}
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            />
            <Select
              options={statusOptions}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <Button
              onClick={() => {
                setCategory("");
                setSearch("");
                setStatus("");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          </Space>
        </Card>
      }
    >
      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible reports"
            value={issueReports.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={[search, category, status].filter(Boolean).length}
            description="Search, category, and status"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Operator access"
            value={hasPermission(session, "report:read") ? "Admin" : "Staff"}
            description="Authenticated dashboard inbox"
          />
        </Col>
      </Row>

      {issueReportsQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          title={getApiErrorMessage(issueReportsQuery.error)}
        />
      ) : null}

      <Card
        title="Submitted issue reports"
        className="glass-card dashboard-data-card"
      >
        {issueReportsQuery.isLoading ? null : issueReports.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={issueReports}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Reference",
                  key: "reportNumber",
                  render: (_value, record) => (
                    <Space orientation="vertical" size={0}>
                      <Typography.Text strong>
                        {record.reportNumber}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {record.subject}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Category",
                  dataIndex: "category",
                  key: "category",
                  render: (value: string) => value.replace("_", " "),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (value: string) => (
                    <Tag color={statusColors[value] || "default"}>{value}</Tag>
                  ),
                },
                {
                  title: "Actions",
                  key: "actions",
                  render: (_value, record) => (
                    <Space wrap>
                      <Button
                        size="small"
                        disabled={
                          record.status === "under_review" ||
                          updateIssueReportStatusMutation.isPending
                        }
                        onClick={() =>
                          updateIssueReportStatusMutation.mutate({
                            id: record.id,
                            status: "under_review",
                          })
                        }
                      >
                        Mark under review
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        disabled={
                          record.status === "resolved" ||
                          updateIssueReportStatusMutation.isPending
                        }
                        onClick={() =>
                          updateIssueReportStatusMutation.mutate({
                            id: record.id,
                            status: "resolved",
                          })
                        }
                      >
                        Resolve
                      </Button>
                      <Button
                        danger
                        size="small"
                        disabled={
                          record.status === "dismissed" ||
                          updateIssueReportStatusMutation.isPending
                        }
                        onClick={() =>
                          updateIssueReportStatusMutation.mutate({
                            id: record.id,
                            status: "dismissed",
                          })
                        }
                      >
                        Dismiss
                      </Button>
                    </Space>
                  ),
                },
                {
                  title: "Reporter",
                  key: "reporter",
                  render: (_value, record) =>
                    record.reporterName || record.reporterEmail || "Anonymous",
                },
                {
                  title: "Submitted",
                  key: "createdAt",
                  render: (_value, record) => formatDate(record.createdAt),
                },
              ]}
            />
            {meta ? (
              <Pagination
                current={meta.page}
                pageSize={meta.limit}
                total={meta.total}
                style={{ marginTop: 20 }}
                onChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        ) : (
          <Empty description="No issue reports found for the current filters" />
        )}
      </Card>
    </InspectionRouteShell>
  );
}
