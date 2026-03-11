import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreviewErrorBoundary } from "../components/PreviewPanel/PreviewErrorBoundary";

function CrashOnce({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
  if (shouldThrow) {
    throw new Error("preview crashed");
  }

  return <div data-testid="preview-safe-child">ok</div>;
}

describe("PreviewErrorBoundary", () => {
  it("render error を捕捉し、reset で復帰できる", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <PreviewErrorBoundary>
        <CrashOnce shouldThrow />
      </PreviewErrorBoundary>,
    );

    expect(screen.getByTestId("preview-error-boundary")).toBeInTheDocument();

    rerender(
      <PreviewErrorBoundary>
        <CrashOnce shouldThrow={false} />
      </PreviewErrorBoundary>,
    );

    fireEvent.click(screen.getByTestId("preview-error-boundary-reset"));

    expect(screen.getByTestId("preview-safe-child")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
