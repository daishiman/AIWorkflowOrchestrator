# IPC 仕様書: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-07                               |
| Phase        | 2 (設計)                                 |
| ドキュメント | IPC 仕様書                               |

---

## 1. 概要

認証キー管理のための IPC チャンネル定義とハンドラー仕様を定義する。既存の IPC パターン（`authHandlers.ts`、`claude-cli/ipc-handler.ts`）に準拠する。

---

## 2. チャンネル定義

### 2.1 AUTH_KEY_CHANNELS

**ファイル**: `packages/shared/src/ipc/channels.ts`

```typescript
/**
 * 認証キー管理関連の IPC チャネル
 */
export const AUTH_KEY_CHANNELS = {
  /**
   * 認証キーを設定
   * @direction Renderer → Main
   */
  SET: "auth-key:set",

  /**
   * 認証キーの存在確認
   * @direction Renderer → Main
   */
  EXISTS: "auth-key:exists",

  /**
   * 認証キーを検証
   * @direction Renderer → Main
   */
  VALIDATE: "auth-key:validate",

  /**
   * 認証キーを削除
   * @direction Renderer → Main
   */
  DELETE: "auth-key:delete",
} as const;

export type AuthKeyChannel =
  (typeof AUTH_KEY_CHANNELS)[keyof typeof AUTH_KEY_CHANNELS];
```

### 2.2 IPC_CHANNELS への統合

```typescript
/**
 * すべての IPC チャネル定数
 */
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
  ...AUTH_KEY_CHANNELS, // 新規追加
} as const;
```

---

## 3. ハンドラー仕様

### 3.1 auth-key:set

| 項目       | 内容                |
| ---------- | ------------------- |
| チャンネル | `auth-key:set`      |
| 方向       | Renderer → Main     |
| メソッド   | `ipcMain.handle`    |
| 認可       | 必須（sender 検証） |

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

#### 処理フロー

```
1. validateIpcSender(event.sender)
   └─ 失敗: { success: false, error: "IPC validation failed" }

2. バリデーション（authKeySetRequestSchema.parse）
   └─ 失敗: { success: false, error: "Invalid API key format" }

3. authKeyService.setKey(key)
   └─ 成功: { success: true }
   └─ 失敗: { success: false, error: error.message }
```

#### エラーケース

| ケース             | レスポンス                                       |
| ------------------ | ------------------------------------------------ |
| sender 検証失敗    | `{ success: false, error: "Unauthorized" }`      |
| 空のキー           | `{ success: false, error: "Key is required" }`   |
| 形式不正           | `{ success: false, error: "Invalid format" }`    |
| 暗号化失敗（本番） | `{ success: false, error: "Encryption failed" }` |

---

### 3.2 auth-key:exists

| 項目       | 内容                |
| ---------- | ------------------- |
| チャンネル | `auth-key:exists`   |
| 方向       | Renderer → Main     |
| メソッド   | `ipcMain.handle`    |
| 認可       | 必須（sender 検証） |

#### リクエスト

なし（引数不要）

#### レスポンス

```typescript
interface AuthKeyExistsResponse {
  /** キーが設定されている場合 true */
  exists: boolean;
}
```

#### 処理フロー

```
1. validateIpcSender(event.sender)
   └─ 失敗: throw new Error("Unauthorized")

2. authKeyService.hasKey()
   └─ 成功: { exists: true/false }
```

#### セキュリティ考慮

- レスポンスにキーの値を含めない
- 環境変数のキーも存在確認の対象に含める

---

### 3.3 auth-key:validate

| 項目       | 内容                |
| ---------- | ------------------- |
| チャンネル | `auth-key:validate` |
| 方向       | Renderer → Main     |
| メソッド   | `ipcMain.handle`    |
| 認可       | 必須（sender 検証） |

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

#### 処理フロー

```
1. validateIpcSender(event.sender)
   └─ 失敗: throw new Error("Unauthorized")

2. バリデーション（authKeyValidateRequestSchema.parse）
   └─ 失敗: { valid: false, error: "Invalid format" }

3. authKeyService.validateKey(key)
   └─ 成功: { valid: true }
   └─ 失敗: { valid: false, error: "Invalid API key" }
```

#### Anthropic API 検証

```typescript
// AuthKeyService.validateKey() の実装
async validateKey(key: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      }),
    });

    // 401/403 以外は有効なキーとみなす
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    // ネットワークエラーは検証失敗として扱う
    return false;
  }
}
```

---

### 3.4 auth-key:delete

| 項目       | 内容                |
| ---------- | ------------------- |
| チャンネル | `auth-key:delete`   |
| 方向       | Renderer → Main     |
| メソッド   | `ipcMain.handle`    |
| 認可       | 必須（sender 検証） |

#### リクエスト

なし（引数不要）

#### レスポンス

```typescript
interface AuthKeyDeleteResponse {
  /** 削除成功の場合 true */
  success: boolean;
  /** エラーメッセージ（失敗時のみ） */
  error?: string;
}
```

