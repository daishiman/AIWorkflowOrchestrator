# SubscriptionAuthProvider 設計

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 2                            |
| 作成日   | 2026-02-09                   |
| 対象     | SubscriptionAuthProvider     |

---

## インターフェース定義

### 型定義

```typescript
/**
 * Claude Code CLI トークン情報
 *
 * macOS Keychain から取得したトークンデータの構造
 */
export interface ClaudeCodeTokenData {
  /** OAuth Access Token (sk-ant-oat01-...) */
  accessToken: string;
  /** OAuth Refresh Token (sk-ant-ort01-...) */
  refreshToken?: string;
  /** トークン取得日時 */
  retrievedAt: number;
}

/**
 * トークンキャッシュエントリ
 */
export interface TokenCacheEntry {
  /** キャッシュされたトークン */
  token: string;
  /** キャッシュ作成日時 */
  cachedAt: number;
  /** キャッシュ有効期限（TTL: 5分） */
  expiresAt: number;
}

/**
 * サブスクリプション認証エラーコード
 */
export const SUBSCRIPTION_AUTH_ERROR_CODES = {
  /** Keychain アクセスエラー */
  KEYCHAIN_ACCESS_ERROR: 3020,
  /** トークン未保存 */
  TOKEN_NOT_FOUND: 3021,
  /** トークン形式不正 */
  INVALID_TOKEN_FORMAT: 3022,
  /** トークン期限切れ */
  TOKEN_EXPIRED: 3023,
  /** Keychain アクセス拒否 */
  KEYCHAIN_ACCESS_DENIED: 3024,
  /** Claude Code CLI 未インストール */
  CLI_NOT_INSTALLED: 3025,
  /** プラットフォーム非対応 */
  PLATFORM_NOT_SUPPORTED: 3026,
} as const;

export type SubscriptionAuthErrorCode =
  (typeof SUBSCRIPTION_AUTH_ERROR_CODES)[keyof typeof SUBSCRIPTION_AUTH_ERROR_CODES];

/**
 * サブスクリプション認証エラー
 */
export interface SubscriptionAuthError {
  code: SubscriptionAuthErrorCode;
  message: string;
  details?: unknown;
  /** ユーザー向けガイダンス */
  guidance?: string;
}
```

### サービスインターフェース

```typescript
/**
 * サブスクリプション認証プロバイダーのインターフェース
 *
 * Claude Code CLI が macOS Keychain に保存した
 * OAuth トークンを取得・管理する。
 *
 * @implements DIP (Dependency Inversion Principle)
 */
export interface ISubscriptionAuthProvider {
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
  getToken(): Promise<string | null>;

  /**
   * トークンの存在確認
   *
   * @returns トークンが存在する場合 true
   */
  hasToken(): Promise<boolean>;

  /**
   * トークンの有効性を検証
   *
   * トークン形式と有効期限を確認する。
   * 注意: APIリクエストによる実際の検証は行わない（コスト削減）。
   *
   * @returns 有効なトークンの場合 true
   */
  validateToken(): Promise<boolean>;

  /**
   * トークンキャッシュをクリア
   *
   * Keychain の更新を反映するために使用。
   */
  clearCache(): void;
}

/**
 * Keychain アクセスのインターフェース
 *
 * keytar ライブラリのラッパー。テスト時にモック可能。
 */
export interface IKeychainAccess {
  /**
   * Keychain からパスワード（トークン）を取得
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @returns パスワード、未保存の場合は null
   */
  getPassword(service: string, account: string): Promise<string | null>;

  /**
   * Keychain にパスワードを保存
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @param password - 保存するパスワード
   */
  setPassword(
    service: string,
    account: string,
    password: string,
  ): Promise<void>;

  /**
   * Keychain からパスワードを削除
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @returns 削除成功の場合 true
   */
  deletePassword(service: string, account: string): Promise<boolean>;
}
```

---

