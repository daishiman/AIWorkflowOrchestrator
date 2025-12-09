# IPC検証モジュール設計書

## 概要

| 項目           | 内容                                |
| -------------- | ----------------------------------- |
| ドキュメントID | DES-IPC                             |
| 対象タスク     | T-01-3: IPC検証設計                 |
| 作成日         | 2025-12-09                          |
| ステータス     | 完了                                |
| 要件定義書     | spec-ipc-validation-requirements.md |

## 設計目的

IPC通信の呼び出し元を検証する共通モジュールを設計し、不正なwebContentsからのAPI呼び出しを防止する。これにより、悪意のあるスクリプトやDevToolsからの不正アクセスを検出・拒否する。

## 現状のコード構造

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts
ipcMain.handle(
  IPC_CHANNELS.AUTH_LOGIN,
  async (
    _, // event は使用されていない（sender検証なし）
    { provider }: { provider: string },
  ): Promise<IPCResponse<void>> => {
    // ...
  },
);
```

### 問題点

1. `event.sender` の検証がない
2. 不正なウィンドウからのIPC呼び出しを検出できない
3. DevToolsからの呼び出しを防止できない
4. セキュリティログが出力されない

## ファイル構成

```
apps/desktop/src/main/
├── infrastructure/
│   └── security/
│       ├── index.ts                   # エクスポート
│       ├── csp.ts                     # CSPモジュール
│       ├── ipc-validator.ts           # IPC検証モジュール本体
│       └── ipc-validator.test.ts      # テストファイル
└── ipc/
    ├── authHandlers.ts                # IPC検証を統合
    └── profileHandlers.ts             # IPC検証を統合
```

## モジュールインターフェース

### 型定義

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.ts
import type { WebContents, BrowserWindow, IpcMainInvokeEvent } from "electron";

/**
 * IPC検証結果
 */
export interface IPCValidationResult {
  /** 検証成功かどうか */
  valid: boolean;
  /** 失敗時のエラーコード */
  errorCode?: "IPC_UNAUTHORIZED" | "IPC_FORBIDDEN";
  /** 失敗時のエラーメッセージ */
  errorMessage?: string;
  /** 呼び出し元のwebContents ID */
  webContentsId?: number;
  /** 呼び出し元のBrowserWindow ID */
  windowId?: number | null;
}

/**
 * IPC検証オプション
 */
export interface IPCValidationOptions {
  /** 許可されたBrowserWindowの取得関数 */
  getAllowedWindows: () => BrowserWindow[];
  /** ログ出力関数（オプション） */
  logger?: SecurityLogger;
}

/**
 * セキュリティログ出力インターフェース
 */
export interface SecurityLogger {
  warn: (message: string, details?: Record<string, unknown>) => void;
  error: (message: string, details?: Record<string, unknown>) => void;
}

/**
 * セキュリティログイベント
 */
export interface SecurityLogEvent {
  timestamp: string;
  level: "warn" | "error";
  category: "security";
  event: "ipc_validation_failed";
  details: {
    channel: string;
    webContentsId: number;
    windowId: number | null;
    reason: string;
  };
}
```

### 関数シグネチャ

```typescript
/**
 * IPC sender検証を実行
 *
 * @param event - IpcMainInvokeEvent
 * @param channel - IPC channel名（ログ用）
 * @param options - 検証オプション
 * @returns 検証結果
 */
export function validateIpcSender(
  event: IpcMainInvokeEvent,
  channel: string,
  options: IPCValidationOptions,
): IPCValidationResult;

/**
 * 検証結果をIPCResponseエラー形式に変換
 *
 * @param result - 検証結果
 * @returns IPCResponse形式のエラー
 */
export function toIPCValidationError(result: IPCValidationResult): {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

/**
 * IPC handler wrapper (検証付き)
 * 既存のhandlerをラップして検証を追加
 *
 * @param channel - IPC channel名
 * @param handler - 元のhandler関数
 * @param options - 検証オプション
 * @returns ラップされたhandler
 */
export function withValidation<T extends unknown[], R>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>,
  options: IPCValidationOptions,
): (
  event: IpcMainInvokeEvent,
  ...args: T
) => Promise<R | ReturnType<typeof toIPCValidationError>>;
```

