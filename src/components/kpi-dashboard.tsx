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
import type { KpiOfficeEntry, KpiTrendEntry } from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import { useKpiReport } from "@/hooks/use-kpi-report";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const byOfficeCols: TableProps<KpiOfficeEntry>["columns"] = [
  { dataIndex: "officeName", key: "officeName", title: "Office" },
  { dataIndex: "total", key: "total", title: "Total", align: "right" },
  {
    dataIndex: "completed",
    key: "completed",
    title: "Completed",
    align: "right",
  },
  {
    dataIndex: "passRate",
    key: "passRate",
    title: "Pass Rate",
    align: "right",
    render: (v: number) => (
      <Tag color={v >= 75 ? "success" : v >= 50 ? "warning" : "error"}>
        {v}%
      </Tag>
    ),
  },
];

const trendCols: TableProps<KpiTrendEntry>["columns"] = [
  { dataIndex: "month", key: "month", title: "Month" },
  { dataIndex: "total", key: "total", title: "Total", align: "right" },
  {
    dataIndex: "completed",
    key: "completed",
    title: "Completed",
    align: "right",
  },
  {
    dataIndex: "passRate",
    key: "passRate",
    title: "Pass Rate",
    align: "right",
    render: (v: number) => (
      <Tag color={v >= 75 ? "success" : v >= 50 ? "warning" : "error"}>
        {v}%
      </Tag>
    ),
  },
];

export default function KpiDashboard() {
  const [dateRange, setDateRange] = useState<[string?, string?]>([]);
  const [fromDate, toDate] = dateRange;

  const { data, isLoading, isError, error } = useKpiReport({
    fromDate,
    toDate,
  });

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            KPI Dashboard
          </Title>
        </Col>
        <Col>
          <RangePicker
            allowClear
            onChange={(_, formatted) => {
              setDateRange(
                formatted[0] && formatted[1]
                  ? [formatted[0], formatted[1]]
                  : [],
              );
            }}
            defaultValue={[dayjs().subtract(12, "month"), dayjs()]}
          />
        </Col>
      </Row>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          title="Failed to load KPI data"
          description={getApiErrorMessage(error)}
        />
      )}

      {data && (
        <>
          {/* Inspection metrics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Inspections"
                  value={data.inspections.total}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={data.inspections.completed}
                  styles={{ content: { color: "#52c41a" } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Overdue"
                  value={data.inspections.overdue}
                  styles={{ content: { color: "#f5222d" } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Pass Rate"
                  value={data.inspections.passRate}
                  suffix="%"
                  styles={{
                    content: {
                      color:
                        data.inspections.passRate >= 75
                          ? "#52c41a"
                          : data.inspections.passRate >= 50
                            ? "#faad14"
                            : "#f5222d",
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Findings + Payment metrics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="Total Findings" value={data.findings.total} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Critical Open"
                  value={data.findings.criticalOpen}
                  styles={{
                    content: {
                      color:
                        data.findings.criticalOpen > 0 ? "#f5222d" : "#52c41a",
                    },
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Findings Resolved Rate"
                  value={data.findings.resolvedRate}
                  suffix="%"
                  styles={{
                    content: {
                      color:
                        data.findings.resolvedRate >= 75
                          ? "#52c41a"
                          : "#faad14",
                    },
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Fees Collected"
                  value={(
                    data.payments.totalCollectedInMinor / 100
                  ).toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  })}
                />
              </Card>
            </Col>
          </Row>

          {/* Monthly trend */}
          <Card title="Monthly Trend" style={{ marginBottom: 24 }}>
            {data.trend.length === 0 ? (
              <Empty description="No trend data" />
            ) : (
              <Table<KpiTrendEntry>
                columns={trendCols}
                dataSource={data.trend}
                pagination={false}
                rowKey="month"
                size="small"
              />
            )}
          </Card>

          {/* By office breakdown */}
          <Card title="By Office">
            {data.byOffice.length === 0 ? (
              <Empty description="No office data" />
            ) : (
              <Table<KpiOfficeEntry>
                columns={byOfficeCols}
                dataSource={data.byOffice}
                pagination={false}
                rowKey="officeCode"
                size="small"
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
