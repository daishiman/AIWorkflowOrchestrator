# AuthModeService 設計

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 2                            |
| 作成日   | 2026-02-09                   |
| 対象     | AuthModeService              |

---

## インターフェース定義

### 認証モード型定義

```typescript
/**
 * 認証モード
 *
 * subscription: Claude Code CLIサブスクリプション認証（Keychain経由）
 * api-key: Anthropic APIキー認証（既存AuthKeyService）
 */
export type AuthMode = "subscription" | "api-key";

/**
 * 認証モードのデフォルト値
 */
export const DEFAULT_AUTH_MODE: AuthMode = "subscription";

/**
 * 認証状態
 */
export interface AuthStatus {
  /** 現在の認証モード */
  mode: AuthMode;
  /** 認証が有効かどうか */
  isAuthenticated: boolean;
  /** エラーメッセージ（認証失敗時） */
  error?: string;
  /** 追加情報 */
  details?: {
    /** APIキー認証時: キーが設定されているか */
    hasApiKey?: boolean;
    /** サブスクリプション認証時: トークンが存在するか */
    hasSubscriptionToken?: boolean;
  };
}

/**
 * 認証モード変更イベント
 */
export interface AuthModeChangeEvent {
  /** 変更前のモード */
  previousMode: AuthMode;
  /** 変更後のモード */
  newMode: AuthMode;
  /** 変更日時 */
  timestamp: number;
}

/**
 * 認証モードエラーコード
 */
export const AUTH_MODE_ERROR_CODES = {
  /** 認証モード取得エラー */
  GET_MODE_FAILED: 3010,
  /** 認証モード設定エラー */
  SET_MODE_FAILED: 3011,
  /** 認証状態取得エラー */
  GET_STATUS_FAILED: 3012,
  /** バリデーションエラー */
  VALIDATION_FAILED: 3013,
  /** サブスクリプション未認証 */
  SUBSCRIPTION_NOT_AUTHENTICATED: 3014,
  /** APIキー未設定 */
  API_KEY_NOT_SET: 3015,
} as const;

export type AuthModeErrorCode =
  (typeof AUTH_MODE_ERROR_CODES)[keyof typeof AUTH_MODE_ERROR_CODES];
```

### サービスインターフェース

```typescript
import { IAuthKeyService } from "./types";
import { ISubscriptionAuthProvider } from "./subscription-auth-provider";

/**
 * 認証モード変更リスナー型
 */
export type AuthModeChangeListener = (event: AuthModeChangeEvent) => void;

/**
 * 認証モード管理サービスのインターフェース
 *
 * 認証方式（サブスクリプション/APIキー）の管理と
 * 適切な認証プロバイダーへのルーティングを担う。
 *
 * @implements DIP (Dependency Inversion Principle)
 */
export interface IAuthModeService {
  /**
   * 現在の認証モードを取得
   *
   * @returns 現在の認証モード
   */
  getMode(): Promise<AuthMode>;

  /**
   * 認証モードを設定
   *
   * @param mode - 設定する認証モード
   * @throws AuthModeError - モード設定失敗時
   */
  setMode(mode: AuthMode): Promise<void>;

  /**
   * 認証状態を取得
   *
   * 現在のモードに応じた認証有効性を確認する。
   *
   * @returns 認証状態
   */
  getStatus(): Promise<AuthStatus>;

  /**
   * 現在のモードで認証トークン/キーを取得
   *
   * subscription: Keychain経由でOAuthトークンを取得
   * api-key: AuthKeyService経由でAPIキーを取得
   *
   * @returns 認証トークン/キー、未認証の場合はnull
   */
  getCredential(): Promise<string | null>;

  /**
   * 認証モード変更リスナーを登録
   *
   * @param listener - 変更通知を受け取るコールバック
   * @returns リスナー解除関数
   */
  onModeChange(listener: AuthModeChangeListener): () => void;

  /**
   * 指定モードの認証が有効かを検証
   *
   * @param mode - 検証対象のモード
   * @returns 有効な場合true
   */
  validateMode(mode: AuthMode): Promise<boolean>;
}
```

---

## 依存関係

### サービス依存