## トークン取得フロー

### フロー図

```
┌──────────────────────────────────────────────────────────────────┐
│                         getToken()                                │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  キャッシュ確認     │
                    │  (TTL: 5分)         │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │ キャッシュ有効?                 │
              │                                 │
        ┌─────▼─────┐                    ┌──────▼──────┐
        │    YES    │                    │     NO      │
        │  キャッシュ│                    │  Keychain   │
        │  から返却 │                    │  アクセス   │
        └───────────┘                    └──────┬──────┘
                                                │
                               ┌────────────────┴────────────────┐
                               │ Keychain トークン存在?          │
                               │                                 │
                         ┌─────▼─────┐                    ┌──────▼──────┐
                         │    YES    │                    │     NO      │
                         │  JSONパース│                    │  環境変数   │
                         │  キャッシュ│                    │  確認       │
                         └─────┬─────┘                    └──────┬──────┘
                               │                                 │
                               ▼                                 ▼
                    ┌─────────────────────┐        ┌─────────────────────┐
                    │  accessToken 抽出   │        │ CLAUDE_CODE_OAUTH_  │
                    │  + キャッシュ保存   │        │ TOKEN 確認          │
                    └──────────┬──────────┘        └──────────┬──────────┘
                               │                              │
                               ▼                              ▼
                    ┌─────────────────────┐        ┌─────────────────────┐
                    │   トークン返却      │        │ 存在すれば返却      │
                    │                     │        │ なければ null       │
                    └─────────────────────┘        └─────────────────────┘
```

### 詳細フロー

```typescript
async getToken(): Promise<string | null> {
  // Step 1: キャッシュ確認
  if (this.isCacheValid()) {
    return this.cache.token;
  }

  // Step 2: macOS Keychain から取得
  const keychainToken = await this.getTokenFromKeychain();
  if (keychainToken) {
    this.updateCache(keychainToken);
    return keychainToken;
  }

  // Step 3: 環境変数フォールバック
  const envToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (envToken && this.isValidTokenFormat(envToken)) {
    return envToken;
  }

  return null;
}
```

### Keychain トークン取得の詳細

```typescript
private async getTokenFromKeychain(): Promise<string | null> {
  // プラットフォームチェック
  if (process.platform !== "darwin") {
    return null;
  }

  try {
    // keytar を使用して Keychain からトークンを取得
    const rawData = await this.keychainAccess.getPassword(
      KEYCHAIN_SERVICE_NAME,
      this.getAccountName()
    );

    if (!rawData) {
      return null;
    }

    // JSON パース
    const tokenData = this.parseTokenData(rawData);
    if (!tokenData) {
      return null;
    }

    // Access Token を返却
    return tokenData.accessToken;
  } catch (error) {
    // Keychain アクセスエラーをログ（トークンは含めない）
    this.logError("Keychain access failed", error);
    return null;
  }
}
```

---

## 定数定義

```typescript
/**
 * Keychain サービス名
 * Claude Code CLI が使用するサービス名と一致させる
 */
export const KEYCHAIN_SERVICE_NAME = "Claude Code-credentials";

/**
 * キャッシュ TTL（ミリ秒）
 * 5分 = 300,000ms
 */
export const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * OAuth Access Token のプレフィックス
 */
export const OAUTH_ACCESS_TOKEN_PREFIX = "sk-ant-oat01-";

/**
 * OAuth Refresh Token のプレフィックス
 */
export const OAUTH_REFRESH_TOKEN_PREFIX = "sk-ant-ort01-";

/**
 * 環境変数名
 */
export const ENV_CLAUDE_CODE_OAUTH_TOKEN = "CLAUDE_CODE_OAUTH_TOKEN";

/**
 * トークンの最大長
 */
export const MAX_TOKEN_LENGTH = 500;

/**
 * トークンの最小長
 */
export const MIN_TOKEN_LENGTH = 20;
```

