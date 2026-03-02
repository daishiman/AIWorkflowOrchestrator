import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorToolBar } from "../components/EditorToolBar";

describe("EditorToolBar", () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnOpenBackups = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ETB-01
  it("選択中のファイル名をツールバーに表示する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    expect(screen.getByText("SKILL.md")).toBeInTheDocument();
  });

  // ETB-02
  it("変更がある場合に保存ボタンを有効化する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={true}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).not.toBeDisabled();
  });

  // ETB-03
  it("変更がない場合に保存ボタンを無効化する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).toBeDisabled();
  });

  // ETB-04
  it("読み取り専用モードで保存ボタンを無効化する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={true}
        isSaving={false}
        isReadOnly={true}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).toBeDisabled();
  });

  // ETB-05
  it("保存ボタンクリック時に onSave を呼び出す", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={true}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    fireEvent.click(screen.getByLabelText("保存"));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  // ETB-06
  it("保存中（isSaving=true）に保存ボタンを無効化しスピナーを表示する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={true}
        isSaving={true}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).toBeDisabled();
    expect(screen.getByTestId("save-spinner")).toBeInTheDocument();
  });

  // ETB-07
  it("閉じるボタンクリック時に onClose を呼び出す", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ETB-08
  it("バックアップボタンクリック時に onOpenBackups を呼び出す", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    fireEvent.click(screen.getByLabelText("バックアップ"));
    expect(mockOnOpenBackups).toHaveBeenCalledTimes(1);
  });

  // ETB-09
  it("保存ボタンに aria-label='保存' を付与する", () => {
    render(
      <EditorToolBar
        selectedFile="SKILL.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onOpenBackups={mockOnOpenBackups}
      />,
    );
    expect(screen.getByLabelText("保存")).toHaveAttribute("aria-label", "保存");
  });
});
