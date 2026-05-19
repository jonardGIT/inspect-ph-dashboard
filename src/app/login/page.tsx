"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Spin, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";

function LoginForm() {
  const { isHydrated, loginMutation, session } = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/inspections";

  // Already signed in — bounce to intended destination
  useEffect(() => {
    if (isHydrated && session) {
      router.replace(next);
    }
  }, [isHydrated, session, router, next]);

  function onFinish(values: { email: string; password: string }) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.replace(next);
      },
    });
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-layout, #eef3ea)",
        padding: 24,
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400 }}
        styles={{ body: { padding: "32px 32px 24px" } }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            InspectPH
          </Typography.Title>
          <Typography.Text type="secondary">
            Sign in to the operations console
          </Typography.Text>
        </div>

        {loginMutation.isError ? (
          <Alert
            type="error"
            title={loginMutation.error?.message ?? "Invalid email or password"}
            style={{ marginBottom: 16 }}
            showIcon
          />
        ) : null}

        <Form
          layout="vertical"
          onFinish={onFinish}
          disabled={loginMutation.isPending}
          autoComplete="on"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@example.com"
              type="email"
              autoComplete="username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginMutation.isPending}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            minHeight: "100dvh",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