---

## エラーハンドリング

### エラー分類

| エラーコード                  | 数値 | 原因                           | リトライ | ユーザーガイダンス                               |
| ----------------------------- | ---- | ------------------------------ | -------- | ------------------------------------------------ |
| KEYCHAIN_ACCESS_ERROR (3020)  | 3020 | Keychain API エラー            | 可       | 「しばらく待ってから再試行してください」         |
| TOKEN_NOT_FOUND (3021)        | 3021 | トークン未保存                 | 不可     | 「Claude Code CLI で /login を実行してください」 |
| INVALID_TOKEN_FORMAT (3022)   | 3022 | トークン形式不正               | 不可     | 「Claude Code CLI で再ログインしてください」     |
| TOKEN_EXPIRED (3023)          | 3023 | トークン期限切れ               | 不可     | 「Claude Code CLI で再ログインしてください」     |
| KEYCHAIN_ACCESS_DENIED (3024) | 3024 | Keychain アクセス拒否          | 不可     | 「キーチェーンへのアクセスを許可してください」   |
| CLI_NOT_INSTALLED (3025)      | 3025 | Claude Code CLI 未インストール | 不可     | 「Claude Code CLI をインストールしてください」   |
| PLATFORM_NOT_SUPPORTED (3026) | 3026 | 非macOSプラットフォーム        | 不可     | 「この機能は macOS のみ対応しています」          |

### エラーメッセージ定義

```typescript
export const SUBSCRIPTION_AUTH_ERROR_MESSAGES: Record<
  SubscriptionAuthErrorCode,
  { message: string; guidance: string }
> = {
  [SUBSCRIPTION_AUTH_ERROR_CODES.KEYCHAIN_ACCESS_ERROR]: {
    message: "Keychainへのアクセスに失敗しました",
    guidance: "しばらく待ってから再試行してください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.TOKEN_NOT_FOUND]: {
    message: "認証トークンが見つかりません",
    guidance: "Claude Code CLIで /login を実行してログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.INVALID_TOKEN_FORMAT]: {
    message: "認証トークンの形式が不正です",
    guidance: "Claude Code CLIで再ログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.TOKEN_EXPIRED]: {
    message: "認証トークンの有効期限が切れています",
    guidance: "Claude Code CLIで再ログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.KEYCHAIN_ACCESS_DENIED]: {
    message: "Keychainへのアクセスが拒否されました",
    guidance:
      "システム環境設定 > セキュリティとプライバシー で許可してください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.CLI_NOT_INSTALLED]: {
    message: "Claude Code CLIがインストールされていません",
    guidance: "Claude Code CLI をインストールしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.PLATFORM_NOT_SUPPORTED]: {
    message: "このプラットフォームはサポートされていません",
    guidance: "この機能は macOS のみ対応しています",
  },
};
```

### エラーハンドリングパターン

```typescript
/**
 * Result パターンでエラーを返す
 */
export type SubscriptionAuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: SubscriptionAuthError };

/**
 * エラーハンドリング例
 */
async getTokenWithResult(): Promise<SubscriptionAuthResult<string>> {
  try {
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        error: {
          code: SUBSCRIPTION_AUTH_ERROR_CODES.TOKEN_NOT_FOUND,
          message: "認証トークンが見つかりません",
          guidance: "Claude Code CLIで /login を実行してログインしてください",
        },
      };
    }
    return { success: true, data: token };
  } catch (error) {
    return {
      success: false,
      error: this.mapError(error),
    };
  }
}
```

---

## セキュリティ考慮事項

### トークン保護

| 観点               | 対策                                         |
| ------------------ | -------------------------------------------- |
| メモリ上のトークン | キャッシュ TTL を短く設定（5分）             |
| ログ出力           | トークンをログに出力しない（サニタイズ必須） |
| IPC 通信           | トークンを Renderer に直接送信しない         |
| エラーメッセージ   | 内部エラー詳細を Renderer に送信しない       |
| プロセス間分離     | トークン操作は Main Process でのみ実行       |

