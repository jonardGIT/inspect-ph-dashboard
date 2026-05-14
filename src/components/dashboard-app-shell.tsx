"use client";

import {
  AppstoreOutlined,
  ApartmentOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  FileTextOutlined,
  GlobalOutlined,
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
  "/lgus",
  "/modules",
  "/notifications",
  "/office-modules",
  "/offices",
  "/permits",
  "/reports",
  "/sessions",
  "/users",
] as const;

const ADMIN_ONLY_PATHS = [
  "/audit-logs",
  "/lgus",
  "/modules",
  "/notifications",
  "/office-modules",
  "/offices",
  "/reports",
  "/users",
] as const;

interface NavigationItem {
  adminOnly?: boolean;
  icon: React.ReactNode;
  key: string;
  label: string;
}

const navigationItems: NavigationItem[] = [
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
    icon: <UserOutlined />,
    key: "/sessions",
    label: "Sessions",
  },
  {
    adminOnly: true,
    icon: <GlobalOutlined />,
    key: "/lgus",
    label: "LGUs",
  },
  {
    adminOnly: true,
    icon: <AppstoreOutlined />,
    key: "/modules",
    label: "Modules",
  },
  {
    adminOnly: true,
    icon: <AuditOutlined />,
    key: "/audit-logs",
    label: "Audit log",
  },
  {
    adminOnly: true,
    icon: <BellOutlined />,
    key: "/notifications",
    label: "Notifications",
  },
  {
    adminOnly: true,
    icon: <ApartmentOutlined />,
    key: "/offices",
    label: "Offices",
  },
  {
    adminOnly: true,
    icon: <ApartmentOutlined />,
    key: "/office-modules",
    label: "Office modules",
  },
  {
    adminOnly: true,
    icon: <UserOutlined />,
    key: "/users",
    label: "Users",
  },
  {
    adminOnly: true,
    icon: <BarChartOutlined />,
    key: "/reports",
    label: "Reports",
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

export function isAdminDashboardPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((prefix) => pathname.startsWith(prefix));
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
  const isAdmin = session?.user.role === "admin";
  const visibleNavigationItems = useMemo(
    () => navigationItems.filter((item) => (item.adminOnly ? isAdmin : true)),
    [isAdmin],
  );

  const selectedKey = useMemo(() => {
    const exact = visibleNavigationItems.find(
      (item) => item.key === pathname,
    )?.key;

    if (exact) {
      return String(exact);
    }

    const prefixed = visibleNavigationItems.find((item) =>
      pathname.startsWith(item.key),
    )?.key;

    return String(prefixed ?? "/inspections");
  }, [pathname, visibleNavigationItems]);

  const menuItems: NonNullable<MenuProps["items"]> = visibleNavigationItems.map(
    (item) => ({
      icon: item.icon,
      key: item.key,
      label: item.label,
    }),
  );
  const isBlockedAdminPath = !isAdmin && isAdminDashboardPath(pathname);

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
          items={menuItems}
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
        <Content className="dashboard-content">
          {isBlockedAdminPath ? (
            <div className="glass-card" style={{ padding: 24 }}>
              <Space direction="vertical" size={12}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Admin access required
                </Typography.Title>
                <Typography.Text type="secondary">
                  This route is reserved for administrative operations.
                  Inspectors can continue using inspections, businesses, and
                  permits.
                </Typography.Text>
                <Button
                  type="primary"
                  onClick={() => router.push("/inspections")}
                >
                  Go to inspections
                </Button>
              </Space>
            </div>
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
