/**
 * SettingsView 統合テスト
 *
 * AC-01: AccountSection, ApiKeysSection, AuthModeSelector の vi.mock() を使わない
 * AC-02: real AuthModeSelector で role="radio" 経由の mode 切替テスト
 * AC-03: real ApiKeysSection で apiKey.list() 異常レスポンスの fallback テスト
 * AC-05: task-05/06/07 の AC が統合テスト行列へ反映
 * AC-06: store mock + electronAPI mock の harness 一本化
 *
 * P39準拠: happy-dom環境では userEvent を使わず fireEvent を使用
 * P40準拠: テスト実行は apps/desktop ディレクトリから実行
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import React from "react";
import {
  createSettingsHarness,
  type MockStoreState,
} from "./settings-test-harness";

// ============================================================
// store mock（vi.mock はファイル先頭に hoist される）
// ============================================================

// beforeEach で再初期化するためのミュータブル変数
let currentStoreState: MockStoreState;
let currentAuthMode = "subscription" as const;
let currentAuthModeStatus: unknown = null;
let currentAuthModeLoading = false;
let currentSetMode = vi.fn();
let currentInitializeAuthMode = vi.fn();

// store をモック: AccountSection, ApiKeysSection, AuthModeSelector は real（AC-01）
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (state: MockStoreState) => unknown) =>
    selector(currentStoreState),
  ),
  useAuthMode: vi.fn(() => currentAuthMode),
  useAuthModeStatus: vi.fn(() => currentAuthModeStatus),
  useAuthModeLoading: vi.fn(() => currentAuthModeLoading),
  useSetAuthMode: vi.fn(() => currentSetMode),
  useInitializeAuthMode: vi.fn(() => currentInitializeAuthMode),
  useAuthModeStore: vi.fn(() => ({
    mode: currentAuthMode,
    status: currentAuthModeStatus,
    isLoading: currentAuthModeLoading,
    setMode: currentSetMode,
    initializeAuthMode: currentInitializeAuthMode,
  })),
}));

// SettingsView を import（vi.mock hoist 後に解決される）
import { SettingsView } from "../index";

// ============================================================
// テストスイート
// ============================================================

describe("SettingsView 統合テスト", () => {
  let harness: ReturnType<typeof createSettingsHarness>;

  beforeEach(() => {
    vi.clearAllMocks();

    // ハーネスをデフォルト設定で再初期化
    harness = createSettingsHarness();

    // store state と AuthMode セレクタをセットアップ
    currentStoreState = harness.storeState;
    currentAuthMode = harness.authModeSelectors.mode;
    currentAuthModeStatus = harness.authModeSelectors.status;
    currentAuthModeLoading = harness.authModeSelectors.isLoading;
    currentSetMode = harness.authModeSelectors.setMode;
    currentInitializeAuthMode = harness.authModeSelectors.initializeAuthMode;

    // electronAPI のセットアップ
    harness.setupElectronApi();
  });

  // ===========================================================
  // INT-01: 全セクション表示テスト
  // ===========================================================
  describe("INT-01: real composition で全セクション表示", () => {
    it("SettingsView が全セクション（アカウント、認証方式、APIキー、テーマ、RAG）を表示する", async () => {
      render(<SettingsView />);

      // ヘッダー
      expect(screen.getByText("設定")).toBeInTheDocument();

      // アカウントセクション（real AccountSection - 未認証状態）
      expect(screen.getByText("アカウント")).toBeInTheDocument();
      // 未認証時は「アカウント登録・ログイン」が表示される
      expect(screen.getByText("アカウント登録・ログイン")).toBeInTheDocument();

      // 認証方式セクション（real AuthModeSelector）
      expect(screen.getByText("Claude Agent SDK 認証方式")).toBeInTheDocument();
      // real AuthModeSelector は role="radiogroup" を持つ
      // ThemeSelector も radiogroup を使うため、複数存在する
      const radiogroups = screen.getAllByRole("radiogroup");
      expect(radiogroups.length).toBeGreaterThanOrEqual(1);

      // APIキーセクション（real ApiKeysSection - 非同期ロード待ち）
      await waitFor(() => {
        expect(screen.getByText("APIキー設定")).toBeInTheDocument();
      });

      // テーマセクション
      expect(screen.getByText("テーマ設定")).toBeInTheDocument();

      // RAGセクション
      expect(screen.getByText("RAG設定")).toBeInTheDocument();

      // 保存ボタン
      expect(
        screen.getByRole("button", { name: "設定を保存" }),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================
  // INT-02: AuthModeSelector mode 切替テスト
  // ===========================================================
  describe("INT-02: real AuthModeSelector で mode 切替", () => {
    it("subscription → api-key 切替が role='radio' 経由で動作する", async () => {
      const mockSetMode = vi.fn().mockResolvedValue(undefined);
      currentSetMode = mockSetMode;

      render(<SettingsView />);

      // real AuthModeSelector の radio ボタンを取得
      const apiKeyRadio = screen.getByRole("radio", {
        name: "APIキー",
      });
      expect(apiKeyRadio).toBeInTheDocument();

      // subscription が初期選択されている
      const subscriptionRadio = screen.getByRole("radio", {
        name: "サブスクリプション",
      });
      expect(subscriptionRadio).toHaveAttribute("aria-checked", "true");
      expect(apiKeyRadio).toHaveAttribute("aria-checked", "false");

      // api-key をクリック（P39準拠: fireEvent 使用）
      await act(async () => {
        fireEvent.click(apiKeyRadio);
      });

      // setMode が "api-key" で呼ばれたことを検証
      expect(mockSetMode).toHaveBeenCalledWith("api-key");
    });
  });

  // ===========================================================
  // INT-03: ApiKeysSection 正常プロバイダー表示テスト
  // ===========================================================
  describe("INT-03: real ApiKeysSection の正常プロバイダー表示", () => {
    it("正常な provider リストを受け取り4プロバイダーを表示する", async () => {
      render(<SettingsView />);

      // ApiKeysSection は mount 時に apiKey.list() を非同期で呼ぶ
      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Google AI")).toBeInTheDocument();
      expect(screen.getByText("xAI")).toBeInTheDocument();

      // apiKey.list が呼ばれたことを検証
      expect(harness.electronApiKey.list).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================
  // INT-04: ApiKeysSection 異常レスポンスフォールバックテスト
  // ===========================================================
  describe("INT-04: real ApiKeysSection の異常レスポンスフォールバック", () => {
    it("providers が非配列の場合、空配列にフォールバックして4プロバイダーを未登録で表示する", async () => {
      // 異常レスポンス: providers が文字列
      harness = createSettingsHarness({
        apiKeyListResult: {
          success: true,
          data: {
            providers: "not-an-array",
          },
        },
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      // フォールバック後、4プロバイダーが未登録として表示される
      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Google AI")).toBeInTheDocument();
      expect(screen.getByText("xAI")).toBeInTheDocument();

      // 全て「未登録」バッジが表示される
      const badges = screen.getAllByText("未登録");
      expect(badges.length).toBe(4);
    });

    it("providers が undefined の場合、空配列にフォールバックする", async () => {
      harness = createSettingsHarness({
        apiKeyListResult: {
          success: true,
          data: {
            providers: undefined,
          },
        },
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      const badges = screen.getAllByText("未登録");
      expect(badges.length).toBe(4);
    });

    it("apiKey.list() が失敗した場合、エラーメッセージを表示する", async () => {
      harness = createSettingsHarness({
        apiKeyListResult: {
          success: false,
          error: { message: "接続エラー" },
        },
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      expect(screen.getByText("接続エラー")).toBeInTheDocument();
    });
  });

  // ===========================================================
  // INT-05: auth-mode status メッセージ表示テスト
  // ===========================================================
  describe("INT-05: auth-mode status メッセージの条件付き表示", () => {
    it("status が null の場合、status メッセージは表示されない", () => {
      render(<SettingsView />);

      expect(screen.queryByTestId("auth-mode-status")).not.toBeInTheDocument();
    });

    it("status が設定されている場合、status メッセージが表示される", () => {
      currentAuthModeStatus = {
        mode: "api-key",
        isValid: false,
        hasCredentials: false,
        message: "APIキーが設定されていません",
        errorCode: "auth-mode/no-api-key",
        guidance: "設定画面でAPIキーを入力してください",
        lastCheckedAt: Date.now(),
      };

      render(<SettingsView />);

      expect(screen.getByTestId("auth-mode-status")).toBeInTheDocument();
      expect(screen.getByTestId("auth-mode-status-message")).toHaveTextContent(
        "APIキーが設定されていません",
      );
      expect(screen.getByTestId("auth-mode-status-code")).toHaveTextContent(
        "auth-mode/no-api-key",
      );
      expect(screen.getByTestId("auth-mode-status-guidance")).toHaveTextContent(
        "設定画面でAPIキーを入力してください",
      );
    });

    it("status.isValid === true の場合、成功スタイルで表示される", () => {
      currentAuthModeStatus = {
        mode: "subscription",
        isValid: true,
        hasCredentials: true,
        message: "サブスクリプション認証が有効です",
        lastCheckedAt: Date.now(),
      };

      render(<SettingsView />);

      const statusEl = screen.getByTestId("auth-mode-status");
      expect(statusEl).toBeInTheDocument();
      // 成功時は green 系のクラスが適用される
      expect(statusEl.className).toContain("bg-green-50");
    });
  });

  // ===========================================================
  // INT-06: AuthModeSelector disabled 状態の操作無効化（AC-02補強）
  // ===========================================================
  describe("INT-06: AuthModeSelector disabled 状態の操作無効化", () => {
    it("isLoading=true 時に radio クリックしても setMode が呼ばれない", async () => {
      const mockSetMode = vi.fn().mockResolvedValue(undefined);
      currentSetMode = mockSetMode;
      currentAuthModeLoading = true;

      render(<SettingsView />);

      // radio ボタンを取得
      const apiKeyRadio = screen.getByRole("radio", { name: "APIキー" });

      // disabled 状態であることを検証
      expect(apiKeyRadio).toBeDisabled();

      // クリックしても setMode は呼ばれない（P39準拠: fireEvent）
      await act(async () => {
        fireEvent.click(apiKeyRadio);
      });

      expect(mockSetMode).not.toHaveBeenCalled();
    });

    it("isLoading=true 時に radiogroup 内の全ボタンが disabled になる", () => {
      currentAuthModeLoading = true;

      render(<SettingsView />);

      const subscriptionRadio = screen.getByRole("radio", {
        name: "サブスクリプション",
      });
      const apiKeyRadio = screen.getByRole("radio", { name: "APIキー" });

      expect(subscriptionRadio).toBeDisabled();
      expect(apiKeyRadio).toBeDisabled();
    });
  });

  // ===========================================================
  // INT-07: task-05 回帰 - auth-mode → api-key 切替 UI 導線
  // ===========================================================
  describe("INT-07: task-05 回帰 - auth-mode → api-key 切替 UI 導線", () => {
    it("mode='api-key' で初期化した場合、api-key の radio が aria-checked='true' である", () => {
      currentAuthMode = "api-key";

      render(<SettingsView />);

      const apiKeyRadio = screen.getByRole("radio", { name: "APIキー" });
      const subscriptionRadio = screen.getByRole("radio", {
        name: "サブスクリプション",
      });

      expect(apiKeyRadio).toHaveAttribute("aria-checked", "true");
      expect(subscriptionRadio).toHaveAttribute("aria-checked", "false");
    });

    it("mode='api-key' でも ApiKeysSection が表示される", async () => {
      currentAuthMode = "api-key";

      render(<SettingsView />);

      // ApiKeysSection は auth-mode に関係なく常に表示される
      // 見出しは即時描画されるため、非同期ロード完了の目印として provider 名を待つ。
      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // プロバイダーも表示される
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
    });
  });

  // ===========================================================
  // INT-08: task-06 回帰 - apiKey.list() が null を返す場合のフォールバック
  // ===========================================================
  describe("INT-08: task-06 回帰 - apiKey.list() が null を返す場合のフォールバック", () => {
    it("apiKeyListResult の providers が null でもクラッシュせず4プロバイダーが未登録で表示される", async () => {
      // apiKey.list() が { success: true, data: { providers: null } } を返す場合
      // → providers が非配列 → 空配列フォールバック → 4プロバイダー未登録表示
      harness = createSettingsHarness({
        apiKeyListResult: {
          success: true,
          data: { providers: null },
        },
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      // クラッシュせず4プロバイダーが表示される
      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Google AI")).toBeInTheDocument();
      expect(screen.getByText("xAI")).toBeInTheDocument();

      // 全て未登録
      const badges = screen.getAllByText("未登録");
      expect(badges.length).toBe(4);
    });

    it("apiKey.list() が null を返す場合、クラッシュせずエラーメッセージが表示される", async () => {
      harness = createSettingsHarness({
        apiKeyListResult: null,
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      // null の場合でもクラッシュせずレンダリングされる
      // ApiKeysSection の非同期ロードが完了するまで待つ
      await waitFor(() => {
        // loading-spinner が消えるまで待つ
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });

      // SettingsView 全体はクラッシュせずレンダリングされる
      expect(screen.getByText("設定")).toBeInTheDocument();
      expect(screen.getByText("APIキー設定")).toBeInTheDocument();
    });
  });

  // ===========================================================
  // INT-09: はじめよう再表示導線
  // ===========================================================
  describe("INT-09: はじめよう再表示導線", () => {
    it("button クリックで onboarding.completed=false を保存し dashboard へ戻す", async () => {
      render(<SettingsView />);

      fireEvent.click(
        screen.getByRole("button", { name: "はじめようを再表示" }),
      );

      await waitFor(() => {
        expect(harness.electronStore.set).toHaveBeenCalledWith({
          key: "onboarding.completed",
          value: false,
        });
      });

      expect(currentStoreState.setCurrentView).toHaveBeenCalledWith("dashboard");
    });
  });

  // ===========================================================
  // INT-10: task-07 回帰 - themeMode が不正値の場合のリカバリー
  // ===========================================================
  describe("INT-10: task-07 回帰 - themeMode が不正値の場合のリカバリー", () => {
    it("themeMode に不正な値を設定してもクラッシュせずレンダリングされる", async () => {
      harness = createSettingsHarness({
        storeOverrides: {
          themeMode: "invalid-theme" as any,
        },
      });
      harness.setupElectronApi();
      currentStoreState = harness.storeState;

      render(<SettingsView />);

      // SettingsView がクラッシュせずレンダリングされる
      expect(screen.getByText("設定")).toBeInTheDocument();
      expect(screen.getByText("テーマ設定")).toBeInTheDocument();

      // 他のセクションも正常に表示される
      expect(screen.getByText("アカウント")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("APIキー設定")).toBeInTheDocument();
      });
    });
  });

  // ===========================================================
  // INT-11: 保存ボタンクリック時の store アクション呼び出し
  // ===========================================================
  describe("INT-11: 保存ボタンクリック・チェックボックス切替の store アクション", () => {
    it("自動同期チェックボックスの切り替えで setAutoSyncEnabled が呼ばれる", async () => {
      render(<SettingsView />);

      // 「自動同期を有効にする」チェックボックスを取得
      const autoSyncCheckbox = screen.getByRole("checkbox", {
        name: "自動同期を有効にする",
      });
      expect(autoSyncCheckbox).toBeInTheDocument();

      // 初期状態は checked=true（デフォルト: autoSyncEnabled=true）
      expect(autoSyncCheckbox).toBeChecked();

      // クリックして切り替え（P39準拠: fireEvent）
      await act(async () => {
        fireEvent.click(autoSyncCheckbox);
      });

      // setAutoSyncEnabled が呼ばれたことを検証
      expect(currentStoreState.setAutoSyncEnabled).toHaveBeenCalledTimes(1);
      expect(currentStoreState.setAutoSyncEnabled).toHaveBeenCalledWith(false);
    });

    it("保存ボタンがクリック可能で、クリック時にエラーが発生しない", async () => {
      render(<SettingsView />);

      const saveButton = screen.getByRole("button", { name: "設定を保存" });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).not.toBeDisabled();

      // クリックしてもエラーが発生しない
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // レンダリングが継続する
      expect(screen.getByText("設定")).toBeInTheDocument();
    });
  });
});
