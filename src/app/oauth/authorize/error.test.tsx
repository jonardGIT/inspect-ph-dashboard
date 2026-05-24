import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import OAuthAuthorizeError from "./error";

describe("OAuth authorize error route", () => {
  it("renders the route error copy and retries", () => {
    const reset = vi.fn();

    render(
      <OAuthAuthorizeError
        error={Object.assign(new Error("OAuth route exploded"), {
          digest: "digest-123",
        })}
        reset={reset}
      />,
    );

    expect(screen.getByText("Authorization page unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load authorization request"),
    ).toBeInTheDocument();
    expect(screen.getByText("OAuth route exploded")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry page/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});