"use client";

import { Alert, Card, Col, Empty, Input, Row, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useBusinessBrowser } from "@/hooks/use-business-browser";
import { usePermitBrowser } from "@/hooks/use-permit-browser";
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
                  record.applicationDate ? formatDate(record.applicationDate) : "—",
              },
              {
                title: "Expiry",
                key: "expirationDate",
                render: (_value, record) =>
                  record.expirationDate ? formatDate(record.expirationDate) : "—",
              },
            ]}
          />
        ) : (
          <Empty description="No permits on file" />
        )}
      </Card>
    </Space>
  );
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
      <Card title="Owner business lookup" className="glass-card dashboard-data-card">
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
        <BusinessDetail
          accessToken={accessToken}
          business={selectedBusiness}
        />
      ) : null}
    </Space>
  );
}
