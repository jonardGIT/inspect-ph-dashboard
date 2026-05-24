"use client";

import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ComplianceScoreResult } from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import { useComplianceScore } from "@/hooks/use-compliance-score";

const { Text, Title } = Typography;

const GRADE_COLOR: Record<string, string> = {
  A: "#52c41a",
  B: "#73d13d",
  C: "#faad14",
  D: "#ff7a45",
  F: "#f5222d",
};

function ScoreCircle({ score, grade }: { score: number; grade: string }) {
  return (
    <Tooltip title={`Compliance score: ${score}/100`}>
      <Progress
        type="circle"
        percent={score}
        size={80}
        strokeColor={GRADE_COLOR[grade] ?? "#1890ff"}
        format={() => (
          <span
            style={{ fontSize: 22, fontWeight: 700, color: GRADE_COLOR[grade] }}
          >
            {grade}
          </span>
        )}
      />
    </Tooltip>
  );
}

function BreakdownRow({
  label,
  score,
  numerator,
  denominator,
}: {
  label: string;
  score: number;
  numerator: number;
  denominator: number;
}) {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
      <Col>
        <Text type="secondary">{label}</Text>
      </Col>
      <Col>
        <Text>
          {numerator}/{denominator}
        </Text>
        <Tag
          style={{ marginLeft: 8 }}
          color={score >= 75 ? "success" : score >= 50 ? "warning" : "error"}
        >
          {score}%
        </Tag>
      </Col>
    </Row>
  );
}

function ComplianceScoreContent({ data }: { data: ComplianceScoreResult }) {
  const { breakdown } = data;
  return (
    <Row gutter={16} align="middle">
      <Col>
        <ScoreCircle score={data.score} grade={data.grade} />
      </Col>
      <Col flex={1}>
        <Title level={5} style={{ marginBottom: 12 }}>
          Compliance Breakdown
        </Title>
        <BreakdownRow
          label="Findings resolved"
          score={breakdown.findings.score}
          numerator={breakdown.findings.resolved}
          denominator={breakdown.findings.total}
        />
        <BreakdownRow
          label="Inspection attendance"
          score={breakdown.inspectionAttendance.score}
          numerator={breakdown.inspectionAttendance.attended}
          denominator={breakdown.inspectionAttendance.total}
        />
        <BreakdownRow
          label="Checklist compliance"
          score={breakdown.checklistCompliance.score}
          numerator={breakdown.checklistCompliance.passed}
          denominator={breakdown.checklistCompliance.total}
        />
        <BreakdownRow
          label="Payment on-time"
          score={breakdown.paymentCompliance.score}
          numerator={breakdown.paymentCompliance.paidOnTime}
          denominator={breakdown.paymentCompliance.total}
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          Last 12 months · computed {new Date(data.computedAt).toLocaleString()}
        </Text>
      </Col>
    </Row>
  );
}

interface ComplianceScoreCardProps {
  businessId: string;
  title?: string;
}

export default function ComplianceScoreCard({
  businessId,
  title = "Compliance Score",
}: ComplianceScoreCardProps) {
  const { data, isLoading, isError, error } = useComplianceScore(businessId);

  return (
    <Card title={title}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      )}
      {isError && (
        <Alert
          type="error"
          title="Failed to load compliance score"
          description={getApiErrorMessage(error)}
        />
      )}
      {data && <ComplianceScoreContent data={data} />}
    </Card>
  );
}
