/**
 * VersionDetail Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionDetail } from "../VersionDetail";

// Types (will be imported from actual types when implemented)
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string;
  size: number;
  mimeType: string;
  hash: string;
  isLatest: boolean;
  metadata?: Record<string, unknown>;
}

interface ConversionLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  details?: Record<string, unknown>;
}

// Mock factory
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 2,
  createdAt: "2026-01-10T12:00:00Z",
  size: 2048,
  mimeType: "text/markdown",
  hash: "def456",
  isLatest: false,
  ...overrides,
});

const createMockConversionLog = (
  overrides?: Partial<ConversionLog>,
): ConversionLog => ({
  timestamp: "2026-01-10T12:00:00Z",
  level: "info",
  message: "Conversion completed",
  ...overrides,
});

// Mock setup
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe("VersionDetail", () => {
  const defaultProps = {
    conversionId: "conv-001",
    onRestore: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    // Add historyAPI to window without replacing the entire window object
    (window as unknown as { historyAPI: typeof mockHistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();

    // Default successful response
    mockHistoryAPI.getVersionDetail.mockResolvedValue({
      success: true,
      data: {
        version: createMockVersionHistoryItem(),
        logs: [createMockConversionLog()],
      },
    });
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: typeof mockHistoryAPI })
      .historyAPI;
  });

  describe("バージョン詳細表示 (FR-02)", () => {
    it("VD-001: バージョン番号が表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: バージョン番号が表示される
      expect(await screen.findByText(/v2/i)).toBeInTheDocument();
    });

    it("VD-002: 作成日時が表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: 作成日時が表示される
      expect(await screen.findByText(/2026/)).toBeInTheDocument();
    });

    it("VD-003: ファイルサイズが表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: ファイルサイズが表示される（フォーマットは実装に依存）
      expect(await screen.findByText(/2.*KB|2048/i)).toBeInTheDocument();
    });

    it("VD-004: MIMEタイプが表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: MIMEタイプが表示される
      expect(
        await screen.findByText(/text\/markdown|markdown/i),
      ).toBeInTheDocument();
    });

    it("VD-005: ハッシュ値が表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: ハッシュ値が表示される
      expect(await screen.findByText(/def456/i)).toBeInTheDocument();
    });

    it("VD-006: 最新バージョンにはバッジが表示される", async () => {
      // Given: 最新バージョンのデータ
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem({ isLatest: true }),
          logs: [],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: 最新バッジが表示される
      expect(await screen.findByText(/最新|latest/i)).toBeInTheDocument();
    });

    it("VD-007: メタデータが表示される", async () => {
      // Given: メタデータを含むバージョン
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem({
            metadata: { sourceFormat: "docx", wordCount: 500 },
          }),
          logs: [],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: メタデータが表示される
      expect(await screen.findByText(/docx/i)).toBeInTheDocument();
    });
  });

  describe("変換ログ表示 (FR-05)", () => {
    it("VD-008: 変換ログ一覧が表示される", async () => {
      // Given: ログを含むレスポンス
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem(),
          logs: [
            createMockConversionLog({ message: "Log entry 1" }),
            createMockConversionLog({ message: "Log entry 2" }),
          ],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: ログが表示される
      expect(await screen.findByText(/Log entry 1/)).toBeInTheDocument();
      expect(screen.getByText(/Log entry 2/)).toBeInTheDocument();
    });

    it("VD-009: ログレベルに応じたスタイルが適用される", async () => {
      // Given: エラーログを含むレスポンス
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem(),
          logs: [
            createMockConversionLog({
              level: "error",
              message: "Error occurred",
            }),
          ],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: エラーログにはエラースタイルが適用される
      const errorLog = await screen.findByText(/Error occurred/);
      expect(errorLog.closest("[data-level]")).toHaveAttribute(
        "data-level",
        "error",
      );
    });
  });

  describe("復元機能 (FR-03)", () => {
    it("VD-010: 「このバージョンに復元」ボタンが表示される", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: 復元ボタンが表示される（ローディング中もボタンは表示される）
      // getAllByRole でボタンを取得し、復元ボタンが存在することを確認
      const allButtons = screen.getAllByRole("button");
      const restoreButton = allButtons.find(
        (btn) => btn.getAttribute("aria-label") === "このバージョンに復元",
      );
      expect(restoreButton).toBeDefined();
      expect(restoreButton).toBeInTheDocument();
    });

    it("VD-011: 復元ボタンクリックでonRestoreが呼ばれる", async () => {
      // Given: コンポーネントがレンダリングされる
      const onRestore = vi.fn();
      render(<VersionDetail {...defaultProps} onRestore={onRestore} />);

      // When: データ読み込み完了を待ってから復元ボタンをクリック
      // データ読み込み完了後にバージョン番号が表示される
      await screen.findByText(/v2/i);

      // 復元ボタンを取得してクリック
      const allButtons = screen.getAllByRole("button");
      const restoreButton = allButtons.find(
        (btn) => btn.getAttribute("aria-label") === "このバージョンに復元",
      );
      expect(restoreButton).toBeDefined();
      await userEvent.click(restoreButton!);

      // Then: onRestoreが呼ばれる
      expect(onRestore).toHaveBeenCalledTimes(1);
    });

    it("VD-012: 最新バージョンでは復元ボタンがdisabled", async () => {
      // Given: 最新バージョンのデータ
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem({ isLatest: true }),
          logs: [],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: 復元ボタンがdisabled
      const restoreButton = await screen.findByRole("button", {
        name: /復元|restore/i,
      });
      expect(restoreButton).toBeDisabled();
    });
  });

  describe("ローディング状態 (NFR-02)", () => {
    it("VD-013: ローディング中はスケルトンが表示される", () => {
      // Given: APIが応答を返していない
      mockHistoryAPI.getVersionDetail.mockReturnValue(new Promise(() => {}));

      // When: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: ローディングインジケータが表示される
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("VD-014: ローディング中は復元ボタンがdisabled", () => {
      // Given: APIが応答を返していない
      mockHistoryAPI.getVersionDetail.mockReturnValue(new Promise(() => {}));

      // When: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: 復元ボタンがdisabled
      const restoreButton = screen.getByRole("button", {
        name: /復元|restore/i,
      });
      expect(restoreButton).toBeDisabled();
    });
  });

  describe("エラー状態 (NFR-03)", () => {
    it("VD-015: エラー時にエラーメッセージが表示される", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: false,
        error: new Error("Version not found"),
      });

      // When: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: エラーメッセージが表示される
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("VD-016: エラー時に再試行ボタンが表示される", async () => {
      // Given: APIがエラーを返す
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: false,
        error: new Error("Error"),
      });

      // When: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: 再試行ボタンが表示される
      expect(
        await screen.findByRole("button", { name: /再試行|retry/i }),
      ).toBeInTheDocument();
    });
  });

  describe("閉じる機能", () => {
    it("VD-017: 閉じるボタンクリックでonCloseが呼ばれる", async () => {
      // Given: コンポーネントがレンダリングされる
      const onClose = vi.fn();
      render(<VersionDetail {...defaultProps} onClose={onClose} />);

      // When: データ読み込み完了を待ってから閉じるボタンをクリック
      await screen.findByText(/v2/i);

      // 閉じるボタンを取得
      const allButtons = screen.getAllByRole("button");
      const closeButton = allButtons.find(
        (btn) => btn.getAttribute("aria-label") === "閉じる",
      );
      expect(closeButton).toBeDefined();
      await userEvent.click(closeButton!);

      // Then: onCloseが呼ばれる
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ (NFR-01)", () => {
    it("VD-018: 適切な見出し構造を持つ", async () => {
      // Given: コンポーネントがレンダリングされる
      render(<VersionDetail {...defaultProps} />);

      // Then: 見出しが存在する
      expect(
        await screen.findByRole("heading", { level: 2 }),
      ).toBeInTheDocument();
    });

    it("VD-019: ログリストがリスト構造を持つ", async () => {
      // Given: ログを含むレスポンス
      mockHistoryAPI.getVersionDetail.mockResolvedValue({
        success: true,
        data: {
          version: createMockVersionHistoryItem(),
          logs: [createMockConversionLog()],
        },
      });

      render(<VersionDetail {...defaultProps} />);

      // Then: リスト構造が存在する
      expect(await screen.findByRole("list")).toBeInTheDocument();
    });

    it("VD-020: キーボードでボタンを操作できる", async () => {
      // Given: コンポーネントがレンダリングされる
      const onRestore = vi.fn();
      render(<VersionDetail {...defaultProps} onRestore={onRestore} />);

      // When: データ読み込み完了を待ってからキーボード操作
      await screen.findByText(/v2/i);

      // 復元ボタンを取得してフォーカス
      const allButtons = screen.getAllByRole("button");
      const restoreButton = allButtons.find(
        (btn) => btn.getAttribute("aria-label") === "このバージョンに復元",
      );
      expect(restoreButton).toBeDefined();
      restoreButton!.focus();

      // Enterキーでクリック（button要素はEnterキーでclickイベントが発火する）
      await userEvent.keyboard("{Enter}");

      // Then: onRestoreが呼ばれる
      expect(onRestore).toHaveBeenCalled();
    });
  });
});
