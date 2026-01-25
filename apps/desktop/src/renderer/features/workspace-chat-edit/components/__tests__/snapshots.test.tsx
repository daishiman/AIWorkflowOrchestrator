/**
 * スナップショットテスト
 *
 * Phase 6: コンポーネントのUIスナップショットテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { FileContextBadge } from "../FileContextBadge";
import { ApplyControls } from "../ApplyControls";
import { EditCommandInput } from "../EditCommandInput";
import { DiffEditor } from "../DiffEditor";
import type { FileContext } from "../../types";

// Monaco Editorのモック
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: vi.fn(({ original, modified, language, theme }) => (
    <div data-testid="monaco-diff-snapshot">
      <span data-testid="original">{original}</span>
      <span data-testid="modified">{modified}</span>
      <span data-testid="language">{language}</span>
      <span data-testid="theme">{theme}</span>
    </div>
  )),
}));

// useDiffApplyのモック
vi.mock("../../hooks/useDiffApply", () => ({
  useDiffApply: vi.fn(() => ({
    applyResult: vi.fn(),
    rejectResult: vi.fn(),
    isLoading: false,
    error: null,
    currentResult: null,
    isDiffPreviewOpen: false,
    calculateDiff: vi.fn(),
    openDiffPreview: vi.fn(),
    closeDiffPreview: vi.fn(),
  })),
}));

import { useDiffApply } from "../../hooks/useDiffApply";

// テスト用モックデータ
const createMockContext = (overrides?: Partial<FileContext>): FileContext => ({
  id: "test-id-1",
  filePath: "/path/to/test.ts",
  fileName: "test.ts",
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

describe("Snapshot Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("FileContextBadge", () => {
    it("デフォルト表示のスナップショット", () => {
      const mockContext = createMockContext();
      const { container } = render(<FileContextBadge context={mockContext} />);
      expect(container).toMatchSnapshot();
    });

    it("削除ボタン付きのスナップショット", () => {
      const mockContext = createMockContext();
      const { container } = render(
        <FileContextBadge context={mockContext} onRemove={vi.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it("アクティブ状態のスナップショット", () => {
      const mockContext = createMockContext();
      const { container } = render(
        <FileContextBadge context={mockContext} isActive={true} />,
      );
      expect(container).toMatchSnapshot();
    });

    it("長いファイル名のスナップショット", () => {
      const mockContext = createMockContext({
        fileName: "very-long-filename-that-should-be-truncated.ts",
      });
      const { container } = render(<FileContextBadge context={mockContext} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe("ApplyControls", () => {
    it("デフォルト表示のスナップショット", () => {
      const { container } = render(<ApplyControls resultId="result-1" />);
      expect(container).toMatchSnapshot();
    });

    it("ローディング状態のスナップショット", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: true,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      const { container } = render(<ApplyControls resultId="result-1" />);
      expect(container).toMatchSnapshot();
    });

    it("エラー状態のスナップショット", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: "適用に失敗しました",
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      const { container } = render(<ApplyControls resultId="result-1" />);
      expect(container).toMatchSnapshot();
    });

    it("無効化状態のスナップショット", () => {
      const { container } = render(
        <ApplyControls resultId="result-1" disabled={true} />,
      );
      expect(container).toMatchSnapshot();
    });

    it("size=sm のスナップショット", () => {
      const { container } = render(
        <ApplyControls resultId="result-1" size="sm" />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("EditCommandInput", () => {
    it("デフォルト表示のスナップショット", () => {
      const { container } = render(
        <EditCommandInput targetContextId="context-1" onSubmit={vi.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it("カスタムタイプ選択時のスナップショット", () => {
      const { container } = render(
        <EditCommandInput
          targetContextId="context-1"
          onSubmit={vi.fn()}
          initialType="custom"
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it("ローディング状態のスナップショット", () => {
      const { container } = render(
        <EditCommandInput
          targetContextId="context-1"
          onSubmit={vi.fn()}
          isLoading={true}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it("無効化状態のスナップショット", () => {
      const { container } = render(
        <EditCommandInput
          targetContextId="context-1"
          onSubmit={vi.fn()}
          disabled={true}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it("size=sm のスナップショット", () => {
      const { container } = render(
        <EditCommandInput
          targetContextId="context-1"
          onSubmit={vi.fn()}
          size="sm"
        />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("DiffEditor", () => {
    const defaultProps = {
      original: "const x = 1;",
      modified: "const x: number = 1;",
      language: "typescript",
    };

    it("デフォルト表示のスナップショット", () => {
      const { container } = render(<DiffEditor {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it("カスタムheightのスナップショット", () => {
      const { container } = render(
        <DiffEditor {...defaultProps} height="600px" />,
      );
      expect(container).toMatchSnapshot();
    });

    it("sideBySide=falseのスナップショット", () => {
      const { container } = render(
        <DiffEditor {...defaultProps} sideBySide={false} />,
      );
      expect(container).toMatchSnapshot();
    });

    it("vs-light テーマのスナップショット", () => {
      const { container } = render(
        <DiffEditor {...defaultProps} theme="vs-light" />,
      );
      expect(container).toMatchSnapshot();
    });

    it("カスタムフォントサイズのスナップショット", () => {
      const { container } = render(
        <DiffEditor {...defaultProps} fontSize={18} />,
      );
      expect(container).toMatchSnapshot();
    });
  });
});
