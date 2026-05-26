"use client";

import { useState } from "react";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import type {
  InspectionTwinSimulationReasonCount,
  InspectionTwinSimulationRecord,
} from "@shared/types/api";

import { useInspectionTwinReport } from "@/hooks/use-inspection-twin-report";
import { getApiErrorMessage } from "@/lib/api/http";

const { RangePicker } = DatePicker;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const reasonsColumns: TableProps<InspectionTwinSimulationReasonCount>["columns"] =
  [
    {
      dataIndex: "reason",
      key: "reason",
      title: "Failure reason",
    },
    {
      align: "right",
      dataIndex: "count",
      key: "count",
      title: "Inspections",
    },
  ];

const impactedColumns: TableProps<InspectionTwinSimulationRecord>["columns"] = [
  {
    dataIndex: "businessName",
    key: "businessName",
    title: "Business",
  },
  {
    dataIndex: "permitNumber",
    key: "permitNumber",
    title: "Permit",
  },
  {
    dataIndex: "officeName",
    key: "officeName",
    title: "Office",
    render: (_value, record) => `${record.officeName} (${record.officeCode})`,
  },
  {
    dataIndex: "moduleCode",
    key: "moduleCode",
    title: "Module",
    render: (value?: string) => value ?? "Shared",
  },
  {
    align: "right",
    dataIndex: "checklistPassRatePct",
    key: "checklistPassRatePct",
    title: "Checklist pass",
    render: (value: number) => `${value}%`,
  },
  {
    align: "right",
    dataIndex: "failedChecklistItems",
    key: "failedChecklistItems",
    title: "Failed items",
  },
  {
    key: "severityProfile",
    title: "Severity profile",
    render: (_value, record) => (
      <Space wrap>
        <Tag color={record.highFindings > 0 ? "orange" : "default"}>
          HIGH {record.highFindings}
        </Tag>
        <Tag color={record.criticalFindings > 0 ? "red" : "default"}>
          CRITICAL {record.criticalFindings}
        </Tag>
      </Space>
    ),
  },
  {
    dataIndex: "completedAt",
    key: "completedAt",
    title: "Completed",
    render: (value: string) => formatDateTime(value),
  },
  {
    key: "reasons",
    title: "Twin outcome",
    render: (_value, record) => (
      <Space wrap>
        {record.reasons.map((reason) => (
          <Tag color="red" key={reason}>
            {reason}
          </Tag>
        ))}
      </Space>
    ),
  },
];

