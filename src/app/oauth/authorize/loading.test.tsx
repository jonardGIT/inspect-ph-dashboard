import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loading from "./loading";

describe("OAuth authorize loading route", () => {
  it("renders the authorization loading copy", () => {
    render(<Loading />);

    expect(screen.getByText("Third-party application access")).toBeInTheDocument();
    expect(screen.getByText("Preparing authorization request")).toBeInTheDocument();
  });
});