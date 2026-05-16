import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import CommandPalette from "./command-palette";

function renderPalette(props: {
  isAdmin?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const onClose = props.onClose ?? vi.fn();
  return render(
    <CommandPalette
      isAdmin={props.isAdmin ?? false}
      open={props.open ?? true}
      onClose={onClose}
    />,
  );
}

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders the search input when open", () => {
    renderPalette({ open: true });
    expect(screen.getByPlaceholderText("Search pages, actions…")).toBeDefined();
  });

  it("shows navigation items by default (no query)", () => {
    renderPalette({ open: true });
    // Some Navigation items should appear
    expect(screen.getByText("Inspections")).toBeDefined();
    expect(screen.getByText("Businesses")).toBeDefined();
  });

  it("filters items by label text", () => {
    renderPalette({ isAdmin: true, open: true });
    const input = screen.getByPlaceholderText("Search pages, actions…");
    fireEvent.change(input, { target: { value: "audit" } });
    expect(screen.getByText("Audit Log")).toBeDefined();
  });

  it("filters items by keyword", () => {
    renderPalette({ open: true });
    const input = screen.getByPlaceholderText("Search pages, actions…");
    fireEvent.change(input, { target: { value: "corrective" } });
    expect(screen.getByText("CAPs")).toBeDefined();
  });

  it("hides Admin category items for non-admin users", () => {
    renderPalette({ isAdmin: false, open: true });
    // Admin items should not appear
    const userItems = screen.queryAllByText("Users");
    expect(userItems.length).toBe(0);
    const auditItems = screen.queryAllByText("Audit Log");
    expect(auditItems.length).toBe(0);
  });

  it("shows Admin category items for admin users", () => {
    renderPalette({ isAdmin: true, open: true });
    const input = screen.getByPlaceholderText("Search pages, actions…");
    fireEvent.change(input, { target: { value: "users" } });
    expect(screen.getByText("Users")).toBeDefined();
  });

  it("shows 'No results' message for a nonsense query", () => {
    renderPalette({ open: true });
    const input = screen.getByPlaceholderText("Search pages, actions…");
    fireEvent.change(input, { target: { value: "xyzzy123nonsense" } });
    expect(screen.getByText(/no results/i)).toBeDefined();
  });
});
