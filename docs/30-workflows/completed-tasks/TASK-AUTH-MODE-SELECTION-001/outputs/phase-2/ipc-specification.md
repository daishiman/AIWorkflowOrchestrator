# IPC仕様書

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 2                            |
| 作成日   | 2026-02-09                   |
| 機能名   | 認証方式選択機能             |

---

## チャンネル一覧

### Renderer → Main (invoke)

| チャンネル           | Request              | Response                                | 説明                                   |
| -------------------- | -------------------- | --------------------------------------- | -------------------------------------- |
| `auth-mode:get`      | なし                 | `IPCResponse<AuthMode>`                 | 現在の認証方式を取得                   |
| `auth-mode:set`      | `{ mode: AuthMode }` | `IPCResponse<void>`                     | 認証方式を設定（永続化）               |
| `auth-mode:status`   | なし                 | `IPCResponse<AuthModeStatus>`           | 現在の認証方式と認証状態を取得         |
| `auth-mode:validate` | `{ mode: AuthMode }` | `IPCResponse<AuthModeValidationResult>` | 指定認証方式のバリデーション結果を取得 |

### Main → Renderer (on)

| チャンネル          | Payload                | 説明               |
| ------------------- | ---------------------- | ------------------ |
| `auth-mode:changed` | `AuthModeChangedEvent` | 認証方式変更の通知 |

---

## チャンネル詳細

### auth-mode:get

**目的**: 現在設定されている認証方式を取得する

**Request**: なし

**Response**:

