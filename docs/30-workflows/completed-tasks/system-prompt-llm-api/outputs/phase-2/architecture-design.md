# アーキテクチャ設計書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 2                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. システム構成図

### 1.1 コンポーネント構成

```
┌─────────────────────────────────────────────────────────────────┐
│                      Renderer Process                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐     ┌──────────────────────┐              │
│  │   ChatPanel     │────▶│   Redux Store        │              │
│  │   (UI Component)│     │   (llmSlice)         │              │
│  └────────┬────────┘     │   - selectedProvider │              │
│           │              │   - selectedModel    │              │
│           │ IPC          └──────────────────────┘              │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │   window.api    │                                           │
│  │   .aiChat()     │                                           │
│  └────────┬────────┘                                           │
└───────────┼─────────────────────────────────────────────────────┘
            │ IPC_CHANNELS.AI_CHAT
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Main Process                                 │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   aiHandlers.ts                              │  │
│  │  ┌─────────────────────────────────────────────────────────┐│  │
│  │  │ handleAIChat(request: AIChatRequest)                    ││  │
│  │  │   1. プロバイダー/モデル取得                            ││  │
│  │  │   2. buildMessages()でメッセージ配列構築                ││  │
│  │  │   3. LLMAdapterFactory.getAdapter()                     ││  │
│  │  │   4. adapter.sendChat()                                 ││  │
│  │  │   5. レスポンス変換してAIChatResponse返却               ││  │
│  │  └─────────────────────────────────────────────────────────┘│  │
│  └───────────────────────┬─────────────────────────────────────┘  │
│                          │                                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │                   buildMessages.ts                            ││
│  │  buildMessages(userMessage, systemPrompt?) → LLMMessage[]     ││
│  └───────────────────────────────────────────────────────────────┘│
│                          │                                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │                   LLMAdapterFactory                           ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           ││
│  │  │ OpenAI      │  │ Anthropic   │  │ Google      │           ││
│  │  │ Adapter     │  │ Adapter     │  │ Adapter     │           ││
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           ││
│  │         │                │                │                   ││
│  │  ┌──────┴──────┐                  ┌───────┴─────┐            ││
│  │  │ xAI Adapter │                  │SecureStorage │            ││
│  │  └─────────────┘                  │(API Keys)   │            ││
│  └───────────────────────────────────└─────────────┘────────────┘│
│                          │                                         │
└──────────────────────────┼─────────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                      External LLM APIs                            │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │ OpenAI API  │  │Anthropic API│  │ Google API  │  │ xAI API  ││
│  │ /v1/chat    │  │ /v1/messages│  │generative-AI│  │ /v1/chat ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### 1.2 レイヤー構成

| レイヤー    | 責務                              | ファイル                           |
| ----------- | --------------------------------- | ---------------------------------- |
| IPC Handler | IPCリクエスト受付、レスポンス変換 | `aiHandlers.ts`                    |
| Utility     | メッセージ構築                    | `buildMessages.ts` (新規)          |
| Adapter     | プロバイダー抽象化、API呼び出し   | `adapters/llm/*.ts` (既存)         |
| Security    | APIキー管理                       | `services/secureStorage.ts` (既存) |

---

## 2. データフロー

### 2.1 正常系フロー

```
1. ユーザーがメッセージを送信
   │
   ▼
2. ChatPanel → window.api.aiChat(request)
   │  request: {
   │    message: "こんにちは",
   │    systemPrompt: "あなたは親切なアシスタントです",
   │    ragEnabled: false,
   │    conversationId: "conv-123"
   │  }
   │
   ▼
3. IPC_CHANNELS.AI_CHAT → aiHandlers.ts
   │
   ▼
4. プロバイダー/モデル情報取得
   │  - 現在選択されているプロバイダーID (例: "openai")
   │  - 現在選択されているモデルID (例: "gpt-4o")
   │
   ▼
5. buildMessages(message, systemPrompt)
   │  messages: [
   │    { role: "system", content: "あなたは親切なアシスタントです" },
   │    { role: "user", content: "こんにちは" }
   │  ]
   │
   ▼
6. LLMAdapterFactory.getAdapter(providerId)
   │  - SecureStorageからAPIキー取得
   │  - OpenAIAdapterインスタンス返却
   │
   ▼
7. adapter.sendChat({ messages, modelId, ... })
   │  - OpenAI API呼び出し
   │  - HTTPレスポンス受信
   │
   ▼
8. AdapterChatResponse → AIChatResponse変換
   │  response: {
   │    success: true,
   │    data: {
   │      message: "こんにちは！何かお手伝いできますか？",
   │      conversationId: "conv-123"
   │    }
   │  }
   │
   ▼
9. Renderer Processへ返却
```

### 2.2 エラー系フロー

```
ケース1: APIキー未設定
  LLMAdapterFactory.getAdapter() → Error("API key not found")
  → AIChatResponse { success: false, error: "APIキーが設定されていません" }

ケース2: API呼び出しエラー
  adapter.sendChat() → LLMError { code: "RATE_LIMIT", ... }
  → AIChatResponse { success: false, error: "レート制限を超えました" }

ケース3: ネットワークエラー
  fetch() → TypeError("Network error")
  → AIChatResponse { success: false, error: "ネットワークエラー" }
```

---

## 3. 依存関係

### 3.1 内部依存

```
aiHandlers.ts
├── buildMessages.ts (新規)
├── adapters/llm/LLMAdapterFactory.ts (既存)
│   ├── OpenAIAdapter.ts
│   ├── AnthropicAdapter.ts
│   ├── GoogleAdapter.ts
│   └── xAIAdapter.ts
└── services/secureStorage.ts (既存)
```

### 3.2 外部依存

| パッケージ     | バージョン | 用途    |
| -------------- | ---------- | ------- |
| `@repo/shared` | workspace  | 型定義  |
| `electron`     | ^35.x      | IPC通信 |

---

## 4. 既存実装との整合性

### 4.1 handlers/llm.ts との関係

| 項目           | handlers/llm.ts       | aiHandlers.ts（更新後）    |
| -------------- | --------------------- | -------------------------- |
| IPCチャンネル  | `LLM_SEND_CHAT`       | `AI_CHAT`                  |
| リクエスト型   | `LLMChatRequestInput` | `AIChatRequest`            |
| レスポンス型   | `LLMChatResponse`     | `AIChatResponse`           |
| アダプター使用 | `LLMAdapterFactory`   | `LLMAdapterFactory` (共有) |
| メッセージ構築 | リクエストに含まれる  | `buildMessages()`で構築    |

**設計判断**:

- `handlers/llm.ts`は新しいLLM機能向け（詳細なリクエスト/レスポンス）
- `aiHandlers.ts`は既存のチャットUI向け（シンプルなインターフェース維持）
- 両者は共通のアダプター層を使用

### 4.2 型変換

```typescript
// AIChatRequest → LLMChatRequestInput への変換
const llmRequest: LLMChatRequestInput = {
  messages: buildMessages(request.message, request.systemPrompt),
  modelId: selectedModel,
  providerId: selectedProvider,
  // temperature, maxTokensはデフォルト値を使用
};

// AdapterChatResponse → AIChatResponse への変換
const aiResponse: AIChatResponse = {
  success: true,
  data: {
    message: adapterResponse.content,
    conversationId: conversationId,
    ragSources: request.ragEnabled ? [] : undefined,
  },
};
```

---

## 5. 設計判断

### 5.1 採用した設計

| 項目                    | 決定                                  | 理由                       |
| ----------------------- | ------------------------------------- | -------------------------- |
| アダプター使用          | LLMAdapterFactory（既存）を再利用     | 実装済み、テスト済み、安定 |
| メッセージ構築          | buildMessages()として分離             | テスト容易性、再利用性     |
| エラーハンドリング      | LLMError → AIChatResponse.errorへ変換 | 既存APIとの互換性維持      |
| プロバイダー/モデル取得 | IPC経由でRenderer Storeから取得       | 状態の一元管理             |

### 5.2 採用しなかった設計

| 項目                    | 理由                                |
| ----------------------- | ----------------------------------- |
| 新規LLMクライアント実装 | 既存アダプターが十分機能している    |
| ストリーミング対応      | 現在のIPCパターンでは複雑、将来対応 |
| handlers/llm.tsへの統合 | 既存APIの互換性維持が優先           |

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