```typescript
/**
 * AuthModeService の依存関係
 */
export interface AuthModeServiceDependencies {
  /** APIキー認証プロバイダー */
  authKeyService: IAuthKeyService;
  /** サブスクリプション認証プロバイダー */
  subscriptionAuthProvider: ISubscriptionAuthProvider;
  /** 設定ストア（モード永続化用） */
  settingsStore?: ElectronStore<AuthModeStoreSchema>;
}
```

### 依存構造図

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillExecutor                          │
│                    (DI: 第3引数)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    IAuthModeService                         │
│              (認証モード統合インターフェース)               │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌───────────────────────┐   ┌───────────────────────────┐
│   IAuthKeyService     │   │ ISubscriptionAuthProvider │
│   (既存APIキー認証)   │   │   (新規Keychain認証)      │
├───────────────────────┤   ├───────────────────────────┤
│ - electron-store      │   │ - keytar                  │
│ - safeStorage         │   │ - macOS Keychain          │
│ - ANTHROPIC_API_KEY   │   │ - CLAUDE_CODE_OAUTH_TOKEN │
└───────────────────────┘   └───────────────────────────┘
```

### 外部ライブラリ

| ライブラリ     | バージョン   | 用途                   |
| -------------- | ------------ | ---------------------- |
| electron-store | 既存         | 認証モード設定の永続化 |
| keytar         | ^7.9.0       | macOS Keychainアクセス |
| safeStorage    | Electron内蔵 | APIキー暗号化（既存）  |

---

## メソッド仕様

### getMode()

```typescript
/**
 * 現在の認証モードを取得
 *
 * 取得優先順位:
 * 1. electron-store に保存されたモード
 * 2. デフォルト値（subscription）
 *
 * @returns 認証モード
 *
 * @example
 * const mode = await authModeService.getMode();
 * // mode: "subscription" | "api-key"
 */
async getMode(): Promise<AuthMode> {
  const storedMode = this.settingsStore.get("authMode");
  if (this.isValidAuthMode(storedMode)) {
    return storedMode;
  }
  return DEFAULT_AUTH_MODE;
}
```

### setMode()

```typescript
/**
 * 認証モードを設定
 *
 * 1. モード値のバリデーション
 * 2. 設定の永続化
 * 3. 変更イベントの発行
 *
 * @param mode - 設定する認証モード
 * @throws Error - 無効なモード値の場合
 *
 * @example
 * await authModeService.setMode("api-key");
 */
async setMode(mode: AuthMode): Promise<void> {
  if (!this.isValidAuthMode(mode)) {
    throw new Error(`Invalid auth mode: ${mode}`);
  }

  const previousMode = await this.getMode();

  // 永続化
  this.settingsStore.set("authMode", mode);

  // 変更イベント発行
  if (previousMode !== mode) {
    this.emitModeChange({
      previousMode,
      newMode: mode,
      timestamp: Date.now(),
    });
  }
}
```

### getStatus()

```typescript
/**
 * 認証状態を取得
 *
 * 現在のモードに応じて適切なプロバイダーの認証状態を確認する。
 *
 * @returns 認証状態
 *
 * @example
 * const status = await authModeService.getStatus();
 * if (!status.isAuthenticated) {
 *   console.log(status.error); // "サブスクリプション認証が必要です"
 * }
 */
async getStatus(): Promise<AuthStatus> {
  const mode = await this.getMode();

  if (mode === "subscription") {
    const hasToken = await this.subscriptionAuthProvider.hasToken();
    return {
      mode,
      isAuthenticated: hasToken,
      error: hasToken ? undefined : "Claude Code CLIでのログインが必要です",
      details: { hasSubscriptionToken: hasToken },
    };
  }

  // api-key mode
  const hasKey = await this.authKeyService.hasKey();
  return {
    mode,
    isAuthenticated: hasKey,
    error: hasKey ? undefined : "APIキーを設定してください",
    details: { hasApiKey: hasKey },
  };
}
```

### getCredential()

```typescript
/**
 * 現在のモードで認証トークン/キーを取得
 *
 * @returns 認証情報、未認証の場合はnull
 *
 * @example
 * const credential = await authModeService.getCredential();
 * if (credential) {
 *   // API呼び出しに使用
 * }
 */
