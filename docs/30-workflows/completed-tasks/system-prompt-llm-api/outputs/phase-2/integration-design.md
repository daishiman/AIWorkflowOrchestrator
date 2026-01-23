# 統合設計書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 2                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. 現在の実装分析

### 1.1 aiHandlers.ts（現在）

```typescript
// apps/desktop/src/main/ipc/aiHandlers.ts（抜粋）

ipcMain.handle(
  IPC_CHANNELS.AI_CHAT,
  async (_event, request: AIChatRequest): Promise<AIChatResponse> => {
    try {
      const conversationId = request.conversationId || generateConversationId();

      // 会話履歴に保存
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }
      conversations.get(conversationId)?.push(request.message);

      // システムプロンプトのログ出力
      if (request.systemPrompt) {
        console.log(
          `[AI_CHAT] System prompt provided (${request.systemPrompt.length} chars)`,
        );
      }

      // ★★★ モックレスポンス（削除対象）★★★
      const mockResponses = [
        "ご質問ありがとうございます...",
        // ...
      ];
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage = mockResponses[responseIndex];

      return {
        success: true,
        data: {
          message: aiMessage,
          conversationId,
          ragSources: request.ragEnabled
            ? ["docs/design.md", "docs/api.md"]
            : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
);
```

### 1.2 問題点

| 問題               | 影響                               |
| ------------------ | ---------------------------------- |
| モックレスポンス   | 実際のAI応答が返らない             |
| systemPrompt未使用 | システムプロンプト機能が動作しない |
| プロバイダー未連携 | 選択されたLLMが使用されない        |

---

## 2. 統合設計

### 2.1 更新後のaiHandlers.ts

```typescript
// apps/desktop/src/main/ipc/aiHandlers.ts（更新後）

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { AIChatRequest, AIChatResponse } from "../../preload/types";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { buildMessages } from "../utils/buildMessages";
import { getSelectedLLMConfig } from "./llmConfigProvider";
import type { LLMError, LLMProviderId } from "@repo/shared/types/llm/schemas";

// 会話ID生成（既存）
function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// エラーメッセージ変換
function convertLLMErrorToMessage(error: LLMError): string {
  const errorMessages: Record<string, string> = {
    API_KEY_MISSING:
      "APIキーが設定されていません。設定画面でAPIキーを登録してください。",
    API_KEY_INVALID: "APIキーが無効です。正しいAPIキーを設定してください。",
    NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
    TIMEOUT: "リクエストがタイムアウトしました。再度お試しください。",
    RATE_LIMIT:
      "APIのレート制限に達しました。しばらく待ってから再度お試しください。",
    MODEL_NOT_FOUND: "指定されたモデルが見つかりません。",
    SERVICE_UNAVAILABLE: "サービスが一時的に利用できません。",
  };
  return errorMessages[error.code] ?? error.message;
}

// LLMErrorか判定
function isLLMError(error: unknown): error is LLMError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "retryable" in error
  );
}

export function registerAIHandlers(): void {
  // Chat with AI
  ipcMain.handle(
    IPC_CHANNELS.AI_CHAT,
    async (_event, request: AIChatRequest): Promise<AIChatResponse> => {
      try {
        const conversationId =
          request.conversationId || generateConversationId();

        // 1. プロバイダー/モデル設定を取得
        const llmConfig = await getSelectedLLMConfig();
        if (!llmConfig) {
          return {
            success: false,
            error:
              "LLMプロバイダーが選択されていません。設定画面で選択してください。",
          };
        }

        // 2. メッセージ配列を構築
        const messages = buildMessages(request.message, request.systemPrompt);

        // 3. アダプターを取得
        let adapter;
        try {
          adapter = await LLMAdapterFactory.getAdapter(llmConfig.providerId);
        } catch (adapterError) {
          // APIキー未設定などのエラー
          return {
            success: false,
            error:
              adapterError instanceof Error
                ? adapterError.message
                : "アダプターの取得に失敗しました。",
          };
        }

        // 4. LLM APIを呼び出し
        const response = await adapter.sendChat({
          messages,
          modelId: llmConfig.modelId,
          providerId: llmConfig.providerId,
        });

        // 5. レスポンスを変換して返却
        return {
          success: true,
          data: {
            message: response.content,
            conversationId,
            ragSources: request.ragEnabled ? [] : undefined, // RAGは未実装
          },
        };
      } catch (error) {
        // エラーハンドリング
        if (isLLMError(error)) {
          return {
            success: false,
            error: convertLLMErrorToMessage(error),
          };
        }
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "不明なエラーが発生しました。",
        };
      }
    },
  );

  // AI_CHECK_CONNECTION, AI_INDEXは既存のまま維持
  // ...
}
```

