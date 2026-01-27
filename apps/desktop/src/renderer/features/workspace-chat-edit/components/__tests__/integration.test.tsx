/**
 * 統合テスト
 *
 * Phase 4: TDD Red - Hooks連携を含む統合テストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  FileContext,
  GeneratedResult,
  EditCommand,
  DiffHunk,
} from "../../types";

// useFileContextのモック
const mockUseFileContext = {
  fileContexts: [] as FileContext[],
  isDragging: false,
  error: null as string | null,
  warning: null as string | null,
  canAddContext: true,
  totalContextSize: 0,
  activeContextId: null as string | null,
  attachFile: vi.fn(),
  addFileContext: vi.fn(),
  removeFileContext: vi.fn(),
  clearAllContexts: vi.fn(),
  setActiveContext: vi.fn(),
  setDragging: vi.fn(),
  clearError: vi.fn(),
};

vi.mock("../../hooks/useFileContext", () => ({
  useFileContext: vi.fn(() => mockUseFileContext),
}));

// useDiffApplyのモック
const mockUseDiffApply = {
  applyResult: vi.fn(),
  rejectResult: vi.fn(),
  isLoading: false,
  error: null as string | null,
  currentResult: null as GeneratedResult | null,
  isDiffPreviewOpen: false,
  calculateDiff: vi.fn(),
  openDiffPreview: vi.fn(),
  closeDiffPreview: vi.fn(),
};

vi.mock("../../hooks/useDiffApply", () => ({
  useDiffApply: vi.fn(() => mockUseDiffApply),
}));

// Monaco Editorのモック
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: vi.fn(({ original, modified }) => (
    <div data-testid="mock-monaco-diff">
      <div data-testid="monaco-original">{original}</div>
      <div data-testid="monaco-modified">{modified}</div>
    </div>
  )),
}));

import { FileContextDropZone } from "../FileContextDropZone";
import { FileContextBadge } from "../FileContextBadge";
import { ApplyControls } from "../ApplyControls";
import { DiffPreview } from "../DiffPreview";
import { EditCommandInput } from "../EditCommandInput";

// テスト用モックデータ
const createMockFileContext = (
  overrides?: Partial<FileContext>,
): FileContext => ({
  id: "context-1",
  filePath: "/path/to/test.ts",
  fileName: "test.ts",
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

const createMockResult = (
  overrides?: Partial<GeneratedResult>,
): GeneratedResult => {
  const command: EditCommand = {
    type: "refactor",
    targetContextId: "context-1",
  };

  const diffHunks: DiffHunk[] = [
    {
      type: "modify",
      originalStartLine: 1,
      originalEndLine: 1,
      newStartLine: 1,
      newEndLine: 1,
      originalLines: ["const x = 1;"],
      newLines: ["const x: number = 1;"],
    },
  ];

  return {
    id: "result-1",
    contextId: "context-1",
    originalContent: "const x = 1;",
    generatedContent: "const x: number = 1;",
    diffHunks,
    status: "pending",
    createdAt: new Date("2026-01-24T00:00:00Z"),
    targetFilePath: "/path/to/test.ts",
    command,
    ...overrides,
  };
};

describe("統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // モックをリセット
    Object.assign(mockUseFileContext, {
      fileContexts: [],
      isDragging: false,
      error: null,
      warning: null,
      canAddContext: true,
      totalContextSize: 0,
      activeContextId: null,
      attachFile: vi.fn(),
      addFileContext: vi.fn(),
      removeFileContext: vi.fn(),
      clearAllContexts: vi.fn(),
      setActiveContext: vi.fn(),
      setDragging: vi.fn(),
      clearError: vi.fn(),
    });
    Object.assign(mockUseDiffApply, {
      applyResult: vi.fn(),
      rejectResult: vi.fn(),
      isLoading: false,
      error: null,
      currentResult: null,
      isDiffPreviewOpen: false,
      calculateDiff: vi.fn(),
      openDiffPreview: vi.fn(),
      closeDiffPreview: vi.fn(),
    });
  });

  describe("FileContextDropZone → useFileContext 連携", () => {
    it("ファイルドロップでattachFileが呼ばれる", async () => {
      const mockAttachFile = vi.fn();
      mockUseFileContext.attachFile = mockAttachFile;

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      const file = new File(["content"], "test.ts", {
        type: "text/typescript",
      });
      Object.defineProperty(file, "path", { value: "/path/to/test.ts" });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockAttachFile).toHaveBeenCalled();
      });
    });

    it("ドラッグ中にsetDragging(true)が呼ばれる", () => {
      const mockSetDragging = vi.fn();
      mockUseFileContext.setDragging = mockSetDragging;

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      fireEvent.dragEnter(dropZone);

      expect(mockSetDragging).toHaveBeenCalledWith(true);
    });

    it("ドラッグ終了でsetDragging(false)が呼ばれる", () => {
      const mockSetDragging = vi.fn();
      mockUseFileContext.setDragging = mockSetDragging;
      mockUseFileContext.isDragging = true;

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      fireEvent.dragLeave(dropZone, { relatedTarget: document.body });

      expect(mockSetDragging).toHaveBeenCalledWith(false);
    });

    it("エラー状態が表示される", () => {
      mockUseFileContext.error = "ファイルサイズが上限を超えています";

      render(<FileContextDropZone />);

      expect(
        screen.getByText("ファイルサイズが上限を超えています"),
      ).toBeInTheDocument();
    });
  });

  describe("FileContextBadge → useFileContext 連携", () => {
    it("削除ボタンクリックでremoveFileContextが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockRemoveFileContext = vi.fn();
      const context = createMockFileContext();

      render(
        <FileContextBadge context={context} onRemove={mockRemoveFileContext} />,
      );

      const removeButton = screen.getByRole("button", { name: /削除/ });
      await user.click(removeButton);

      expect(mockRemoveFileContext).toHaveBeenCalledTimes(1);
    });

    it("バッジクリックでsetActiveContextが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockSetActiveContext = vi.fn();
      const context = createMockFileContext();

      render(
        <FileContextBadge context={context} onSelect={mockSetActiveContext} />,
      );

      const badge = screen.getByRole("listitem");
      await user.click(badge);

      expect(mockSetActiveContext).toHaveBeenCalledTimes(1);
    });
  });

  describe("ApplyControls → useDiffApply 連携", () => {
    it("適用ボタンクリックでapplyResultが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockApplyResult = vi.fn().mockResolvedValue({ success: true });
      mockUseDiffApply.applyResult = mockApplyResult;

      render(<ApplyControls resultId="result-1" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      expect(mockApplyResult).toHaveBeenCalledWith("result-1");
    });

    it("却下ボタンクリックでrejectResultが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockRejectResult = vi.fn();
      mockUseDiffApply.rejectResult = mockRejectResult;

      render(<ApplyControls resultId="result-1" />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      await user.click(rejectButton);

      expect(mockRejectResult).toHaveBeenCalledWith("result-1");
    });

    it("ローディング中はボタンが無効化される", () => {
      mockUseDiffApply.isLoading = true;

      render(<ApplyControls resultId="result-1" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      const rejectButton = screen.getByRole("button", { name: /却下/ });

      expect(applyButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });

    it("エラーメッセージが表示される", () => {
      mockUseDiffApply.error = "ファイルの書き込みに失敗しました";

      render(<ApplyControls resultId="result-1" />);

      expect(
        screen.getByText("ファイルの書き込みに失敗しました"),
      ).toBeInTheDocument();
    });
  });

  describe("DiffPreview + DiffEditor + ApplyControls 統合", () => {
    it("DiffPreviewにDiffEditorが含まれている", () => {
      const result = createMockResult();

      render(<DiffPreview result={result} isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("mock-monaco-diff")).toBeInTheDocument();
    });

    it("DiffPreviewにApplyControlsが含まれている", () => {
      const result = createMockResult();

      render(<DiffPreview result={result} isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByRole("button", { name: /適用/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /却下/ })).toBeInTheDocument();
    });

    it("DiffEditorにoriginal/modifiedが正しく渡される", () => {
      const result = createMockResult();

      render(<DiffPreview result={result} isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        "const x = 1;",
      );
      expect(screen.getByTestId("monaco-modified")).toHaveTextContent(
        "const x: number = 1;",
      );
    });
  });

  describe("EditCommandInput → onSubmit 連携", () => {
    it("コマンド送信でEditCommandが生成される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCommandInput targetContextId="context-1" onSubmit={onSubmit} />,
      );

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "continue",
          targetContextId: "context-1",
        }),
      );
    });

    it("カスタム指示付きでEditCommandが生成される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCommandInput
          targetContextId="context-1"
          onSubmit={onSubmit}
          initialType="custom"
        />,
      );

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      await user.type(textArea, "型を追加して");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "custom",
          targetContextId: "context-1",
          instruction: "型を追加して",
        }),
      );
    });
  });

  describe("完全なワークフロー", () => {
    it("ファイルドロップ → コマンド入力 → 差分プレビュー → 適用の流れ", async () => {
      const user = userEvent.setup();
      const mockResult = createMockResult();

      // Step 1: ファイルドロップ
      mockUseFileContext.attachFile = vi.fn();
      const { rerender } = render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      const file = new File(["content"], "test.ts", {
        type: "text/typescript",
      });
      Object.defineProperty(file, "path", { value: "/path/to/test.ts" });

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(mockUseFileContext.attachFile).toHaveBeenCalled();
      });

      // Step 2: コマンド入力
      const onSubmit = vi.fn();
      rerender(
        <EditCommandInput targetContextId="context-1" onSubmit={onSubmit} />,
      );

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();

      // Step 3: 差分プレビュー表示
      rerender(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("mock-monaco-diff")).toBeInTheDocument();

      // Step 4: 適用
      mockUseDiffApply.applyResult = vi
        .fn()
        .mockResolvedValue({ success: true });
      rerender(<ApplyControls resultId="result-1" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      expect(mockUseDiffApply.applyResult).toHaveBeenCalledWith("result-1");
    });
  });

  describe("複数ファイルコンテキスト", () => {
    it("複数のFileContextBadgeが表示される", () => {
      const contexts = [
        createMockFileContext({ id: "context-1", fileName: "file1.ts" }),
        createMockFileContext({ id: "context-2", fileName: "file2.ts" }),
        createMockFileContext({ id: "context-3", fileName: "file3.ts" }),
      ];

      render(
        <div role="list">
          {contexts.map((context) => (
            <FileContextBadge key={context.id} context={context} />
          ))}
        </div>,
      );

      expect(screen.getByText("file1.ts")).toBeInTheDocument();
      expect(screen.getByText("file2.ts")).toBeInTheDocument();
      expect(screen.getByText("file3.ts")).toBeInTheDocument();
    });

    it("アクティブなコンテキストが視覚的に区別される", () => {
      const contexts = [
        createMockFileContext({ id: "context-1", fileName: "file1.ts" }),
        createMockFileContext({ id: "context-2", fileName: "file2.ts" }),
      ];

      render(
        <div role="list">
          <FileContextBadge context={contexts[0]} isActive={true} />
          <FileContextBadge context={contexts[1]} isActive={false} />
        </div>,
      );

      const badges = screen.getAllByRole("listitem");
      expect(badges[0]).toHaveAttribute("aria-current", "true");
      expect(badges[1]).not.toHaveAttribute("aria-current");
    });
  });

  describe("エラー状態の伝播", () => {
    it("useFileContextのエラーがDropZoneに表示される", () => {
      mockUseFileContext.error = "ファイル数の上限に達しました";

      render(<FileContextDropZone />);

      expect(
        screen.getByText("ファイル数の上限に達しました"),
      ).toBeInTheDocument();
    });

    it("useDiffApplyのエラーがApplyControlsに表示される", () => {
      mockUseDiffApply.error = "適用に失敗しました";

      render(<ApplyControls resultId="result-1" />);

      expect(screen.getByText("適用に失敗しました")).toBeInTheDocument();
    });
  });

  describe("ローディング状態の伝播", () => {
    it("useDiffApplyのローディング状態がApplyControlsに反映される", () => {
      mockUseDiffApply.isLoading = true;

      render(<ApplyControls resultId="result-1" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      expect(applyButton).toBeDisabled();
    });
  });
});
