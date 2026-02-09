/**
 * SubscriptionAuthProvider
 *
 * Claude Code CLI が macOS Keychain に保存した OAuth トークンを取得・管理する。
 * サブスクリプション認証（Claude Pro/Team）のトークンプロバイダー。
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/subscription-auth-provider-design.md
 */

import type {
  ISubscriptionAuthProvider,
  IKeychainAccess,
  ClaudeCodeTokenData,
  TokenCacheEntry,
} from "@repo/shared/types/auth-mode";

import {
  KEYCHAIN_SERVICE_NAME,
  TOKEN_CACHE_TTL_MS,
  OAUTH_ACCESS_TOKEN_PREFIX,
  ENV_CLAUDE_CODE_OAUTH_TOKEN,
  MAX_TOKEN_LENGTH,
  MIN_TOKEN_LENGTH,
} from "@repo/shared/types/auth-mode";

// =============================================================================
// Keytar アクセスラッパー
// =============================================================================

/**
 * Keytar インターフェース（動的インポート用）
 */
interface KeytarModule {
  getPassword(service: string, account: string): Promise<string | null>;
  setPassword(
    service: string,
    account: string,
    password: string,
  ): Promise<void>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

/**
 * keytar ライブラリのデフォルト実装
 *
 * keytar はネイティブモジュールのため、動的インポートで使用する。
 * テスト環境ではこのクラスは使用されず、モックが注入される。
 */
class KeytarAccess implements IKeychainAccess {
  private keytar: KeytarModule | null = null;

  private async getKeytar(): Promise<KeytarModule | null> {
    if (this.keytar) {
      return this.keytar;
    }

    try {
      // keytar は動的インポート（ネイティブモジュールのため）
      // テスト環境では使用されない（モックが注入される）
      const keytar = (await Function(
        'return import("keytar")',
      )()) as KeytarModule;
      this.keytar = keytar;
      return this.keytar;
    } catch {
      // keytar が利用できない場合（Windows/Linux、または未インストール）
      return null;
    }
  }

  async getPassword(service: string, account: string): Promise<string | null> {
    const keytar = await this.getKeytar();
    if (!keytar) {
      return null;
    }
    return keytar.getPassword(service, account);
  }

  async setPassword(
    service: string,
    account: string,
    password: string,
  ): Promise<void> {
    const keytar = await this.getKeytar();
    if (!keytar) {
      throw new Error("Keytar is not available on this platform");
    }
    await keytar.setPassword(service, account, password);
  }

  async deletePassword(service: string, account: string): Promise<boolean> {
    const keytar = await this.getKeytar();
    if (!keytar) {
      return false;
    }
    return keytar.deletePassword(service, account);
  }
}

// =============================================================================
// SubscriptionAuthProvider 依存関係
// =============================================================================

/**
 * SubscriptionAuthProvider の依存関係
 */
export interface SubscriptionAuthProviderDependencies {
  /** Keychain アクセスインターフェース（テスト用モック可能） */
  keychainAccess?: IKeychainAccess;
  /** デバッグモード */
  debug?: boolean;
}

// =============================================================================
// SubscriptionAuthProvider 実装
// =============================================================================

/**
 * SubscriptionAuthProvider 実装クラス
 *
 * Claude Code CLI の認証トークンを macOS Keychain から取得する。
 * 5分間のメモリキャッシュにより、Keychain アクセスを最適化。
 */
export class SubscriptionAuthProvider implements ISubscriptionAuthProvider {
  private cache: TokenCacheEntry | null = null;
  private readonly keychainAccess: IKeychainAccess;
  private readonly debug: boolean;

  constructor(deps?: SubscriptionAuthProviderDependencies) {
    // DI: keytar のラッパーを注入可能（テスト用）
    this.keychainAccess = deps?.keychainAccess ?? new KeytarAccess();
    this.debug = deps?.debug ?? false;
  }

