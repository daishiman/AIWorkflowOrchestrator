/**
 * 認証フローオーケストレーター
 *
 * OAuth認証のPKCE対応フローを統合的に制御する。
 * HTTPサーバー起動 → OAuth URL構築 → コールバック待機 →
 * トークン交換 → セッション確立 までの全工程を管理。
 *
 * Note: PKCE（code_verifier/code_challenge）とState parameter（CSRF保護）は
 * Supabase JS クライアントが内部で管理するため、アプリ側では管理しない。
 *
 * @module authFlowOrchestrator
 */

import { shell, type BrowserWindow } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAuthCallbackServer,
  type AuthCallbackServer,
} from "./authCallbackServer";
import type { SecureStorage } from "../ipc/authHandlers";
import type { OAuthProvider } from "@repo/shared/types/auth";
import { toAuthUser } from "@repo/shared/infrastructure/auth";
import { IPC_CHANNELS } from "../../preload/channels";

/** フローの有効期限（5分） */
const FLOW_TTL_MS = 5 * 60 * 1000;

interface PendingAuthFlow {
  server: AuthCallbackServer;
  createdAt: number;
}

export class AuthFlowOrchestrator {
  /** 現在進行中のフロー（1つのみ許可） */
  private currentFlow: PendingAuthFlow | null = null;

  constructor(
    private supabase: SupabaseClient,
    private mainWindow: BrowserWindow,
    private secureStorage: SecureStorage,
  ) {}

  /**
   * PKCE対応OAuth認証フローを開始する
   *
   * Note: PKCE（code_verifier/code_challenge）とState parameter（CSRF保護）は
   * Supabase JS クライアントが内部で管理する。アプリ側ではHTTPサーバーの
   * ライフサイクルのみを管理する。
   */
  async startOAuthFlow(provider: OAuthProvider): Promise<void> {
    console.log("[AuthFlowOrchestrator] Starting OAuth flow for:", provider);

    // 既存フローのクリーンアップ
    await this.cancelCurrentFlow();

    // HTTPサーバー起動
    const server = createAuthCallbackServer();
    const { port } = await server.start();
    console.log("[AuthFlowOrchestrator] HTTP server started on port:", port);

    // 現在のフローを保存
    this.currentFlow = {
      server,
      createdAt: Date.now(),
    };

    try {
      // Supabase OAuth URLを構築（PKCE/StateはSupabaseが内部管理）
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `http://localhost:${port}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        throw new Error(error?.message ?? "Failed to generate OAuth URL");
      }

      console.log("[AuthFlowOrchestrator] Opening OAuth URL in browser");

      // 外部ブラウザで認証URLを開く
      await shell.openExternal(data.url);

      // コールバック待機
      const callbackResult = await server.waitForCallback();
      console.log("[AuthFlowOrchestrator] Callback received with code");

      // トークン交換
      await this.handleCallback(callbackResult.code);
    } catch (err) {
      // エラー通知
      const errorMessage =
        err instanceof Error ? err.message : "Unknown authentication error";
      console.error("[AuthFlowOrchestrator] Error:", errorMessage);
      this.mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: errorMessage,
      });
      throw err;
    } finally {
      // クリーンアップ
      await this.cancelCurrentFlow();
    }
  }

  /**
   * コールバック受信後の処理（トークン交換）
   */
  private async handleCallback(code: string): Promise<void> {
    if (!this.currentFlow) {
      throw new Error("No pending flow found");
    }

    // フローの有効期限チェック
    if (Date.now() - this.currentFlow.createdAt > FLOW_TTL_MS) {
      throw new Error("Authentication flow expired");
    }

    console.log("[AuthFlowOrchestrator] Exchanging code for session");

    // トークン交換（Supabaseが内部で保存したcode_verifierを使用）
    const { data, error } =
      await this.supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      throw new Error(
        error?.message ?? "Token exchange failed: no session returned",
      );
    }

    console.log("[AuthFlowOrchestrator] Session established successfully");

    // Refresh Token暗号化保存
    await this.secureStorage.storeRefreshToken(data.session.refresh_token);

    // Renderer通知
    const user = toAuthUser(data.session.user);
    this.mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
      authenticated: true,
      user,
    });

    // ウィンドウフォアグラウンド表示
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    this.mainWindow.focus();
  }

  /**
   * 現在のフローをキャンセル
   */
  private async cancelCurrentFlow(): Promise<void> {
    if (this.currentFlow) {
      await this.currentFlow.server.stop().catch(() => {});
      this.currentFlow = null;
    }
  }

  /**
   * 全リソース解放
   */
  async dispose(): Promise<void> {
    await this.cancelCurrentFlow();
  }
}
