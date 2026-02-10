/**
 * AuthModeService - 認証モード管理サービス
 *
 * 認証方式（サブスクリプション/APIキー）の管理と
 * 適切な認証プロバイダーへのルーティングを担う。
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/auth-mode-service-design.md
 */
import Store from "electron-store";
import type {
  AuthMode,
  AuthStatus,
  AuthModeChangeEvent,
  AuthModeChangeListener,
  AuthModeStoreSchema,
  IAuthKeyService,
  ISubscriptionAuthProvider,
  IAuthModeService,
} from "./types";
import {
  DEFAULT_AUTH_MODE,
  VALID_AUTH_MODES,
  AUTH_MODE_STORE_NAME,
  AUTH_MODE_ERROR_CODES,
} from "./types";

// =================================================================
// 依存関係インターフェース
// =================================================================

/**
 * AuthModeService の依存関係
 */
export interface AuthModeServiceDependencies {
  /** APIキー認証プロバイダー */
  authKeyService: IAuthKeyService;
  /** サブスクリプション認証プロバイダー */
  subscriptionAuthProvider: ISubscriptionAuthProvider;
  /** 設定ストア（モード永続化用） */
  settingsStore?: Store<AuthModeStoreSchema>;
}

// =================================================================
// ストアインスタンス管理
// =================================================================

let authModeStore: Store<AuthModeStoreSchema> | null = null;

/**
 * AuthModeストアを取得（遅延初期化）
 */
function getAuthModeStore(): Store<AuthModeStoreSchema> {
  if (!authModeStore) {
    authModeStore = new Store<AuthModeStoreSchema>({
      name: AUTH_MODE_STORE_NAME,
      defaults: {
        authMode: DEFAULT_AUTH_MODE,
      },
    });
  }
  return authModeStore;
}

/**
 * ストアをクリア（テスト用）
 */
export function clearAuthModeStore(): void {
  if (authModeStore) {
    authModeStore.clear();
  }
}

/**
 * ストアをリセット（テスト用）
 */
export function resetAuthModeStore(): void {
  authModeStore = null;
}

// =================================================================
// AuthModeService 実装
// =================================================================

/**
 * 認証モード管理サービス
 */
export class AuthModeService implements IAuthModeService {
  private readonly authKeyService: IAuthKeyService;
  private readonly subscriptionAuthProvider: ISubscriptionAuthProvider;
  private readonly settingsStore: Store<AuthModeStoreSchema>;
  private readonly listeners: Set<AuthModeChangeListener> = new Set();

  constructor(deps: AuthModeServiceDependencies) {
    this.authKeyService = deps.authKeyService;
    this.subscriptionAuthProvider = deps.subscriptionAuthProvider;
    this.settingsStore = deps.settingsStore ?? getAuthModeStore();
  }

  /**
   * 認証モードが有効かどうかを検証
   */
  private isValidAuthMode(mode: unknown): mode is AuthMode {
    return (
      typeof mode === "string" && VALID_AUTH_MODES.includes(mode as AuthMode)
    );
  }