### 2.2 新規ファイル: buildMessages.ts

```typescript
// apps/desktop/src/main/utils/buildMessages.ts

import type { LLMMessage } from "@repo/shared/types/llm/schemas";

/**
 * ユーザーメッセージとシステムプロンプトからLLMメッセージ配列を構築
 */
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  if (systemPrompt && systemPrompt.trim().length > 0) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
}
```

### 2.3 新規ファイル: llmConfigProvider.ts

```typescript
// apps/desktop/src/main/ipc/llmConfigProvider.ts

import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

/**
 * LLM設定
 */
export interface LLMConfig {
  providerId: LLMProviderId;
  modelId: string;
}

/**
 * 現在選択されているLLM設定を取得
 * Renderer ProcessのRedux Storeから取得
 */
export async function getSelectedLLMConfig(): Promise<LLMConfig | null> {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (!mainWindow) {
    // デフォルト設定を返す
    return {
      providerId: "openai",
      modelId: "gpt-4o",
    };
  }

  try {
    // Renderer側に問い合わせ
    const config = await mainWindow.webContents.executeJavaScript(`
      (function() {
        const state = window.__REDUX_STORE__?.getState?.();
        if (state?.llm) {
          return {
            providerId: state.llm.selectedProvider,
            modelId: state.llm.selectedModel,
          };
        }
        return null;
      })()
    `);

    if (config && config.providerId && config.modelId) {
      return config as LLMConfig;
    }

    // デフォルト設定
    return {
      providerId: "openai",
      modelId: "gpt-4o",
    };
  } catch {
    // エラー時はデフォルト設定
    return {
      providerId: "openai",
      modelId: "gpt-4o",
    };
  }
}
```

---

## 3. 統合ポイント

### 3.1 データフロー

```
AIChatRequest
      │
      ├── message ────────────────────────┐
      │                                   ▼
      ├── systemPrompt ────▶ buildMessages() ──▶ LLMMessage[]
      │                                   │
      │                                   │
      │                                   ▼
      │                      LLMAdapterFactory.getAdapter()
      │                                   │
      ├── ragEnabled                      ▼
      │                           adapter.sendChat()
      │                                   │
      └── conversationId                  ▼
                              AdapterChatResponse
                                          │
                                          ▼
                                AIChatResponse
```

### 3.2 エラーフロー

```
エラー発生箇所           対応
───────────────────────────────────────────────────
getSelectedLLMConfig()   → "LLMプロバイダーが選択されていません"
LLMAdapterFactory        → "APIキーが設定されていません"
adapter.sendChat()       → LLMErrorに応じたメッセージ
その他例外               → "不明なエラーが発生しました"
```

---

## 4. テスト計画

### 4.1 単体テスト対象

| ファイル             | テスト項目                            |
| -------------------- | ------------------------------------- |
| buildMessages.ts     | システムプロンプトあり/なし、空文字列 |
| llmConfigProvider.ts | 設定取得、デフォルト値                |
| aiHandlers.ts        | 正常系、各種エラーケース              |

### 4.2 モック対象

| モック対象        | 理由                     |
| ----------------- | ------------------------ |
| LLMAdapterFactory | 外部API呼び出しを避ける  |
| BrowserWindow     | Electronのウィンドウ操作 |
| SecureStorage     | APIキー取得をモック      |

---

## 5. 変更ファイル一覧

| ファイル                                         | 変更内容              |
| ------------------------------------------------ | --------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`        | LLM API呼び出しに更新 |
| `apps/desktop/src/main/utils/buildMessages.ts`   | 新規作成              |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts` | 新規作成              |

---

## 6. リスクと対策

| リスク              | 対策                                    |
| ------------------- | --------------------------------------- |
| Redux Store未初期化 | デフォルト設定（openai/gpt-4o）を使用   |
| APIキー未設定       | 明確なエラーメッセージを返す            |
| ネットワーク障害    | LLMAdapterのリトライ機構を利用          |
| 既存機能への影響    | AI_CHECK_CONNECTION, AI_INDEXは変更なし |

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
