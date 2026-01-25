/**
 * DiffPreview コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiffPreview } from "../DiffPreview";
import type { GeneratedResult, DiffHunk, EditCommand } from "../../types";

// DiffEditorのモック
vi.mock("../DiffEditor", () => ({
  DiffEditor: vi.fn(
    ({
      original,
      modified,
      language,
    }: {
      original: string;
      modified: string;
      language: string;
    }) => (
      <div data-testid="mock-diff-editor">
        <div data-testid="original-content">{original}</div>
        <div data-testid="modified-content">{modified}</div>
        <div data-testid="language">{language}</div>
      </div>
    ),
  ),
}));

// ApplyControlsのモック
vi.mock("../ApplyControls", () => ({
  ApplyControls: vi.fn(
    ({ resultId: _resultId, onApplied, onRejected, disabled }) => (
      <div data-testid="mock-apply-controls">
        <button
          data-testid="apply-button"
          onClick={() => onApplied?.({ success: true })}
          disabled={disabled}
        >
          適用
        </button>
        <button
          data-testid="reject-button"
          onClick={onRejected}
          disabled={disabled}
        >
          却下
        </button>
      </div>
    ),
  ),
}));

// テスト用モックデータ
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
      originalEndLine: 3,
      newStartLine: 1,
      newEndLine: 4,
      originalLines: ["const x = 1;", "const y = 2;"],
      newLines: ["const x: number = 1;", "const y: number = 2;", "// added"],
    },
  ];

  return {
    id: "result-1",
    contextId: "context-1",
    originalContent: "const x = 1;\nconst y = 2;",
    generatedContent: "const x: number = 1;\nconst y: number = 2;\n// added",
    diffHunks,
    status: "pending",
    createdAt: new Date("2026-01-24T00:00:00Z"),
    targetFilePath: "/path/to/test.ts",
    command,
    ...overrides,
  };
};

describe("DiffPreview", () => {
  let mockResult: GeneratedResult;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResult = createMockResult();
  });

  describe("表示", () => {
    it("ファイル名がヘッダーに表示される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByText("test.ts")).toBeInTheDocument();
    });

    it("フルパスがツールチップとして設定される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      const header = screen.getByText("test.ts");
      expect(header).toHaveAttribute("title", "/path/to/test.ts");
    });

    it("DiffEditorが表示される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByTestId("mock-diff-editor")).toBeInTheDocument();
    });

    it("DiffEditorにoriginal/modifiedが渡される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      // HTMLのtextContentは改行をスペースに変換するため、正規化して比較
      const originalContent =
        screen.getByTestId("original-content").textContent;
      const modifiedContent =
        screen.getByTestId("modified-content").textContent;

      expect(originalContent?.replace(/\s+/g, " ").trim()).toBe(
        mockResult.originalContent.replace(/\s+/g, " ").trim(),
      );
      expect(modifiedContent?.replace(/\s+/g, " ").trim()).toBe(
        mockResult.generatedContent.replace(/\s+/g, " ").trim(),
      );
    });

    it("ApplyControlsが表示される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByTestId("mock-apply-controls")).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(
        screen.getByRole("button", { name: /閉じる|close/i }),
      ).toBeInTheDocument();
    });

    it("isOpen=falseの場合は何も表示されない", () => {
      const { container } = render(
        <DiffPreview result={mockResult} isOpen={false} onClose={vi.fn()} />,
      );

      expect(
        container.querySelector('[role="dialog"]'),
      ).not.toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("閉じるボタンクリックでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={onClose} />,
      );

      const closeButton = screen.getByRole("button", { name: /閉じる|close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Escapeキーでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={onClose} />,
      );

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("オーバーレイクリックでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={onClose} />,
      );

      const overlay = screen.getByTestId("diff-preview-overlay");
      await user.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("適用成功時にonAppliedが呼ばれる", async () => {
      const user = userEvent.setup();
      const onApplied = vi.fn();

      render(
        <DiffPreview
          result={mockResult}
          isOpen={true}
          onClose={vi.fn()}
          onApplied={onApplied}
        />,
      );

      const applyButton = screen.getByTestId("apply-button");
      await user.click(applyButton);

      await waitFor(() => {
        expect(onApplied).toHaveBeenCalled();
      });
    });

    it("却下時にonRejectedが呼ばれる", async () => {
      const user = userEvent.setup();
      const onRejected = vi.fn();

      render(
        <DiffPreview
          result={mockResult}
          isOpen={true}
          onClose={vi.fn()}
          onRejected={onRejected}
        />,
      );

      const rejectButton = screen.getByTestId("reject-button");
      await user.click(rejectButton);

      expect(onRejected).toHaveBeenCalledTimes(1);
    });
  });

  describe("差分統計", () => {
    it("追加行数が表示される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByText(/\+\d+/)).toBeInTheDocument();
    });

    it("削除行数が表示される", () => {
      const resultWithDelete = createMockResult({
        diffHunks: [
          {
            type: "remove",
            originalStartLine: 1,
            originalEndLine: 2,
            newStartLine: 1,
            newEndLine: 1,
            originalLines: ["line1", "line2"],
            newLines: [],
          },
        ],
      });

      render(
        <DiffPreview
          result={resultWithDelete}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText(/-\d+/)).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("role=dialogが設定されている", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-labelledbyが設定されている", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });

    it("aria-modalがtrueに設定されている", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("フォーカストラップが機能する", async () => {
      const user = userEvent.setup();

      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      // 最初のフォーカス可能な要素にフォーカスが当たる
      await user.tab();

      // ダイアログ内の要素にフォーカスが当たっていることを確認
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it("閉じるボタンにaria-labelが設定されている", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      const closeButton = screen.getByRole("button", { name: /閉じる|close/i });
      expect(closeButton).toHaveAttribute("aria-label");
    });
  });

  describe("言語検出", () => {
    it("ファイル拡張子からlanguageが推定される", () => {
      render(
        <DiffPreview result={mockResult} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByTestId("language")).toHaveTextContent("typescript");
    });

    it(".jsファイルの場合はjavascript", () => {
      const jsResult = createMockResult({
        targetFilePath: "/path/to/test.js",
      });

      render(<DiffPreview result={jsResult} isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("language")).toHaveTextContent("javascript");
    });

    it(".pyファイルの場合はpython", () => {
      const pyResult = createMockResult({
        targetFilePath: "/path/to/test.py",
      });

      render(<DiffPreview result={pyResult} isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("language")).toHaveTextContent("python");
    });
  });

  describe("ステータス表示", () => {
    it("pending状態でApplyControlsが有効", () => {
      const pendingResult = createMockResult({ status: "pending" });

      render(
        <DiffPreview result={pendingResult} isOpen={true} onClose={vi.fn()} />,
      );

      const applyButton = screen.getByTestId("apply-button");
      expect(applyButton).not.toBeDisabled();
    });

    it("approved状態でApplyControlsが無効", () => {
      const approvedResult = createMockResult({ status: "approved" });

      render(
        <DiffPreview result={approvedResult} isOpen={true} onClose={vi.fn()} />,
      );

      const applyButton = screen.getByTestId("apply-button");
      expect(applyButton).toBeDisabled();
    });

    it("rejected状態でApplyControlsが無効", () => {
      const rejectedResult = createMockResult({ status: "rejected" });

      render(
        <DiffPreview result={rejectedResult} isOpen={true} onClose={vi.fn()} />,
      );

      const applyButton = screen.getByTestId("apply-button");
      expect(applyButton).toBeDisabled();
    });
  });
});