  /**
   * モード変更イベントを発行
   */
  private emitModeChange(event: AuthModeChangeEvent): void {
    // 非同期でリスナーを呼び出し（UIブロッキング防止）
    queueMicrotask(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          // リスナーのエラーは他リスナーに影響させない
          if (process.env.NODE_ENV !== "test") {
            console.error("[AuthModeService] Listener error:", error);
          }
        }
      });
    });
  }

  /**
   * 現在の認証モードを取得
   *
   * 取得優先順位:
   * 1. electron-store に保存されたモード
   * 2. デフォルト値（subscription）
   */
  getMode(): AuthMode {
    try {
      const storedMode = this.settingsStore.get("authMode");
      if (this.isValidAuthMode(storedMode)) {
        return storedMode;
      }
    } catch {
      // ストア読み取りエラー時はデフォルト値を返す
    }
    return DEFAULT_AUTH_MODE;
  }

  /**
   * 認証モードを設定
   *
   * 1. モード値のバリデーション
   * 2. 設定の永続化
   * 3. 変更イベントの発行
   */
  async setMode(mode: AuthMode): Promise<void> {
    if (!this.isValidAuthMode(mode)) {
      throw new Error(`Invalid auth mode: ${mode}`);
    }

    const previousMode = this.getMode();

    // 永続化
    this.settingsStore.set("authMode", mode);
    this.settingsStore.set("authModeUpdatedAt", Date.now());

    // 変更イベント発行（異なるモードの場合のみ）
    if (previousMode !== mode) {
      this.emitModeChange({
        previousMode,
        newMode: mode,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 認証状態を取得
   *
   * 現在のモードに応じて適切なプロバイダーの認証状態を確認する。
   */
  async getStatus(): Promise<AuthStatus> {
    const mode = this.getMode();

    if (mode === "subscription") {
      const hasToken = await this.subscriptionAuthProvider.hasToken();
      return {
        mode,
        isAuthenticated: hasToken,
        hasCredentials: hasToken,
        error: hasToken
          ? undefined
          : {
              code: AUTH_MODE_ERROR_CODES.NO_SUBSCRIPTION_TOKEN,
              message: "サブスクリプションが見つかりません",
              guidance: "Claude Code CLIでログインしてください",
            },
        details: { hasSubscriptionToken: hasToken },
      };
    }

    // api-key mode
    const hasKey = await this.authKeyService.hasKey();
    return {
      mode,
      isAuthenticated: hasKey,
      hasCredentials: hasKey,
      error: hasKey
        ? undefined
        : {
            code: AUTH_MODE_ERROR_CODES.NO_API_KEY,
            message: "APIキーが設定されていません",
            guidance: "設定画面でAPIキーを入力してください",
          },
      details: { hasApiKey: hasKey },
    };
  }

  /**
   * 現在のモードで認証トークン/キーを取得
   *
   * subscription: Keychain経由でOAuthトークンを取得
   * api-key: AuthKeyService経由でAPIキーを取得
   */
  async getCredential(): Promise<string | null> {
    const mode = this.getMode();

    if (mode === "subscription") {
      return this.subscriptionAuthProvider.getToken();
    }

    return this.authKeyService.getKey();
  }

  /**
   * 認証モード変更リスナーを登録
   */
  onModeChange(listener: AuthModeChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 指定モードの認証が有効かを検証
   */
  async validateMode(mode: AuthMode): Promise<boolean> {
    if (mode === "subscription") {
      return this.subscriptionAuthProvider.hasToken();
    }
    return this.authKeyService.hasKey();
  }
}

// =================================================================
// スタブ実装（SubscriptionAuthProvider未実装時の暫定対応）
// =================================================================

/**
 * SubscriptionAuthProvider のスタブ実装
 *
 * 実際の実装が完了するまでの暫定対応。
 * 常に未認証状態を返す。
 */
export class StubSubscriptionAuthProvider implements ISubscriptionAuthProvider {
  async getToken(): Promise<string | null> {
    // TODO: Phase 5で実際の実装に置き換え
    return null;
  }

  async hasToken(): Promise<boolean> {
    // TODO: Phase 5で実際の実装に置き換え
    return false;
  }

  async validateToken(): Promise<boolean> {
    // TODO: Phase 5で実際の実装に置き換え
    return false;
  }

  clearCache(): void {
    // No-op for stub
  }
}

/**
 * AuthModeServiceのファクトリ関数
 *
 * @param authKeyService - APIキー認証サービス
 * @param subscriptionAuthProvider - サブスクリプション認証プロバイダー（オプション）
 * @returns AuthModeServiceインスタンス
 */
export function createAuthModeService(
  authKeyService: IAuthKeyService,
  subscriptionAuthProvider?: ISubscriptionAuthProvider,
): AuthModeService {
  return new AuthModeService({
    authKeyService,
    subscriptionAuthProvider:
      subscriptionAuthProvider ?? new StubSubscriptionAuthProvider(),
  });
}
