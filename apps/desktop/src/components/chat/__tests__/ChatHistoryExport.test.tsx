import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ChatHistoryExport } from "../ChatHistoryExport";
import type { ChatSession } from "../types";

expect.extend(toHaveNoViolations);

// モックセッションデータ
const createMockSession = (overrides = {}): ChatSession => ({
  id: "session-001",
  userId: "user-001",
  title: "Test Session",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T12:00:00Z",
  messageCount: 10,
  isFavorite: false,
  isPinned: false,
  pinOrder: null,
  lastMessagePreview: "Last message preview...",
  metadata: {},
  deletedAt: null,
  ...overrides,
});

describe("ChatHistoryExport", () => {
  const defaultProps = {
    session: createMockSession(),
    onExport: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("エクスポートダイアログが表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/ダウンロード/)).toBeInTheDocument();
    });

    it("セッション情報が表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByText("Test Session")).toBeInTheDocument();
      expect(screen.getByText(/10件/)).toBeInTheDocument();
    });

    it("フォーマット選択オプションが表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByLabelText(/Markdown/)).toBeInTheDocument();
      expect(screen.getByLabelText(/JSON/)).toBeInTheDocument();
    });

    it("範囲選択オプションが表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByText(/全メッセージ|すべて/)).toBeInTheDocument();
      expect(
        screen.getByText(/選択範囲|選択したメッセージ/),
      ).toBeInTheDocument();
    });

    it("ダウンロードボタンとキャンセルボタンが表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /ダウンロード/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "キャンセル" }),
      ).toBeInTheDocument();
    });
  });

  describe("フォーマット選択", () => {
    it("デフォルトでMarkdownが選択されている", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      const markdownRadio = screen.getByRole("radio", { name: /Markdown/i });
      expect(markdownRadio).toBeChecked();
    });

    it("JSONを選択できる", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      const jsonRadio = screen.getByRole("radio", { name: /JSON/i });
      await user.click(jsonRadio);

      expect(jsonRadio).toBeChecked();
    });

    it("フォーマット選択後に別のフォーマットを選択できる", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      // JSONを選択
      await user.click(screen.getByRole("radio", { name: /JSON/i }));
      expect(screen.getByRole("radio", { name: /JSON/i })).toBeChecked();

      // Markdownに戻す
      await user.click(screen.getByRole("radio", { name: /Markdown/i }));
      expect(screen.getByRole("radio", { name: /Markdown/i })).toBeChecked();
    });

    it("各フォーマットの説明が表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByText(/人間が読みやすい形式/)).toBeInTheDocument();
      expect(screen.getByText(/プログラムでの処理に最適/)).toBeInTheDocument();
    });
  });

  describe("範囲選択", () => {
    it("デフォルトで全メッセージが選択されている", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      const allRadio = screen.getByRole("radio", {
        name: /全メッセージ|すべて/i,
      });
      expect(allRadio).toBeChecked();
    });

    it("選択範囲を選択できる", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      const selectedRadio = screen.getByRole("radio", {
        name: /選択範囲|選択したメッセージ/i,
      });
      await user.click(selectedRadio);

      expect(selectedRadio).toBeChecked();
    });

    it("選択範囲モード時、メッセージ選択UIが表示される", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      await user.click(
        screen.getByRole("radio", { name: /選択範囲|選択したメッセージ/i }),
      );

      // メッセージ選択に関するUIが表示される
      expect(screen.getByText("選択したメッセージ")).toBeInTheDocument();
      expect(screen.getByText(/0件選択/)).toBeInTheDocument();
    });

    it("初期選択されたメッセージIDが渡された場合、選択範囲モードで開始される", () => {
      render(
        <ChatHistoryExport
          {...defaultProps}
          initialSelectedMessageIds={["msg-1", "msg-2"]}
        />,
      );

      const selectedRadio = screen.getByRole("radio", {
        name: /選択範囲|選択したメッセージ/i,
      });
      expect(selectedRadio).toBeChecked();
      expect(screen.getByText(/2件選択/)).toBeInTheDocument();
    });
  });

  describe("エクスポート実行", () => {
    it("ダウンロードボタンをクリックするとonExportが呼ばれる", async () => {
      const user = userEvent.setup();
      const onExport = vi.fn().mockResolvedValue(undefined);
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      expect(onExport).toHaveBeenCalledWith({
        format: "markdown",
        range: "all",
        selectedMessageIds: undefined,
        includeMetadata: true,
      });
    });

    it("JSON形式でエクスポートできる", async () => {
      const user = userEvent.setup();
      const onExport = vi.fn().mockResolvedValue(undefined);
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByRole("radio", { name: /JSON/i }));
      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      expect(onExport).toHaveBeenCalledWith({
        format: "json",
        range: "all",
        selectedMessageIds: undefined,
        includeMetadata: true,
      });
    });

    it("選択範囲でエクスポートできる", async () => {
      const user = userEvent.setup();
      const onExport = vi.fn().mockResolvedValue(undefined);
      render(
        <ChatHistoryExport
          {...defaultProps}
          onExport={onExport}
          initialSelectedMessageIds={["msg-1", "msg-2", "msg-3"]}
        />,
      );

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      expect(onExport).toHaveBeenCalledWith({
        format: "markdown",
        range: "selected",
        selectedMessageIds: ["msg-1", "msg-2", "msg-3"],
        includeMetadata: true,
      });
    });

    it("ダウンロード中はボタンが無効化される", async () => {
      const user = userEvent.setup();
      const onExport = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      const exportButton = screen.getByRole("button", {
        name: /ダウンロード中/i,
      });
      expect(exportButton).toBeDisabled();
    });

    it("ダウンロード中はキャンセルボタンも無効化される", async () => {
      const user = userEvent.setup();
      const onExport = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    });

    it("選択範囲モードで選択がない場合、ダウンロードボタンは無効", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      await user.click(
        screen.getByRole("radio", { name: /選択範囲|選択したメッセージ/i }),
      );

      const downloadButton = screen.getByRole("button", {
        name: /ダウンロード/i,
      });
      expect(downloadButton).toBeDisabled();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ChatHistoryExport {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("Escapeキーでダイアログが閉じる", () => {
      const onClose = vi.fn();
      render(<ChatHistoryExport {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("オーバーレイクリックでダイアログが閉じる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ChatHistoryExport {...defaultProps} onClose={onClose} />);

      const overlay = screen.getByTestId("dialog-overlay");
      await user.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("ダウンロードエラー時にエラーメッセージが表示される", async () => {
      const user = userEvent.setup();
      const onExport = vi
        .fn()
        .mockRejectedValue(new Error("エクスポートに失敗しました"));
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      await waitFor(() => {
        expect(
          screen.getByText("エクスポートに失敗しました"),
        ).toBeInTheDocument();
      });
    });

    it("エラー後も再度ダウンロードを試行できる", async () => {
      const user = userEvent.setup();
      const onExport = vi
        .fn()
        .mockRejectedValueOnce(new Error("エラー"))
        .mockResolvedValueOnce(undefined);
      render(<ChatHistoryExport {...defaultProps} onExport={onExport} />);

      // 最初の試行（失敗）
      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));
      await waitFor(() => {
        expect(screen.getByText("エラー")).toBeInTheDocument();
      });

      // 再試行（成功）
      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));
      expect(onExport).toHaveBeenCalledTimes(2);
    });
  });

  describe("フォーマット別表示", () => {
    it("Markdown形式の説明が詳細に表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByText(/\.md/)).toBeInTheDocument();
    });

    it("JSON形式の説明が詳細に表示される", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      expect(screen.getByText(/\.json/)).toBeInTheDocument();
    });
  });

  describe("セッション情報表示", () => {
    it("長いタイトルが適切に切り詰められる", () => {
      const longTitleSession = createMockSession({
        title:
          "This is a very long session title that should be truncated properly for display",
      });
      render(
        <ChatHistoryExport {...defaultProps} session={longTitleSession} />,
      );

      const titleElement = screen.getByText(/This is a very long/);
      expect(titleElement).toBeInTheDocument();
    });

    it("メッセージ数が0の場合も正しく表示される", () => {
      const emptySession = createMockSession({ messageCount: 0 });
      render(<ChatHistoryExport {...defaultProps} session={emptySession} />);

      expect(screen.getByText(/0件/)).toBeInTheDocument();
    });

    it("メッセージ数が多い場合も正しく表示される", () => {
      const largeSession = createMockSession({ messageCount: 1000 });
      render(<ChatHistoryExport {...defaultProps} session={largeSession} />);

      expect(screen.getByText(/1000件/)).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("axe-coreによるアクセシビリティ違反がない", async () => {
      const { container } = render(<ChatHistoryExport {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("ダイアログにaria-labelまたはaria-labelledbyが設定されている", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(
        dialog.getAttribute("aria-label") ||
          dialog.getAttribute("aria-labelledby"),
      ).toBeTruthy();
    });

    it("ラジオボタンにname属性が設定されている", () => {
      render(<ChatHistoryExport {...defaultProps} />);

      const formatRadios = screen.getAllByRole("radio");
      formatRadios.forEach((radio) => {
        expect(radio).toHaveAttribute("name");
      });
    });

    it("フォーカストラップが実装されている", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      // ダイアログ内の最初のフォーカス可能な要素にフォーカス
      const firstFocusable = screen.getByRole("radio", { name: /Markdown/i });
      firstFocusable.focus();

      // Tabを複数回押して、フォーカスがダイアログ内に留まることを確認
      for (let i = 0; i < 10; i++) {
        await user.tab();
        const activeElement = document.activeElement;
        expect(screen.getByRole("dialog").contains(activeElement)).toBe(true);
      }
    });

    it("キーボードでフォーマットを選択できる", async () => {
      const user = userEvent.setup();
      render(<ChatHistoryExport {...defaultProps} />);

      const markdownRadio = screen.getByRole("radio", { name: /Markdown/i });
      markdownRadio.focus();

      // 矢印キーでJSONに移動
      await user.keyboard("{ArrowDown}");

      expect(screen.getByRole("radio", { name: /JSON/i })).toBeChecked();
    });
  });

  describe("プログレス表示", () => {
    it("大きなダウンロード時にローディング状態が表示される", async () => {
      const user = userEvent.setup();
      const largeSession = createMockSession({ messageCount: 1000 });
      const slowExport = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 2000)),
        );

      render(
        <ChatHistoryExport
          {...defaultProps}
          session={largeSession}
          onExport={slowExport}
        />,
      );

      await user.click(screen.getByRole("button", { name: /ダウンロード/i }));

      // ローディング状態が表示される
      expect(
        screen.getByText(/ダウンロード中/) || screen.getByRole("progressbar"),
      ).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("セッションがnullの場合でもクラッシュしない", () => {
      // TypeScript的にはnullは許容されないが、ランタイムでの堅牢性テスト
      expect(() => {
        render(
          <ChatHistoryExport
            {...defaultProps}
            session={null as unknown as ChatSession}
          />,
        );
      }).not.toThrow();
    });

    it("非常に長いメッセージIDリストでも正常に動作する", () => {
      const manyIds = Array.from({ length: 1000 }, (_, i) => `msg-${i}`);
      render(
        <ChatHistoryExport
          {...defaultProps}
          initialSelectedMessageIds={manyIds}
        />,
      );

      expect(screen.getByText(/1000件選択/)).toBeInTheDocument();
    });
  });
});
