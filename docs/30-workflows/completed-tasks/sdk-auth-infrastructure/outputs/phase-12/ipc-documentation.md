# IPC ドキュメント: 認証キー管理 API

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名 | Claude Agent SDK用認証キー管理基盤の構築 |
| Phase    | 12 (ドキュメント更新)                    |
| 作成日   | 2026-02-08                               |

---

## 1. 概要

認証キー管理のための IPC チャンネル定義とハンドラー仕様。Electron の Main Process と Renderer Process 間で認証キーの設定・検証・削除を安全に行うための API を提供する。

### 1.1 セキュリティ原則

- **認証キーは Main Process のみで扱う**: Renderer に送信しない
- **チャンネル名はホワイトリスト管理**: 定数として定義
- **全ハンドラーで sender 検証**: 不正なウィンドウからのリクエストを拒否
- **ログサニタイズ**: 認証キーをログに出力しない

---

## 2. チャンネル定義

### 2.1 AUTH_KEY_CHANNELS

```typescript
export const AUTH_KEY_CHANNELS = {
  /** 認証キーを設定 (Renderer → Main) */
  SET: "auth-key:set",

  /** 認証キーの存在確認 (Renderer → Main) */
  EXISTS: "auth-key:exists",

  /** 認証キーを検証 (Renderer → Main) */
  VALIDATE: "auth-key:validate",

  /** 認証キーを削除 (Renderer → Main) */
  DELETE: "auth-key:delete",
} as const;
```

### 2.2 チャンネル一覧

| チャンネル名        | 方向            | 認可 | 説明                       |
| ------------------- | --------------- | ---- | -------------------------- |
| `auth-key:set`      | Renderer → Main | 必須 | Anthropic API Key を設定   |
| `auth-key:exists`   | Renderer → Main | 必須 | キーが設定済みか確認       |
| `auth-key:validate` | Renderer → Main | 必須 | Anthropic API でキーを検証 |
| `auth-key:delete`   | Renderer → Main | 必須 | 設定済みキーを削除         |

**重要**: `auth-key:get` チャンネルは意図的に存在しません。

---

## 3. API リファレンス

### 3.1 auth-key:set

認証キーを暗号化して保存する。

#### リクエスト

```typescript
interface AuthKeySetRequest {
  /** Anthropic API Key */
  key: string;
}
```

#### レスポンス

```typescript
interface AuthKeySetResponse {
  /** 設定成功の場合 true */
  success: boolean;
  /** エラーメッセージ（失敗時のみ） */
  error?: string;
}
```

#### 使用例 (Renderer)

```typescript
const result = await window.electronAPI.authKey.set("sk-ant-api03-...");
if (result.success) {
  console.log("API Key saved successfully");
} else {
  console.error("Failed to save API Key:", result.error);
}
```

#### エラーケース

| 条件            | レスポンス                                       |
| --------------- | ------------------------------------------------ |
| sender 検証失敗 | `{ success: false, error: "Unauthorized" }`      |
| 空のキー        | `{ success: false, error: "Key is required" }`   |
| 形式不正        | `{ success: false, error: "Invalid format" }`    |
| 暗号化失敗      | `{ success: false, error: "Encryption failed" }` |

---

### 3.2 auth-key:exists

認証キーが設定されているかを確認する。

#### リクエスト

なし

#### レスポンス

```typescript
interface AuthKeyExistsResponse {
  /** キーが設定されている場合 true */
  exists: boolean;
}
```

#### 使用例 (Renderer)

```typescript
const { exists } = await window.electronAPI.authKey.exists();
if (exists) {
  console.log("API Key is configured");
} else {
  console.log("API Key is not configured");
}
```

#### 備考

- ストレージに保存されたキーと環境変数 `ANTHROPIC_API_KEY` の両方をチェック
- どちらかが設定されていれば `true` を返す

---

### 3.3 auth-key:validate

Anthropic API にリクエストを送信してキーの有効性を検証する。

#### リクエスト

```typescript
interface AuthKeyValidateRequest {
  /** 検証対象のキー */
  key: string;
}
```

#### レスポンス

```typescript
interface AuthKeyValidateResponse {
  /** 有効なキーの場合 true */
  valid: boolean;
  /** エラーメッセージ（無効時のみ） */
  error?: string;
}
```

#### 使用例 (Renderer)

```typescript
const { valid, error } =
  await window.electronAPI.authKey.validate("sk-ant-api03-...");
if (valid) {
  console.log("API Key is valid");
} else {
  console.error("API Key is invalid:", error);
}
```

#### 検証ロジック

1. Anthropic API (`/v1/messages`) にテストリクエストを送信
2. HTTP 401/403 以外のレスポンスは有効と判定
3. ネットワークエラーは検証失敗として扱う

