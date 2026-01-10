/**
 * VersionHistory Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistory } from "../VersionHistory";

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
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// Mock factory
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-10T00:00:00Z",
  size: 1024,
  mimeType: "text/markdown",
  hash: "abc123",
  isLatest: false,
  ...overrides,
});

// Mock setup
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe("VersionHistory", () => {
  beforeEach(() => {
    // Add historyAPI to window without replacing the entire window object
    (window as unknown as { historyAPI: typeof mockHistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: typeof mockHistoryAPI })
      .historyAPI;
  });

  describe("履歴一覧表示 (FR-01)", () => {
    it("VH-001: ファイルIDを指定して履歴一覧を表示する", async () => {
      // Given: ファイルID "file-123" が存在する
      const mockData: PaginatedResult<VersionHistoryItem> = {
        items: [
          createMockVersionHistoryItem({ version: 3, isLatest: true }),
          createMockVersionHistoryItem({
            conversionId: "conv-002",
            version: 2,
          }),
          createMockVersionHistoryItem({
            conversionId: "conv-003",
            version: 1,
          }),
        ],
        total: 3,
        hasMore: false,
      };
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: mockData,
      });

      // When: VersionHistoryコンポーネントにfileIdを渡す
      render(<VersionHistory fileId="file-123" />);

      // Then: 履歴アイテムが表示される
      await waitFor(() => {
        expect(screen.getByText(/v3/i)).toBeInTheDocument();
        expect(screen.getByText(/v2/i)).toBeInTheDocument();
        expect(screen.getByText(/v1/i)).toBeInTheDocument();
      });
    });

    it("VH-002: 履歴アイテムが時系列順（新しい順）で表示される", async () => {
      // Given: 複数のバージョンが存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [
            createMockVersionHistoryItem({ version: 3, isLatest: true }),
            createMockVersionHistoryItem({
              conversionId: "conv-002",
              version: 2,
            }),
          ],
          total: 2,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 新しい順で表示される
      await waitFor(() => {
        const items = screen.getAllByRole("listitem");
        expect(items[0]).toHaveTextContent(/v3/i);
        expect(items[1]).toHaveTextContent(/v2/i);
      });
    });

    it("VH-003: 各アイテムにバージョン番号が表示される", async () => {
      // Given: 履歴が存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ version: 5 })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: バージョン番号が表示される
      await waitFor(() => {
        expect(screen.getByText(/v5/i)).toBeInTheDocument();
      });
    });

    it("VH-004: 各アイテムに作成日時が表示される", async () => {
      // Given: 履歴が存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 作成日時が表示される
      await waitFor(() => {
        expect(screen.getByText(/2026/)).toBeInTheDocument();
      });
    });

    it("VH-005: 各アイテムにファイルサイズが表示される", async () => {
      // Given: 履歴が存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ size: 1024 })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: ファイルサイズが表示される（1KB or 1024 bytes）
      await waitFor(() => {
        expect(screen.getByText(/1.*KB|1024/i)).toBeInTheDocument();
      });
    });

    it("VH-006: 最新バージョンに「現在」ラベルが表示される", async () => {
      // Given: 最新バージョンがある
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: true })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 「現在」ラベルが表示される
      await waitFor(() => {
        expect(screen.getByText(/現在/)).toBeInTheDocument();
      });
    });

    it("VH-007: 最新バージョンには復元ボタンが表示されない", async () => {
      // Given: 最新バージョンのみ
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: true })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示（onRestoreを渡しても最新は非表示）
      const onRestore = vi.fn();
      render(<VersionHistory fileId="file-123" onRestore={onRestore} />);

      // Then: 復元ボタンが表示されない
      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("button", { name: /復元/i }),
      ).not.toBeInTheDocument();
    });

    it("VH-008: 過去バージョンには復元ボタンが表示される", async () => {
      // Given: 過去バージョンがある
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: false })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示（onRestoreを渡す）
      const onRestore = vi.fn();
      render(<VersionHistory fileId="file-123" onRestore={onRestore} />);

      // Then: 復元ボタンが表示される
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /復元/i }),
        ).toBeInTheDocument();
      });
    });

    it("VH-009: 履歴が空の場合「履歴がありません」を表示", async () => {
      // Given: ファイルに履歴がない
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 「履歴がありません」メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/履歴がありません/)).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態 (NFR-02)", () => {
    it("VH-010: 読み込み中はローディングスピナーが表示される", () => {
      // Given: データ取得中
      mockHistoryAPI.getFileHistory.mockReturnValue(new Promise(() => {}));

      // When: コンポーネントをレンダリング
      render(<VersionHistory fileId="file-123" />);

      // Then: ローディングスピナーが表示される
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("VH-011: データ取得後はスピナーが非表示になる", async () => {
      // Given: データ取得完了
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: データ取得完了
      render(<VersionHistory fileId="file-123" />);

      // Then: スピナーが非表示
      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });
  });

  describe("エラー状態 (NFR-03)", () => {
    it("VH-012: エラー時はエラーメッセージが表示される", async () => {
      // Given: API呼び出しがエラーを返す
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: false,
        error: new Error("Network error"),
      });

      // When: 履歴一覧を取得
      render(<VersionHistory fileId="file-123" />);

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/エラー/)).toBeInTheDocument();
      });
    });

    it("VH-013: エラー時はリストが表示されない", async () => {
      // Given: エラー状態
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: false,
        error: new Error("Error"),
      });

      // When: 履歴一覧を取得
      render(<VersionHistory fileId="file-123" />);

      // Then: リストが表示されない
      await waitFor(() => {
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
      });
    });
  });

  describe("ページネーション (FR-06)", () => {
    it("VH-014: 「さらに読み込む」ボタンで追加データを取得する", async () => {
      // Given: 履歴が20件以上ある
      mockHistoryAPI.getFileHistory
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem()],
            total: 2,
            hasMore: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            items: [createMockVersionHistoryItem({ conversionId: "conv-002" })],
            total: 2,
            hasMore: false,
          },
        });

      render(<VersionHistory fileId="file-123" />);

      await waitFor(() => {
        expect(screen.getByText(/さらに読み込む/)).toBeInTheDocument();
      });

      // When: 「さらに読み込む」ボタンをクリック
      await userEvent.click(screen.getByText(/さらに読み込む/));

      // Then: APIが再度呼ばれる
      await waitFor(() => {
        expect(mockHistoryAPI.getFileHistory).toHaveBeenCalledTimes(2);
      });
    });

    it("VH-016: すべて読み込み済みの場合ボタンは非表示", async () => {
      // Given: すべての履歴を読み込んだ
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 「さらに読み込む」ボタンは非表示
      await waitFor(() => {
        expect(screen.queryByText(/さらに読み込む/)).not.toBeInTheDocument();
      });
    });
  });

  describe("アクセシビリティ (NFR-01)", () => {
    it("VH-018: キーボードで履歴アイテムを選択できる", async () => {
      // Given: 履歴一覧にフォーカスがある
      const onVersionSelect = vi.fn();
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      render(
        <VersionHistory fileId="file-123" onVersionSelect={onVersionSelect} />,
      );

      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });

      // When: Enter/Spaceキーを押す
      // listitem内のbuttonにフォーカスしてEnterを押す
      const button = screen.getByRole("button", { name: /バージョン/i });
      button.focus();
      await userEvent.keyboard("{Enter}");

      // Then: アイテムが選択される
      expect(onVersionSelect).toHaveBeenCalled();
    });

    it('VH-019: リストにrole="list"が設定されている', async () => {
      // Given: 履歴が存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: role="list"が設定されている
      await waitFor(() => {
        expect(screen.getByRole("list")).toBeInTheDocument();
      });
    });

    it('VH-020: 各アイテムにrole="listitem"が設定されている', async () => {
      // Given: 履歴が存在する
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: role="listitem"が設定されている
      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });
    });
  });

  describe("境界値テスト", () => {
    it("VH-021: 履歴が0件の場合", async () => {
      // Given: 空配列
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 空メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/履歴がありません/)).toBeInTheDocument();
      });
    });

    it("VH-022: 履歴が1件の場合", async () => {
      // Given: 1件のみ
      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: true })],
          total: 1,
          hasMore: false,
        },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 1件表示、「さらに読み込む」非表示
      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
        expect(screen.queryByText(/さらに読み込む/)).not.toBeInTheDocument();
      });
    });

    it("VH-023: 履歴が20件（1ページ分）の場合", async () => {
      // Given: 20件
      const items = Array.from({ length: 20 }, (_, i) =>
        createMockVersionHistoryItem({
          conversionId: `conv-${i}`,
          version: 20 - i,
          isLatest: i === 0,
        }),
      );

      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items, total: 20, hasMore: false },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 20件表示
      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(20);
      });
    });

    it("VH-024: 履歴が21件（ページング発生）の場合", async () => {
      // Given: 21件（最初の20件のみ返す）
      const items = Array.from({ length: 20 }, (_, i) =>
        createMockVersionHistoryItem({
          conversionId: `conv-${i}`,
          version: 21 - i,
          isLatest: i === 0,
        }),
      );

      mockHistoryAPI.getFileHistory.mockResolvedValue({
        success: true,
        data: { items, total: 21, hasMore: true },
      });

      // When: 履歴一覧を表示
      render(<VersionHistory fileId="file-123" />);

      // Then: 20件表示、「さらに読み込む」表示
      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(20);
        expect(screen.getByText(/さらに読み込む/)).toBeInTheDocument();
      });
    });
  });
});
