"use client";

import { useState } from "react";
import { Button, Card, Space, Tag, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";

import type { InspectionRecord } from "@shared/types/api";

const { Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  scheduled: "blue",
  in_progress: "processing",
  completed: "success",
  overdue: "error",
  canceled: "default",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function InspectionCalendar() {
  const { accessToken } = useAuthSession();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(year, month, 1).toISOString().slice(0, 10);
  const lastOfMonth = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const { inspectionsQuery } = useInspectionBrowser({
    accessToken: accessToken,
    from: firstOfMonth,
    to: lastOfMonth,
    page: 1,
  });

  const inspections = inspectionsQuery.data?.data ?? [];

  // Group by day
  const byDay: Record<number, InspectionRecord[]> = {};
  for (const insp of inspections) {
    const d = new Date(insp.scheduledAt).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(insp);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDayOfWeek).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <InspectionRouteShell
      title="Inspection Calendar"
      eyebrow="Scheduling"
      description="Monthly calendar view of scheduled inspections by date."
    >
      <Card
        loading={inspectionsQuery.isLoading}
        extra={
          <Space>
            <Button icon={<LeftOutlined />} onClick={prevMonth} size="small" />
            <Text strong>
              {monthNames[month]} {year}
            </Text>
            <Button icon={<RightOutlined />} onClick={nextMonth} size="small" />
          </Space>
        }
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "8px 4px",
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#888",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  const isToday =
                    day !== null &&
                    year === today.getFullYear() &&
                    month === today.getMonth() &&
                    day === today.getDate();

                  const dayInspections = day !== null ? (byDay[day] ?? []) : [];

                  return (
                    <td
                      key={di}
                      style={{
                        verticalAlign: "top",
                        padding: 4,
                        height: 90,
                        border: "1px solid #f0f0f0",
                        background: day === null ? "#fafafa" : undefined,
                      }}
                    >
                      {day !== null && (
                        <>
                          <div
                            style={{
                              fontWeight: isToday ? 700 : 400,
                              color: isToday ? "#1890ff" : undefined,
                              fontSize: 13,
                              marginBottom: 4,
                            }}
                          >
                            {day}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {dayInspections.slice(0, 3).map((insp) => (
                              <Tag
                                key={insp.id}
                                color={STATUS_COLOR[insp.status]}
                                style={{
                                  fontSize: 10,
                                  margin: 0,
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {insp.business.businessName}
                              </Tag>
                            ))}
                            {dayInspections.length > 3 && (
                              <Text type="secondary" style={{ fontSize: 10 }}>
                                +{dayInspections.length - 3} more
                              </Text>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </InspectionRouteShell>
  );
}