async getCredential(): Promise<string | null> {
  const mode = await this.getMode();

  if (mode === "subscription") {
    return this.subscriptionAuthProvider.getToken();
  }

  return this.authKeyService.getKey();
}
```

### onModeChange()

```typescript
/**
 * 認証モード変更リスナーを登録
 *
 * @param listener - 変更通知コールバック
 * @returns リスナー解除関数
 *
 * @example
 * const unsubscribe = authModeService.onModeChange((event) => {
 *   console.log(`Mode changed: ${event.previousMode} -> ${event.newMode}`);
 * });
 *
 * // 解除
 * unsubscribe();
 */
onModeChange(listener: AuthModeChangeListener): () => void {
  this.listeners.add(listener);
  return () => {
    this.listeners.delete(listener);
  };
}
```

### validateMode()

```typescript
/**
 * 指定モードの認証が有効かを検証
 *
 * @param mode - 検証対象のモード
 * @returns 有効な場合true
 *
 * @example
 * const isValid = await authModeService.validateMode("subscription");
 * if (!isValid) {
 *   // エラーハンドリング
 * }
 */
async validateMode(mode: AuthMode): Promise<boolean> {
  if (mode === "subscription") {
    return this.subscriptionAuthProvider.hasToken();
  }
  return this.authKeyService.hasKey();
}
```

---

## 永続化仕様

### electron-store スキーマ

```typescript
/**
 * 認証モード設定のストアスキーマ
 */
export interface AuthModeStoreSchema {
  /** 認証モード設定 */
  authMode?: AuthMode;
  /** 最終変更日時 */
  authModeUpdatedAt?: number;
}

/**
 * ストア設定
 */
export const AUTH_MODE_STORE_CONFIG = {
  /** Store 名 */
  name: "auth-mode-store",
  /** スキーマ定義（electron-store v8+） */
  schema: {
    authMode: {
      type: "string",
      enum: ["subscription", "api-key"],
      default: "subscription",
    },
    authModeUpdatedAt: {
      type: "number",
    },
  },
} as const;
```

### ストレージキー

| キー                | 型       | デフォルト     | 説明             |
| ------------------- | -------- | -------------- | ---------------- |
| `authMode`          | AuthMode | "subscription" | 認証モード設定   |
| `authModeUpdatedAt` | number   | -              | 最終更新タイムス |

### ストレージファイルパス

```
macOS: ~/Library/Application Support/AIWorkflowOrchestrator/auth-mode-store.json
```

---

## イベント仕様

### AuthModeChangeEvent

```typescript
/**
 * 認証モード変更イベント
 *
 * 認証モードが変更された際に発行される。
 * UIの状態更新やログ記録に使用。
 */
export interface AuthModeChangeEvent {
  /** 変更前のモード */
  previousMode: AuthMode;
  /** 変更後のモード */
  newMode: AuthMode;
  /** 変更日時（Unix timestamp in ms） */
  timestamp: number;
}
```

### イベント発行タイミング

| タイミング         | 発行条件                                 |
| ------------------ | ---------------------------------------- |
| setMode() 呼び出し | previousMode !== newMode の場合のみ      |
| 初期化時           | 発行しない（初期状態は変更ではないため） |
| ストア破損時の復旧 | デフォルト値への復帰時に発行             |

### リスナー管理

```typescript
/**
 * リスナー管理の実装パターン
 */
class AuthModeService implements IAuthModeService {
  private listeners: Set<AuthModeChangeListener> = new Set();

  private emitModeChange(event: AuthModeChangeEvent): void {
    // 非同期でリスナーを呼び出し（UIブロッキング防止）
    queueMicrotask(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          // リスナーのエラーは他リスナーに影響させない
          console.error("[AuthModeService] Listener error:", error);
        }
      });
    });
  }
}
```

---

## IPC チャンネル仕様

### チャンネル一覧

| チャンネル         | 方向            | リクエスト         | レスポンス          |
| ------------------ | --------------- | ------------------ | ------------------- |
| auth-mode:get      | Renderer → Main | なし               | AuthModeResponse    |
| auth-mode:set      | Renderer → Main | AuthModeSetRequest | AuthModeSetResponse |
| auth-mode:status   | Renderer → Main | なし               | AuthStatusResponse  |
| auth-mode:validate | Renderer → Main | AuthModeRequest    | ValidateResponse    |

### 型定義

```typescript
/**
 * auth-mode:get レスポンス
 */
export interface AuthModeResponse {
  mode: AuthMode;
}

/**
 * auth-mode:set リクエスト
 */
export interface AuthModeSetRequest {
  mode: AuthMode;
}

