"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import type { PaymentAnomalyFlag } from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import {
  usePaymentAnomalyFlags,
  useResolveAnomalyFlag,
} from "@/hooks/use-payment-anomaly-flags";

const { Title, Text } = Typography;

const REASON_COLOR: Record<string, string> = {
  DUPLICATE: "red",
  AMOUNT_MISMATCH: "orange",
  LOW_AMOUNT: "gold",
  HIGH_VELOCITY: "volcano",
};

export default function PaymentAnomalyBrowser() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isError, error } = usePaymentAnomalyFlags({
    includeResolved,
    page,
    limit: LIMIT,
  });

  const { mutate: resolveFlag, isPending: isResolving } =
    useResolveAnomalyFlag();

  const columns: TableProps<PaymentAnomalyFlag>["columns"] = [
    {
      dataIndex: ["payment", "referenceNumber"],
      key: "referenceNumber",
      title: "Reference",
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      dataIndex: "reason",
      key: "reason",
      title: "Reason",
      render: (v: string) => (
        <Tag color={REASON_COLOR[v] ?? "default"}>{v}</Tag>
      ),
    },
    {
      dataIndex: "detail",
      key: "detail",
      title: "Detail",
      render: (v: string | null) =>
        v ? (
          <Tooltip title={v}>
            <Text ellipsis style={{ maxWidth: 260, display: "inline-block" }}>
              {v}
            </Text>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: ["payment", "amountInMinor"],
      key: "amount",
      title: "Amount",
      align: "right",
      render: (v: number) =>
        (v / 100).toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        }),
    },
    {
      dataIndex: "quarantinedAt",
      key: "quarantinedAt",
      title: "Flagged",
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      dataIndex: "resolvedAt",
      key: "resolvedAt",
      title: "Status",
      render: (v: string | null) =>
        v ? <Tag color="success">Resolved</Tag> : <Tag color="error">Open</Tag>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) =>
        !record.resolvedAt ? (
          <Button
            size="small"
            type="primary"
            loading={isResolving}
            onClick={() =>
              Modal.confirm({
                title: "Resolve anomaly flag?",
                content: "Mark this payment anomaly as reviewed and resolved.",
                onOk: () => resolveFlag(record.id),
              })
            }
          >
            Resolve
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} align="baseline">
        <Title level={3} style={{ margin: 0 }}>
          Payment Anomaly Flags
        </Title>
        <Checkbox
          checked={includeResolved}
          onChange={(e) => {
            setIncludeResolved(e.target.checked);
            setPage(1);
          }}
        >
          Show resolved
        </Checkbox>
      </Space>

      {isError && (
        <Alert
          type="error"
          message="Failed to load anomaly flags"
          description={getApiErrorMessage(error)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table<PaymentAnomalyFlag>
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total: data?.meta.total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `${total} flags`,
        }}
        rowKey="id"
        size="small"
      />
    </div>
  );
}