### Keychain セキュリティ

```typescript
/**
 * Keychain アクセスのセキュリティ設定
 */
const KEYCHAIN_SECURITY = {
  // アクセス制御
  accessControl: {
    // ユーザー認証後のみアクセス可能（macOS 標準）
    requireUserPresence: true,
    // アプリ署名による制限（本番環境）
    requireCodeSignature: process.env.NODE_ENV === "production",
  },
  // アクセスログ
  logging: {
    // アクセス試行をログ（トークンは含めない）
    logAccess: true,
    // エラーをログ
    logErrors: true,
  },
};
```

### ログサニタイズ

```typescript
/**
 * トークンをサニタイズしてログ出力
 */
function sanitizeTokenForLog(token: string): string {
  if (!token) return "[empty]";
  if (token.length < 20) return "[too short]";

  // プレフィックス + 最初4文字 + ... + 最後4文字
  const prefix = token.slice(0, 15); // sk-ant-oat01-
  const suffix = token.slice(-4);
  return `${prefix}...${suffix}`;
}

// 使用例
this.logger.debug(`Token retrieved: ${sanitizeTokenForLog(token)}`);
// 出力: "Token retrieved: sk-ant-oat01-...xxxx"
```

### 権限分離

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           SubscriptionAuthProvider                   │    │
│  │  - Keychain アクセス                                 │    │
│  │  - トークンキャッシュ管理                            │    │
│  │  - トークンバリデーション                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼ (トークンを直接渡さない)         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AuthModeService                         │    │
│  │  - getCredential() でトークンを取得                  │    │
│  │  - SkillExecutor に渡す                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ IPC (トークンなし、状態のみ)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│  - 認証状態（isAuthenticated）のみ受信                      │
│  - トークン自体は受け取らない                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 実装クラス設計

```typescript
/**
 * SubscriptionAuthProvider 実装クラス
 */
export class SubscriptionAuthProvider implements ISubscriptionAuthProvider {
  private cache: TokenCacheEntry | null = null;
  private readonly keychainAccess: IKeychainAccess;
  private readonly debug: boolean;

  constructor(deps?: { keychainAccess?: IKeychainAccess; debug?: boolean }) {
    // DI: keytar のラッパーを注入可能（テスト用）
    this.keychainAccess = deps?.keychainAccess ?? new KeytarAccess();
    this.debug = deps?.debug ?? false;
  }

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

  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  async validateToken(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    return this.isValidTokenFormat(token);
  }

  clearCache(): void {
    this.cache = null;
    this.log("Cache cleared");
  }

  // ===== Private Methods =====

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() < this.cache.expiresAt;
  }

  private updateCache(token: string): void {
    const now = Date.now();
    this.cache = {
      token,
      cachedAt: now,
      expiresAt: now + TOKEN_CACHE_TTL_MS,
    };
  }

  private async getTokenFromKeychain(): Promise<string | null> {
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

  private getAccountName(): string {
    return process.env.USER || process.env.USERNAME || "unknown";
  }

  private parseTokenData(rawData: string): ClaudeCodeTokenData | null {
    try {
      const parsed = JSON.parse(rawData);
      if (typeof parsed.accessToken !== "string") {
        return null;
      }
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
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

  private log(message: string, error?: unknown): void {
    if (!this.debug) return;
    if (process.env.NODE_ENV === "test") return;

    if (error) {
      console.error(`[SubscriptionAuthProvider] ${message}:`, error);
    } else {
      console.log(`[SubscriptionAuthProvider] ${message}`);
    }
  }
}
```

---

## テスト戦略

### 単体テストケース

