# LLM IPCハンドラー設計

## 文書情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001             |
| Phase      | 2                                       |
| 作成日     | 2026-01-09                              |
| 使用スキル | electron-ipc-patterns                   |
| 配置先     | `apps/desktop/src/main/handlers/llm.ts` |

---

## 1. IPCチャンネル定義

### 1.1 既存チャンネル（channels.ts）

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // LLM operations
  LLM_GET_PROVIDERS: "llm:get-providers",
  LLM_CHECK_HEALTH: "llm:check-health",
} as const;
```

### 1.2 追加チャンネル

以下のチャンネルを `channels.ts` に追加:

```typescript
// LLM operations (追加)
LLM_SEND_CHAT: "llm:send-chat",
LLM_STREAM_CHAT: "llm:stream-chat",
LLM_STREAM_CHUNK: "llm:stream-chunk",  // event channel
LLM_STREAM_END: "llm:stream-end",      // event channel
LLM_STREAM_ERROR: "llm:stream-error",  // event channel
```

### 1.3 ホワイトリスト更新

```typescript
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存 ...
  IPC_CHANNELS.LLM_GET_PROVIDERS,
  IPC_CHANNELS.LLM_CHECK_HEALTH,
  IPC_CHANNELS.LLM_SEND_CHAT, // 追加
  IPC_CHANNELS.LLM_STREAM_CHAT, // 追加
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存 ...
  IPC_CHANNELS.LLM_STREAM_CHUNK, // 追加
  IPC_CHANNELS.LLM_STREAM_END, // 追加
  IPC_CHANNELS.LLM_STREAM_ERROR, // 追加
];
```

---

## 2. Preload API拡張

### 2.1 型定義

```typescript
// apps/desktop/src/preload/types.ts
import type {
  LLMProvider,
  LLMProviderId,
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

export interface StreamChunk {
  /** チャンクID */
  id: string;
  /** 差分コンテンツ */
  delta: string;
  /** 完了フラグ */
  done: boolean;
  /** メタデータ */
  metadata?: {
    model?: string;
    finishReason?: string;
  };
}

export interface LLMPreloadAPI {
  /** プロバイダー一覧取得 */
  getProviders: () => Promise<LLMProvider[]>;

  /** ヘルスチェック */
  checkHealth: (providerId: LLMProviderId) => Promise<HealthCheckResult>;

  /** チャット送信（非ストリーミング） */
  sendChat: (request: LLMChatRequest) => Promise<LLMChatResponse>;

  /** ストリーミングチャット開始 */
  streamChat: (request: LLMChatRequest) => Promise<string>; // returns streamId

  /** ストリームチャンク購読 */
  onStreamChunk: (callback: (chunk: StreamChunk) => void) => () => void;

  /** ストリーム完了購読 */
  onStreamEnd: (callback: (streamId: string) => void) => () => void;

  /** ストリームエラー購読 */
  onStreamError: (callback: (error: LLMError) => void) => () => void;
}
```

### 2.2 Preload実装

```typescript
// apps/desktop/src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels";
import type { LLMPreloadAPI, StreamChunk } from "./types";

const llmAPI: LLMPreloadAPI = {
  getProviders: () => ipcRenderer.invoke(IPC_CHANNELS.LLM_GET_PROVIDERS),

  checkHealth: (providerId) =>
    ipcRenderer.invoke(IPC_CHANNELS.LLM_CHECK_HEALTH, providerId),

  sendChat: (request) =>
    ipcRenderer.invoke(IPC_CHANNELS.LLM_SEND_CHAT, request),

  streamChat: (request) =>
    ipcRenderer.invoke(IPC_CHANNELS.LLM_STREAM_CHAT, request),

  onStreamChunk: (callback) => {
    const handler = (_event: IpcRendererEvent, chunk: StreamChunk) => {
      callback(chunk);
    };
    ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_CHUNK, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.LLM_STREAM_CHUNK, handler);
    };
  },

  onStreamEnd: (callback) => {
    const handler = (_event: IpcRendererEvent, streamId: string) => {
      callback(streamId);
    };
    ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_END, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.LLM_STREAM_END, handler);
    };
  },

  onStreamError: (callback) => {
    const handler = (_event: IpcRendererEvent, error: LLMError) => {
      callback(error);
    };
    ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_ERROR, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.LLM_STREAM_ERROR, handler);
    };
  },
};