/**
 * auth-mode:set レスポンス
 */
export interface AuthModeSetResponse {
  success: boolean;
  error?: string;
}

/**
 * auth-mode:status レスポンス
 */
export interface AuthStatusResponse {
  mode: AuthMode;
  isAuthenticated: boolean;
  error?: string;
  details?: {
    hasApiKey?: boolean;
    hasSubscriptionToken?: boolean;
  };
}

/**
 * auth-mode:validate リクエスト
 */
export interface AuthModeRequest {
  mode: AuthMode;
}

/**
 * auth-mode:validate レスポンス
 */
export interface ValidateResponse {
  valid: boolean;
  error?: string;
}
```

---

## エラーハンドリング

### エラー分類

| エラーコード                          | 範囲 | 原因                     | リトライ |
| ------------------------------------- | ---- | ------------------------ | -------- |
| GET_MODE_FAILED (3010)                | 3xxx | ストア読み取りエラー     | 可       |
| SET_MODE_FAILED (3011)                | 3xxx | ストア書き込みエラー     | 可       |
| GET_STATUS_FAILED (3012)              | 3xxx | 認証状態取得エラー       | 可       |
| VALIDATION_FAILED (3013)              | 3xxx | バリデーションエラー     | 不可     |
| SUBSCRIPTION_NOT_AUTHENTICATED (3014) | 3xxx | サブスクリプション未認証 | 不可     |
| API_KEY_NOT_SET (3015)                | 3xxx | APIキー未設定            | 不可     |

### エラーメッセージ

```typescript
export const AUTH_MODE_ERROR_MESSAGES: Record<AuthModeErrorCode, string> = {
  [AUTH_MODE_ERROR_CODES.GET_MODE_FAILED]: "認証モードの取得に失敗しました",
  [AUTH_MODE_ERROR_CODES.SET_MODE_FAILED]: "認証モードの設定に失敗しました",
  [AUTH_MODE_ERROR_CODES.GET_STATUS_FAILED]: "認証状態の取得に失敗しました",
  [AUTH_MODE_ERROR_CODES.VALIDATION_FAILED]:
    "認証モードのバリデーションに失敗しました",
  [AUTH_MODE_ERROR_CODES.SUBSCRIPTION_NOT_AUTHENTICATED]:
    "Claude Code CLIでログインしてください",
  [AUTH_MODE_ERROR_CODES.API_KEY_NOT_SET]:
    "Anthropic APIキーを設定してください",
};
```

---

## テスト戦略

### 単体テストケース

| テストケース                 | 期待結果                        |
| ---------------------------- | ------------------------------- |
| getMode - 未設定時           | DEFAULT_AUTH_MODE を返す        |
| getMode - 設定済み時         | 保存されたモードを返す          |
| setMode - 有効なモード       | ストアに保存される              |
| setMode - 無効なモード       | Error をスロー                  |
| setMode - イベント発行       | リスナーが呼び出される          |
| getStatus - subscription有効 | isAuthenticated: true           |
| getStatus - subscription無効 | isAuthenticated: false + エラー |
| getStatus - api-key有効      | isAuthenticated: true           |
| getStatus - api-key無効      | isAuthenticated: false + エラー |
| getCredential - subscription | トークンを返す                  |
| getCredential - api-key      | APIキーを返す                   |
| onModeChange - 登録/解除     | リスナーの追加/削除が正しく動作 |

### モック戦略

```typescript
// テスト用モック
const mockAuthKeyService: IAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-xxx"),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn(),
};

const mockSubscriptionAuthProvider: ISubscriptionAuthProvider = {
  getToken: vi.fn().mockResolvedValue("sk-ant-oat01-xxx"),
  hasToken: vi.fn().mockResolvedValue(true),
  validateToken: vi.fn().mockResolvedValue(true),
  clearCache: vi.fn(),
};
```

---

## 関連ドキュメント

| ドキュメント                 | パス                                                    |
| ---------------------------- | ------------------------------------------------------- |
| SubscriptionAuthProvider設計 | `outputs/phase-2/subscription-auth-provider-design.md`  |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`            |
| CLI認証調査結果              | `outputs/phase-1/cli-auth-investigation.md`             |
| 既存AuthKeyService           | `apps/desktop/src/main/services/auth/AuthKeyService.ts` |
