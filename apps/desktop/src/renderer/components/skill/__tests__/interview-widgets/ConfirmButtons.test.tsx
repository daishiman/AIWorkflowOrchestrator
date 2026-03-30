import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmButtons } from "../../interview-widgets/ConfirmButtons";

describe("ConfirmButtons", () => {
  it("renders Yes and No buttons", () => {
    render(<ConfirmButtons onConfirm={vi.fn()} selected={null} />);

    expect(screen.getByTestId("confirm-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-yes")).toHaveTextContent("はい");
    expect(screen.getByTestId("confirm-no")).toHaveTextContent("いいえ");
  });

  // TC-17: 「はい」をクリック
  it("calls onConfirm(true) on Yes click (TC-17)", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} />);

    fireEvent.click(screen.getByTestId("confirm-yes"));
    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  // TC-18: 「いいえ」をクリック
  it("calls onConfirm(false) on No click (TC-18)", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} />);

    fireEvent.click(screen.getByTestId("confirm-no"));
    expect(onConfirm).toHaveBeenCalledWith(false);
  });

  it("does not fire onConfirm when disabled", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} disabled />);

    fireEvent.click(screen.getByTestId("confirm-yes"));
    fireEvent.click(screen.getByTestId("confirm-no"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm(true) on Y key press", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} />);

    fireEvent.keyDown(document, { key: "Y" });
    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  it("calls onConfirm(false) on N key press", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} />);

    fireEvent.keyDown(document, { key: "N" });
    expect(onConfirm).toHaveBeenCalledWith(false);
  });

  it("ignores Y/N keys when disabled", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButtons onConfirm={onConfirm} selected={null} disabled />);

    fireEvent.keyDown(document, { key: "Y" });
    fireEvent.keyDown(document, { key: "N" });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
