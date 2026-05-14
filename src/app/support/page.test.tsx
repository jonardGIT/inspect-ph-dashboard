import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SupportPage from "./page";

describe("SupportPage", () => {
  it("renders the owner support lookup workspace", () => {
    render(<SupportPage />);

    expect(screen.getByText("Support lookups")).toBeInTheDocument();
    expect(screen.getByText("Public permit lookup")).toBeInTheDocument();
    expect(screen.getByText("Public certificate lookup")).toBeInTheDocument();
    expect(screen.getByText("Track an issue report")).toBeInTheDocument();
    expect(screen.getByText("Public payment lookup")).toBeInTheDocument();
  });
});
