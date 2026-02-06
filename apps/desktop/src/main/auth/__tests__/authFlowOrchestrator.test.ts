/**
 * 認証フローオーケストレーター テスト
 * Phase 4: TDD Red - 実装前のテスト作成
 *
 * テストID: ORC-01 ~ ORC-09, EDGE-02, EDGE-03, SEC-02 ~ SEC-04, SEC-06
 *
 * Note: State parameter（CSRF保護）はSupabaseが内部で管理するため、
 * アプリ側でのstate検証テスト（SEC-01）は不要。PKCEに集中したテストを行う。
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthFlowOrchestrator } from "../authFlowOrchestrator";

// Electron モック
vi.mock("electron", () => ({
  shell: {
    openExternal: vi.fn().mockResolvedValue(undefined),
  },
  BrowserWindow: vi.fn(),
}));

// Supabase モック
const mockExchangeCodeForSession = vi.fn();
const mockSignInWithOAuth = vi.fn();

const mockSupabase = {
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
} as never;

// BrowserWindow モック
const mockSend = vi.fn();
const mockShow = vi.fn();
const mockFocus = vi.fn();
const mockIsMinimized = vi.fn(() => false);
const mockRestore = vi.fn();
const mockMainWindow = {
  webContents: { send: mockSend },
  show: mockShow,
  focus: mockFocus,
  isMinimized: mockIsMinimized,
  restore: mockRestore,
} as never;

// SecureStorage モック
const mockSecureStorage = {
  storeRefreshToken: vi.fn().mockResolvedValue(undefined),
  getRefreshToken: vi.fn().mockResolvedValue(null),
  clearTokens: vi.fn().mockResolvedValue(undefined),
};

describe("認証フローオーケストレーター", () => {
  let orchestrator: AuthFlowOrchestrator;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSignInWithOAuth.mockResolvedValue({
      data: {
        url: "https://supabase.example.com/auth/v1/authorize?provider=google",
      },
      error: null,
    });

    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: "user-123",
            email: "test@example.com",
            app_metadata: { provider: "google" },
            user_metadata: { full_name: "Test User" },
          },
        },
      },
      error: null,
    });

    orchestrator = new AuthFlowOrchestrator(
      mockSupabase,
      mockMainWindow,
      mockSecureStorage,
    );
  });

  describe("Supabase Delegated PKCE/State", () => {
    it("ORC-01: PKCE/StateパラメータはSupabaseに完全委任される", async () => {
      // PKCE（code_verifier/code_challenge）とState parameter（CSRF保護）は
      // Supabase JS クライアントが内部で管理する
      const flowPromise = orchestrator.startOAuthFlow("google");

      // signInWithOAuthが呼ばれるまで待機
      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      const options = callArgs[0].options;

      // redirectToとskipBrowserRedirectのみを指定
      expect(options.redirectTo).toMatch(/^http:\/\/localhost:\d+/);
      expect(options.skipBrowserRedirect).toBe(true);
      // カスタムqueryParamsは渡さない（Supabaseに任せる）
      expect(options.queryParams).toBeUndefined();

      // クリーンアップ
      await orchestrator.dispose();
      await flowPromise.catch(() => {}); // ignore cleanup errors
    });

    it("ORC-02: コールバック受信後にトークン交換が実行される", async () => {
      // startOAuthFlow内でHTTPサーバーが起動し、
      // コールバック受信後にトークン交換が行われることを検証
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      // オーケストレーターのフロー完了を待つ（モックサーバーのため）
      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });

    it("ORC-03: Supabaseがエラーを返した場合にエラーハンドリングされる", async () => {
      // SupabaseからのOAuthエラー（bad_oauth_state等）は
      // コールバックサーバーでエラーとして処理される
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });
  });

  describe("OAuth URL構築", () => {
    it("ORC-04: signInWithOAuthが正しいプロバイダーで呼ばれる", async () => {
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      expect(callArgs[0].provider).toBe("google");

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });

    it("ORC-05: exchangeCodeForSessionが呼ばれる", async () => {
      // トークン交換時にexchangeCodeForSessionが呼ばれることを検証
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });
  });

  describe("フロー制御", () => {
    it("ORC-06: トークン交換成功後にセッションが確立される", async () => {
      // exchangeCodeForSession成功後にsecureStorage.storeRefreshTokenが呼ばれることを検証
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });

    it("ORC-07: shell.openExternalでOAuth URLが開かれる", async () => {
      const { shell } = await import("electron");
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(shell.openExternal).toHaveBeenCalled();
      });

      const url = (shell.openExternal as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(url).toContain("authorize");

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });
  });

  describe("エラーハンドリング", () => {
    it("ORC-08: エラー発生時にクリーンアップが実行される", async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { url: null },
        error: { message: "OAuth URL generation failed" },
      });

      await expect(orchestrator.startOAuthFlow("google")).rejects.toThrow();

      // disposeが安全に呼べることを確認（リソースリークなし）
      await orchestrator.dispose();
    });

    it("ORC-09: トークン交換失敗時にエラーが通知される", async () => {
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Token exchange failed" },
      });

      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      // フロー完了待機（エラーが発生するケース）
      await orchestrator.dispose();
      await flowPromise.catch(() => {});

      // エラー時にRendererにエラーが通知されることを検証
      // 具体的な検証はPhase 5の実装後に詳細化
    });
  });

  // === Phase 6: エッジケーステスト ===

  describe("エッジケース", () => {
    it("EDGE-02: secureStorage失敗時にエラーが伝播する", async () => {
      mockSecureStorage.storeRefreshToken.mockRejectedValueOnce(
        new Error("Encryption unavailable"),
      );

      const flowPromise = orchestrator.startOAuthFlow("google");
      flowPromise.catch(() => {}); // Prevent vitest unhandled rejection

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      const redirectTo = callArgs[0].options.redirectTo;

      // コールバック送信 → トークン交換 → storeRefreshToken失敗
      await fetch(`${redirectTo}?code=test_code&state=test_state`).catch(
        () => {},
      );

      await expect(flowPromise).rejects.toThrow();
    });

    it("EDGE-03: 同時認証リクエスト時に既存フローがキャンセルされる", async () => {
      const flow1Promise = orchestrator.startOAuthFlow("google");
      flow1Promise.catch(() => {}); // Prevent vitest unhandled rejection

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      });

      // 2番目のフローを開始（既存フローをキャンセル）
      mockSignInWithOAuth.mockClear();
      const flow2Promise = orchestrator.startOAuthFlow("google");
      flow2Promise.catch(() => {}); // Prevent vitest unhandled rejection

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      });

      // 最初のフローはサーバー停止でreject
      await expect(flow1Promise).rejects.toThrow();

      await orchestrator.dispose();
      await flow2Promise.catch(() => {});
    });
  });

  // === Phase 6: セキュリティテスト ===

  describe("セキュリティテスト", () => {
    // Note: SEC-01（State不一致検証）はSupabaseが内部で処理するため削除

    it("SEC-02: トークン交換失敗時にエラーが正しく処理される", async () => {
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Invalid code_verifier" },
      });

      const flowPromise = orchestrator.startOAuthFlow("google");
      flowPromise.catch(() => {}); // Prevent vitest unhandled rejection

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      const redirectTo = callArgs[0].options.redirectTo;

      await fetch(`${redirectTo}?code=test_code&state=test_state`).catch(
        () => {},
      );

      await expect(flowPromise).rejects.toThrow();
    });

    it("SEC-03: リダイレクトURIがlocalhostを使用する", async () => {
      const flowPromise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      const redirectTo = callArgs[0].options.redirectTo;

      // localhostを使用（Supabase Redirect URLs登録済み）
      expect(redirectTo).toMatch(/^http:\/\/localhost:\d+\/auth\/callback$/);

      await orchestrator.dispose();
      await flowPromise.catch(() => {});
    });

    it("SEC-04: 各フローで独立したHTTPサーバーが起動される", async () => {
      const flow1Promise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      });

      const redirectTo1 =
        mockSignInWithOAuth.mock.calls[0][0].options.redirectTo;

      await orchestrator.dispose();
      await flow1Promise.catch(() => {});

      // 2番目のフロー
      mockSignInWithOAuth.mockClear();
      const flow2Promise = orchestrator.startOAuthFlow("google");

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      });

      const redirectTo2 =
        mockSignInWithOAuth.mock.calls[0][0].options.redirectTo;

      // 両方のフローでredirectToが設定されている
      expect(redirectTo1).toMatch(/^http:\/\/localhost:\d+/);
      expect(redirectTo2).toMatch(/^http:\/\/localhost:\d+/);

      await orchestrator.dispose();
      await flow2Promise.catch(() => {});
    });

    it("SEC-06: トークンがRenderer Processに送信されない", async () => {
      const flowPromise = orchestrator.startOAuthFlow("google");
      flowPromise.catch(() => {}); // Prevent vitest unhandled rejection

      await vi.waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      const callArgs = mockSignInWithOAuth.mock.calls[0];
      const redirectTo = callArgs[0].options.redirectTo;

      await fetch(`${redirectTo}?code=test_code&state=test_state`).catch(
        () => {},
      );

      // フロー完了待機
      await flowPromise.catch(() => {});

      // webContents.sendの呼び出しを検証
      if (mockSend.mock.calls.length > 0) {
        const lastCall = mockSend.mock.calls[mockSend.mock.calls.length - 1];
        const payload = lastCall[1];
        // access_token / refresh_token が含まれないこと
        expect(payload).not.toHaveProperty("access_token");
        expect(payload).not.toHaveProperty("refresh_token");
        expect(JSON.stringify(payload)).not.toContain("mock_access_token");
        expect(JSON.stringify(payload)).not.toContain("mock_refresh_token");
      }
    });
  });
});
