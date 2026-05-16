"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import {
  DownloadOutlined,
  DollarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import type { PaymentReconciliationByOffice } from "@shared/types/api";

import { usePaymentReconciliation } from "@/hooks/use-payment-reconciliation";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function formatPHP(amountInMinor: number): string {
  return `₱${(amountInMinor / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function exportCsv(
  rows: PaymentReconciliationByOffice[],
  fromDate: string,
  toDate: string,
) {
  const header =
    "office_code,office_name,paid_count,paid_amount_php,unpaid_count,unpaid_amount_php";
  const body = rows
    .map(
      (r) =>
        `${r.officeCode},"${r.officeName.replace(/"/g, '""')}",${r.paidCount},${(r.paidAmountInMinor / 100).toFixed(2)},${r.unpaidCount},${(r.unpaidAmountInMinor / 100).toFixed(2)}`,
    )
    .join("\n");
  const csv = [header, body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payment-reconciliation-${fromDate.slice(0, 10)}-to-${toDate.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const columns: TableProps<PaymentReconciliationByOffice>["columns"] = [
  {
    dataIndex: "officeName",
    key: "officeName",
    title: "Office",
    render: (name: string, row) => (
      <span>
        <Text strong>{name}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {row.officeCode}
        </Text>
      </span>
    ),
  },
  {
    align: "right",
    dataIndex: "paidCount",
    key: "paidCount",
    title: "Paid transactions",
  },
  {
    align: "right",
    key: "paidAmount",
    title: "Collected (PHP)",
    render: (_: unknown, row) => (
      <Text strong style={{ color: "#52c41a" }}>
        {formatPHP(row.paidAmountInMinor)}
      </Text>
    ),
  },
  {
    align: "right",
    dataIndex: "unpaidCount",
    key: "unpaidCount",
    title: "Unpaid transactions",
  },
  {
    align: "right",
    key: "unpaidAmount",
    title: "Unpaid (PHP)",
    render: (_: unknown, row) =>
      row.unpaidAmountInMinor > 0 ? (
        <Text type="danger">{formatPHP(row.unpaidAmountInMinor)}</Text>
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
];

export default function PaymentReconciliation() {
  const {
    data,
    error,
    fromDate,
    isLoading,
    officeId: _officeId,
    refetch,
    setFromDate,
    setToDate,
    toDate,
  } = usePaymentReconciliation();

  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  function handleDateChange(
    _: unknown,
    dateStrings: [string, string] | string,
  ) {
    if (Array.isArray(dateStrings) && dateStrings[0] && dateStrings[1]) {
      setFromDate(dateStrings[0]);
      setToDate(dateStrings[1]);
      setDateRange([dateStrings[0], dateStrings[1]]);
    } else {
      setFromDate(undefined);
      setToDate(undefined);
      setDateRange(null);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1100 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ margin: 0 }}>
            Payment Reconciliation
          </Title>
          <Text type="secondary">
            Fee collection summary for the LGU treasurer. Covers PAID and aging
            unpaid transactions.
          </Text>
        </Space>

        <Space wrap>
          <RangePicker
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            placeholder={["From date", "To date"]}
          />
          <Button onClick={() => void refetch()} loading={isLoading}>
            Refresh
          </Button>
          {data && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                exportCsv(data.byOffice, data.fromDate, data.toDate)
              }
            >
              Export CSV
            </Button>
          )}
        </Space>

        {error && (
          <Alert
            type="error"
            message="Failed to load reconciliation data"
            showIcon
          />
        )}

        {data && (
          <>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <Statistic
                  title="Total collected"
                  value={(data.totalPaidAmountInMinor / 100).toFixed(2)}
                  prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                  suffix="PHP"
                  precision={2}
                  valueStyle={{ color: "#52c41a" }}
                />
                <Text type="secondary">{data.totalPaidCount} transactions</Text>
              </Card>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <Statistic
                  title="Total unpaid"
                  value={(data.totalUnpaidAmountInMinor / 100).toFixed(2)}
                  prefix={<DollarOutlined />}
                  suffix="PHP"
                  precision={2}
                />
                <Text type="secondary">
                  {data.totalUnpaidCount} transactions
                </Text>
              </Card>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <Statistic
                  title="Aging unpaid (>7 days)"
                  value={(data.agingUnpaidAmountInMinor / 100).toFixed(2)}
                  prefix={<WarningOutlined style={{ color: "#fa8c16" }} />}
                  suffix="PHP"
                  precision={2}
                  valueStyle={
                    data.agingUnpaidCount > 0 ? { color: "#fa8c16" } : undefined
                  }
                />
                <Text type="secondary">
                  {data.agingUnpaidCount} transactions
                </Text>
              </Card>
            </div>

            <Card
              title="Breakdown by office"
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dateRange ? `${dateRange[0]} – ${dateRange[1]}` : "All time"}
                </Text>
              }
            >
              {data.byOffice.length === 0 ? (
                <Empty description="No payment data for selected period" />
              ) : (
                <Table
                  dataSource={data.byOffice}
                  columns={columns}
                  rowKey="officeId"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </>
        )}

        {!data && !isLoading && !error && (
          <Empty description="Select a date range to load the reconciliation report" />
        )}
      </Space>
    </div>
  );
}
