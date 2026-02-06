/**
 * 認証フローオーケストレーター
 *
 * OAuth認証のPKCE対応フローを統合的に制御する。
 * PKCE生成 → HTTPサーバー起動 → OAuth URL構築 → コールバック待機 →
 * State検証 → トークン交換 → セッション確立 までの全工程を管理。
 *
 * @module authFlowOrchestrator
 */

import crypto from "node:crypto";
import { shell, type BrowserWindow } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generatePKCEPair, base64URLEncode } from "./pkce";
import {
  createAuthCallbackServer,
  type AuthCallbackServer,
} from "./authCallbackServer";
import type { SecureStorage } from "../ipc/authHandlers";
import type {
  OAuthProvider,
  AuthCallbackResult,
} from "@repo/shared/types/auth";
import { toAuthUser } from "@repo/shared/infrastructure/auth";
import { IPC_CHANNELS } from "../../preload/channels";

/** State parameterの有効期限（5分） */
const STATE_TTL_MS = 5 * 60 * 1000;

/** State parameterのエントロピーサイズ（32バイト = 256ビット） */
const STATE_ENTROPY_BYTES = 32;

interface PendingAuthFlow {
  state: string;
  codeVerifier: string;
  server: AuthCallbackServer;
  createdAt: number;
}

export class AuthFlowOrchestrator {
  private pendingFlows = new Map<string, PendingAuthFlow>();

  constructor(
    private supabase: SupabaseClient,
    private mainWindow: BrowserWindow,
    private secureStorage: SecureStorage,
  ) {}

  /**
   * PKCE対応OAuth認証フローを開始する
   */
  async startOAuthFlow(provider: OAuthProvider): Promise<void> {
    // 既存フローのクリーンアップ
    this.cleanupExpiredFlows();
    await this.cancelExistingFlows();

    // PKCE生成
    const pkcePair = generatePKCEPair();

    // State parameter生成（32バイト = 256ビットエントロピー）
    const state = this.generateState();

    // HTTPサーバー起動
    const server = createAuthCallbackServer();
    const { port } = await server.start();

    // pendingFlowsに保存
    this.pendingFlows.set(state, {
      state,
      codeVerifier: pkcePair.codeVerifier,
      server,
      createdAt: Date.now(),
    });

    try {
      // Supabase OAuth URLを構築
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `http://127.0.0.1:${port}/auth/callback`,
          skipBrowserRedirect: true,
          queryParams: {
            code_challenge: pkcePair.codeChallenge,
            code_challenge_method: "S256",
            state,
          },
        },
      });

      if (error || !data.url) {
        throw new Error(error?.message ?? "Failed to generate OAuth URL");
      }

      // 外部ブラウザで認証URLを開く
      await shell.openExternal(data.url);

      // コールバック待機
      const callbackResult = await server.waitForCallback();

      // State検証
      await this.handleCallback(callbackResult, state);
    } catch (err) {
      // エラー通知
      const errorMessage =
        err instanceof Error ? err.message : "Unknown authentication error";
      this.mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: errorMessage,
      });
      throw err;
    } finally {
      // クリーンアップ
      await this.cleanupFlow(state);
    }
  }

  /**
   * コールバック受信後の処理
   */
  private async handleCallback(
    result: AuthCallbackResult,
    expectedState: string,
  ): Promise<void> {
    // State検証
    if (result.state !== expectedState) {
      throw new Error("State parameter mismatch: possible CSRF attack");
    }

    const flow = this.pendingFlows.get(expectedState);
    if (!flow) {
      throw new Error("No pending flow found for state");
    }

    // トークン交換
    const { data, error } = await this.supabase.auth.exchangeCodeForSession(
      result.code,
    );

    if (error || !data.session) {
      throw new Error(
        error?.message ?? "Token exchange failed: no session returned",
      );
    }

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
   * State parameter生成（暗号的ランダム）
   */
  private generateState(): string {
    return base64URLEncode(crypto.randomBytes(STATE_ENTROPY_BYTES));
  }

  /**
   * 期限切れフローのクリーンアップ
   */
  private cleanupExpiredFlows(): void {
    const now = Date.now();
    for (const [state, flow] of this.pendingFlows) {
      if (now - flow.createdAt > STATE_TTL_MS) {
        flow.server.stop().catch(() => {});
        this.pendingFlows.delete(state);
      }
    }
  }

  /**
   * 既存フローのキャンセル
   */
  private async cancelExistingFlows(): Promise<void> {
    for (const [state, flow] of this.pendingFlows) {
      await flow.server.stop().catch(() => {});
      this.pendingFlows.delete(state);
    }
  }

  /**
   * 特定フローのクリーンアップ
   */
  private async cleanupFlow(state: string): Promise<void> {
    const flow = this.pendingFlows.get(state);
    if (flow) {
      await flow.server.stop().catch(() => {});
      this.pendingFlows.delete(state);
    }
  }

  /**
   * 全リソース解放
   */
  async dispose(): Promise<void> {
    await this.cancelExistingFlows();
  }
}
