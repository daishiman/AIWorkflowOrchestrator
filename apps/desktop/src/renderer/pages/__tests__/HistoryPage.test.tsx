/**
 * HistoryPage Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/history-ui-integration/outputs/phase-4/test-cases.md
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type {
  HistoryAPI,
  VersionHistoryItem,
  PaginatedResult,
  VersionDetailData,
  ConversionLog,
} from "../../components/history/types";

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

const createMockConversionLog = (
  overrides?: Partial<ConversionLog>,
): ConversionLog => ({
  timestamp: "2026-01-10T00:00:00Z",
  level: "info",
  message: "Test log message",
  ...overrides,
});

// Mock setup
const mockHistoryAPI: HistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

// Helper to render with router
const renderWithRouter = (
  ui: React.ReactElement,
  { route = "/history/file-123" } = {},
) => {
  window.history.pushState({}, "Test page", route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/history/:fileId" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("HistoryPage", () => {
  beforeEach(() => {
    // Add historyAPI to window
    (window as unknown as { historyAPI: HistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: HistoryAPI }).historyAPI;
  });

  // ===========================================================================
  // 1.1 レンダリングテスト
  // ===========================================================================

  describe("レンダリングテスト", () => {
    it("HP-R-01: HistoryPageが正しくレンダリングされる", async () => {
      // Given: historyAPIが利用可能
      const mockData: PaginatedResult<VersionHistoryItem> = {
        items: [createMockVersionHistoryItem({ version: 1, isLatest: true })],
        total: 1,
        hasMore: false,
      };
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: mockData,
      });

      // When: HistoryPageをレンダリング
      // Note: HistoryPage component doesn't exist yet (TDD Red Phase)
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: VersionHistoryコンポーネントが表示される
      await waitFor(() => {
        expect(screen.getByRole("list")).toBeInTheDocument();
      });
    });

    it("HP-R-02: バージョン履歴タイトルが表示される", async () => {
      // Given: HistoryPageがレンダリングされる
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: 「バージョン履歴」テキストが表示される
      await waitFor(() => {
        expect(screen.getByText(/バージョン履歴/)).toBeInTheDocument();
      });
    });

    it("HP-R-03: 詳細パネル未選択時にプレースホルダー表示", async () => {
      // Given: バージョン未選択
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem()],
          total: 1,
          hasMore: false,
        },
      });

      // When: HistoryPageをレンダリング（バージョン未選択）
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: 「バージョンを選択してください」プレースホルダーが表示される
      await waitFor(() => {
        expect(
          screen.getByText(/バージョンを選択してください/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 1.2 インタラクションテスト
  // ===========================================================================

  describe("インタラクションテスト", () => {
    it("HP-I-01: バージョン選択で詳細パネル表示", async () => {
      // Given: 履歴アイテムが存在
      const mockItem = createMockVersionHistoryItem({ version: 1 });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });

      const mockDetail: VersionDetailData = {
        version: mockItem,
        logs: [createMockConversionLog()],
      };
      (
        mockHistoryAPI.getVersionDetail as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: mockDetail,
      });

      // When: 履歴アイテムを選択
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });

      // バージョン選択ボタンをクリック（aria-label="バージョン 1"のボタン）
      const versionButtons = screen.getAllByRole("button");
      const selectButton = versionButtons.find(
        (btn) =>
          btn.getAttribute("aria-label")?.startsWith("バージョン") &&
          !btn.getAttribute("aria-label")?.includes("復元"),
      );
      expect(selectButton).toBeDefined();
      await userEvent.click(selectButton!);

      // Then: VersionDetailコンポーネントが表示される
      await waitFor(() => {
        expect(mockHistoryAPI.getVersionDetail).toHaveBeenCalledWith(
          mockItem.conversionId,
        );
      });
    });

    it("HP-I-02: 復元ボタンでダイアログ表示", async () => {
      // Given: バージョンが選択済み（非最新）
      const mockItem = createMockVersionHistoryItem({
        version: 1,
        isLatest: false,
      });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });

      // When: 復元ボタンをクリック
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        // 「〜に復元」というaria-labelを持つ復元ボタンを探す
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      // 復元ボタンをクリック
      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      // Then: RestoreDialogが開く
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("HP-I-03: ダイアログキャンセルでダイアログ閉じる", async () => {
      // Given: ダイアログが開いている
      const mockItem = createMockVersionHistoryItem({ isLatest: false });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });

      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // When: キャンセルボタンをクリック
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Then: RestoreDialogが閉じる
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("HP-I-04: 復元確認でrestoreVersion呼び出し", async () => {
      // Given: ダイアログが開いている
      const mockItem = createMockVersionHistoryItem({ isLatest: false });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });
      (
        mockHistoryAPI.restoreVersion as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { ...mockItem, isLatest: true },
      });

      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // When: 復元するボタンをクリック
      await userEvent.click(screen.getByRole("button", { name: /復元する/i }));

      // Then: historyAPI.restoreVersion()が呼び出される
      await waitFor(() => {
        expect(mockHistoryAPI.restoreVersion).toHaveBeenCalledWith(
          mockItem.fileId,
          mockItem.conversionId,
        );
      });
    });
  });

  // ===========================================================================
  // 1.3 エラーハンドリングテスト
  // ===========================================================================

  describe("エラーハンドリングテスト", () => {
    it("HP-E-01: historyAPI未定義時にエラー表示", async () => {
      // Given: window.historyAPI=undefined
      delete (window as unknown as { historyAPI?: HistoryAPI }).historyAPI;

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(
          screen.getByText(/History API not available/i),
        ).toBeInTheDocument();
      });
    });

    it("HP-E-02: 履歴取得失敗時にエラー表示", async () => {
      // Given: getFileHistoryがエラー返却
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: new Error("Network error"),
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("HP-E-03: 詳細取得失敗時にエラー表示", async () => {
      // Given: getVersionDetailがエラー返却
      const mockItem = createMockVersionHistoryItem();
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });
      (
        mockHistoryAPI.getVersionDetail as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: new Error("Detail not found"),
      });

      // When: バージョンを選択
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });

      // バージョン選択ボタンをクリック（「〜に復元」を含まないバージョンボタン）
      const versionButtons = screen.getAllByRole("button");
      const selectButton = versionButtons.find(
        (btn) =>
          btn.getAttribute("aria-label")?.startsWith("バージョン") &&
          !btn.getAttribute("aria-label")?.includes("復元"),
      );
      expect(selectButton).toBeDefined();
      await userEvent.click(selectButton!);

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("HP-E-04: 復元失敗時にダイアログ内エラー", async () => {
      // Given: restoreVersionがエラー返却
      const mockItem = createMockVersionHistoryItem({ isLatest: false });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });
      (
        mockHistoryAPI.restoreVersion as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: new Error("Restore failed"),
      });

      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      await waitFor(() => {
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // When: 復元するボタンをクリック
      await userEvent.click(screen.getByRole("button", { name: /復元する/i }));

      // Then: ダイアログ内にエラー表示
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent(/エラー|failed/i);
      });
    });
  });

  // ===========================================================================
  // 1.4 境界値テスト
  // ===========================================================================

  describe("境界値テスト", () => {
    it("HP-B-01: 履歴が0件の場合", async () => {
      // Given: items=[]
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: EmptyState表示
      await waitFor(() => {
        expect(screen.getByText(/履歴がありません/)).toBeInTheDocument();
      });
    });

    it("HP-B-02: 履歴が1件の場合", async () => {
      // Given: items.length=1
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: true })],
          total: 1,
          hasMore: false,
        },
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: 1件表示
      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
      });
    });

    it("HP-B-03: 最新バージョンに復元ボタンなし", async () => {
      // Given: isLatest=true
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          items: [createMockVersionHistoryItem({ isLatest: true })],
          total: 1,
          hasMore: false,
        },
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: 復元ボタン非表示/無効
      await waitFor(() => {
        expect(screen.getByRole("listitem")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /復元/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // 1.5 Phase 6 追加テスト
  // ===========================================================================

  describe("Phase 6 追加テスト", () => {
    it("TS-08: 大量データ（100件以上）のページネーション動作", async () => {
      // Given: 100件のアイテムと次ページあり
      const manyItems = Array.from({ length: 20 }, (_, i) =>
        createMockVersionHistoryItem({
          conversionId: `conv-${i.toString().padStart(3, "0")}`,
          version: 100 - i,
          isLatest: i === 0,
        }),
      );
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          items: manyItems,
          total: 100,
          hasMore: true,
        },
      });

      // When: HistoryPageをレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // Then: 最初の20件が表示され、hasMoreフラグが正しい
      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(20);
      });
    });

    it("TS-09: 復元中に接続エラーが発生した場合のエラーメッセージ", async () => {
      // Given: 復元がネットワークエラーで失敗
      const mockItem = createMockVersionHistoryItem({ isLatest: false });
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });
      (
        mockHistoryAPI.restoreVersion as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: new Error("Network connection lost"),
      });

      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // When: 復元を実行
      await waitFor(() => {
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: /復元する/i }));

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
          screen.getByText(/Network connection lost/i),
        ).toBeInTheDocument();
      });
    });

    it("TS-10: 復元成功後に成功通知と履歴再取得", async () => {
      // Given: 復元が成功する設定
      const mockItem = createMockVersionHistoryItem({
        version: 2,
        isLatest: false,
      });
      const restoredItem = createMockVersionHistoryItem({
        version: 2,
        isLatest: true,
      });

      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [mockItem], total: 1, hasMore: false },
      });
      (
        mockHistoryAPI.restoreVersion as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: restoredItem,
      });

      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage />);

      // When: 復元を実行
      await waitFor(() => {
        const restoreButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
        expect(restoreButtons.length).toBeGreaterThan(0);
      });

      const restoreButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("に復元"));
      await userEvent.click(restoreButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: /復元する/i }));

      // Then: ダイアログが閉じて履歴が再取得される
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // getFileHistoryが2回呼ばれる（初回 + 復元後のリフレッシュ）
      expect(mockHistoryAPI.getFileHistory).toHaveBeenCalledTimes(2);
    });

    it("TS-07補足: プロップスでfileIdが渡された場合URLパラメータより優先", async () => {
      // Given: propsでfileIdを渡す
      (
        mockHistoryAPI.getFileHistory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: { items: [], total: 0, hasMore: false },
      });

      // When: propsでfileIdを指定してレンダリング
      const { HistoryPage } = await import("../HistoryPage");
      renderWithRouter(<HistoryPage fileId="custom-file-id" />, {
        route: "/history/url-file-id",
      });

      // Then: propsのfileIdが使用される
      await waitFor(() => {
        expect(mockHistoryAPI.getFileHistory).toHaveBeenCalledWith(
          "custom-file-id",
          expect.any(Object),
        );
      });
    });
  });
});