#### 注意

- ネットワーク接続が必要
- 検証にはわずかな API 使用量が発生する可能性あり

---

### 3.4 auth-key:delete

保存された認証キーを削除する。

#### リクエスト

なし

#### レスポンス

```typescript
interface AuthKeyDeleteResponse {
  /** 削除成功の場合 true */
  success: boolean;
  /** エラーメッセージ（失敗時のみ） */
  error?: string;
}
```

#### 使用例 (Renderer)

```typescript
const { success, error } = await window.electronAPI.authKey.delete();
if (success) {
  console.log("API Key deleted successfully");
} else {
  console.error("Failed to delete API Key:", error);
}
```

#### 備考

- 冪等性あり: キー未設定状態で呼び出してもエラーにならない
- メモリキャッシュとストレージの両方からクリア

---

## 4. Preload Bridge

### 4.1 公開 API

```typescript
// window.electronAPI.authKey
interface AuthKeyAPI {
  /** 認証キーを設定 */
  set(key: string): Promise<AuthKeySetResponse>;

  /** 認証キーの存在確認 */
  exists(): Promise<AuthKeyExistsResponse>;

  /** 認証キーを検証 */
  validate(key: string): Promise<AuthKeyValidateResponse>;

  /** 認証キーを削除 */
  delete(): Promise<AuthKeyDeleteResponse>;
}
```

### 4.2 TypeScript 型定義

Renderer で使用する場合、グローバル型定義を拡張する:

```typescript
// src/types/electron.d.ts
interface AuthKeyAPI {
  set(key: string): Promise<AuthKeySetResponse>;
  exists(): Promise<AuthKeyExistsResponse>;
  validate(key: string): Promise<AuthKeyValidateResponse>;
  delete(): Promise<AuthKeyDeleteResponse>;
}

interface ElectronAPI {
  authKey: AuthKeyAPI;
  // ... other APIs
}

interface Window {
  electronAPI: ElectronAPI;
}
```

---

## 5. セキュリティ仕様

### 5.1 sender 検証

全ハンドラーで IPC 送信元を検証する:

```typescript
const validation = validateIpcSender(event.sender);
if (!validation.valid) {
  return { success: false, error: "Unauthorized" };
}
```

### 5.2 ログサニタイズ

認証キーがログに露出しないよう、エラーメッセージをサニタイズ:

```typescript
function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.replace(
        /sk-ant-api\d{2}-[A-Za-z0-9_-]+/g,
        "[REDACTED]",
      ),
    };
  }
  return { error: String(error) };
}
```

### 5.3 入力バリデーション

| チェック項目           | 条件                           |
| ---------------------- | ------------------------------ |
| 空チェック             | `!key` で拒否                  |
| 長さチェック           | `1 <= length <= 200`           |
| プレフィックスチェック | `/^sk-ant-api\d{2}-/` にマッチ |

---

## 6. エラーコード

| コード | 名称                   | 説明                 | リトライ |
| ------ | ---------------------- | -------------------- | -------- |
| 3001   | NOT_SET                | 認証キー未設定       | 不可     |
| 3002   | INVALID                | 認証キー無効         | 不可     |
| 3003   | VALIDATION_FAILED      | バリデーションエラー | 不可     |
| 3004   | NETWORK_ERROR          | ネットワークエラー   | 可能     |
| 4001   | ENCRYPTION_UNAVAILABLE | 暗号化不可           | 可能     |
| 4002   | STORAGE_ERROR          | ストレージエラー     | 可能     |

---

## 7. シーケンス図

### 7.1 認証キー設定フロー

```
Renderer                 Preload                  Main (Handler)           AuthKeyService
    │                        │                          │                        │
    │ authKey.set(key)       │                          │                        │
    │───────────────────────>│                          │                        │
    │                        │ invoke(SET, {key})       │                        │
    │                        │─────────────────────────>│                        │
    │                        │                          │ validateSender()       │
    │                        │                          │───────────────────────>│
    │                        │                          │                        │
    │                        │                          │ setKey(key)            │
    │                        │                          │───────────────────────>│
    │                        │                          │                        │
    │                        │                          │<──────── void ─────────│
    │                        │<───── {success: true} ──│                        │
    │<─── Promise<Response> ─│                          │                        │
```

---

## 8. 関連ファイル

| カテゴリ       | ファイルパス                                            |
| -------------- | ------------------------------------------------------- |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`                  |
| IPC ハンドラー | `apps/desktop/src/main/ipc/authKeyHandlers.ts`          |
| Preload API    | `apps/desktop/src/preload/authKeyApi.ts`                |
| 型定義         | `apps/desktop/src/main/services/auth/types.ts`          |
| サービス実装   | `apps/desktop/src/main/services/auth/AuthKeyService.ts` |
