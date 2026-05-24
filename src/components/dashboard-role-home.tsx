"use client";

import Link from "next/link";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";

import { useAuthSession } from "@/hooks/use-auth-session";
import PublicFireSafetyCertificateLookup from "@/components/public-fire-safety-certificate-lookup";
import PublicIssueReportForm from "@/components/public-issue-report-form";
import PublicIssueReportLookup from "@/components/public-issue-report-lookup";
import PublicPaymentLookup from "@/components/public-payment-lookup";
import PublicPermitLookup from "@/components/public-permit-lookup";

import type { User } from "@shared/types/api";

interface HomeCard {
  description: string;
  href: string;
  title: string;
}

const PUBLIC_CARDS: HomeCard[] = [
  {
    description:
      "Browse live inspections, filter by status, and open the workspace from the actual queue.",
    href: "/inspections",
    title: "Inspection queue",
  },
  {
    description:
      "Browse permit records and create permits for registered businesses through the existing API.",
    href: "/permits",
    title: "Permit registry",
  },
  {
    description:
      "Browse the BPLO business registry and register establishments through the existing API.",
    href: "/businesses",
    title: "Business registry",
  },
];

const ROLE_HOME_CARDS: Record<User["role"], HomeCard[]> = {
  admin: [
    {
      description: "Review platform-wide audit history and sensitive governance events.",
      href: "/audit-logs",
      title: "Audit oversight",
    },
    {
      description: "Process privacy requests, session controls, and platform access governance.",
      href: "/privacy/requests",
      title: "Compliance desk",
    },
    {
      description: "Manage users, LGUs, and operational reports across the platform.",
      href: "/users",
      title: "Platform administration",
    },
  ],
  lgu_admin: [
    {
      description: "Review office queues, issue reports, and inspection throughput across your LGU.",
      href: "/inspections",
      title: "LGU operations",
    },
    {
      description: "Manage office and user access within your LGU scope.",
      href: "/users",
      title: "Office access",
    },
    {
      description: "Track reports, workload, and module activity for the current LGU.",
      href: "/reports",
      title: "LGU reporting",
    },
  ],
  office_supervisor: [
    {
      description: "Assign inspections, review findings, and monitor the office queue.",
      href: "/inspections",
      title: "Queue and assignments",
    },
    {
      description: "Track corrective action plans and prepare follow-up inspection decisions.",
      href: "/caps",
      title: "CAP review",
    },
    {
      description: "Issue and review fire-safety outcomes after successful reinspection.",
      href: "/fireguard",
      title: "Certificate workspace",
    },
  ],
  office_clerk: [
    {
      description: "Register or update business records before inspection handoff.",
      href: "/businesses",
      title: "Business intake",
    },
    {
      description: "Prepare permit renewals and confirm payment-linked records.",
      href: "/permits",
      title: "Permit intake",
    },
    {
      description: "Verify inspection work items are ready for supervisor review and assignment.",
      href: "/inspections",
      title: "Inspection preparation",
    },
  ],
  inspector: [
    {
      description: "Open the web queue only when you need a desktop view of your assigned inspections.",
      href: "/inspections",
      title: "Assigned inspections",
    },
    {
      description: "Use the calendar for schedule verification, but keep field execution in mobile.",
      href: "/inspections/calendar",
      title: "Schedule review",
    },
  ],
  business_owner: [],
  citizen: [],
};

function RoleMessageCard(input: {
  description: string;
  tagColor: string;
  tagLabel: string;
  title: string;
}) {
  return (
    <Card className="glass-card">
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Tag color={input.tagColor}>{input.tagLabel}</Tag>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {input.title}
        </Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>
          {input.description}
        </Typography.Paragraph>
      </Space>
    </Card>
  );
}

export default function DashboardRoleHome() {
  const { session } = useAuthSession();

  if (!session) {
    return (
      <main className="page-shell">
        <section className="hero-panel">
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Tag color="green">Inspect PH operations dashboard</Tag>
            <h1 style={{ margin: 0 }}>Inspect PH Dashboard</h1>
            <p style={{ margin: 0, maxWidth: 720 }}>
              The dashboard now has a first BPLO inspection workspace wired to the
              API for inspection detail, checklist results, findings, and
              attachment uploads.
            </p>
            <Space wrap>
              <Button type="primary" size="large">
                <Link href="/inspections">Open inspection queue</Link>
              </Button>
              <span style={{ color: "var(--text-soft)" }}>
                Set NEXT_PUBLIC_API_BASE_URL to point at the API origin.
              </span>
            </Space>
          </Space>
        </section>

        <Row gutter={[16, 16]}>
          {PUBLIC_CARDS.map((card) => (
            <Col key={card.title} xs={24} md={12} lg={8}>
              <Card
                title={card.title}
                className="glass-card"
                extra={<span aria-hidden="true">-&gt;</span>}
              >
                <Space orientation="vertical" size={12}>
                  <p style={{ margin: 0 }}>{card.description}</p>
                  <Button type="link" style={{ padding: 0 }}>
                    <Link href={card.href}>Go to workspace</Link>
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
          <Col xs={24} lg={12}>
            <PublicFireSafetyCertificateLookup />
          </Col>
          <Col xs={24} lg={12}>
            <PublicIssueReportForm />
          </Col>
          <Col xs={24} lg={12}>
            <PublicIssueReportLookup />
          </Col>
          <Col xs={24} lg={12}>
            <PublicPermitLookup />
          </Col>
          <Col xs={24} lg={12}>
            <PublicPaymentLookup />
          </Col>
        </Row>
      </main>
    );
  }

  const role = session.user.role;

  if (role === "business_owner") {
    return (
      <main className="page-shell">
        <RoleMessageCard
          tagColor="gold"
          tagLabel="Mobile-first role"
          title="Use mobile for owner self-service"
          description="Business owners should use the mobile app for permits, CAP acknowledgements, reinspection requests, and certificate tracking. The web dashboard is reserved for office operations."
        />
      </main>
    );
  }

  if (role === "citizen") {
    return (
      <main className="page-shell">
        <RoleMessageCard
          tagColor="gold"
          tagLabel="Mobile-first role"
          title="Use mobile for citizen reporting"
          description="Citizens should use the mobile app for public issue reporting and status tracking. The web dashboard is reserved for office and administrative work."
        />
      </main>
    );
  }

  const cards = ROLE_HOME_CARDS[role];

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Tag color={role === "inspector" ? "blue" : "green"}>
            {role === "inspector" ? "Dashboard-secondary role" : "Dashboard-primary role"}
          </Tag>
          <Typography.Title style={{ margin: 0 }}>
            {session.user.roleProfile.label}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, maxWidth: 760 }}>
            {role === "inspector"
              ? "Use the dashboard for schedule review and desktop inspection browsing. Keep field execution, findings, and attachment capture in the mobile app."
              : "This workspace is tailored to the primary operational tasks for your role."}
          </Typography.Paragraph>
        </Space>
      </section>

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.title} xs={24} md={12} lg={8}>
            <Card
              title={card.title}
              className="glass-card"
              extra={<span aria-hidden="true">-&gt;</span>}
            >
              <Space orientation="vertical" size={12}>
                <Typography.Paragraph style={{ margin: 0 }}>
                  {card.description}
                </Typography.Paragraph>
                <Button type="link" style={{ padding: 0 }}>
                  <Link href={card.href}>Open workspace</Link>
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </main>
  );
}