contextBridge.exposeInMainWorld("electronAPI", {
  // ... 既存API ...
  llm: llmAPI,
});
```

---

## 3. Main Process ハンドラー

### 3.1 ファイル構成

```
apps/desktop/src/main/handlers/
├── index.ts           # ハンドラー登録
└── llm.ts             # LLMハンドラー
```

### 3.2 ハンドラー実装

```typescript
// apps/desktop/src/main/handlers/llm.ts
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  LLMProviderSchema,
  LLMChatRequestSchema,
  HealthCheckResultSchema,
  LLMErrorSchema,
} from "@repo/shared/types/llm/schemas";
import type {
  LLMProvider,
  LLMProviderId,
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
  LLMError,
} from "@repo/shared/types/llm/schemas";
import { LLMAdapterFactory } from "../adapters/llm/factory";
import { ProviderConfigService } from "../services/provider-config";

/**
 * LLM IPCハンドラーを登録
 */
export function registerLLMHandlers(): void {
  // llm:get-providers
  ipcMain.handle(IPC_CHANNELS.LLM_GET_PROVIDERS, handleGetProviders);

  // llm:check-health
  ipcMain.handle(IPC_CHANNELS.LLM_CHECK_HEALTH, handleCheckHealth);

  // llm:send-chat
  ipcMain.handle(IPC_CHANNELS.LLM_SEND_CHAT, handleSendChat);

  // llm:stream-chat
  ipcMain.handle(IPC_CHANNELS.LLM_STREAM_CHAT, handleStreamChat);
}

/**
 * プロバイダー一覧取得ハンドラー
 */
async function handleGetProviders(
  _event: IpcMainInvokeEvent,
): Promise<LLMProvider[]> {
  try {
    const providers = await ProviderConfigService.getProviders();
    // Zodでバリデーション
    return providers.map((p) => LLMProviderSchema.parse(p));
  } catch (error) {
    console.error("[LLM] Failed to get providers:", error);
    throw createLLMError("UNKNOWN", "プロバイダー一覧の取得に失敗しました");
  }
}

/**
 * ヘルスチェックハンドラー
 */
async function handleCheckHealth(
  _event: IpcMainInvokeEvent,
  providerId: LLMProviderId,
): Promise<HealthCheckResult> {
  try {
    const adapter = LLMAdapterFactory.getAdapter(providerId);
    const result = await adapter.checkHealth();
    return HealthCheckResultSchema.parse(result);
  } catch (error) {
    console.error(`[LLM] Health check failed for ${providerId}:`, error);
    return {
      status: "error",
      providerId,
      errorMessage:
        error instanceof Error ? error.message : "ヘルスチェック失敗",
      checkedAt: new Date(),
    };
  }
}

/**
 * チャット送信ハンドラー（非ストリーミング）
 */
async function handleSendChat(
  _event: IpcMainInvokeEvent,
  request: LLMChatRequest,
): Promise<LLMChatResponse> {
  try {
    // リクエストバリデーション
    const validatedRequest = LLMChatRequestSchema.parse(request);

    // プロバイダーID取得（モデルIDからマッピング）
    const providerId = await ProviderConfigService.getProviderForModel(
      validatedRequest.modelId,
    );

    // アダプター取得
    const adapter = LLMAdapterFactory.getAdapter(providerId);

    // チャット送信
    const response = await adapter.sendChat(validatedRequest);

    return response;
  } catch (error) {
    console.error("[LLM] Chat failed:", error);

    if (isLLMError(error)) {
      return { success: false, error };
    }

    return {
      success: false,
      error: createLLMError(
        "UNKNOWN",
        error instanceof Error ? error.message : "チャット送信に失敗しました",
      ),
    };
  }
}

/**
 * ストリーミングチャットハンドラー
 */
