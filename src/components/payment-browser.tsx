"use client";

import {
  Alert,
  Button,
  Card,
  Empty,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import Link from "next/link";
import type { PaymentRecord } from "@shared/types/api";

import { getPaymentReceiptUrl } from "@/lib/api/payments";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { usePaymentsBrowser } from "@/hooks/use-payments-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const providerOptions: Array<{
  label: string;
  value: PaymentRecord["provider"] | "all";
}> = [
  { label: "All providers", value: "all" },
  { label: "Local", value: "local" },
  { label: "PayMongo", value: "paymongo" },
];

const statusOptions: Array<{
  label: string;
  value: PaymentRecord["status"] | "all";
}> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const statusColors: Record<PaymentRecord["status"], string> = {
  failed: "red",
  paid: "green",
  pending: "gold",
  processing: "blue",
  refunded: "purple",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value / 100);
}

function formatOptionLabel(
  value: PaymentRecord["provider"] | PaymentRecord["status"] | "all",
  options: Array<{ label: string; value: string }>,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function PaymentBrowser() {
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { provider: "all", status: "all" },
      keys: ["provider", "status"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const isAdmin = hasPermission(session, "payment:read");
  const provider = values.provider as PaymentRecord["provider"] | "all";
  const status = values.status as PaymentRecord["status"] | "all";
  const { paymentsQuery } = usePaymentsBrowser({
    accessToken,
    enabled: Boolean(accessToken) && isAdmin,
    page,
    provider: provider === "all" ? undefined : provider,
    status: status === "all" ? undefined : status,
  });

  const payments = paymentsQuery.data?.data ?? [];
  const meta = paymentsQuery.data?.meta;
  const columns: TableProps<PaymentRecord>["columns"] = [
    {
      title: "Reference",
      key: "reference",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.referenceNumber}</Typography.Text>
          <Typography.Text type="secondary">
            {record.permit.permitNumber}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Business",
      key: "business",
      render: (_value, record) => record.permit.business.businessName,
    },
    {
      title: "Amount",
      key: "amount",
      render: (_value, record) => formatPeso(record.amountInMinor),
    },
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      render: (value: PaymentRecord["provider"]) => (
        <Tag color="cyan">{value}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: PaymentRecord["status"]) => (
        <Tag color={statusColors[value]}>{value.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Receipt",
      key: "receipt",
      render: (_value, record) =>
        record.status === "paid" && record.receiptNumber ? (
          <Button
            size="small"
            type="link"
            href={getPaymentReceiptUrl(record.id)}
            target="_blank"
            rel="noreferrer"
          >
            Download OR
          </Button>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Updated",
      key: "updatedAt",
      render: (_value, record) => formatDate(record.updatedAt),
    },
    {
      title: "Checkout",
      key: "checkoutUrl",
      render: (_value, record) =>
        record.checkoutUrl ? (
          <Link href={record.checkoutUrl} target="_blank" rel="noreferrer">
            Open checkout
          </Link>
        ) : (
          <Typography.Text type="secondary">Not available</Typography.Text>
        ),
    },
  ];

  return (
    <InspectionRouteShell
      eyebrow="Payment operations"
      title="Payments"
      description="Review permit-linked payment records, provider status, and checkout routing for reconciliation work."
    >
      {!accessToken ? null : !isAdmin ? (
        <Alert
          type="warning"
          showIcon
          message="Payments access is limited to admins."
        />
      ) : (
        <>
          {activeCount ? (
            <DashboardFilterStrip onClear={clearValues}>
              {provider !== "all" ? (
                <Tag color="blue">
                  Provider: {formatOptionLabel(provider, providerOptions)}
                </Tag>
              ) : null}
              {status !== "all" ? (
                <Tag color="gold">
                  Status: {formatOptionLabel(status, statusOptions)}
                </Tag>
              ) : null}
            </DashboardFilterStrip>
          ) : null}

          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Space size={16} style={{ width: "100%" }} wrap>
              <DashboardMetricCard
                label="Visible payments"
                value={payments.length}
                description="Current result window"
              />
              <DashboardMetricCard
                accent
                label="Provider focus"
                value={formatOptionLabel(provider, providerOptions)}
                description="Current provider filter"
              />
              <DashboardMetricCard
                label="Status focus"
                value={formatOptionLabel(status, statusOptions)}
                description="Current status filter"
              />
            </Space>

            <Card
              className="glass-card dashboard-data-card"
              title="Payment records"
            >
              <Space
                align="start"
                size={12}
                style={{
                  justifyContent: "space-between",
                  marginBottom: 20,
                  width: "100%",
                }}
                wrap
              >
                <Space direction="vertical" size={4}>
                  <Typography.Text strong>Filters</Typography.Text>
                  <Typography.Text type="secondary">
                    Narrow payment records by provider and status.
                  </Typography.Text>
                </Space>
                <Space wrap>
                  <Select
                    aria-label="Payment provider filter"
                    options={providerOptions}
                    style={{ minWidth: 180 }}
                    value={provider}
                    onChange={(value) => setValue("provider", value)}
                  />
                  <Select
                    aria-label="Payment status filter"
                    options={statusOptions}
                    style={{ minWidth: 180 }}
                    value={status}
                    onChange={(value) => setValue("status", value)}
                  />
                </Space>
              </Space>

              {paymentsQuery.error ? (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 20 }}
                  message={getApiErrorMessage(paymentsQuery.error)}
                />
              ) : null}

              {paymentsQuery.isLoading ? null : payments.length ? (
                <>
                  <Table
                    className="dashboard-table"
                    columns={columns}
                    dataSource={payments}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: true }}
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
                <Empty description="No payments found for the current filters" />
              )}
            </Card>
          </Space>
        </>
      )}
    </InspectionRouteShell>
  );
}
