# 型定義設計書: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-07                               |
| Phase        | 2 (設計)                                 |
| ドキュメント | 型定義設計書                             |

---

## 1. 概要

認証キー管理基盤で使用する TypeScript 型定義を設計する。既存の型定義パターン（`AppError`、`InfrastructureError` 等）に準拠し、型安全性を確保する。

---

## 2. インターフェース定義

### 2.1 IAuthKeyService

**ファイル**: `apps/desktop/src/main/services/auth/IAuthKeyService.ts`

```typescript
/**
 * 認証キー管理サービスのインターフェース
 *
 * Anthropic API Key の設定・取得・検証・削除を提供する。
 * SkillExecutor はこのインターフェースに依存する（DIP）。
 */
export interface IAuthKeyService {
  /**
   * 認証キーを暗号化して保存
   *
   * @param key - Anthropic API Key
   * @throws AuthKeyValidationError - キーが不正な形式の場合
   */
  setKey(key: string): Promise<void>;

  /**
   * 認証キーを取得（復号済み）
   *
   * 取得優先順位:
   * 1. electron-store に保存されたキー
   * 2. ANTHROPIC_API_KEY 環境変数
   *
   * @returns 認証キー、未設定の場合は null
   */
  getKey(): Promise<string | null>;

  /**
   * 認証キーの存在確認
   *
   * @returns キーが設定されている場合 true
   */
  hasKey(): Promise<boolean>;

  /**
   * 認証キーを Anthropic API で検証
   *
   * @param key - 検証対象のキー
   * @returns 有効なキーの場合 true
   */
  validateKey(key: string): Promise<boolean>;

  /**
   * 認証キーを削除
   *
   * 保存されたキーとキャッシュを両方クリアする。
   */
  deleteKey(): Promise<void>;
}
```

### 2.2 IAuthKeyStorage

**ファイル**: `apps/desktop/src/main/infrastructure/authKeyStorage.ts`

```typescript
/**
 * 認証キーストレージのインターフェース
 *
 * safeStorage を使用した暗号化/復号と
 * electron-store を使用した永続化を提供する。
 */
export interface IAuthKeyStorage {
  /**
   * 認証キーを暗号化して保存
   *
   * @param key - 保存する認証キー
   * @throws EncryptionUnavailableError - 暗号化が利用不可の場合（本番環境）
   */
  store(key: string): Promise<void>;

  /**
   * 認証キーを取得（復号済み）
   *
   * @returns 復号された認証キー、未保存の場合は null
   */
  retrieve(): Promise<string | null>;

  /**
   * 認証キーを削除
   */
  delete(): Promise<void>;

  /**
   * 認証キーの存在確認
   *
   * @returns 保存されている場合 true
   */
  exists(): Promise<boolean>;
}
```

---

## 3. エラー型定義

### 3.1 エラーコード定数

**ファイル**: `packages/shared/src/types/auth-key.ts`

```typescript
/**
 * 認証キー関連のエラーコード
 *
 * - External Service Error 範囲 (3000-3999): SDK/API 関連
 * - Infrastructure Error 範囲 (4000-4999): インフラ関連
 */
export const AUTH_KEY_ERROR_CODES = {
  /** 認証キー未設定 (External Service Error) */
  NOT_SET: 3001,
  /** 認証キー無効 (External Service Error) */
  INVALID: 3002,
  /** 認証キーバリデーションエラー (External Service Error) */
  VALIDATION_FAILED: 3003,
  /** 暗号化不可 (Infrastructure Error) */
  ENCRYPTION_UNAVAILABLE: 4001,
} as const;

export type AuthKeyErrorCode =
  (typeof AUTH_KEY_ERROR_CODES)[keyof typeof AUTH_KEY_ERROR_CODES];
```

### 3.2 AuthKeyNotSetError

**ファイル**: `packages/shared/src/core/errors/AuthKeyError.ts`

```typescript
import { AppError } from "./AppError.js";
import { AUTH_KEY_ERROR_CODES } from "../../types/auth-key.js";

/**
 * 認証キー未設定エラー
 *
 * 認証キーが設定されていない状態で SDK を呼び出した場合にスローされる。
 */
export class AuthKeyNotSetError extends AppError {
  readonly code = "AUTH_KEY_NOT_SET";
  readonly statusCode = 400; // Bad Request (クライアント側の設定不足)
  readonly errorCode = AUTH_KEY_ERROR_CODES.NOT_SET; // 3001
  readonly isRetryable = false;

  constructor(message?: string) {
    super(
      message ??
        "Anthropic API Key is not configured. Please set it in Settings.",
    );
    this.name = "AuthKeyNotSetError";
    Object.setPrototypeOf(this, AuthKeyNotSetError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errorCode: this.errorCode,
      isRetryable: this.isRetryable,
    };
  }
}
```

