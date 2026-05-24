"use client";

import { useState } from "react";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Row,
  Spin,
  Statistic,
  Tooltip,
  Typography,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { getApiErrorMessage } from "@/lib/api/http";
import { useWellnessReport } from "@/hooks/use-wellness-report";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function MetricCard({
  title,
  value,
  suffix,
  tooltip,
  warn,
}: {
  title: string;
  value: number | string | null;
  suffix?: string;
  tooltip?: string;
  warn?: boolean;
}) {
  return (
    <Card>
      <Statistic
        title={
          <span>
            {title}
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 12 }} />
              </Tooltip>
            )}
          </span>
        }
        value={value ?? "—"}
        suffix={suffix}
        styles={warn ? { content: { color: "#faad14" } } : undefined}
      />
    </Card>
  );
}

export default function WellnessReport() {
  const [dateRange, setDateRange] = useState<[string?, string?]>([]);
  const [fromDate, toDate] = dateRange;

  const { data, isLoading, isError, error } = useWellnessReport({
    fromDate,
    toDate,
  });

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Inspector Wellness Signals
          </Title>
          <Text type="secondary">
            Aggregate metrics only — no individual inspector data is exposed.
          </Text>
        </Col>
        <Col>
          <RangePicker
            allowClear
            onChange={(_, formatted) =>
              setDateRange(
                formatted[0] && formatted[1]
                  ? [formatted[0], formatted[1]]
                  : [],
              )
            }
            defaultValue={[dayjs().subtract(3, "month"), dayjs()]}
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
          title="Failed to load wellness data"
          description={getApiErrorMessage(error)}
        />
      )}

      {data && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="Active Inspectors"
              value={data.activeInspectorCount}
              tooltip="Inspectors with at least one inspection in the period"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="Avg Inspections / Inspector"
              value={data.avgInspectionsPerInspector}
              tooltip="Total inspections divided by active inspector count"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="Avg Inspection Duration"
              value={data.avgDurationMinutes ?? "—"}
              suffix={data.avgDurationMinutes !== null ? "min" : undefined}
              tooltip="Average elapsed time between startedAt and completedAt (capped at 480 min)"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="Median Inspection Duration"
              value={data.medianDurationMinutes ?? "—"}
              suffix={data.medianDurationMinutes !== null ? "min" : undefined}
              tooltip="Median duration — less sensitive to outliers than average"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="After-Hours Rate"
              value={data.afterHoursRatePct}
              suffix="%"
              warn={data.afterHoursRatePct > 20}
              tooltip="Inspections started outside Mon–Fri 08:00–17:00"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              title="Avg Pending Queue / Inspector"
              value={data.avgPendingQueuePerInspector}
              warn={data.avgPendingQueuePerInspector > 5}
              tooltip="Average number of SCHEDULED or IN_PROGRESS inspections per inspector"
            />
          </Col>
        </Row>
      )}
    </div>
  );
}