```typescript
interface IPCResponse<AuthMode> {
  success: true;
  data: AuthMode; // "subscription" | "api-key"
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**使用例**:

```typescript
// Renderer側
const result = await window.api.authMode.get();
if (result.success) {
  console.log(`Current auth mode: ${result.data}`);
}
```

---

### auth-mode:set

**目的**: 認証方式を設定し、electron-storeに永続化する

**Request**:

```typescript
interface AuthModeSetRequest {
  mode: AuthMode; // "subscription" | "api-key"
}
```

**Response**:

```typescript
interface IPCResponse<void> {
  success: true;
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**副作用**:

- 成功時、`auth-mode:changed` イベントが全Rendererに通知される
- 設定値は `electron-store` の `settings.authMode` に保存される

**エラーケース**:
| エラーコード | 発生条件 |
| ----------------------------- | ---------------------------- |
| `auth-mode/invalid-mode` | 無効な認証方式が指定された |
| `auth-mode/storage-failed` | 永続化に失敗した |

---

### auth-mode:status

**目的**: 現在の認証方式と、その認証状態（トークン/キーの有効性）を取得する

**Request**: なし

**Response**:

```typescript
interface IPCResponse<AuthModeStatus> {
  success: true;
  data: {
    mode: AuthMode;                // 現在の認証方式
    isAuthenticated: boolean;      // 認証済みかどうか
    hasCredentials: boolean;       // 認証情報が存在するか
    tokenExpiresAt?: number;       // トークン有効期限（サブスクリプション時、Unixタイムスタンプ秒）
    lastValidatedAt?: number;      // 最終検証日時（Unixタイムスタンプ秒）
    error?: AuthModeStatusError;   // 認証エラー情報（エラー時のみ）
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**使用例**:

```typescript
// Renderer側
const result = await window.api.authMode.getStatus();
if (result.success && result.data.isAuthenticated) {
  console.log("User is authenticated");
} else if (result.success && !result.data.hasCredentials) {
  console.log("No credentials configured");
}
```

---

### auth-mode:validate

**目的**: 指定された認証方式の認証情報を検証し、有効性を確認する

**Request**:

```typescript
interface AuthModeValidateRequest {
  mode: AuthMode; // 検証対象の認証方式
}
```

**Response**:

```typescript
interface IPCResponse<AuthModeValidationResult> {
  success: true;
  data: {
    isValid: boolean;              // 認証情報が有効か
    mode: AuthMode;                // 検証した認証方式
    hasCredentials: boolean;       // 認証情報が存在するか
    error?: AuthModeValidationError; // エラー詳細（無効時のみ）
    tokenInfo?: {                  // トークン情報（サブスクリプション時のみ）
      expiresAt?: number;          // 有効期限（Unixタイムスタンプ秒）
      isExpired: boolean;          // 期限切れかどうか
      needsRefresh: boolean;       // リフレッシュが必要か
    };
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**検証内容**:
| 認証方式 | 検証項目 |
| -------------- | ------------------------------------------------ |
| api-key | キー存在確認、フォーマット検証（`sk-ant-api03-`） |
| subscription | Keychain存在確認、トークン有効期限検証 |

---

### auth-mode:changed (Main → Renderer)

**目的**: 認証方式が変更されたことをRendererに通知する

**Payload**:

```typescript
interface AuthModeChangedEvent {
  previousMode: AuthMode; // 変更前の認証方式
  currentMode: AuthMode; // 変更後の認証方式
  timestamp: number; // 変更日時（Unixタイムスタンプ秒）
  isAuthenticated: boolean; // 新しいモードで認証済みか
}
```

**使用例**:

```typescript
// Renderer側 - Preload経由で登録
window.api.authMode.onChanged((event) => {
  console.log(
    `Auth mode changed: ${event.previousMode} -> ${event.currentMode}`,
  );
  // UIを更新
});
```

---

## 型定義

### AuthMode

```typescript
/**
 * 認証方式
 * - subscription: Claude サブスクリプション（macOS Keychain経由）
 * - api-key: Anthropic API Key（electron-store + safeStorage）
 */
export type AuthMode = "subscription" | "api-key";
```

### AuthModeStatus

```typescript
/**
 * 認証方式の状態
 */
export interface AuthModeStatus {
  /** 現在の認証方式 */
  mode: AuthMode;
  /** 認証済みかどうか（トークン/キーが有効） */
  isAuthenticated: boolean;
  /** 認証情報が存在するか */
  hasCredentials: boolean;
  /** トークン有効期限（サブスクリプション時、Unixタイムスタンプ秒） */
  tokenExpiresAt?: number;
  /** 最終検証日時（Unixタイムスタンプ秒） */
  lastValidatedAt?: number;
  /** 認証エラー情報（エラー時のみ） */
  error?: AuthModeStatusError;
}
```

### AuthModeStatusError

```typescript
/**
 * 認証状態エラー
 */
export interface AuthModeStatusError {
  /** エラーコード */
  code: AuthModeErrorCode;
  /** ユーザー向けメッセージ */
  message: string;
  /** 復旧ガイダンス（任意） */
  guidance?: string;
}
```

### AuthModeValidationResult

```typescript
/**
 * 認証方式バリデーション結果
 */
export interface AuthModeValidationResult {
  /** 認証情報が有効か */
  isValid: boolean;
  /** 検証した認証方式 */
  mode: AuthMode;
  /** 認証情報が存在するか */
  hasCredentials: boolean;
  /** エラー詳細（無効時のみ） */
  error?: AuthModeValidationError;
  /** トークン情報（サブスクリプション時のみ） */
  tokenInfo?: TokenInfo;
}
```

### AuthModeValidationError

```typescript
/**
 * バリデーションエラー
 */
export interface AuthModeValidationError {
  /** エラーコード */
  code: AuthModeErrorCode;
  /** ユーザー向けメッセージ */
  message: string;
  /** 復旧ガイダンス */
  guidance: string;
}
```

### TokenInfo

```typescript
/**
 * トークン情報（サブスクリプション認証時）
 */
export interface TokenInfo {
  /** 有効期限（Unixタイムスタンプ秒） */
  expiresAt?: number;
  /** 期限切れかどうか */
  isExpired: boolean;
  /** リフレッシュが必要か */
  needsRefresh: boolean;
}
```

### AuthModeChangedEvent

```typescript
/**
 * 認証方式変更イベント
 */
export interface AuthModeChangedEvent {
  /** 変更前の認証方式 */
  previousMode: AuthMode;
  /** 変更後の認証方式 */
  currentMode: AuthMode;
  /** 変更日時（Unixタイムスタンプ秒） */
  timestamp: number;
  /** 新しいモードで認証済みか */
  isAuthenticated: boolean;
}
```

---

## セキュリティ要件

### sender検証

すべてのIPCハンドラは `withValidation` ラッパーを使用してsender検証を行う。

```typescript
import { withValidation } from "../infrastructure/security/ipc-validator.js";

ipcMain.handle(
  IPC_CHANNELS.AUTH_MODE_GET,
  withValidation(
    IPC_CHANNELS.AUTH_MODE_GET,
    async (_event): Promise<IPCResponse<AuthMode>> => {
      // ハンドラ実装
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

### エラーサニタイズ

内部エラーメッセージは `sanitizeErrorMessage` を通じてサニタイズしてからRendererに送信する。

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    // 機密情報パターンを除去
    const sanitized = message
      .replace(/token=[\w.-]+/gi, "token=***")
      .replace(/key=[\w.-]+/gi, "key=***")
      .replace(/sk-ant-[\w-]+/gi, "sk-***");
    return sanitized;
  }
  return "An unknown error occurred";
}
```

### ホワイトリスト登録

新規チャンネルは `ALLOWED_INVOKE_CHANNELS` および `ALLOWED_ON_CHANNELS` に登録する。

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャンネル

  // Auth Mode operations (TASK-AUTH-MODE-SELECTION-001)
  AUTH_MODE_GET: "auth-mode:get",
  AUTH_MODE_SET: "auth-mode:set",
  AUTH_MODE_STATUS: "auth-mode:status",
  AUTH_MODE_VALIDATE: "auth-mode:validate",
  AUTH_MODE_CHANGED: "auth-mode:changed",
} as const;

// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル
  IPC_CHANNELS.AUTH_MODE_GET,
  IPC_CHANNELS.AUTH_MODE_SET,
  IPC_CHANNELS.AUTH_MODE_STATUS,
  IPC_CHANNELS.AUTH_MODE_VALIDATE,
];

// ALLOWED_ON_CHANNELS に追加
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存チャンネル
  IPC_CHANNELS.AUTH_MODE_CHANGED,
];
```

### 機密情報の取り扱い

| 項目                | 取り扱い                                     |
| ------------------- | -------------------------------------------- |
| APIキー             | Main Processでのみ保持、Rendererに送信しない |
| OAuthトークン       | Main Processでのみ保持、Rendererに送信しない |
| トークン有効期限    | Rendererに送信可（機密情報ではない）         |
| 認証状態（boolean） | Rendererに送信可                             |
| エラーメッセージ    | サニタイズ後にRendererに送信                 |

---

## エラーコード定義

### AUTH_MODE_ERROR_CODES

```typescript
/**
 * 認証方式関連エラーコード
 */
