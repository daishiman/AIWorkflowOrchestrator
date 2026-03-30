import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterviewProgressBar } from "../InterviewProgressBar";

describe("InterviewProgressBar", () => {
  it("displays progress text (TC-08)", () => {
    render(<InterviewProgressBar current={2} total={5} />);

    expect(screen.getByTestId("progress-text")).toHaveTextContent("2/5");
  });

  it("sets correct width percentage", () => {
    render(<InterviewProgressBar current={3} total={10} />);

    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveStyle({ width: "30%" });
  });

  it("handles 0/0 case (TC-B01)", () => {
    render(<InterviewProgressBar current={0} total={0} />);

    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveStyle({ width: "0%" });
    expect(screen.getByTestId("progress-text")).toHaveTextContent("0/0");
  });

  it("shows 100% when complete (TC-B02)", () => {
    render(<InterviewProgressBar current={5} total={5} />);

    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveStyle({ width: "100%" });
    expect(screen.getByTestId("progress-text")).toHaveTextContent("5/5");
  });

  it("has correct aria attributes", () => {
    render(<InterviewProgressBar current={2} total={5} />);

    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveAttribute("role", "progressbar");
    expect(fill).toHaveAttribute("aria-valuenow", "2");
    expect(fill).toHaveAttribute("aria-valuemin", "0");
    expect(fill).toHaveAttribute("aria-valuemax", "5");
  });
});
