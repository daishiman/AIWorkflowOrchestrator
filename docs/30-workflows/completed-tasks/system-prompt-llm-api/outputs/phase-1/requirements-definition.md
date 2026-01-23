# 要件定義書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 1                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. 機能要件（FR）

### FR-001: システムプロンプト付きメッセージのLLM API送信

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 要件ID | FR-001                                                                |
| 説明   | ユーザーメッセージとシステムプロンプトを組み合わせてLLM APIに送信する |
| 優先度 | 必須                                                                  |
| 入力   | AIChatRequest（message, systemPrompt, ragEnabled, conversationId）    |
| 出力   | AIChatResponse（success, data.message, data.conversationId, error）   |

**詳細**:

- `systemPrompt`が指定されている場合、`role: 'system'`として最初に配置
- `message`は`role: 'user'`として送信
- 既存の`AIChatRequest`/`AIChatResponse`型を維持

### FR-002: LLMアダプターとの連携

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 要件ID | FR-002                                                                |
| 説明   | 既存のLLMAdapterFactoryを使用して適切なプロバイダーのアダプターを取得 |
| 優先度 | 必須                                                                  |
| 依存   | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`             |

**詳細**:

- 4つのプロバイダー（OpenAI, Anthropic, Google, xAI）に対応
- `LLMAdapterFactory.getAdapter(providerId)`でアダプター取得
- `adapter.sendChat(request)`でAPI呼び出し

### FR-003: プロバイダー/モデル選択

| 項目   | 内容                                                         |
| ------ | ------------------------------------------------------------ |
| 要件ID | FR-003                                                       |
| 説明   | 現在選択されているLLMプロバイダーとモデルを使用して送信      |
| 優先度 | 必須                                                         |
| 依存   | llmSlice（Redux Store）の`selectedProvider`と`selectedModel` |

**詳細**:

- 選択されたプロバイダーIDに基づいてアダプターを取得
- 選択されたモデルIDをリクエストに含める

### FR-004: エラーハンドリング

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| 要件ID | FR-004                                          |
| 説明   | API呼び出し失敗時に適切なエラーレスポンスを返す |
| 優先度 | 必須                                            |

**エラーケース**:

| エラー種別         | 対応                                    |
| ------------------ | --------------------------------------- |
| APIキー未設定      | `API_KEY_MISSING`エラー、ユーザーに通知 |
| APIキー無効        | `API_KEY_INVALID`エラー、設定画面誘導   |
| ネットワークエラー | `NETWORK_ERROR`エラー、リトライ可能     |
| レート制限         | `RATE_LIMIT`エラー、待機時間を通知      |
| モデル未検出       | `MODEL_NOT_FOUND`エラー                 |
| サービス停止       | `SERVICE_UNAVAILABLE`エラー             |

### FR-005: 会話コンテキスト維持

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 要件ID | FR-005                                   |
| 説明   | 同一会話内のメッセージ履歴を維持して送信 |
| 優先度 | 任意（スコープ外、将来対応）             |

---

## 2. 非機能要件（NFR）

### NFR-001: レスポンス時間

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 要件ID   | NFR-001                         |
| 説明     | 初回トークン応答時間            |
| 目標値   | < 2秒（ネットワーク条件良好時） |
| 測定方法 | API呼び出しから最初の応答まで   |

### NFR-002: テストカバレッジ

| 項目     | 内容                 |
| -------- | -------------------- |
| 要件ID   | NFR-002              |
| 説明     | コードカバレッジ目標 |
| 目標値   | Line Coverage ≥ 80%  |
| 測定方法 | Vitest coverage      |

### NFR-003: 型安全性

| 項目     | 内容                       |
| -------- | -------------------------- |
| 要件ID   | NFR-003                    |
| 説明     | TypeScriptコンパイルエラー |
| 目標値   | 0件                        |
| 測定方法 | `pnpm typecheck`           |

### NFR-004: コード品質

| 項目     | 内容         |
| -------- | ------------ |
| 要件ID   | NFR-004      |
| 説明     | ESLintエラー |
| 目標値   | 0件          |
| 測定方法 | `pnpm lint`  |

---

## 3. 接続要件

### API接続

| プロバイダー | エンドポイント                            | 認証方式            |
| ------------ | ----------------------------------------- | ------------------- |
| OpenAI       | https://api.openai.com/v1/chat            | Bearer Token        |
| Anthropic    | https://api.anthropic.com/v1/messages     | x-api-key Header    |
| Google       | https://generativelanguage.googleapis.com | API Key Query Param |
| xAI          | https://api.x.ai/v1/chat                  | Bearer Token        |

### データフロー

```
[Renderer Process]
      │
      │ IPC: AI_CHAT
      ▼
[Main Process: aiHandlers.ts]
      │
      │ getAdapter(providerId)
      ▼
[LLMAdapterFactory]
      │
      │ adapter.sendChat(request)
      ▼
[LLMAdapter: OpenAI/Anthropic/Google/xAI]
      │
      │ HTTP Request
      ▼
[LLM API Endpoint]
      │
      │ HTTP Response
      ▼
[LLMAdapter]
      │
      │ AdapterChatResponse
      ▼
[aiHandlers.ts]
      │
      │ AIChatResponse
      ▼
[Renderer Process]
```

---

## 4. 現在の実装状態

### aiHandlers.ts（変更対象）

```typescript
// 現在: モックレスポンスを返している
const mockResponses = [
  "ご質問ありがとうございます...",
  // ...
];
return {
  success: true,
  data: {
    message: mockResponses[responseIndex],
    conversationId,
  },
};
```

### LLMAdapterFactory（既存・利用可能）

```typescript
// 既に実装済み
await LLMAdapterFactory.getAdapter(providerId);
adapter.sendChat(request);
```

---

## 5. システム仕様との整合性確認

| 仕様書                      | 整合性 | 備考                           |
| --------------------------- | ------ | ------------------------------ |
| interfaces-llm.md           | ✓      | AIChatRequest/Response型を維持 |
| interfaces-system-prompt.md | ✓      | SystemPromptTemplate参照可能   |
| technology-core.md          | ✓      | 4プロバイダー対応              |

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
