"use client";

import { useState } from "react";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import type {
  TreasurerAgingReceivable,
  TreasurerByOffice,
  TreasurerDailyEntry,
} from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import { useTreasurerReport } from "@/hooks/use-treasurer-report";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function formatPHP(amountInMinor: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amountInMinor / 100);
}

const byOfficeCols: TableProps<TreasurerByOffice>["columns"] = [
  { dataIndex: "officeName", key: "officeName", title: "Office", width: 200 },
  {
    dataIndex: "officeCode",
    key: "officeCode",
    render: (v: string) => <Tag>{v}</Tag>,
    title: "Code",
    width: 100,
  },
  {
    dataIndex: "collectedCount",
    key: "collectedCount",
    sorter: (a, b) => a.collectedCount - b.collectedCount,
    title: "Paid #",
    width: 80,
  },
  {
    dataIndex: "collectedAmountInMinor",
    key: "collectedAmountInMinor",
    render: (v: number) => formatPHP(v),
    sorter: (a, b) => a.collectedAmountInMinor - b.collectedAmountInMinor,
    title: "Collected",
    width: 140,
  },
  {
    dataIndex: "pendingCount",
    key: "pendingCount",
    sorter: (a, b) => a.pendingCount - b.pendingCount,
    title: "Pending #",
    width: 90,
  },
  {
    dataIndex: "pendingAmountInMinor",
    key: "pendingAmountInMinor",
    render: (v: number) => formatPHP(v),
    sorter: (a, b) => a.pendingAmountInMinor - b.pendingAmountInMinor,
    title: "Pending",
    width: 140,
  },
];

const dailyTrendCols: TableProps<TreasurerDailyEntry>["columns"] = [
  { dataIndex: "date", key: "date", title: "Date", width: 120 },
  {
    dataIndex: "paymentCount",
    key: "paymentCount",
    title: "Payments",
    width: 100,
  },
  {
    dataIndex: "collectedAmountInMinor",
    key: "collectedAmountInMinor",
    render: (v: number) => formatPHP(v),
    title: "Collected",
  },
];

const agingCols: TableProps<TreasurerAgingReceivable>["columns"] = [
  {
    dataIndex: "referenceNumber",
    key: "referenceNumber",
    title: "Ref #",
    width: 180,
  },
  {
    dataIndex: "businessName",
    key: "businessName",
    title: "Business",
  },
  {
    dataIndex: "permitNumber",
    key: "permitNumber",
    title: "Permit #",
    width: 180,
  },
  {
    dataIndex: "amountInMinor",
    key: "amountInMinor",
    render: (v: number) => formatPHP(v),
    title: "Amount",
    width: 130,
  },
  {
    dataIndex: "daysOverdue",
    key: "daysOverdue",
    render: (v: number) => <Tag color="red">{v}d overdue</Tag>,
    sorter: (a, b) => b.daysOverdue - a.daysOverdue,
    title: "Overdue",
    width: 110,
  },
];

export default function TreasurerReport() {
  const defaultFrom = dayjs().startOf("month");
  const defaultTo = dayjs().endOf("day");

  const [fromDate, setFromDate] = useState<string>(defaultFrom.toISOString());
  const [toDate, setToDate] = useState<string>(defaultTo.toISOString());

  const { data, error, isLoading } = useTreasurerReport({ fromDate, toDate });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Treasurer&apos;s Fee Collection Report
        </Title>
        <RangePicker
          defaultValue={[defaultFrom, defaultTo]}
          onChange={(dates) => {
            if (dates?.[0] && dates[1]) {
              setFromDate(dates[0].startOf("day").toISOString());
              setToDate(dates[1].endOf("day").toISOString());
            }
          }}
        />
      </div>

      {error ? (
        <Alert message={getApiErrorMessage(error)} showIcon type="error" />
      ) : null}

      {isLoading ? (
        <Spin />
      ) : data ? (
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Collected"
                  value={data.totalCollectedAmountInMinor / 100}
                  prefix="₱"
                  precision={2}
                />
                <Text type="secondary">
                  {data.totalCollectedCount} payments
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Pending"
                  value={data.totalPendingAmountInMinor / 100}
                  prefix="₱"
                  precision={2}
                />
                <Text type="secondary">{data.totalPendingCount} payments</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Aging Receivables (>7d)"
                  value={data.agingReceivablesAmountInMinor / 100}
                  prefix="₱"
                  precision={2}
                  valueStyle={{ color: "#cf1322" }}
                />
                <Text type="secondary">
                  {data.agingReceivablesCount} overdue
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Collection Rate"
                  value={
                    data.totalCollectedCount + data.totalPendingCount > 0
                      ? Math.round(
                          (data.totalCollectedCount /
                            (data.totalCollectedCount +
                              data.totalPendingCount)) *
                            100,
                        )
                      : 0
                  }
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          <Card title="Daily Collection Trend">
            {data.dailyTrend.length === 0 ? (
              <Empty description="No collections in this period" />
            ) : (
              <Table<TreasurerDailyEntry>
                columns={dailyTrendCols}
                dataSource={data.dailyTrend}
                pagination={false}
                rowKey="date"
                size="small"
              />
            )}
          </Card>

          <Card title="By Office">
            {data.byOffice.length === 0 ? (
              <Empty description="No data" />
            ) : (
              <Table<TreasurerByOffice>
                columns={byOfficeCols}
                dataSource={data.byOffice}
                pagination={false}
                rowKey="officeId"
                size="small"
              />
            )}
          </Card>

          <Card
            title={
              <span>
                Aging Receivables{" "}
                {data.agingReceivablesCount > 0 ? (
                  <Tag color="red">{data.agingReceivablesCount}</Tag>
                ) : null}
              </span>
            }
          >
            {data.agingReceivablesList.length === 0 ? (
              <Empty description="No aging receivables — all payments are current" />
            ) : (
              <Table<TreasurerAgingReceivable>
                columns={agingCols}
                dataSource={data.agingReceivablesList}
                pagination={{ pageSize: 20 }}
                rowKey="paymentId"
                size="small"
              />
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