## 実装詳細

### 検証ロジック

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.ts
import { BrowserWindow, type IpcMainInvokeEvent } from "electron";

export function validateIpcSender(
  event: IpcMainInvokeEvent,
  channel: string,
  options: IPCValidationOptions,
): IPCValidationResult {
  const sender = event.sender;
  const webContentsId = sender.id;

  // 1. webContentsからBrowserWindowを取得
  const sourceWindow = BrowserWindow.fromWebContents(sender);

  // 2. BrowserWindowが存在しない場合は拒否
  if (!sourceWindow) {
    const result: IPCValidationResult = {
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Unauthorized IPC call: no associated BrowserWindow",
      webContentsId,
      windowId: null,
    };

    logSecurityEvent(
      options.logger,
      channel,
      result,
      "No associated BrowserWindow found",
    );
    return result;
  }

  const windowId = sourceWindow.id;

  // 3. DevToolsからの呼び出しチェック
  // DevToolsのwebContentsはメインウィンドウとは異なるID
  if (sender.getType() === "webview" || sender.isDevToolsOpened()) {
    // DevToolsが開いている場合でも、メインウィンドウからの呼び出しは許可
    // ただし、DevTools自体のwebContentsからの呼び出しは拒否
    const isFromDevTools = sourceWindow.webContents.id !== webContentsId;

    if (isFromDevTools) {
      const result: IPCValidationResult = {
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "IPC call from DevTools is not allowed",
        webContentsId,
        windowId,
      };

      logSecurityEvent(options.logger, channel, result, "Call from DevTools");
      return result;
    }
  }

  // 4. 許可されたウィンドウリストとの照合
  const allowedWindows = options.getAllowedWindows();
  const isAllowed = allowedWindows.some((w) => w.id === windowId);

  if (!isAllowed) {
    const result: IPCValidationResult = {
      valid: false,
      errorCode: "IPC_FORBIDDEN",
      errorMessage: "IPC call from unauthorized window",
      webContentsId,
      windowId,
    };

    logSecurityEvent(
      options.logger,
      channel,
      result,
      "Window not in allowed list",
    );
    return result;
  }

  // 検証成功
  return {
    valid: true,
    webContentsId,
    windowId,
  };
}
```

### セキュリティログ出力

```typescript
function logSecurityEvent(
  logger: SecurityLogger | undefined,
  channel: string,
  result: IPCValidationResult,
  reason: string,
): void {
  if (!logger) return;

  const event: SecurityLogEvent = {
    timestamp: new Date().toISOString(),
    level: "warn",
    category: "security",
    event: "ipc_validation_failed",
    details: {
      channel,
      webContentsId: result.webContentsId ?? -1,
      windowId: result.windowId ?? null,
      reason,
    },
  };

  logger.warn(`[Security] IPC call rejected: ${channel}`, event.details);
}
```

### IPCResponseエラー変換

```typescript
export function toIPCValidationError(result: IPCValidationResult): {
  success: false;
  error: {
    code: string;
    message: string;
  };
} {
  return {
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  };
}
```

### Handler Wrapper

```typescript
export function withValidation<T extends unknown[], R>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>,
  options: IPCValidationOptions,
): (
  event: IpcMainInvokeEvent,
  ...args: T
) => Promise<R | ReturnType<typeof toIPCValidationError>> {
  return async (event, ...args) => {
    const validation = validateIpcSender(event, channel, options);

    if (!validation.valid) {
      return toIPCValidationError(validation);
    }

    return handler(event, ...args);
  };
}
```

## 既存handlersへの統合

### authHandlers.ts への統合

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts
import {
  withValidation,
  type IPCValidationOptions,
} from "../infrastructure/security";

export function registerAuthHandlers(
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
): void {
  // 検証オプション
  const validationOptions: IPCValidationOptions = {
    getAllowedWindows: () => [mainWindow],
    logger: console, // 本番では専用ロガーを使用
  };

  // auth:login
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGIN,
    withValidation(
      IPC_CHANNELS.AUTH_LOGIN,
      async (event, { provider }: { provider: string }) => {
        // 既存の処理
      },
      validationOptions,
    ),
  );

  // auth:logout
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGOUT,
    withValidation(
      IPC_CHANNELS.AUTH_LOGOUT,
      async () => {
        // 既存の処理
      },
      validationOptions,
    ),
  );

  // ... 他のハンドラーも同様
}
```

