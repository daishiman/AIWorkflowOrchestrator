# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装（TDD: Green）    |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-23            |
| 機能名     | system-prompt-llm-api |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。TDDのGreenフェーズとして、テストが成功状態になることを目指す。

## 背景

実装対象:

- `buildMessages` 関数: システムプロンプトを含むメッセージ配列構築
- `callLLM` 関数: Vercel AI SDKを使用したLLM API呼び出し
- `aiHandlers` 更新: モックレスポンスからLLM Client呼び出しへの切り替え

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: buildMessages関数の実装

**目的**: メッセージ構築ロジックを実装する

**実行手順**:

1. `apps/desktop/src/main/utils/buildMessages.ts` を作成
2. システムプロンプトの処理ロジックを実装
3. テストを実行して成功を確認

**実装例**:

```typescript
// apps/desktop/src/main/utils/buildMessages.ts
export type MessageRole = "system" | "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * ユーザーメッセージとシステムプロンプトからメッセージ配列を構築する
 * @param userMessage ユーザーのメッセージ
 * @param systemPrompt システムプロンプト（オプション）
 * @returns メッセージ配列
 */
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): Message[] {
  const messages: Message[] = [];

  // システムプロンプトがあり、空白以外の文字を含む場合のみ追加
  if (systemPrompt && systemPrompt.trim()) {
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

**期待される成果物**:

- `apps/desktop/src/main/utils/buildMessages.ts`

---

### タスク2: LLM Client（callLLM関数）の実装

**目的**: Vercel AI SDKを使用してLLM APIを呼び出すロジックを実装する

**実行手順**:

1. `apps/desktop/src/main/services/llmClient.ts` を作成
2. プロバイダー別のクライアント初期化を実装
3. エラーハンドリングを実装
4. テストを実行して成功を確認

**実装例**:

```typescript
// apps/desktop/src/main/services/llmClient.ts
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import type { Message } from "../utils/buildMessages";

export type LLMProviderId = "openai" | "anthropic" | "google" | "xai";

export interface LLMClientOptions {
  provider: LLMProviderId;
  apiKey: string;
  model?: string;
}

const DEFAULT_MODELS: Record<LLMProviderId, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  google: "gemini-1.5-pro",
  xai: "grok-2",
};

/**
 * LLM APIを呼び出してテキスト応答を取得する
 * @param messages メッセージ配列
 * @param options プロバイダー設定
 * @returns AI応答テキスト
 * @throws APIキー未設定時、API呼び出しエラー時
 */
export async function callLLM(
  messages: Message[],
  options: LLMClientOptions,
): Promise<string> {
  if (!options.apiKey) {
    throw new Error("API key is required");
  }

  const model = options.model || DEFAULT_MODELS[options.provider];
  const client = createClient(options.provider, options.apiKey);

  try {
    const result = await generateText({
      model: client(model),
      messages,
    });

    return result.text;
  } catch (error) {
    // エラーを適切な形式に変換
    if (error instanceof Error) {
      throw new Error(`LLM API error: ${error.message}`);
    }
    throw new Error("Unknown LLM API error");
  }
}

function createClient(provider: LLMProviderId, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    case "xai":
      return createXai({ apiKey });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

**期待される成果物**:

- `apps/desktop/src/main/services/llmClient.ts`

---

### タスク3: aiHandlersの更新

**目的**: モックレスポンスを削除し、LLM Client呼び出しに切り替える

**実行手順**:

1. 現在の `aiHandlers.ts` を確認
2. モックレスポンス箇所を特定
3. `callLLM` を使用した実装に置き換え
4. エラーハンドリングを追加
5. テストを実行して成功を確認

**変更例**:

```typescript
// apps/desktop/src/main/ipc/aiHandlers.ts
import { callLLM, LLMClientOptions } from "../services/llmClient";
import { buildMessages } from "../utils/buildMessages";
import type { AIChatRequest, AIChatResponse } from "@/preload/types";

export async function handleAIChat(
  request: AIChatRequest,
  llmOptions: LLMClientOptions,
): Promise<AIChatResponse> {
  try {
    // メッセージ配列を構築
    const messages = buildMessages(request.message, request.systemPrompt);

    // LLM APIを呼び出し
    const response = await callLLM(messages, llmOptions);

    return {
      success: true,
      data: {
        message: response,
        conversationId: request.conversationId || generateConversationId(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/aiHandlers.ts`（更新）

---

## 参照資料

### Phase成果物

| 資料名               | パス                                    | 内容          |
| -------------------- | --------------------------------------- | ------------- |
| インターフェース設計 | `outputs/phase-2/interface-design.md`   | Phase 2成果物 |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | Phase 4成果物 |

### システム仕様

| 参照資料                | パス                                                                  | 内容               |
| ----------------------- | --------------------------------------------------------------------- | ------------------ |
| LLMインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | 型定義、アダプター |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                    |
| ------------------ | --------------------------------------- |
| API接続            | Vercel AI SDK経由のLLMプロバイダー接続  |
| エラーハンドリング | APIエラーのキャッチとAIChatResponse変換 |
| 状態同期           | conversationIdによる会話状態管理        |

---

## 成果物

| 成果物            | パス                                           | 説明            |
| ----------------- | ---------------------------------------------- | --------------- |
| buildMessages実装 | `apps/desktop/src/main/utils/buildMessages.ts` | メッセージ構築  |
| llmClient実装     | `apps/desktop/src/main/services/llmClient.ts`  | LLM API呼び出し |
| aiHandlers更新    | `apps/desktop/src/main/ipc/aiHandlers.ts`      | IPC Handler更新 |

---

## 完了条件

- [ ] buildMessages関数が実装されている
- [ ] callLLM関数が実装されている
- [ ] aiHandlersがLLM Clientを使用するよう更新されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 型エラーがない
- [ ] フロント/バック接続が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

Phase 6: テスト拡充

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-llm-api/phase-6-test-expansion.md`