| テストケース                              | 期待結果                     |
| ----------------------------------------- | ---------------------------- |
| getToken - キャッシュ有効時               | キャッシュからトークンを返す |
| getToken - キャッシュ期限切れ             | Keychain から再取得          |
| getToken - Keychain にトークンあり        | Keychain のトークンを返す    |
| getToken - Keychain にトークンなし        | 環境変数をチェック           |
| getToken - 環境変数にトークンあり         | 環境変数のトークンを返す     |
| getToken - どこにもなし                   | null を返す                  |
| hasToken - トークンあり                   | true を返す                  |
| hasToken - トークンなし                   | false を返す                 |
| validateToken - 有効なトークン            | true を返す                  |
| validateToken - 無効なフォーマット        | false を返す                 |
| clearCache - キャッシュクリア             | 次回 getToken で再取得       |
| parseTokenData - 有効な JSON              | ClaudeCodeTokenData を返す   |
| parseTokenData - 無効な JSON              | null を返す                  |
| parseTokenData - 直接トークン             | accessToken として解釈       |
| isValidTokenFormat - 有効なプレフィックス | true を返す                  |
| isValidTokenFormat - 無効なプレフィックス | false を返す                 |

### モック戦略

```typescript
// keytar モック
const mockKeychainAccess: IKeychainAccess = {
  getPassword: vi.fn(),
  setPassword: vi.fn(),
  deletePassword: vi.fn(),
};

// テストセットアップ
describe("SubscriptionAuthProvider", () => {
  let provider: SubscriptionAuthProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new SubscriptionAuthProvider({
      keychainAccess: mockKeychainAccess,
      debug: false,
    });
  });

  afterEach(() => {
    provider.clearCache();
  });

  describe("getToken", () => {
    it("should return token from Keychain", async () => {
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
        refreshToken: "sk-ant-ort01-refresh-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const token = await provider.getToken();

      expect(token).toBe("sk-ant-oat01-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledWith(
        "Claude Code-credentials",
        expect.any(String),
      );
    });

    it("should return null when no token exists", async () => {
      mockKeychainAccess.getPassword.mockResolvedValue(null);

      const token = await provider.getToken();

      expect(token).toBeNull();
    });
  });
});
```

### 統合テスト（E2E）

```typescript
describe("SubscriptionAuthProvider Integration", () => {
  // 実際の Keychain にアクセスするテスト（CI では skip）
  it.skipIf(process.env.CI)(
    "should retrieve real token from Keychain",
    async () => {
      const provider = new SubscriptionAuthProvider();
      const token = await provider.getToken();

      // Claude Code CLI でログイン済みの場合のみ PASS
      if (token) {
        expect(token).toMatch(/^sk-ant-oat01-/);
      } else {
        console.log(
          "No Claude Code CLI token found (expected if not logged in)",
        );
      }
    },
  );
});
```

---

## 依存パッケージ

### 必須パッケージ

| パッケージ | バージョン | 用途                    |
| ---------- | ---------- | ----------------------- |
| keytar     | ^7.9.0     | macOS Keychain アクセス |

### electron-rebuild 設定

```json
// package.json
{
  "scripts": {
    "postinstall": "electron-rebuild",
    "rebuild": "electron-rebuild -f -w keytar"
  },
  "devDependencies": {
    "@electron/rebuild": "^3.6.0"
  }
}
```

### ネイティブモジュールの注意点

```
注意: keytar はネイティブモジュールのため、以下の対応が必要:

1. electron-rebuild でリビルド
2. Node.js バージョンと Electron バージョンの互換性確認
3. CI/CD でのビルド環境設定（macOS ランナー）
```

---

## 関連ドキュメント

| ドキュメント        | パス                                          |
| ------------------- | --------------------------------------------- |
| AuthModeService設計 | `outputs/phase-2/auth-mode-service-design.md` |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`  |
| CLI認証調査結果     | `outputs/phase-1/cli-auth-investigation.md`   |
| セキュリティルール  | `.claude/rules/04-electron-security.md`       |