async function handleStreamChat(
  event: IpcMainInvokeEvent,
  request: LLMChatRequest,
): Promise<string> {
  const streamId = generateStreamId();
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    throw createLLMError("UNKNOWN", "ウィンドウが見つかりません");
  }

  try {
    // リクエストバリデーション
    const validatedRequest = LLMChatRequestSchema.parse({
      ...request,
      stream: true,
    });

    // プロバイダーID取得
    const providerId = await ProviderConfigService.getProviderForModel(
      validatedRequest.modelId,
    );

    // アダプター取得
    const adapter = LLMAdapterFactory.getAdapter(providerId);

    // 非同期でストリーミング開始
    processStream(window, streamId, adapter, validatedRequest);

    return streamId;
  } catch (error) {
    console.error("[LLM] Stream chat failed:", error);
    throw error;
  }
}

/**
 * ストリーム処理（非同期）
 */
async function processStream(
  window: BrowserWindow,
  streamId: string,
  adapter: ILLMAdapter,
  request: LLMChatRequest,
): Promise<void> {
  try {
    const generator = adapter.streamChat(request);

    for await (const chunk of generator) {
      if (window.isDestroyed()) {
        break;
      }

      window.webContents.send(IPC_CHANNELS.LLM_STREAM_CHUNK, {
        id: streamId,
        delta: chunk.delta,
        done: chunk.done,
        metadata: chunk.metadata,
      });
    }

    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.LLM_STREAM_END, streamId);
    }
  } catch (error) {
    if (!window.isDestroyed()) {
      const llmError = isLLMError(error)
        ? error
        : createLLMError(
            "UNKNOWN",
            error instanceof Error ? error.message : "ストリーム処理に失敗",
          );

      window.webContents.send(IPC_CHANNELS.LLM_STREAM_ERROR, llmError);
    }
  }
}