export const AUTH_MODE_ERROR_CODES = {
  // === バリデーションエラー (1000番台) ===
  /** 無効な認証方式が指定された */
  INVALID_MODE: "auth-mode/invalid-mode",

  // === 認証情報エラー (2000番台) ===
  /** 認証情報が存在しない */
  NO_CREDENTIALS: "auth-mode/no-credentials",
  /** APIキーが設定されていない */
  NO_API_KEY: "auth-mode/no-api-key",
  /** サブスクリプショントークンが存在しない */
  NO_SUBSCRIPTION_TOKEN: "auth-mode/no-subscription-token",
  /** APIキーのフォーマットが無効 */
  INVALID_API_KEY_FORMAT: "auth-mode/invalid-api-key-format",
  /** トークンのフォーマットが無効 */
  INVALID_TOKEN_FORMAT: "auth-mode/invalid-token-format",

  // === トークンエラー (3000番台) ===
  /** トークンが期限切れ */
  TOKEN_EXPIRED: "auth-mode/token-expired",
  /** トークンのリフレッシュが必要 */
  TOKEN_NEEDS_REFRESH: "auth-mode/token-needs-refresh",
  /** トークンのリフレッシュに失敗 */
  TOKEN_REFRESH_FAILED: "auth-mode/token-refresh-failed",

  // === Keychainエラー (4000番台) ===
  /** Keychainアクセスが拒否された */
  KEYCHAIN_ACCESS_DENIED: "auth-mode/keychain-access-denied",
  /** Keychainエントリが見つからない */
  KEYCHAIN_NOT_FOUND: "auth-mode/keychain-not-found",
  /** Keychainアクセスに失敗 */
  KEYCHAIN_ERROR: "auth-mode/keychain-error",

  // === ストレージエラー (5000番台) ===
  /** 設定の永続化に失敗 */
  STORAGE_FAILED: "auth-mode/storage-failed",
  /** 設定の読み込みに失敗 */
  STORAGE_READ_FAILED: "auth-mode/storage-read-failed",

  // === 内部エラー (9000番台) ===
  /** 不明なエラー */
  UNKNOWN_ERROR: "auth-mode/unknown-error",
} as const;

export type AuthModeErrorCode =
  (typeof AUTH_MODE_ERROR_CODES)[keyof typeof AUTH_MODE_ERROR_CODES];
