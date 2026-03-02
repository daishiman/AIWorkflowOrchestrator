import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";

describe("UnsavedChangesDialog", () => {
  const mockOnSaveAndContinue = vi.fn();
  const mockOnDiscardAndContinue = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // UCD-01
  it("isOpen=true の場合にダイアログを表示する", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  // UCD-02
  it("isOpen=false の場合にダイアログを非表示にする", () => {
    render(
      <UnsavedChangesDialog
        isOpen={false}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  // UCD-03
  it("「保存して続行」ボタンクリック時に onSaveAndContinue を呼び出す", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    fireEvent.click(screen.getByText("保存して続行"));
    expect(mockOnSaveAndContinue).toHaveBeenCalledTimes(1);
  });

  // UCD-04
  it("「保存せず続行」ボタンクリック時に onDiscardAndContinue を呼び出す", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    fireEvent.click(screen.getByText("保存せず続行"));
    expect(mockOnDiscardAndContinue).toHaveBeenCalledTimes(1);
  });

  // UCD-05
  it("「キャンセル」ボタンクリック時に onCancel を呼び出す", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    fireEvent.click(screen.getByText("キャンセル"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // UCD-06
  it("ダイアログに role='alertdialog' と aria-modal='true' を付与する", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        fileName="SKILL.md"
        onSaveAndContinue={mockOnSaveAndContinue}
        onDiscardAndContinue={mockOnDiscardAndContinue}
        onCancel={mockOnCancel}
      />,
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
