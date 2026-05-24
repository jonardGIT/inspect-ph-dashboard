"use client";

import { useQueries } from "@tanstack/react-query";
import {
  Alert,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useBusinessBrowser } from "@/hooks/use-business-browser";
import { usePermitBrowser } from "@/hooks/use-permit-browser";
import { listPayments } from "@/lib/api/payments";
import { getApiErrorMessage } from "@/lib/api/http";
import type { BusinessEstablishment } from "@shared/types/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function BusinessDetail({
  accessToken,
  business,
}: {
  accessToken: string;
  business: BusinessEstablishment;
}) {
  const { permitsQuery } = usePermitBrowser({
    accessToken,
    businessId: business.id,
    page: 1,
  });

  const permits = permitsQuery.data?.data ?? [];
  const paymentQueries = useQueries({
    queries: permits.map((permit) => ({
      enabled: Boolean(accessToken),
      queryFn: () =>
        listPayments({
          accessToken,
          limit: 10,
          page: 1,
          permitId: permit.id,
        }),
      queryKey: ["owner-support-payments", business.id, permit.id],
      staleTime: 60_000,
    })),
  });

  const paymentsLoading = paymentQueries.some((query) => query.isLoading);
  const paymentsError = paymentQueries.find((query) => query.error)?.error;

  const paymentHistoryRows = useMemo(() => {
    return permits.map((permit, index) => {
      const records = paymentQueries[index]?.data?.data ?? [];
      const latestPayment = records[0];

      return {
        amountInMinor: latestPayment?.amountInMinor,
        latestPayment,
        permitId: permit.id,
        permitNumber: permit.permitNumber,
        status: permit.status,
      };
    });
  }, [paymentQueries, permits]);

  const ownerActivityRows = useMemo(() => {
    const items = [
      {
        date: business.createdAt,
        detail: business.contactNumber
          ? `Owner contact: ${business.contactNumber}`
          : "Owner contact number not yet recorded.",
        event: "Business registered",
        id: `business-${business.id}`,
      },
      ...permits.flatMap((permit, index) => {
        const records = paymentQueries[index]?.data?.data ?? [];

        return [
          {
            date: permit.applicationDate ?? permit.createdAt,
            detail: `${permit.permitNumber} · ${permit.lineOfBusiness}`,
            event: "Permit application tracked",
            id: `permit-${permit.id}`,
          },
          ...records.flatMap((payment) => {
            const entries = [
              {
                date: payment.createdAt,
                detail: `${payment.referenceNumber} · ${payment.status} · ${formatCurrency(payment.amountInMinor)}`,
                event: "Payment record created",
                id: `payment-created-${payment.id}`,
              },
            ];

            if (payment.paidAt) {
              entries.push({
                date: payment.paidAt,
                detail: `${payment.referenceNumber} · Receipt ${payment.receiptNumber ?? "pending"}`,
                event: "Payment settled",
                id: `payment-paid-${payment.id}`,
              });
            }

            return entries;
          }),
        ];
      }),
    ];

    return items.sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    );
  }, [business, paymentQueries, permits]);

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card
        title="Business information"
        size="small"
        className="glass-card dashboard-data-card"
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Business name</Typography.Text>
            <br />
            <Typography.Text strong>{business.businessName}</Typography.Text>
          </Col>
          {business.tradeName ? (
            <Col xs={24} md={8}>
              <Typography.Text type="secondary">Trade name</Typography.Text>
              <br />
              <Typography.Text>{business.tradeName}</Typography.Text>
            </Col>
          ) : null}
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Owner</Typography.Text>
            <br />
            <Typography.Text>{business.ownerName}</Typography.Text>
          </Col>
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Address</Typography.Text>
            <br />
            <Typography.Text>
              {business.addressLine}, {business.barangay}, {business.city},{" "}
              {business.province}
            </Typography.Text>
          </Col>
          {business.contactNumber ? (
            <Col xs={24} md={8}>
              <Typography.Text type="secondary">Contact</Typography.Text>
              <br />
              <Typography.Text>{business.contactNumber}</Typography.Text>
            </Col>
          ) : null}
          {business.taxIdentificationNumber ? (
            <Col xs={24} md={8}>
              <Typography.Text type="secondary">TIN</Typography.Text>
              <br />
              <Typography.Text>
                {business.taxIdentificationNumber}
              </Typography.Text>
            </Col>
          ) : null}
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Registered</Typography.Text>
            <br />
            <Typography.Text>{formatDate(business.createdAt)}</Typography.Text>
          </Col>
        </Row>
      </Card>

      <Card
        title={`Permits (${permits.length})`}
        size="small"
        className="glass-card dashboard-data-card"
      >
        {permitsQuery.isLoading ? (
          <Typography.Text type="secondary">Loading permits…</Typography.Text>
        ) : permitsQuery.error ? (
          <Alert
            type="error"
            showIcon
            title={getApiErrorMessage(permitsQuery.error)}
          />
        ) : permits.length ? (
          <Table
            className="dashboard-table"
            dataSource={permits}
            pagination={false}
            rowKey="id"
            size="small"
            columns={[
              {
                title: "Permit number",
                dataIndex: "permitNumber",
                key: "permitNumber",
                render: (value: string | undefined) => value ?? "—",
              },
              {
                title: "Line of business",
                dataIndex: "lineOfBusiness",
                key: "lineOfBusiness",
              },
              {
                title: "Status",
                key: "status",
                render: (_value, record) => {
                  const color: Record<string, string> = {
                    approved: "green",
                    draft: "default",
                    expired: "orange",
                    pending_inspection: "gold",
                    rejected: "red",
                  };
                  return (
                    <Tag color={color[record.status] ?? "default"}>
                      {record.status}
                    </Tag>
                  );
                },
              },
              {
                title: "Application date",
                key: "applicationDate",
                render: (_value, record) =>
                  record.applicationDate
                    ? formatDate(record.applicationDate)
                    : "—",
              },
              {
                title: "Expiry",
                key: "expirationDate",
                render: (_value, record) =>
                  record.expirationDate
                    ? formatDate(record.expirationDate)
                    : "—",
              },
            ]}
          />
        ) : (
          <Empty description="No permits on file" />
        )}
      </Card>

      <Card
        title="Fee and payment history"
        size="small"
        className="glass-card dashboard-data-card"
      >
        {paymentsLoading ? (
          <Typography.Text type="secondary">
            Loading payment history…
          </Typography.Text>
        ) : paymentsError ? (
          <Alert
            type="error"
            showIcon
            title={getApiErrorMessage(paymentsError)}
          />
        ) : paymentHistoryRows.length ? (
          <Table
            className="dashboard-table"
            dataSource={paymentHistoryRows}
            pagination={false}
            rowKey="permitId"
            size="small"
            columns={[
              {
                title: "Permit",
                key: "permit",
                render: (_value, record) => (
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>
                      {record.permitNumber}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {record.latestPayment?.referenceNumber ??
                        "No payment yet"}
                    </Typography.Text>
                  </Space>
                ),
              },
              {
                title: "Latest amount",
                key: "amount",
                render: (_value, record) =>
                  typeof record.amountInMinor === "number"
                    ? formatCurrency(record.amountInMinor)
                    : "—",
              },
              {
                title: "Payment status",
                key: "paymentStatus",
                render: (_value, record) =>
                  record.latestPayment ? (
                    <Tag
                      color={getPaymentStatusColor(record.latestPayment.status)}
                    >
                      {record.latestPayment.status}
                    </Tag>
                  ) : (
                    <Typography.Text type="secondary">
                      Awaiting payment
                    </Typography.Text>
                  ),
              },
              {
                title: "Updated",
                key: "updatedAt",
                render: (_value, record) =>
                  record.latestPayment?.updatedAt
                    ? formatDate(record.latestPayment.updatedAt)
                    : "—",
              },
            ]}
          />
        ) : (
          <Empty description="No fee or payment history recorded yet" />
        )}
      </Card>

      <Card
        title="Owner contact and activity log"
        size="small"
        className="glass-card dashboard-data-card"
      >
        {ownerActivityRows.length ? (
          <Table
            className="dashboard-table"
            dataSource={ownerActivityRows}
            pagination={false}
            rowKey="id"
            size="small"
            columns={[
              {
                title: "Event",
                dataIndex: "event",
                key: "event",
              },
              {
                title: "Date",
                dataIndex: "date",
                key: "date",
                render: (value: string) => formatDate(value),
              },
              {
                title: "Detail",
                dataIndex: "detail",
                key: "detail",
              },
            ]}
          />
        ) : (
          <Empty description="No owner activity logged yet" />
        )}
      </Card>
    </Space>
  );
}