export default function InspectionTwinSimulator() {
  const [dateRange, setDateRange] = useState<[string?, string?]>([]);
  const [moduleCode, setModuleCode] = useState<string>();
  const [minChecklistPassRatePct, setMinChecklistPassRatePct] = useState(85);
  const [maxFailedChecklistItems, setMaxFailedChecklistItems] = useState(2);
  const [failOnHighSeverity, setFailOnHighSeverity] = useState(false);
  const [failOnCriticalSeverity, setFailOnCriticalSeverity] = useState(true);
  const [fromDate, toDate] = dateRange;

  const { modulesQuery, reportQuery } = useInspectionTwinReport({
    failOnCriticalSeverity,
    failOnHighSeverity,
    fromDate,
    maxFailedChecklistItems,
    minChecklistPassRatePct,
    moduleCode,
    toDate,
  });

  const impactedRecords =
    reportQuery.data?.records.filter(
      (record) => record.simulatedOutcome === "fail",
    ) ?? [];

  return (
    <div style={{ padding: 24 }}>
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            Inspection Twin Simulator
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 0, maxWidth: 760 }}>
            Dry-run a proposed ordinance rule against the last 90 days of
            completed inspections before rolling it into live enforcement.
          </Typography.Paragraph>
        </div>

        <Card
          className="glass-card dashboard-data-card"
          title="Simulation rule"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={8}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Typography.Text strong>Inspection window</Typography.Text>
                <RangePicker
                  allowClear
                  defaultValue={[dayjs().subtract(90, "day"), dayjs()]}
                  onChange={(_, formatted) => {
                    setDateRange(
                      formatted[0] && formatted[1]
                        ? [formatted[0], formatted[1]]
                        : [],
                    );
                  }}
                />
              </Space>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Typography.Text strong>Module scope</Typography.Text>
                <Select
                  allowClear
                  loading={modulesQuery.isLoading}
                  options={(modulesQuery.data?.data ?? []).map((module) => ({
                    label: `${module.name} (${module.code})`,
                    value: module.code,
                  }))}
                  placeholder="All modules"
                  value={moduleCode}
                  onChange={(value) => {
                    setModuleCode(value);
                  }}
                />
              </Space>
            </Col>
            <Col xs={24} md={12} xl={4}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Typography.Text strong>Min checklist pass %</Typography.Text>
                <InputNumber
                  max={100}
                  min={0}
                  style={{ width: "100%" }}
                  value={minChecklistPassRatePct}
                  onChange={(value) => {
                    setMinChecklistPassRatePct(Number(value ?? 0));
                  }}
                />
              </Space>
            </Col>
            <Col xs={24} md={12} xl={4}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Typography.Text strong>Max failed items</Typography.Text>
                <InputNumber
                  max={100}
                  min={0}
                  style={{ width: "100%" }}
                  value={maxFailedChecklistItems}
                  onChange={(value) => {
                    setMaxFailedChecklistItems(Number(value ?? 0));
                  }}
                />
              </Space>
            </Col>
            <Col xs={24}>
              <Space orientation="vertical" size={8}>
                <Checkbox
                  checked={failOnCriticalSeverity}
                  onChange={(event) => {
                    setFailOnCriticalSeverity(event.target.checked);
                  }}
                >
                  Fail inspections with any CRITICAL finding
                </Checkbox>
                <Checkbox
                  checked={failOnHighSeverity}
                  onChange={(event) => {
                    setFailOnHighSeverity(event.target.checked);
                  }}
                >
                  Fail inspections with any HIGH finding
                </Checkbox>
              </Space>
            </Col>
          </Row>
        </Card>

        {reportQuery.isLoading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : null}

        {reportQuery.isError ? (
          <Alert
            description={getApiErrorMessage(reportQuery.error)}
            message="Failed to load twin simulation"
            showIcon
            type="error"
          />
        ) : null}

        {reportQuery.data ? (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} xl={6}>
                <Card>
                  <Statistic
                    title="Inspections evaluated"
                    value={reportQuery.data.inspectionsEvaluated}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card>
                  <Statistic
                    title="Would fail"
                    value={reportQuery.data.simulatedFailedCount}
                    styles={{ content: { color: "#cf1322" } }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card>
                  <Statistic
                    title="Affected businesses"
                    value={reportQuery.data.affectedBusinesses}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card>
                  <Statistic
                    suffix="%"
                    title="Failure rate"
                    value={reportQuery.data.failureRatePct}
                    styles={{
                      content: {
                        color:
                          reportQuery.data.failureRatePct >= 50
                            ? "#cf1322"
                            : reportQuery.data.failureRatePct >= 25
                              ? "#d48806"
                              : "#389e0d",
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              className="glass-card dashboard-data-card"
              title="Top twin failure reasons"
            >
              {reportQuery.data.topReasons.length === 0 ? (
                <Empty description="No inspections would fail under the simulated rule." />
              ) : (
                <Table<InspectionTwinSimulationReasonCount>
                  columns={reasonsColumns}
                  dataSource={reportQuery.data.topReasons}
                  pagination={false}
                  rowKey="reason"
                  size="small"
                />
              )}
            </Card>

            <Card
              className="glass-card dashboard-data-card"
              title="Impacted inspections"
            >
              {impactedRecords.length === 0 ? (
                <Empty description="No completed inspections in this window would newly fail under the simulated rule." />
              ) : (
                <Table<InspectionTwinSimulationRecord>
                  columns={impactedColumns}
                  dataSource={impactedRecords}
                  pagination={{ pageSize: 10 }}
                  rowKey="inspectionId"
                  size="small"
                />
              )}
            </Card>
          </>
        ) : null}
      </Space>
    </div>
  );
}
