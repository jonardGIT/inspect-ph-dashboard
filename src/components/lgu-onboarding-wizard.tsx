"use client";

import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Result,
  Space,
  Steps,
  Typography,
} from "antd";
import React, { useState } from "react";

import type { ProvisionedLgu } from "@shared/types/api";
import type { ModuleRecord } from "@shared/types/api";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listModules } from "@/lib/api/modules";
import { provisionLgu } from "@/lib/api/lgu-provisioning";

const { Title, Text } = Typography;

interface WizardValues {
  lguName: string;
  lguCode: string;
  region: string;
  officeName: string;
  officeCode: string;
  moduleIds: string[];
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

const STEPS = [
  { title: "LGU details" },
  { title: "Office" },
  { title: "Modules" },
  { title: "Admin account" },
  { title: "Review & provision" },
];

export default function LguOnboardingWizard() {
  const { accessToken } = useAuthSession();
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Partial<WizardValues>>({});
  const [result, setResult] = useState<ProvisionedLgu | null>(null);
  const [form] = Form.useForm<Partial<WizardValues>>();

  const { data: modulesData, isLoading: loadingModules } = useQuery({
    enabled: current === 2 && !!accessToken,
    queryFn: () =>
      listModules({ accessToken: accessToken!, isActive: true, limit: 100 }),
    queryKey: ["modules", "active"],
  });
  const modules: ModuleRecord[] = modulesData?.data ?? [];

  const mutation = useMutation({
    mutationFn: (merged: WizardValues) =>
      provisionLgu({
        accessToken: accessToken!,
        adminEmail: merged.adminEmail,
        adminName: merged.adminName,
        adminPassword: merged.adminPassword,
        lguCode: merged.lguCode,
        lguName: merged.lguName,
        offices: [
          {
            code: merged.officeCode,
            moduleIds: merged.moduleIds ?? [],
            name: merged.officeName,
          },
        ],
        region: merged.region || undefined,
      }),
    onSuccess: (data) => setResult(data),
  });

  async function handleNext() {
    try {
      const stepValues = await form.validateFields();
      const merged = { ...values, ...stepValues };
      setValues(merged);

      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
        form.resetFields();
      } else {
        mutation.mutate(merged as WizardValues);
      }
    } catch {
      // Validation errors are shown inline
    }
  }

  function handlePrev() {
    setCurrent((c) => c - 1);
  }

  if (result) {
    return (
      <Result
        extra={[
          <Button
            key="new"
            onClick={() => {
              setResult(null);
              setValues({});
              setCurrent(0);
              form.resetFields();
            }}
          >
            Provision another LGU
          </Button>,
        ]}
        status="success"
        subTitle={
          <Space direction="vertical">
            <Text>
              LGU ID: <Text code>{result.lguId}</Text>
            </Text>
            <Text>
              Admin account: <Text code>{result.adminEmail}</Text>
            </Text>
            <Text>Offices created: {result.officeIds.length}</Text>
          </Space>
        }
        title={`"${result.lguName}" provisioned successfully`}
      />
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Steps current={current} items={STEPS} />

      <Divider />

      <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
        {current === 0 && (
          <>
            <Title level={4}>LGU details</Title>
            <Form.Item
              label="LGU name"
              name="lguName"
              rules={[
                { max: 200, message: "Max 200 characters", required: true },
              ]}
            >
              <Input placeholder="e.g. City of Tuguegarao" />
            </Form.Item>
            <Form.Item
              label="LGU code"
              name="lguCode"
              rules={[
                { max: 50, message: "Max 50 characters", required: true },
                {
                  message: "Code must be uppercase letters, digits, or hyphens",
                  pattern: /^[A-Z0-9-]+$/i,
                },
              ]}
            >
              <Input placeholder="e.g. TUG" />
            </Form.Item>
            <Form.Item label="Region (optional)" name="region">
              <Input placeholder="e.g. Region II" />
            </Form.Item>
          </>
        )}

        {current === 1 && (
          <>
            <Title level={4}>Initial office</Title>
            <Form.Item
              label="Office name"
              name="officeName"
              rules={[
                { max: 200, message: "Max 200 characters", required: true },
              ]}
            >
              <Input placeholder="e.g. Business Permits & Licensing Office" />
            </Form.Item>
            <Form.Item
              label="Office code"
              name="officeCode"
              rules={[
                { max: 50, message: "Max 50 characters", required: true },
                {
                  message: "Code must be uppercase letters, digits, or hyphens",
                  pattern: /^[A-Z0-9-]+$/i,
                },
              ]}
            >
              <Input placeholder="e.g. BPLO" />
            </Form.Item>
          </>
        )}

        {current === 2 && (
          <>
            <Title level={4}>Enable modules</Title>
            <Form.Item label="Select modules to enable" name="moduleIds">
              <Checkbox.Group>
                <Space direction="vertical">
                  {loadingModules && (
                    <Text type="secondary">Loading modules…</Text>
                  )}
                  {modules.map((m) => (
                    <Checkbox key={m.id} value={m.id}>
                      {m.name}
                      {m.description && (
                        <Text style={{ marginLeft: 8 }} type="secondary">
                          — {m.description}
                        </Text>
                      )}
                    </Checkbox>
                  ))}
                  {!loadingModules && modules.length === 0 && (
                    <Text type="secondary">No active modules found.</Text>
                  )}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </>
        )}

        {current === 3 && (
          <>
            <Title level={4}>Admin account</Title>
            <Form.Item
              label="Full name"
              name="adminName"
              rules={[
                { max: 200, message: "Max 200 characters", required: true },
              ]}
            >
              <Input placeholder="e.g. Juan dela Cruz" />
            </Form.Item>
            <Form.Item
              label="Email address"
              name="adminEmail"
              rules={[
                {
                  message: "Enter a valid email",
                  required: true,
                  type: "email",
                },
              ]}
            >
              <Input placeholder="admin@lgu.gov.ph" type="email" />
            </Form.Item>
            <Form.Item
              label="Temporary password"
              name="adminPassword"
              rules={[
                { message: "At least 8 characters", min: 8, required: true },
              ]}
            >
              <Input.Password placeholder="Min. 8 characters" />
            </Form.Item>
          </>
        )}

        {current === 4 && (
          <>
            <Title level={4}>Review</Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>
                <strong>LGU:</strong> {values.lguName} ({values.lguCode})
              </Text>
              {values.region && (
                <Text>
                  <strong>Region:</strong> {values.region}
                </Text>
              )}
              <Text>
                <strong>Office:</strong> {values.officeName} (
                {values.officeCode})
              </Text>
              <Text>
                <strong>Modules enabled:</strong>{" "}
                {(values.moduleIds ?? []).length > 0
                  ? modules
                      .filter((m) => values.moduleIds?.includes(m.id))
                      .map((m) => m.name)
                      .join(", ")
                  : "None"}
              </Text>
              <Text>
                <strong>Admin:</strong> {values.adminName} &lt;
                {values.adminEmail}&gt;
              </Text>
            </Space>
            {mutation.isError && (
              <Text style={{ display: "block", marginTop: 16 }} type="danger">
                {(mutation.error as Error).message}
              </Text>
            )}
          </>
        )}

        <Divider />

        <Space>
          {current > 0 && <Button onClick={handlePrev}>Back</Button>}
          <Button
            loading={mutation.isPending}
            onClick={handleNext}
            type="primary"
          >
            {current < STEPS.length - 1 ? "Next" : "Provision LGU"}
          </Button>
        </Space>
      </Form>
    </Space>
  );
}