  /**
   * OAuth トークンを取得
   *
   * 取得優先順位:
   * 1. メモリキャッシュ（5分TTL）
   * 2. macOS Keychain
   * 3. CLAUDE_CODE_OAUTH_TOKEN 環境変数
   *
   * @returns Access Token、未認証の場合は null
   */
  async getToken(): Promise<string | null> {
    // Step 1: キャッシュ確認
    if (this.isCacheValid()) {
      this.log("Returning cached token");
      return this.cache!.token;
    }

    // Step 2: Keychain から取得
    const keychainToken = await this.getTokenFromKeychain();
    if (keychainToken) {
      this.updateCache(keychainToken);
      return keychainToken;
    }

    // Step 3: 環境変数フォールバック
    const envToken = process.env[ENV_CLAUDE_CODE_OAUTH_TOKEN];
    if (envToken && this.isValidTokenFormat(envToken)) {
      this.log("Using token from environment variable");
      return envToken;
    }

    return null;
  }

  /**
   * トークンの存在確認
   *
   * @returns トークンが存在する場合 true
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * トークンの有効性を検証
   *
   * トークン形式と長さを確認する。
   * 注意: APIリクエストによる実際の検証は行わない（コスト削減）。
   *
   * @returns 有効なトークンの場合 true
   */
  async validateToken(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    return this.isValidTokenFormat(token);
  }

  /**
   * トークンキャッシュをクリア
   *
   * Keychain の更新を反映するために使用。
   */
  clearCache(): void {
    this.cache = null;
    this.log("Cache cleared");
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * キャッシュの有効性を確認
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() < this.cache.expiresAt;
  }

  /**
   * キャッシュを更新
   */
  private updateCache(token: string): void {
    const now = Date.now();
    this.cache = {
      token,
      cachedAt: now,
      expiresAt: now + TOKEN_CACHE_TTL_MS,
    };
  }

  /**
   * Keychain からトークンを取得
   */
  private async getTokenFromKeychain(): Promise<string | null> {
    // プラットフォームチェック（macOS のみ）
    if (process.platform !== "darwin") {
      this.log("Platform not supported for Keychain access");
      return null;
    }

    try {
      const rawData = await this.keychainAccess.getPassword(
        KEYCHAIN_SERVICE_NAME,
        this.getAccountName(),
      );

      if (!rawData) {
        this.log("No token found in Keychain");
        return null;
      }

      const tokenData = this.parseTokenData(rawData);
      if (!tokenData) {
        this.log("Failed to parse token data");
        return null;
      }

      return tokenData.accessToken;
    } catch (error) {
      this.log("Keychain access error", error);
      return null;
    }
  }

  /**
   * アカウント名を取得
   */
  private getAccountName(): string {
    return process.env.USER || process.env.USERNAME || "unknown";
  }

  /**
   * トークンデータをパース
   *
   * JSON形式またはプレーンテキストのトークンを解析する。
   */
  private parseTokenData(rawData: string): ClaudeCodeTokenData | null {
    try {
      const parsed = JSON.parse(rawData) as Record<string, unknown>;

      // accessToken が存在しない場合は null
      if (typeof parsed.accessToken !== "string") {
        return null;
      }

      return {
        accessToken: parsed.accessToken,
        refreshToken:
          typeof parsed.refreshToken === "string"
            ? parsed.refreshToken
            : undefined,
        retrievedAt: Date.now(),
      };
    } catch {
      // JSON パース失敗の場合、rawData 自体がトークンの可能性
      if (this.isValidTokenFormat(rawData)) {
        return {
          accessToken: rawData,
          retrievedAt: Date.now(),
        };
      }
      return null;
    }
  }

  /**
   * トークン形式の検証
   *
   * OAuth Access Token または API Key のプレフィックスを確認する。
   */
  private isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    if (token.length < MIN_TOKEN_LENGTH) return false;
    if (token.length > MAX_TOKEN_LENGTH) return false;

    // OAuth Access Token または API Key のプレフィックスを確認
    return (
      token.startsWith(OAUTH_ACCESS_TOKEN_PREFIX) ||
      token.startsWith("sk-ant-api")
    );
  }

  /**
   * ログ出力（デバッグモード時のみ）
   *
   * @param message - ログメッセージ
   * @param error - エラーオブジェクト（オプション）
   */
  private log(message: string, error?: unknown): void {
    // テスト環境やデバッグ無効時はログを出力しない
    if (!this.debug) return;
    if (process.env.NODE_ENV === "test") return;

    if (error) {
      console.error(`[SubscriptionAuthProvider] ${message}:`, error);
    } else {
      console.log(`[SubscriptionAuthProvider] ${message}`);
    }
  }
}