function formatCurrency(amountInMinor: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amountInMinor / 100);
}

function getPaymentStatusColor(status: string) {
  const color: Record<string, string> = {
    failed: "red",
    paid: "green",
    pending: "gold",
    processing: "blue",
    refunded: "purple",
  };

  return color[status] ?? "default";
}

export default function OwnerSupportDesk() {
  const { accessToken } = useAuthSession();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessEstablishment | null>(null);

  const { businessesQuery } = useBusinessBrowser({
    accessToken,
    page: 1,
    search: submittedSearch || undefined,
  });

  const businesses = businessesQuery.data?.data ?? [];

  function handleSearch(value: string) {
    setSubmittedSearch(value.trim());
    setSelectedBusiness(null);
  }

  return (
    <Space orientation="vertical" size={20} style={{ width: "100%" }}>
      <Card
        title="Owner business lookup"
        className="glass-card dashboard-data-card"
      >
        <Input.Search
          allowClear
          enterButton="Search"
          placeholder="Search by business name or owner name"
          size="large"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onSearch={handleSearch}
        />
        {submittedSearch && !businessesQuery.isLoading ? (
          <Typography.Text
            type="secondary"
            style={{ marginTop: 8, display: "block" }}
          >
            {businesses.length} result
            {businesses.length !== 1 ? "s" : ""} for &ldquo;{submittedSearch}
            &rdquo;
          </Typography.Text>
        ) : null}
      </Card>

      {businessesQuery.error ? (
        <Alert
          type="error"
          showIcon
          title={getApiErrorMessage(businessesQuery.error)}
        />
      ) : null}

      {submittedSearch && businesses.length > 0 ? (
        <Card title="Search results" className="glass-card dashboard-data-card">
          <Table
            className="dashboard-table"
            dataSource={businesses}
            pagination={false}
            rowKey="id"
            columns={[
              {
                title: "Business name",
                key: "businessName",
                render: (_value, record) => (
                  <Space orientation="vertical" size={0}>
                    <Typography.Text
                      strong
                      style={{ cursor: "pointer", color: "#1677ff" }}
                      onClick={() => setSelectedBusiness(record)}
                    >
                      {record.businessName}
                    </Typography.Text>
                    {record.tradeName ? (
                      <Typography.Text type="secondary">
                        {record.tradeName}
                      </Typography.Text>
                    ) : null}
                  </Space>
                ),
              },
              {
                title: "Owner",
                dataIndex: "ownerName",
                key: "ownerName",
              },
              {
                title: "City",
                dataIndex: "city",
                key: "city",
              },
              {
                title: "Registered",
                key: "createdAt",
                render: (_value, record) => formatDate(record.createdAt),
              },
            ]}
          />
        </Card>
      ) : submittedSearch && !businessesQuery.isLoading ? (
        <Card className="glass-card">
          <Empty description="No businesses found for this search" />
        </Card>
      ) : null}

      {selectedBusiness ? (
        <BusinessDetail accessToken={accessToken} business={selectedBusiness} />
      ) : null}
    </Space>
  );
}
