import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the dashboard heading, queue link, and public public-service tools", () => {
    render(<HomePage />);

    expect(screen.getByText("Inspect PH Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Open inspection queue")).toBeInTheDocument();
    expect(screen.getByText("Public certificate lookup")).toBeInTheDocument();
    expect(screen.getByText("Public issue reporting")).toBeInTheDocument();
    expect(screen.getByText("Track an issue report")).toBeInTheDocument();
    expect(screen.getByText("Public permit lookup")).toBeInTheDocument();
    expect(screen.getByText("Public payment lookup")).toBeInTheDocument();
  });
});