#### 処理フロー

```
1. validateIpcSender(event.sender)
   └─ 失敗: throw new Error("Unauthorized")

2. authKeyService.deleteKey()
   └─ 成功: { success: true }
   └─ 失敗: { success: false, error: error.message }
```

---

## 4. ハンドラー実装

### 4.1 registerAuthKeyHandlers

**ファイル**: `apps/desktop/src/main/ipc/authKeyHandlers.ts`

```typescript
import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { validateIpcSender } from "../infrastructure/security/ipc-validator";
import { AUTH_KEY_CHANNELS } from "@repo/shared/src/ipc/channels";
import {
  authKeySetRequestSchema,
  authKeyValidateRequestSchema,
} from "@repo/shared/src/types/auth-key";
import type { IAuthKeyService } from "../services/auth/IAuthKeyService";
import type {
  AuthKeySetResponse,
  AuthKeyExistsResponse,
  AuthKeyValidateResponse,
  AuthKeyDeleteResponse,
} from "@repo/shared/src/types/auth-key";

/**
 * 認証キー IPC ハンドラーを登録
 *
 * @param authKeyService - 認証キー管理サービス
 */
export function registerAuthKeyHandlers(authKeyService: IAuthKeyService): void {
  // auth-key:set
  ipcMain.handle(
    AUTH_KEY_CHANNELS.SET,
    async (
      event: IpcMainInvokeEvent,
      request: unknown,
    ): Promise<AuthKeySetResponse> => {
      // sender 検証
      const validation = validateIpcSender(event.sender);
      if (!validation.valid) {
        return { success: false, error: "Unauthorized" };
      }

      try {
        // リクエストバリデーション
        const parsed = authKeySetRequestSchema.parse(request);

        // キー設定
        await authKeyService.setKey(parsed.key);

        return { success: true };
      } catch (error) {
        console.error("[AuthKeyHandlers] setKey error:", sanitizeError(error));
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // auth-key:exists
  ipcMain.handle(
    AUTH_KEY_CHANNELS.EXISTS,
    async (event: IpcMainInvokeEvent): Promise<AuthKeyExistsResponse> => {
      const validation = validateIpcSender(event.sender);
      if (!validation.valid) {
        throw new Error("Unauthorized");
      }

      const exists = await authKeyService.hasKey();
      return { exists };
    },
  );

  // auth-key:validate
  ipcMain.handle(
    AUTH_KEY_CHANNELS.VALIDATE,
    async (
      event: IpcMainInvokeEvent,
      request: unknown,
    ): Promise<AuthKeyValidateResponse> => {
      const validation = validateIpcSender(event.sender);
      if (!validation.valid) {
        throw new Error("Unauthorized");
      }

      try {
        const parsed = authKeyValidateRequestSchema.parse(request);
        const valid = await authKeyService.validateKey(parsed.key);
        return { valid };
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : "Validation failed",
        };
      }
    },
  );

  // auth-key:delete
  ipcMain.handle(
    AUTH_KEY_CHANNELS.DELETE,
    async (event: IpcMainInvokeEvent): Promise<AuthKeyDeleteResponse> => {
      const validation = validateIpcSender(event.sender);
      if (!validation.valid) {
        throw new Error("Unauthorized");
      }

      try {
        await authKeyService.deleteKey();
        return { success: true };
      } catch (error) {
        console.error(
          "[AuthKeyHandlers] deleteKey error:",
          sanitizeError(error),
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}

/**
 * 認証キー IPC ハンドラーを解除
 */
export function unregisterAuthKeyHandlers(): void {
  ipcMain.removeHandler(AUTH_KEY_CHANNELS.SET);
  ipcMain.removeHandler(AUTH_KEY_CHANNELS.EXISTS);
  ipcMain.removeHandler(AUTH_KEY_CHANNELS.VALIDATE);
  ipcMain.removeHandler(AUTH_KEY_CHANNELS.DELETE);
}

/**
 * エラーをサニタイズ（認証キーを除去）
 */
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

---

## 5. Preload Bridge 拡張

### 5.1 contextBridge 設定

**ファイル**: `apps/desktop/src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";
import { AUTH_KEY_CHANNELS } from "@repo/shared/src/ipc/channels";
import type {
  AuthKeySetResponse,
  AuthKeyExistsResponse,
  AuthKeyValidateResponse,
  AuthKeyDeleteResponse,
} from "@repo/shared/src/types/auth-key";