### profileHandlers.ts への統合

```typescript
// apps/desktop/src/main/ipc/profileHandlers.ts
import {
  withValidation,
  type IPCValidationOptions,
} from "../infrastructure/security";

export function registerProfileHandlers(
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  cache: ProfileCache,
): void {
  // 検証オプション
  const validationOptions: IPCValidationOptions = {
    getAllowedWindows: () => [mainWindow],
    logger: console,
  };

  // profile:update
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE,
    withValidation(
      IPC_CHANNELS.PROFILE_UPDATE,
      async (event, { updates }) => {
        // 既存の処理
      },
      validationOptions,
    ),
  );

  // ... 他のハンドラーも同様
}
```

## エクスポート構造

```typescript
// apps/desktop/src/main/infrastructure/security/index.ts

// CSPモジュール
export {
  generateCSP,
  getProductionDirectives,
  getDevelopmentDirectives,
  buildCSPString,
  type CSPOptions,
  type CSPDirective,
  type CSPDirectiveMap,
  type CSPResult,
} from "./csp.js";

// IPC検証モジュール
export {
  validateIpcSender,
  toIPCValidationError,
  withValidation,
  type IPCValidationResult,
  type IPCValidationOptions,
  type SecurityLogger,
  type SecurityLogEvent,
} from "./ipc-validator.js";
```

## テスト戦略

### モックの準備

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateIpcSender,
  toIPCValidationError,
  withValidation,
} from "./ipc-validator";

