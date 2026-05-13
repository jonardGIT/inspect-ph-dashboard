"use client";

import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";

const { Content, Header, Sider } = Layout;

const PROTECTED_PREFIXES = [
  "/audit-logs",
  "/businesses",
  "/inspections",
  "/permits",
] as const;

const navigationItems: NonNullable<MenuProps["items"]> = [
  {
    icon: <AppstoreOutlined />,
    key: "/inspections",
    label: "Inspections",
  },
  {
    icon: <ShopOutlined />,
    key: "/businesses",
    label: "Businesses",
  },
  {
    icon: <AuditOutlined />,
    key: "/audit-logs",
    label: "Audit log",
  },
  {
    icon: <FileTextOutlined />,
    key: "/permits",
    label: "Permits",
  },
];

export function isProtectedDashboardPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

interface DashboardAppShellProps {
  children: React.ReactNode;
}

export default function DashboardAppShell({
  children,
}: DashboardAppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = useAuthSession();

  const selectedKey = useMemo(() => {
    const exact = navigationItems.find((item) => item?.key === pathname)?.key;

    if (exact) {
      return String(exact);
    }

    const prefixed = navigationItems.find((item) =>
      pathname.startsWith(String(item?.key)),
    )?.key;

    return String(prefixed ?? "/inspections");
  }, [pathname]);

  const identityLabel = session?.user.email || session?.user.name || "Guest";
  const avatarInitial = identityLabel.charAt(0).toUpperCase() || "G";

  return (
    <Layout className="dashboard-shell">
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        collapsible
        collapsedWidth={84}
        trigger={null}
        width={252}
        className="dashboard-sider"
      >
        <div className="dashboard-brand">
          <Typography.Text className="dashboard-brand-eyebrow">
            Inspect PH
          </Typography.Text>
          <Typography.Title level={4} className="dashboard-brand-title">
            {collapsed ? "IP" : "Operations"}
          </Typography.Title>
          {!collapsed ? (
            <Typography.Text className="dashboard-brand-copy">
              BPLO workspace
            </Typography.Text>
          ) : null}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navigationItems}
          className="dashboard-menu"
          onClick={({ key }) => router.push(String(key))}
        />
        {!collapsed ? (
          <div className="dashboard-sider-footer">
            <Button block icon={<BankOutlined />}>
              <Link href="/">Public landing</Link>
            </Button>
          </div>
        ) : null}
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <div className="dashboard-header-lead">
            <Button
              aria-label={
                collapsed ? "Expand navigation" : "Collapse navigation"
              }
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((current) => !current)}
            />
            <div>
              <Typography.Text className="dashboard-header-eyebrow">
                Authenticated workspace
              </Typography.Text>
              <Typography.Title level={3} className="dashboard-header-title">
                BPLO Operations Console
              </Typography.Title>
            </div>
          </div>
          <Space size={12}>
            <Tag color={session ? "green" : "default"}>
              {session?.user.role || "guest"}
            </Tag>
            <div className="dashboard-identity-card">
              <Avatar icon={<UserOutlined />}>{avatarInitial}</Avatar>
              <div>
                <Typography.Text strong>{identityLabel}</Typography.Text>
              </div>
            </div>
            {session ? <Button onClick={logout}>Sign out</Button> : null}
          </Space>
        </Header>
        <Content className="dashboard-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
