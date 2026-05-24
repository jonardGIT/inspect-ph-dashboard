"use client";

import { useMemo, useRef, useState } from "react";
import { Input, type InputRef, Modal, Typography } from "antd";
import {
  AlertOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BankOutlined,
  BellOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HeartOutlined,
  ReconciliationOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export interface CommandItem {
  category: string;
  icon: ReactNode;
  id: string;
  keywords?: string;
  label: string;
  path: string;
}

const ALL_COMMAND_ITEMS: CommandItem[] = [
  // --- Navigation ---
  {
    category: "Navigation",
    icon: <AppstoreOutlined />,
    id: "nav-inspections",
    keywords: "inspections list schedule",
    label: "Inspections",
    path: "/inspections",
  },
  {
    category: "Navigation",
    icon: <CalendarOutlined />,
    id: "nav-calendar",
    keywords: "calendar week schedule inspector",
    label: "Inspector Calendar",
    path: "/inspections/calendar",
  },
  {
    category: "Navigation",
    icon: <AlertOutlined />,
    id: "nav-caps",
    keywords: "cap corrective action plan",
    label: "CAPs",
    path: "/caps",
  },
  {
    category: "Navigation",
    icon: <ShopOutlined />,
    id: "nav-businesses",
    keywords: "business establishment owner",
    label: "Businesses",
    path: "/businesses",
  },
  {
    category: "Navigation",
    icon: <FileTextOutlined />,
    id: "nav-permits",
    keywords: "permit business permit renewal",
    label: "Permits",
    path: "/permits",
  },
  {
    category: "Navigation",
    icon: <FileTextOutlined />,
    id: "nav-issue-reports",
    keywords: "issue report citizen complaint",
    label: "Issue Reports",
    path: "/issue-reports",
  },
  // --- Modules ---
  {
    category: "Modules",
    icon: <BankOutlined />,
    id: "nav-buildsure",
    keywords: "building construction permit inspection",
    label: "BuildSure",
    path: "/buildsure",
  },
  {
    category: "Modules",
    icon: <BankOutlined />,
    id: "nav-fireguard",
    keywords: "fire safety certificate fsic",
    label: "FireGuard",
    path: "/fireguard",
  },
  {
    category: "Modules",
    icon: <ShopOutlined />,
    id: "nav-marketguard",
    keywords: "market stall sanitation food",
    label: "MarketGuard",
    path: "/marketguard",
  },
  {
    category: "Modules",
    icon: <BankOutlined />,
    id: "nav-sanitacheck",
    keywords: "sanitary permit health food",
    label: "SanitaCheck",
    path: "/sanitacheck",
  },
  {
    category: "Modules",
    icon: <EnvironmentOutlined />,
    id: "nav-ecowatch",
    keywords: "environment ecology waste",
    label: "EcoWatch",
    path: "/ecowatch",
  },
  {
    category: "Modules",
    icon: <EnvironmentOutlined />,
    id: "nav-zoneverify",
    keywords: "zoning land use parcel",
    label: "ZoneVerify",
    path: "/zoneverify",
  },
  {
    category: "Modules",
    icon: <BankOutlined />,
    id: "nav-infrainspect",
    keywords: "infrastructure road bridge",
    label: "InfraInspect",
    path: "/infrainspect",
  },
  {
    category: "Modules",
    icon: <ShopOutlined />,
    id: "nav-agricheck",
    keywords: "agriculture farm",
    label: "AgriCheck",
    path: "/agricheck",
  },
  {
    category: "Modules",
    icon: <BankOutlined />,
    id: "nav-assesspro",
    keywords: "assessment property real estate tax",
    label: "AssessPro",
    path: "/assesspro",
  },
  // --- Admin ---
  {
    category: "Admin",
    icon: <BarChartOutlined />,
    id: "nav-payments",
    keywords: "payments fees receipts",
    label: "Payments",
    path: "/payments",
  },
  {
    category: "Admin",
    icon: <ReconciliationOutlined />,
    id: "nav-reconciliation",
    keywords: "reconciliation treasurer report",
    label: "Payment Reconciliation",
    path: "/reports/payments",
  },
  {
    category: "Admin",
    icon: <GlobalOutlined />,
    id: "nav-lgus",
    keywords: "lgu local government unit",
    label: "LGUs",
    path: "/lgus",
  },
  {
    category: "Admin",
    icon: <AppstoreOutlined />,
    id: "nav-modules",
    keywords: "modules office module settings",
    label: "Modules config",
    path: "/modules",
  },
  {
    category: "Admin",
    icon: <FileTextOutlined />,
    id: "nav-checklist-templates",
    keywords: "checklist template items questions",
    label: "Checklist Templates",
    path: "/checklist-templates",
  },
  {
    category: "Admin",
    icon: <AuditOutlined />,
    id: "nav-audit-logs",
    keywords: "audit log activity history",
    label: "Audit Log",
    path: "/audit-logs",
  },
  {
    category: "Admin",
    icon: <BellOutlined />,
    id: "nav-notifications",
    keywords: "notifications push",
    label: "Notifications",
    path: "/notifications",
  },
  {
    category: "Admin",
    icon: <ApartmentOutlined />,
    id: "nav-offices",
    keywords: "office branch department",
    label: "Offices",
    path: "/offices",
  },
  {
    category: "Admin",
    icon: <UserOutlined />,
    id: "nav-users",
    keywords: "users staff accounts",
    label: "Users",
    path: "/users",
  },
  {
    category: "Admin",
    icon: <HeartOutlined />,
    id: "nav-system-health",
    keywords: "health system status monitoring",
    label: "System Health",
    path: "/reports/system",
  },
  {
    category: "Admin",
    icon: <UserOutlined />,
    id: "nav-sessions",
    keywords: "sessions auth token",
    label: "Sessions",
    path: "/sessions",
  },
];

interface CommandPaletteProps {
  isAdmin: boolean;
  onClose: () => void;
  open: boolean;
}

function scoreItem(item: CommandItem, query: string): number {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const keywords = (item.keywords ?? "").toLowerCase();
  const path = item.path.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (path.includes(q)) return 50;
  if (keywords.includes(q)) return 40;
  return 0;
}

const ADMIN_CATEGORIES = new Set(["Admin"]);

export default function CommandPalette({
  isAdmin,
  onClose,
  open,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<InputRef>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const filtered = ALL_COMMAND_ITEMS.filter(
      (item) => isAdmin || !ADMIN_CATEGORIES.has(item.category),
    );

    if (!query.trim()) {
      return filtered.slice(0, 8);
    }

    return filtered
      .map((item) => ({ item, score: scoreItem(item, query.trim()) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item);
  }, [query, isAdmin]);

  const boundedActiveIndex = Math.min(
    activeIndex,
    Math.max(0, results.length - 1),
  );

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (prev) =>
          (prev - 1 + Math.max(1, results.length)) %
          Math.max(1, results.length),
      );
    } else if (event.key === "Enter" && results[boundedActiveIndex]) {
      navigate(results[boundedActiveIndex].path);
    }
  };

  // Group by category
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of results) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return [...map.entries()];
  }, [results]);

  // Flat index within grouped results
  const flatResults = groups.flatMap(([, items]) => items);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterOpenChange={(nextOpen) => {
        if (!nextOpen) {
          return;
        }

        setQuery("");
        setActiveIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      }}
      footer={null}
      width={580}
      closable={false}
      styles={{
        body: { padding: 0 },
      }}
      style={{ top: "20vh", borderRadius: 12, overflow: "hidden" }}
    >
      <div onKeyDown={handleKeyDown}>
        <div
          style={{
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            gap: 8,
            padding: "12px 16px",
          }}
        >
          <Input
            ref={inputRef}
            autoFocus
            variant="borderless"
            placeholder="Search pages, actions…"
            size="large"
            style={{ flex: 1, fontSize: 16, padding: 0 }}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, flexShrink: 0 }}
          >
            ↑↓ navigate · ↵ open · Esc close
          </Typography.Text>
        </div>

        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
          {groups.length === 0 ? (
            <div
              style={{
                color: "#999",
                padding: "24px 16px",
                textAlign: "center",
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            groups.map(([category, items]) => (
              <div key={category}>
                <Typography.Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    padding: "6px 16px 2px",
                    textTransform: "uppercase",
                  }}
                >
                  {category}
                </Typography.Text>
                {items.map((item) => {
                  const flatIndex = flatResults.indexOf(item);
                  const isActive = flatIndex === boundedActiveIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      style={{
                        alignItems: "center",
                        background: isActive ? "#f5f5f5" : "transparent",
                        borderRadius: 6,
                        cursor: "pointer",
                        display: "flex",
                        gap: 10,
                        margin: "1px 8px",
                        padding: "8px 10px",
                        transition: "background 0.1s",
                      }}
                    >
                      <span style={{ color: "#666", fontSize: 16 }}>
                        {item.icon}
                      </span>
                      <Typography.Text style={{ flex: 1 }}>
                        {item.label}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 11 }}
                      >
                        {item.path}
                      </Typography.Text>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            color: "#bbb",
            fontSize: 11,
            padding: "8px 16px",
            textAlign: "right",
          }}
        >
          ⌘K to toggle
        </div>
      </div>
    </Modal>
  );
}