### 3.3 AuthKeyInvalidError

```typescript
/**
 * 認証キー無効エラー
 *
 * Anthropic API で検証した結果、キーが無効だった場合にスローされる。
 */
export class AuthKeyInvalidError extends AppError {
  readonly code = "AUTH_KEY_INVALID";
  readonly statusCode = 401; // Unauthorized
  readonly errorCode = AUTH_KEY_ERROR_CODES.INVALID; // 3002
  readonly isRetryable = false;

  constructor(message?: string) {
    super(message ?? "The provided Anthropic API Key is invalid.");
    this.name = "AuthKeyInvalidError";
    Object.setPrototypeOf(this, AuthKeyInvalidError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errorCode: this.errorCode,
      isRetryable: this.isRetryable,
    };
  }
}
```

### 3.4 AuthKeyValidationError

```typescript
/**
 * 認証キーバリデーションエラー
 *
 * キーの形式が不正（空文字、長すぎるなど）な場合にスローされる。
 */
export class AuthKeyValidationError extends AppError {
  readonly code = "AUTH_KEY_VALIDATION_FAILED";
  readonly statusCode = 400; // Bad Request
  readonly errorCode = AUTH_KEY_ERROR_CODES.VALIDATION_FAILED; // 3003
  readonly isRetryable = false;

  constructor(
    message: string,
    readonly validationDetails?: string,
  ) {
    super(message);
    this.name = "AuthKeyValidationError";
    Object.setPrototypeOf(this, AuthKeyValidationError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errorCode: this.errorCode,
      isRetryable: this.isRetryable,
      validationDetails: this.validationDetails,
    };
  }
}
```

### 3.5 EncryptionUnavailableError

```typescript
/**
 * 暗号化不可エラー
 *
 * safeStorage が利用できない本番環境でスローされる。
 * Infrastructure Error として分類（インフラレベルの問題）。
 */
export class EncryptionUnavailableError extends AppError {
  readonly code = "ENCRYPTION_UNAVAILABLE";
  readonly statusCode = 500; // Internal Server Error
  readonly errorCode = AUTH_KEY_ERROR_CODES.ENCRYPTION_UNAVAILABLE; // 4001 (Infrastructure Error)
  readonly isRetryable = false;

  constructor(message?: string) {
    super(
      message ??
        "Secure storage encryption is not available. Cannot store API key securely.",
    );
    this.name = "EncryptionUnavailableError";
    Object.setPrototypeOf(this, EncryptionUnavailableError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errorCode: this.errorCode,
      isRetryable: this.isRetryable,
    };
  }
}
```

---

## 4. IPC 型定義

### 4.1 リクエスト/レスポンス型

**ファイル**: `packages/shared/src/types/auth-key.ts`

```typescript
/**
 * auth-key:set リクエスト
 */
export interface AuthKeySetRequest {
  /** Anthropic API Key */
  key: string;
}

/**
 * auth-key:set レスポンス
 */
export interface AuthKeySetResponse {
  success: boolean;
  error?: string;
}

/**
 * auth-key:exists レスポンス
 */
export interface AuthKeyExistsResponse {
  exists: boolean;
}

/**
 * auth-key:validate リクエスト
 */
export interface AuthKeyValidateRequest {
  /** 検証対象のキー */
  key: string;
}

/**
 * auth-key:validate レスポンス
 */
export interface AuthKeyValidateResponse {
  valid: boolean;
  error?: string;
}

/**
 * auth-key:delete レスポンス
 */
export interface AuthKeyDeleteResponse {
  success: boolean;
  error?: string;
}
```

### 4.2 Preload Bridge 型

**ファイル**: `apps/desktop/src/preload/types.ts`

```typescript
/**
 * 認証キー API（Preload Bridge 経由）
 */
export interface AuthKeyAPI {
  /**
   * 認証キーを設定
   */
  set(key: string): Promise<AuthKeySetResponse>;

  /**
   * 認証キーの存在確認
   */
  exists(): Promise<AuthKeyExistsResponse>;

  /**
   * 認証キーを検証
   */
  validate(key: string): Promise<AuthKeyValidateResponse>;

  /**
   * 認証キーを削除
   */
  delete(): Promise<AuthKeyDeleteResponse>;
}

/**
 * Electron API 拡張
 */
declare global {
  interface Window {
    electronAPI: {
      // ... 既存の API ...
      authKey: AuthKeyAPI;
    };
  }
}
```

