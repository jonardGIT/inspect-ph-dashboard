"use client";

import * as React from "react";

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from "antd";

import type {
  CreatePublicIssueReportInput,
  IssueReportRecord,
} from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import { createPublicIssueReport } from "@/lib/api/issue-reports";

const categoryOptions: Array<{
  label: string;
  value: CreatePublicIssueReportInput["category"];
}> = [
  { label: "Fire hazard", value: "fire_hazard" },
  { label: "Sanitation", value: "sanitation" },
  { label: "Structural", value: "structural" },
  { label: "Public safety", value: "public_safety" },
  { label: "Other", value: "other" },
];

type FormValues = CreatePublicIssueReportInput;

export default function PublicIssueReportForm() {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<IssueReportRecord | null>(null);

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createPublicIssueReport(values);

      setResult(created);
      form.resetFields(["subject", "description", "locationDescription"]);
    } catch (submitError) {
      setResult(null);
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Public issue reporting" className="glass-card">
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Residents and business owners can file a public issue report for the
          operations team to review.
        </Typography.Paragraph>
        <Form<FormValues>
          form={form}
          layout="vertical"
          initialValues={{ category: "other" }}
          onFinish={(values) => {
            void handleSubmit(values);
          }}
        >
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true }]}
          >
            <Input placeholder="Describe the issue briefly" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Share the details of the report"
            />
          </Form.Item>
          <Form.Item name="locationDescription" label="Location details">
            <Input placeholder="Landmark, street, or establishment" />
          </Form.Item>
          <Form.Item name="reporterName" label="Your name">
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item
            name="reporterEmail"
            label="Email"
            rules={[{ type: "email", message: "Enter a valid email address" }]}
          >
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item name="reporterPhone" label="Phone number">
            <Input placeholder="Optional" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={submitting}>
            Submit issue report
          </Button>
        </Form>

        {error ? <Alert type="error" showIcon title={error} /> : null}

        {result ? (
          <Alert
            type="success"
            showIcon
            title={`Report submitted: ${result.reportNumber}`}
            description={`Status: ${result.status}. Keep this reference number for follow-up.`}
          />
        ) : null}
      </Space>
    </Card>
  );
}
