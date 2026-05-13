import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the dashboard heading and queue link", () => {
    render(<HomePage />);

    expect(screen.getByText("Inspect PH Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Open inspection queue")).toBeInTheDocument();
  });
});