// Electronモジュールのモック
vi.mock("electron", () => ({
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// モックオブジェクト
const createMockEvent = (webContentsId: number, type = "window") => ({
  sender: {
    id: webContentsId,
    getType: () => type,
    isDevToolsOpened: () => false,
  },
});

const createMockWindow = (id: number, webContentsId: number) => ({
  id,
  webContents: {
    id: webContentsId,
  },
});
```

### テストケース

| テストID | シナリオ                           | 期待結果                    |
| -------- | ---------------------------------- | --------------------------- |
| IPC-U01  | 許可されたウィンドウからの呼び出し | valid: true                 |
| IPC-U02  | BrowserWindowが存在しない          | valid: false, UNAUTHORIZED  |
| IPC-U03  | 許可リストにないウィンドウ         | valid: false, FORBIDDEN     |
| IPC-U04  | DevToolsからの呼び出し             | valid: false, FORBIDDEN     |
| IPC-U05  | ログが正しく出力される             | logger.warnが呼ばれる       |
| IPC-U06  | withValidation検証失敗時           | IPCResponse形式でエラー返却 |
| IPC-U07  | withValidation検証成功時           | 元のhandlerが実行される     |

### テストコード例

```typescript
describe("validateIpcSender", () => {
  const mockLogger = {
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("許可されたウィンドウからの呼び出しは成功する", () => {
    const mockWindow = createMockWindow(1, 100);
    const mockEvent = createMockEvent(100);

    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
      mockWindow as never,
    );

    const result = validateIpcSender(mockEvent as never, "auth:login", {
      getAllowedWindows: () => [mockWindow as never],
      logger: mockLogger,
    });

    expect(result.valid).toBe(true);
    expect(result.windowId).toBe(1);
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it("BrowserWindowが存在しない場合は失敗する", () => {
    const mockEvent = createMockEvent(100);

    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

    const result = validateIpcSender(mockEvent as never, "auth:login", {
      getAllowedWindows: () => [],
      logger: mockLogger,
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("IPC_UNAUTHORIZED");
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("許可リストにないウィンドウからの呼び出しは失敗する", () => {
    const mockWindow = createMockWindow(1, 100);
    const otherWindow = createMockWindow(2, 200);
    const mockEvent = createMockEvent(100);

    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
      mockWindow as never,
    );

    const result = validateIpcSender(mockEvent as never, "auth:login", {
      getAllowedWindows: () => [otherWindow as never], // 別のウィンドウのみ許可
      logger: mockLogger,
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("IPC_FORBIDDEN");
  });
});

describe("toIPCValidationError", () => {
  it("IPCResponse形式のエラーを返す", () => {
    const result = toIPCValidationError({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Test error",
    });

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("IPC_UNAUTHORIZED");
    expect(result.error.message).toBe("Test error");
  });
});

describe("withValidation", () => {
  it("検証成功時は元のhandlerを実行する", async () => {
    const mockWindow = createMockWindow(1, 100);
    const mockEvent = createMockEvent(100);
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
      mockWindow as never,
    );

    const wrappedHandler = withValidation("auth:login", mockHandler, {
      getAllowedWindows: () => [mockWindow as never],
    });

    const result = await wrappedHandler(mockEvent as never, {
      provider: "google",
    });

    expect(mockHandler).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("検証失敗時はエラーを返す", async () => {
    const mockEvent = createMockEvent(100);
    const mockHandler = vi.fn();

    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

    const wrappedHandler = withValidation("auth:login", mockHandler, {
      getAllowedWindows: () => [],
    });

    const result = await wrappedHandler(mockEvent as never, {
      provider: "google",
    });

    expect(mockHandler).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      error: {
        code: "IPC_UNAUTHORIZED",
      },
    });
  });
});
```

## 適用対象チャネル

### Phase 1: 必須適用（認証関連）

| Channel名              | ハンドラーファイル   | 優先度 |
| ---------------------- | -------------------- | ------ |
| `auth:login`           | `authHandlers.ts`    | 必須   |
| `auth:logout`          | `authHandlers.ts`    | 必須   |
| `auth:get-session`     | `authHandlers.ts`    | 必須   |
| `auth:refresh`         | `authHandlers.ts`    | 必須   |
| `profile:get`          | `profileHandlers.ts` | 必須   |
| `profile:update`       | `profileHandlers.ts` | 必須   |
| `profile:linkProvider` | `profileHandlers.ts` | 必須   |

### Phase 2: 推奨適用

| Channel名              | ハンドラーファイル   | 優先度 |
| ---------------------- | -------------------- | ------ |
| `auth:check-online`    | `authHandlers.ts`    | 推奨   |
| `profile:getProviders` | `profileHandlers.ts` | 推奨   |

## セキュリティ考慮事項

### 検出可能な攻撃

| 攻撃パターン                    | 検出方法                      |
| ------------------------------- | ----------------------------- |
| 不正なwebContentsからの呼び出し | BrowserWindow.fromWebContents |
| DevToolsからの呼び出し          | sender.getType() + ID比較     |
| サブウィンドウからの呼び出し    | 許可リストとの照合            |

### 検出できない攻撃

| 攻撃パターン            | 対策                    |
| ----------------------- | ----------------------- |
| メインウィンドウ内のXSS | CSP、入力バリデーション |
| メモリ改ざん            | OSレベルのセキュリティ  |

## 完了条件

- [x] 検証関数のシグネチャが定義されている
- [x] 既存handlersへの統合方法が設計されている
- [x] エラー時のレスポンス形式が設計されている
- [x] ログ出力の形式が設計されている

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/spec-ipc-validation-requirements.md` - IPC検証要件定義
- `apps/desktop/src/main/ipc/authHandlers.ts` - 認証IPCハンドラー
- `apps/desktop/src/main/ipc/profileHandlers.ts` - プロフィールIPCハンドラー
- [Electron Security: IPC Validation](https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages)
