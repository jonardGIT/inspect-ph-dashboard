"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getApiErrorMessage } from "@/lib/api/http";
import { getRoleProfile } from "@/lib/role-profiles";

interface InspectionRouteShellProps {
  children: React.ReactNode;
  description: string;
  secondarySidebar?: React.ReactNode;
  title: string;
  eyebrow: string;
}

export default function InspectionRouteShell({
  children,
  description,
  secondarySidebar,
  title,
  eyebrow,
}: InspectionRouteShellProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { accessToken, isHydrated, loginMutation, logout, session } =
    useAuthSession();
  const roleProfile = getRoleProfile(session?.user);
  const officeCount = Array.isArray(session?.user.officeIds)
    ? session.user.officeIds.length
    : 0;

  const submitLogin = async () => {
    await loginMutation.mutateAsync({
      email: email.trim(),
      password,
    });
    setPassword("");
  };

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Text className="eyebrow">{eyebrow}</Typography.Text>
          <Typography.Title style={{ margin: 0 }}>{title}</Typography.Title>
          <Typography.Paragraph style={{ margin: 0, maxWidth: 780 }}>
            {description}
          </Typography.Paragraph>
          <Space wrap>
            <Button type="primary">
              <Link href="/">Return to dashboard</Link>
            </Button>
            <Typography.Text type="secondary">
              API origin:{" "}
              {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}
            </Typography.Text>
          </Space>
        </Space>
      </section>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={8}>
          <Card title="Dashboard session" className="glass-card">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {isHydrated && session ? (
                <>
                  <Typography.Paragraph style={{ margin: 0 }}>
                    Signed in as {session.user.name} ({roleProfile.label}).
                  </Typography.Paragraph>
                  <Typography.Text type="secondary">
                    {session.user.email}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Scope: {roleProfile.accessScope} · {officeCount} office
                    {officeCount === 1 ? "" : "s"}
                  </Typography.Text>
                  <Button onClick={logout}>Sign out</Button>
                </>
              ) : null}
              {isHydrated && !session ? (
                <>
                  <Typography.Paragraph style={{ margin: 0 }}>
                    Sign in with your Inspect PH account to load inspection
                    data.
                  </Typography.Paragraph>
                  <Input
                    placeholder="you@example.gov.ph"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <Input.Password
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <Button
                    type="primary"
                    loading={loginMutation.isPending}
                    onClick={() => void submitLogin()}
                  >
                    Sign in
                  </Button>
                </>
              ) : null}
              {!isHydrated ? <Spin size="small" /> : null}
              {!accessToken && isHydrated ? (
                <Alert
                  type="info"
                  showIcon
                  title="Inspection queries stay idle until you sign in."
                />
              ) : null}
              {loginMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  title={getApiErrorMessage(loginMutation.error)}
                />
              ) : null}
            </Space>
          </Card>

          {secondarySidebar ? (
            <div style={{ marginTop: 20 }}>{secondarySidebar}</div>
          ) : null}
        </Col>

        <Col xs={24} xl={16}>
          {children}
        </Col>
      </Row>
    </main>
  );
}