---

## 5. ストレージ型定義

### 5.1 Store スキーマ

**ファイル**: `apps/desktop/src/main/infrastructure/authKeyStorage.ts`

```typescript
/**
 * auth-key-store のスキーマ
 */
export interface AuthKeyStoreSchema {
  /** Base64 エンコードされた暗号化済みキー */
  encryptedAuthKey?: string;
}

/**
 * ストレージ設定
 */
export interface AuthKeyStorageConfig {
  /** Store 名（デフォルト: "auth-key-store"） */
  storeName?: string;
  /** 暗号化キー（electron-store の encryptionKey） */
  encryptionKey?: string;
}
```

---

## 6. SkillExecutor 型拡張

### 6.1 コンストラクタ引数

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

```typescript
/**
 * SkillExecutor コンストラクタオプション
 *
 * 将来の拡張性のためにオプションオブジェクトパターンも用意
 */
export interface SkillExecutorOptions {
  mainWindow: BrowserWindow;
  permissionStore?: IPermissionStore;
  authKeyService?: IAuthKeyService;
}
```

### 6.2 SDKQueryOptions 拡張

```typescript
/**
 * SDK query() オプション（拡張）
 */
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "default" | "plan" | "bypassPermissions";
  signal?: AbortSignal;
  timeout?: number;
}

/**
 * SDK query() 呼び出し時の内部オプション
 */
interface InternalSDKQueryOptions extends SDKQueryOptions {
  /** Anthropic API Key（callSDKQuery 内部で追加） */
  apiKey: string;
}
```

---

## 7. 型エクスポート

### 7.1 packages/shared からのエクスポート

**ファイル**: `packages/shared/src/index.ts`

```typescript
// 認証キー関連
export * from "./types/auth-key.js";
export * from "./core/errors/AuthKeyError.js";
```

### 7.2 apps/desktop からのエクスポート

**ファイル**: `apps/desktop/src/main/services/auth/index.ts`

```typescript
export type { IAuthKeyService } from "./IAuthKeyService.js";
export { AuthKeyService } from "./AuthKeyService.js";
```

---

## 8. 型ガード

### 8.1 エラー型ガード

**ファイル**: `packages/shared/src/core/errors/guards.ts`

```typescript
import { AuthKeyNotSetError, AuthKeyInvalidError } from "./AuthKeyError.js";

/**
 * AuthKeyNotSetError の型ガード
 */
export function isAuthKeyNotSetError(
  error: unknown,
): error is AuthKeyNotSetError {
  return error instanceof AuthKeyNotSetError;
}

/**
 * AuthKeyInvalidError の型ガード
 */
export function isAuthKeyInvalidError(
  error: unknown,
): error is AuthKeyInvalidError {
  return error instanceof AuthKeyInvalidError;
}

/**
 * 認証キー関連エラーの型ガード
 */
export function isAuthKeyError(
  error: unknown,
): error is AuthKeyNotSetError | AuthKeyInvalidError {
  return isAuthKeyNotSetError(error) || isAuthKeyInvalidError(error);
}
```

---

## 9. バリデーションスキーマ

### 9.1 Zod スキーマ

**ファイル**: `packages/shared/src/types/auth-key.ts`

```typescript
import { z } from "zod";

/**
 * Anthropic API Key のバリデーションスキーマ
 *
 * フォーマット: "sk-ant-api03-" で始まる文字列
 */
export const anthropicApiKeySchema = z
  .string()
  .min(1, "API Key cannot be empty")
  .max(200, "API Key is too long")
  .regex(
    /^sk-ant-api\d{2}-[A-Za-z0-9_-]+$/,
    "Invalid Anthropic API Key format",
  );

/**
 * auth-key:set リクエストスキーマ
 */
export const authKeySetRequestSchema = z.object({
  key: anthropicApiKeySchema,
});

/**
 * auth-key:validate リクエストスキーマ
 */
export const authKeyValidateRequestSchema = z.object({
  key: anthropicApiKeySchema,
});
```

---

## 10. 定数定義

### 10.1 設定定数

**ファイル**: `apps/desktop/src/main/infrastructure/authKeyStorage.ts`

```typescript
/** 認証キー Store 名 */
export const AUTH_KEY_STORE_NAME = "auth-key-store";

/** 暗号化済みキーの Store キー */
export const ENCRYPTED_AUTH_KEY = "encryptedAuthKey";

/** 環境変数名 */
export const ENV_ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY";

/** キーの最大長 */
export const MAX_KEY_LENGTH = 200;
```