```

### エラーコードとガイダンス

| エラーコード                       | ユーザー向けメッセージ                 | 復旧ガイダンス                                |
| ---------------------------------- | -------------------------------------- | --------------------------------------------- |
| `auth-mode/no-api-key`             | APIキーが設定されていません            | 設定画面でAPIキーを入力してください           |
| `auth-mode/no-subscription-token`  | サブスクリプションが見つかりません     | Claude Code CLIでログインしてください         |
| `auth-mode/invalid-api-key-format` | APIキーの形式が正しくありません        | `sk-ant-api03-`で始まるキーを入力してください |
| `auth-mode/token-expired`          | サブスクリプションの認証が切れています | Claude Code CLIで再ログインしてください       |
| `auth-mode/keychain-access-denied` | Keychainへのアクセスが拒否されました   | システム環境設定でアクセスを許可してください  |
| `auth-mode/keychain-not-found`     | Claude Codeの認証情報が見つかりません  | Claude Code CLIでログインしてください         |

---

## Preload API設計

### contextBridge 経由のAPI

```typescript
// apps/desktop/src/preload/authModeApi.ts

import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels";
import type {
  AuthMode,
  AuthModeStatus,
  AuthModeValidationResult,
  AuthModeChangedEvent,
  IPCResponse,
} from "@repo/shared/types/auth-mode";

export interface AuthModeAPI {
  /** 現在の認証方式を取得 */
  get: () => Promise<IPCResponse<AuthMode>>;
  /** 認証方式を設定 */
  set: (mode: AuthMode) => Promise<IPCResponse<void>>;
  /** 認証状態を取得 */
  getStatus: () => Promise<IPCResponse<AuthModeStatus>>;
  /** 認証方式を検証 */
  validate: (mode: AuthMode) => Promise<IPCResponse<AuthModeValidationResult>>;
  /** 認証方式変更イベントのリスナー登録 */
  onChanged: (callback: (event: AuthModeChangedEvent) => void) => () => void;
}

export const authModeApi: AuthModeAPI = {
  get: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_MODE_GET),

  set: (mode) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_MODE_SET, { mode }),

  getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_MODE_STATUS),

  validate: (mode) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_MODE_VALIDATE, { mode }),

  onChanged: (callback) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: AuthModeChangedEvent,
    ) => {
      callback(data);
    };
    ipcRenderer.on(IPC_CHANNELS.AUTH_MODE_CHANGED, handler);
    // クリーンアップ関数を返す
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.AUTH_MODE_CHANGED, handler);
    };
  },
};

// contextBridge で公開
contextBridge.exposeInMainWorld("api", {
  // ... 既存API
  authMode: authModeApi,
});
```

---

## シーケンス図

### 認証方式取得

```
Renderer                Preload                 Main
   |                       |                      |
   |-- get() ------------->|                      |
   |                       |-- invoke ----------->|
   |                       |                      |-- AuthModeService.getMode()
   |                       |                      |<- AuthMode
   |                       |<-- IPCResponse ------|
   |<-- IPCResponse -------|                      |
   |                       |                      |
```

### 認証方式設定

```
Renderer                Preload                 Main
   |                       |                      |
   |-- set(mode) --------->|                      |
   |                       |-- invoke ----------->|
   |                       |                      |-- AuthModeService.setMode()
   |                       |                      |-- electron-store.set()
   |                       |                      |-- webContents.send(changed)
   |                       |<-- IPCResponse ------|
   |<-- IPCResponse -------|                      |
   |                       |                      |
   |<-- onChanged ---------|<-- auth-mode:changed-|
   |                       |                      |
```

### 認証状態検証

```
Renderer                Preload                 Main
   |                       |                      |
   |-- validate(mode) ---->|                      |
   |                       |-- invoke ----------->|
   |                       |                      |-- if (mode === "subscription")
   |                       |                      |     SubscriptionAuthService.validate()
   |                       |                      |     keytar.getPassword()
   |                       |                      |   else
   |                       |                      |     AuthKeyService.validate()
   |                       |                      |<- ValidationResult
   |                       |<-- IPCResponse ------|
   |<-- IPCResponse -------|                      |
   |                       |                      |
```

---

## 関連ドキュメント

| ドキュメント      | パス                                                             |
| ----------------- | ---------------------------------------------------------------- |
| 型定義ファイル    | `outputs/phase-2/type-definitions.ts`                            |
| 要件定義書        | `outputs/phase-1/requirements-definition.md`                     |
| CLI認証調査結果   | `outputs/phase-1/cli-auth-investigation.md`                      |
| 既存IPCチャンネル | `apps/desktop/src/preload/channels.ts`                           |
| IPC検証モジュール | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` |