// ヘルパー関数
function generateStreamId(): string {
  return `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createLLMError(
  code: LLMErrorCode,
  message: string,
  retryable = false,
): LLMError {
  return { code, message, retryable };
}

function isLLMError(error: unknown): error is LLMError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
```

---

## 4. ハンドラーシグネチャ

### 4.1 llm:get-providers

| 項目       | 内容                     |
| ---------- | ------------------------ |
| チャンネル | `llm:get-providers`      |
| 方向       | Renderer → Main          |
| 入力       | なし                     |
| 出力       | `Promise<LLMProvider[]>` |
| エラー     | throw (IPC error)        |

### 4.2 llm:check-health

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| チャンネル | `llm:check-health`               |
| 方向       | Renderer → Main                  |
| 入力       | `providerId: LLMProviderId`      |
| 出力       | `Promise<HealthCheckResult>`     |
| エラー     | HealthCheckResult.status="error" |

### 4.3 llm:send-chat

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| チャンネル | `llm:send-chat`               |
| 方向       | Renderer → Main               |
| 入力       | `request: LLMChatRequest`     |
| 出力       | `Promise<LLMChatResponse>`    |
| エラー     | LLMChatResponse.success=false |

### 4.4 llm:stream-chat

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| チャンネル | `llm:stream-chat`                 |
| 方向       | Renderer → Main (invoke)          |
| 入力       | `request: LLMChatRequest`         |
| 出力       | `Promise<string>` (streamId)      |
| 副作用     | llm:stream-chunk イベント送信開始 |

### 4.5 llm:stream-chunk (event)

| 項目       | 内容               |
| ---------- | ------------------ |
| チャンネル | `llm:stream-chunk` |
| 方向       | Main → Renderer    |
| ペイロード | `StreamChunk`      |

### 4.6 llm:stream-end (event)

| 項目       | 内容               |
| ---------- | ------------------ |
| チャンネル | `llm:stream-end`   |
| 方向       | Main → Renderer    |
| ペイロード | `streamId: string` |

### 4.7 llm:stream-error (event)

| 項目       | 内容               |
| ---------- | ------------------ |
| チャンネル | `llm:stream-error` |
| 方向       | Main → Renderer    |
| ペイロード | `LLMError`         |

---

## 5. バリデーション戦略

### 5.1 入力バリデーション

すべてのハンドラーでZodスキーマを使用:

```typescript
// リクエストバリデーション
const validatedRequest = LLMChatRequestSchema.parse(request);

// 失敗時は ZodError がスローされる
```

### 5.2 出力バリデーション

レスポンスもZodでバリデーション:

```typescript
// 出力バリデーション
return LLMProviderSchema.array().parse(providers);
```

---

## 6. エラーハンドリング

### 6.1 エラー変換

```typescript
try {
  // 処理
} catch (error) {
  // Zod エラー
  if (error instanceof ZodError) {
    return {
      success: false,
      error: createLLMError("UNKNOWN", "リクエストが不正です"),
    };
  }

  // LLMError（アダプターから）
  if (isLLMError(error)) {
    return { success: false, error };
  }

  // その他のエラー
  return {
    success: false,
    error: createLLMError(
      "UNKNOWN",
      error instanceof Error ? error.message : "不明なエラー",
    ),
  };
}
```

### 6.2 ログ出力

```typescript
console.error("[LLM] Operation failed:", {
  channel: "llm:send-chat",
  error: error.message,
  stack: error.stack,
});
```

---

## 7. セキュリティ考慮事項

### 7.1 チャンネルホワイトリスト

```typescript
// 許可されたチャンネルのみ処理
if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
  throw new Error(`Unauthorized channel: ${channel}`);
}
```

### 7.2 入力サニタイズ

```typescript
// XSS対策（メッセージ内容）
const sanitizedMessage = sanitizeInput(message);

// パストラバーサル対策（ファイルパス使用時）
// ※ 本タスクでは該当なし
```

### 7.3 APIキー保護

```typescript
// APIキーはMain Processでのみ使用
// Renderer Processには絶対に露出しない

const apiKey = await SecureStorage.get(`llm.${providerId}.apiKey`);
// ログにAPIキーを出力しない
console.log("[LLM] Using provider:", providerId); // ✓
console.log("[LLM] API Key:", apiKey); // ✗
```

---

## 8. テスト設計

### 8.1 ユニットテスト

```typescript
// apps/desktop/src/main/handlers/__tests__/llm.test.ts
describe("LLM Handlers", () => {
  describe("handleGetProviders", () => {
    it("プロバイダー一覧を返す", async () => {
      // ProviderConfigService をモック
      vi.mocked(ProviderConfigService.getProviders).mockResolvedValue([
        { id: "openai", name: "OpenAI", isAvailable: true, models: [...] },
      ]);

      const result = await handleGetProviders({} as IpcMainInvokeEvent);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("openai");
    });
  });

  describe("handleSendChat", () => {
    it("正常なリクエストで成功レスポンスを返す", async () => {
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          success: true,
          data: { content: "Hello!", ... },
        }),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockReturnValue(mockAdapter);

      const result = await handleSendChat(
        {} as IpcMainInvokeEvent,
        { messages: [...], modelId: "gpt-4o" }
      );

      expect(result.success).toBe(true);
    });

    it("バリデーションエラー時に失敗レスポンスを返す", async () => {
      const result = await handleSendChat(
        {} as IpcMainInvokeEvent,
        { messages: [], modelId: "" } // 無効
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN");
    });
  });
});
```

### 8.2 統合テスト

```typescript
describe("LLM IPC Integration", () => {
  it("Renderer → Main → Adapter の通信フロー", async () => {
    // Electron テスト環境で実行
    const providers = await window.electronAPI.llm.getProviders();
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
  });
});
```

---

## 9. ファイル構成

```
apps/desktop/src/
├── main/
│   └── handlers/
│       ├── index.ts           # ハンドラー登録エントリ
│       ├── llm.ts             # LLMハンドラー
│       └── __tests__/
│           └── llm.test.ts    # ハンドラーテスト
├── preload/
│   ├── channels.ts            # チャンネル定義（更新）
│   ├── index.ts               # Preload実装（更新）
│   └── types.ts               # 型定義（更新）
└── renderer/
    └── store/
        └── slices/
            └── llmSlice.ts    # 状態管理（既存）
```
