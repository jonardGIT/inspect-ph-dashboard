"use client";

import { useState } from "react";
import { Alert, Button, Form, Input, Result, Select, Typography } from "antd";

import { submitDataSubjectRequest } from "@/lib/api/privacy";
import { getApiErrorMessage } from "@/lib/api/http";
import type { DataSubjectRequestType } from "@shared/types/api";

const { Title, Paragraph } = Typography;

const REQUEST_TYPE_OPTIONS: {
  label: string;
  value: DataSubjectRequestType;
  description: string;
}[] = [
  {
    description: "Request a copy of the personal data we hold about you.",
    label: "Access my data",
    value: "ACCESS",
  },
  {
    description: "Request correction of inaccurate or incomplete data.",
    label: "Correct my data",
    value: "CORRECTION",
  },
  {
    description:
      "Request deletion of your personal data (subject to legal retention requirements).",
    label: "Erase my data",
    value: "ERASURE",
  },
];

interface FormValues {
  type: DataSubjectRequestType;
  email: string;
  description: string;
}

export default function PrivacyRequestForm() {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await submitDataSubjectRequest(values);
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Request submitted"
        subTitle="We will review your request and respond to the email address you provided within 15 business days, as required by the Data Privacy Act."
        extra={<Button href="/privacy">Return to Privacy Notice</Button>}
      />
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <Title level={3}>Data Subject Request</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Use this form to exercise your rights under the{" "}
        <a href="/privacy">Data Privacy Act of 2012</a>. We will respond within
        15 business days.
      </Paragraph>

      {error && (
        <Alert
          type="error"
          title={error}
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="type"
          label="Request type"
          rules={[{ message: "Please select a request type", required: true }]}
        >
          <Select
            placeholder="Select the type of request"
            options={REQUEST_TYPE_OPTIONS.map((opt) => ({
              label: (
                <div>
                  <div>{opt.label}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>
                    {opt.description}
                  </div>
                </div>
              ),
              value: opt.value,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Your email address"
          rules={[
            { message: "Email is required", required: true },
            { message: "Please enter a valid email address", type: "email" },
          ]}
        >
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { message: "Description is required", required: true },
            {
              message: "Please provide at least 10 characters of context",
              min: 10,
              type: "string",
            },
          ]}
          extra="Describe what data you are concerned about or what correction you need."
        >
          <Input.TextArea rows={4} maxLength={2000} showCount />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Submit request
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
