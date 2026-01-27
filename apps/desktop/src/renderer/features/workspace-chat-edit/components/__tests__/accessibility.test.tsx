/**
 * アクセシビリティテスト
 *
 * WCAG 2.1 AA準拠のアクセシビリティ検証
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { FileAttachmentButton } from "../FileAttachmentButton";
import { FileContextList } from "../FileContextList";
import { FileContextBadge } from "../FileContextBadge";
import type { FileContext } from "../../types";

// axeマッチャーを拡張
expect.extend(toHaveNoViolations);

// useFileContextのモック
const mockAttachFile = vi.fn();
const mockRemoveFileContext = vi.fn();
const mockSetActiveContext = vi.fn();
const mockUseFileContext = vi.fn(() => ({
  fileContexts: [],
  activeContextId: null,
  canAddContext: true,
  attachFile: mockAttachFile,
  removeFileContext: mockRemoveFileContext,
  setActiveContext: mockSetActiveContext,
  error: null,
}));

vi.mock("../../hooks", () => ({
  useFileContext: () => mockUseFileContext(),
}));

// electronAPIのモック
const mockOpenDialog = vi.fn();

// テスト用モックデータ
const createMockContext = (
  id: string,
  overrides?: Partial<FileContext>,
): FileContext => ({
  id,
  filePath: `/path/to/${id}.ts`,
  fileName: `${id}.ts`,
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

describe("アクセシビリティテスト", () => {
  const mockFiles = [
    createMockContext("file-1"),
    createMockContext("file-2"),
    createMockContext("file-3"),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // useFileContextモックをリセット
    mockUseFileContext.mockReturnValue({
      fileContexts: mockFiles,
      activeContextId: null,
      canAddContext: true,
      attachFile: mockAttachFile,
      removeFileContext: mockRemoveFileContext,
      setActiveContext: mockSetActiveContext,
      error: null,
    });

    // electronAPI モックをセットアップ
    (window as unknown as { electronAPI: unknown }).electronAPI = {
      fileSelection: {
        openDialog: mockOpenDialog,
      },
    };

    mockOpenDialog.mockResolvedValue({
      success: true,
      data: {
        canceled: false,
        filePaths: ["/path/to/file1.ts"],
      },
    });
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  describe("FileAttachmentButton", () => {
    it("アクセシビリティ違反がないこと", async () => {
      const { container } = render(<FileAttachmentButton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("disabled状態でもアクセシビリティ違反がないこと", async () => {
      const { container } = render(<FileAttachmentButton disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("カスタムchildren状態でもアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <FileAttachmentButton>カスタムテキスト</FileAttachmentButton>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("FileContextList", () => {
    it("空状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(<FileContextList contexts={[]} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("ファイルがある状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(<FileContextList contexts={mockFiles} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("選択状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <FileContextList contexts={mockFiles} selectedId="file-1" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("カスタムemptyMessage状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <FileContextList contexts={[]} emptyMessage="ドラッグ&ドロップ" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("FileContextBadge", () => {
    // FileContextBadgeはrole="listitem"なので、role="list"の親要素が必要
    const ListWrapper = ({ children }: { children: React.ReactNode }) => (
      <div role="list">{children}</div>
    );

    it("デフォルト状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <ListWrapper>
          <FileContextBadge context={mockFiles[0]} />
        </ListWrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("アクティブ状態でアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <ListWrapper>
          <FileContextBadge context={mockFiles[0]} isActive />
        </ListWrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("削除ボタン付きでアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <ListWrapper>
          <FileContextBadge context={mockFiles[0]} onRemove={() => {}} />
        </ListWrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("長いファイル名でアクセシビリティ違反がないこと", async () => {
      const longNameContext = createMockContext("file", {
        fileName: "very-long-file-name-that-should-be-truncated.typescript.tsx",
      });
      const { container } = render(
        <ListWrapper>
          <FileContextBadge context={longNameContext} />
        </ListWrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("コンポーネント連携", () => {
    it("FileContextListとFileAttachmentButtonを組み合わせてもアクセシビリティ違反がないこと", async () => {
      const { container } = render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={mockFiles} />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("大量のファイルでもアクセシビリティ違反がないこと", async () => {
      const manyFiles = Array(12)
        .fill(null)
        .map((_, i) => createMockContext(`file-${i}`));
      const { container } = render(
        <FileContextList contexts={manyFiles} maxHeight="200px" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