// 既存の electronAPI に追加
contextBridge.exposeInMainWorld("electronAPI", {
  // ... 既存の API ...

  /**
   * 認証キー管理 API
   */
  authKey: {
    /**
     * 認証キーを設定
     */
    set: (key: string): Promise<AuthKeySetResponse> =>
      ipcRenderer.invoke(AUTH_KEY_CHANNELS.SET, { key }),

    /**
     * 認証キーの存在確認
     */
    exists: (): Promise<AuthKeyExistsResponse> =>
      ipcRenderer.invoke(AUTH_KEY_CHANNELS.EXISTS),

    /**
     * 認証キーを検証
     */
    validate: (key: string): Promise<AuthKeyValidateResponse> =>
      ipcRenderer.invoke(AUTH_KEY_CHANNELS.VALIDATE, { key }),

    /**
     * 認証キーを削除
     */
    delete: (): Promise<AuthKeyDeleteResponse> =>
      ipcRenderer.invoke(AUTH_KEY_CHANNELS.DELETE),
  },
});
```

---

## 6. ハンドラー登録

### 6.1 registerAllIpcHandlers への統合

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

```typescript
import { registerAuthKeyHandlers } from "./authKeyHandlers";
import { AuthKeyService } from "../services/auth/AuthKeyService";
import { createAuthKeyStorage } from "../infrastructure/authKeyStorage";

/**
 * 全 IPC ハンドラーを登録
 */
export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // 既存のハンドラー登録
  // ...

  // 認証キーハンドラー登録
  const authKeyStorage = createAuthKeyStorage();
  const authKeyService = new AuthKeyService(authKeyStorage);
  registerAuthKeyHandlers(authKeyService);
}
```

---

## 7. セキュリティ仕様

### 7.1 sender 検証

全ハンドラーで `validateIpcSender()` を呼び出し、不正なウィンドウからのリクエストを拒否する。

```typescript
const validation = validateIpcSender(event.sender);
if (!validation.valid) {
  throw new Error("Unauthorized");
  // または { success: false, error: "Unauthorized" }
}
```

### 7.2 認証キーの非公開

- `auth-key:get` チャンネルは存在しない
- レスポンスに認証キーの値を含めない
- エラーメッセージから認証キーをサニタイズ

### 7.3 ログ除外

```typescript
// ログ出力時に認証キーをサニタイズ
const sanitizedMessage = message.replace(
  /sk-ant-api\d{2}-[A-Za-z0-9_-]+/g,
  "[REDACTED]",
);
console.log(sanitizedMessage);
```

---

## 8. エラーハンドリング

### 8.1 エラーレスポンス形式

| フィールド | 型      | 説明                       |
| ---------- | ------- | -------------------------- |
| success    | boolean | 成功/失敗                  |
| error      | string? | エラーメッセージ（失敗時） |

### 8.2 エラーコードマッピング

| エラー種別           | レスポンス                                   |
| -------------------- | -------------------------------------------- |
| sender 検証失敗      | `{ success: false, error: "Unauthorized" }`  |
| バリデーションエラー | `{ success: false, error: "..." }`           |
| サービスエラー       | `{ success: false, error: "..." }`           |
| 不明なエラー         | `{ success: false, error: "Unknown error" }` |

---

## 9. テスト仕様

### 9.1 ユニットテスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`

```typescript
describe("authKeyHandlers", () => {
  describe("auth-key:set", () => {
    it("should set key with valid input", async () => {
      // ...
    });

    it("should reject unauthorized sender", async () => {
      // ...
    });

    it("should reject empty key", async () => {
      // ...
    });
  });

  describe("auth-key:exists", () => {
    it("should return true when key exists", async () => {
      // ...
    });

    it("should return false when key does not exist", async () => {
      // ...
    });
  });

  // ...
});
```

### 9.2 統合テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.integration.test.ts`

```typescript
describe("authKeyHandlers integration", () => {
  it("should set and verify key existence", async () => {
    // 1. auth-key:set でキー設定
    // 2. auth-key:exists で存在確認
    // 3. auth-key:delete で削除
    // 4. auth-key:exists で削除確認
  });
});
```

---

## 10. シーケンス図

### 10.1 認証キー設定フロー

```
┌──────────┐          ┌──────────┐          ┌──────────────┐          ┌────────────┐
│ Settings │          │  Preload │          │ AuthKeyHandlers │        │ AuthKeyService │
│    UI    │          │  Bridge  │          │               │          │              │
└────┬─────┘          └────┬─────┘          └───────┬───────┘          └──────┬───────┘
     │                     │                        │                         │
     │ set(key)            │                        │                         │
     │────────────────────>│                        │                         │
     │                     │ invoke('auth-key:set') │                         │
     │                     │───────────────────────>│                         │
     │                     │                        │                         │
     │                     │                        │ validateIpcSender()     │
     │                     │                        │─────────────────────────│
     │                     │                        │                         │
     │                     │                        │ setKey(key)             │
     │                     │                        │────────────────────────>│
     │                     │                        │                         │
     │                     │                        │                         │ encrypt & store
     │                     │                        │                         │──────────────
     │                     │                        │                         │
     │                     │                        │       { success: true } │
     │                     │                        │<────────────────────────│
     │                     │  { success: true }     │                         │
     │                     │<───────────────────────│                         │
     │  Promise resolved   │                        │                         │
     │<────────────────────│                        │                         │
     │                     │                        │                         │
```
