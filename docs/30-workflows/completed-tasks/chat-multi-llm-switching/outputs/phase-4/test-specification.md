# テスト仕様書 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 4                        |
| 作成日 | 2026-01-07               |
| スキル | tdd-principles           |

---

## 1. テスト戦略概要

### 1.1 テストピラミッド

```
           /\
          /E2E\          5% - E2Eテスト（Playwright）
         /------\
        /統合テスト\      25% - 統合テスト（IPC, API）
       /------------\
      / ユニットテスト \   70% - ユニットテスト（Vitest）
     /------------------\
```

### 1.2 テストカバレッジ目標

| カテゴリ       | 目標 | 計測方法        |
| -------------- | ---- | --------------- |
| ステートメント | 80%  | Vitest coverage |
| ブランチ       | 75%  | Vitest coverage |
| 関数           | 85%  | Vitest coverage |
| 行             | 80%  | Vitest coverage |

---

## 2. ユニットテスト仕様

### 2.1 Zodスキーマテスト

#### TS-001: LLMProviderIdSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`

| ID        | テストケース                     | 入力          | 期待結果  |
| --------- | -------------------------------- | ------------- | --------- |
| TS-001-01 | 有効なプロバイダーID (openai)    | `"openai"`    | parse成功 |
| TS-001-02 | 有効なプロバイダーID (anthropic) | `"anthropic"` | parse成功 |
| TS-001-03 | 有効なプロバイダーID (google)    | `"google"`    | parse成功 |
| TS-001-04 | 有効なプロバイダーID (xai)       | `"xai"`       | parse成功 |
| TS-001-05 | 無効なプロバイダーID             | `"invalid"`   | ZodError  |
| TS-001-06 | 空文字列                         | `""`          | ZodError  |
| TS-001-07 | null                             | `null`        | ZodError  |

---

#### TS-002: LLMModelSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`

| ID        | テストケース             | 入力                             | 期待結果        |
| --------- | ------------------------ | -------------------------------- | --------------- |
| TS-002-01 | 有効な最小モデル         | `{id: "gpt-4o", name: "GPT-4o"}` | parse成功       |
| TS-002-02 | 全フィールド指定         | 全フィールド有効値               | parse成功       |
| TS-002-03 | id が空文字              | `{id: "", name: "Test"}`         | ZodError        |
| TS-002-04 | name が空文字            | `{id: "test", name: ""}`         | ZodError        |
| TS-002-05 | contextWindow が負数     | `{..., contextWindow: -1}`       | ZodError        |
| TS-002-06 | isDefault のデフォルト値 | `{id: "test", name: "Test"}`     | isDefault=false |

---

#### TS-003: LLMChatRequestSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/request.test.ts`

| ID        | テストケース                | 入力                                | 期待結果     |
| --------- | --------------------------- | ----------------------------------- | ------------ |
| TS-003-01 | 有効な最小リクエスト        | messages + modelId                  | parse成功    |
| TS-003-02 | 全オプション指定            | 全フィールド有効値                  | parse成功    |
| TS-003-03 | messages が空配列           | `{messages: [], modelId: "gpt-4o"}` | parse成功    |
| TS-003-04 | modelId が空文字            | `{..., modelId: ""}`                | ZodError     |
| TS-003-05 | temperature が範囲外 (負)   | `{..., temperature: -0.1}`          | ZodError     |
| TS-003-06 | temperature が範囲外 (超過) | `{..., temperature: 2.1}`           | ZodError     |
| TS-003-07 | maxTokens が負数            | `{..., maxTokens: -1}`              | ZodError     |
| TS-003-08 | stream のデフォルト値       | オプション未指定                    | stream=false |

---

#### TS-004: LLMChatResponseSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/response.test.ts`

| ID        | テストケース      | 入力                             | 期待結果  |
| --------- | ----------------- | -------------------------------- | --------- |
| TS-004-01 | 成功レスポンス    | `{success: true, data: {...}}`   | parse成功 |
| TS-004-02 | 失敗レスポンス    | `{success: false, error: {...}}` | parse成功 |
| TS-004-03 | 成功時にdata必須  | `{success: true}`                | ZodError  |
| TS-004-04 | 失敗時にerror必須 | `{success: false}`               | ZodError  |

---

#### TS-005: LLMStreamChunkSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/response.test.ts`

| ID        | テストケース    | 入力                                  | 期待結果  |
| --------- | --------------- | ------------------------------------- | --------- |
| TS-005-01 | contentチャンク | `{type: "content", content: "Hello"}` | parse成功 |
| TS-005-02 | doneチャンク    | `{type: "done", response: {...}}`     | parse成功 |
| TS-005-03 | errorチャンク   | `{type: "error", error: {...}}`       | parse成功 |
| TS-005-04 | 不明なtype      | `{type: "unknown"}`                   | ZodError  |

---

#### TS-006: LLMErrorSchema

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/error.test.ts`

| ID        | テストケース       | 入力                          | 期待結果  |
| --------- | ------------------ | ----------------------------- | --------- |
| TS-006-01 | 有効なエラー       | 全必須フィールド              | parse成功 |
| TS-006-02 | 無効なエラーコード | `{code: "INVALID_CODE", ...}` | ZodError  |
| TS-006-03 | retryAfter が正数  | `{..., retryAfter: 30}`       | parse成功 |
| TS-006-04 | retryAfter が負数  | `{..., retryAfter: -1}`       | ZodError  |

---

### 2.2 LLMアダプターテスト

#### TS-010: ILLMAdapter インターフェース準拠テスト

**ファイル**: `packages/shared/src/infrastructure/llm-adapters/__tests__/adapter.test.ts`

| ID        | テストケース                    | プロバイダー | 期待結果   |
| --------- | ------------------------------- | ------------ | ---------- |
| TS-010-01 | providerId プロパティ           | OpenAI       | "openai"   |
| TS-010-02 | providerName プロパティ         | OpenAI       | "OpenAI"   |
| TS-010-03 | chat メソッド存在               | OpenAI       | 関数である |
| TS-010-04 | chatStream メソッド存在         | OpenAI       | 関数である |
| TS-010-05 | healthCheck メソッド存在        | OpenAI       | 関数である |
| TS-010-06 | getAvailableModels メソッド存在 | OpenAI       | 関数である |

**注**: 同様のテストを Anthropic, Google, xAI に対しても作成

---

#### TS-011: OpenAIAdapter

**ファイル**: `packages/shared/src/infrastructure/llm-adapters/__tests__/openai-adapter.test.ts`

| ID        | テストケース            | 入力/条件             | 期待結果                      |
| --------- | ----------------------- | --------------------- | ----------------------------- |
| TS-011-01 | chat 成功               | 有効なリクエスト      | LLMChatResponse (success)     |
| TS-011-02 | chat API エラー         | 401 Unauthorized      | error.code = API_KEY_INVALID  |
| TS-011-03 | chat ネットワークエラー | 接続失敗              | error.code = NETWORK_ERROR    |
| TS-011-04 | chat タイムアウト       | 30秒超過              | error.code = TIMEOUT          |
| TS-011-05 | chat レート制限         | 429 Too Many Requests | error.code = RATE_LIMIT       |
| TS-011-06 | chatStream 成功         | 有効なリクエスト      | AsyncIterable<LLMStreamChunk> |
| TS-011-07 | healthCheck 接続成功    | 有効なAPIキー         | status = "connected"          |
| TS-011-08 | healthCheck 接続失敗    | 無効なAPIキー         | status = "error"              |
| TS-011-09 | getAvailableModels      | -                     | LLMModel[] 返却               |

---

### 2.3 状態管理テスト

#### TS-020: llmSlice

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.test.ts`

| ID        | テストケース                    | アクション                  | 期待結果                     |
| --------- | ------------------------------- | --------------------------- | ---------------------------- |
| TS-020-01 | 初期状態                        | -                           | デフォルト値が設定           |
| TS-020-02 | fetchProviders 成功             | fetchProviders()            | providers に値が設定         |
| TS-020-03 | fetchProviders 失敗             | fetchProviders() (API失敗)  | error に値が設定             |
| TS-020-04 | selectProvider                  | selectProvider("anthropic") | selectedProviderId 更新      |
| TS-020-05 | selectProvider でモデル自動選択 | selectProvider("anthropic") | selectedModelId がデフォルト |
| TS-020-06 | selectModel                     | selectModel("gpt-4-turbo")  | selectedModelId 更新         |
| TS-020-07 | checkHealth 成功                | checkHealth("openai")       | healthStatus 更新            |
| TS-020-08 | resetSelection                  | resetSelection()            | デフォルト値にリセット       |
| TS-020-09 | clearError                      | clearError()                | error = null                 |

---

#### TS-021: chatSlice 拡張部分

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/chatSlice.test.ts`

| ID        | テストケース                         | アクション                      | 期待結果                          |
| --------- | ------------------------------------ | ------------------------------- | --------------------------------- |
| TS-021-01 | sendMessage でユーザーメッセージ追加 | sendMessage("Hello")            | messages に user メッセージ追加   |
| TS-021-02 | sendMessage でプレースホルダー追加   | sendMessage("Hello")            | isStreaming=true のメッセージ追加 |
| TS-021-03 | updateStreamingMessage               | updateStreamingMessage("chunk") | content に追記                    |
| TS-021-04 | finalizeStreamingMessage             | finalizeStreamingMessage(...)   | isStreaming=false, LLM情報設定    |
| TS-021-05 | メッセージにLLM情報が含まれる        | sendMessage 完了後              | llmProviderId, llmModelId 設定    |

---

### 2.4 バリデーションユーティリティテスト

#### TS-030: validators

**ファイル**: `packages/shared/src/types/llm/schemas/__tests__/validators.test.ts`

| ID        | テストケース               | 関数                    | 期待結果               |
| --------- | -------------------------- | ----------------------- | ---------------------- |
| TS-030-01 | validateChatRequest 成功   | validateChatRequest()   | パース済みオブジェクト |
| TS-030-02 | validateChatRequest 失敗   | validateChatRequest()   | ZodError throw         |
| TS-030-03 | validateChatResponse 成功  | validateChatResponse()  | パース済みオブジェクト |
| TS-030-04 | validateIPCRequest 成功    | validateIPCRequest()    | パース済みオブジェクト |
| TS-030-05 | safeParseChatResponse 成功 | safeParseChatResponse() | パース済みオブジェクト |
| TS-030-06 | safeParseChatResponse 失敗 | safeParseChatResponse() | undefined              |

---

## 3. 統合テスト仕様

### 3.1 API接続テスト

**ファイル**: `apps/desktop/src/main/__tests__/llm-integration.test.ts`

| ID        | テストケース        | 検証内容               | 対応AC |
| --------- | ------------------- | ---------------------- | ------ |
| IT-001-01 | OpenAI API 疎通     | ヘルスチェック成功     | AC-017 |
| IT-001-02 | Anthropic API 疎通  | ヘルスチェック成功     | AC-017 |
| IT-001-03 | Google AI API 疎通  | ヘルスチェック成功     | AC-017 |
| IT-001-04 | xAI API 疎通        | ヘルスチェック成功     | AC-017 |
| IT-001-05 | 無効APIキーでエラー | API_KEY_INVALID エラー | AC-019 |

---

### 3.2 データフローテスト

**ファイル**: `apps/desktop/src/main/__tests__/llm-dataflow.test.ts`

| ID        | テストケース                    | 検証内容                  | 対応AC |
| --------- | ------------------------------- | ------------------------- | ------ |
| IT-002-01 | Renderer→Main→LLM→Main→Renderer | リクエスト/レスポンス往復 | AC-018 |
| IT-002-02 | ストリーミングデータフロー      | チャンク逐次配信          | AC-018 |
| IT-002-03 | 会話履歴の受け渡し              | 履歴がLLMに渡される       | AC-006 |
| IT-002-04 | システムプロンプトの受け渡し    | プロンプトがLLMに渡される | AC-007 |

---

### 3.3 エラーハンドリングテスト

**ファイル**: `apps/desktop/src/main/__tests__/llm-error-handling.test.ts`

| ID        | テストケース        | 検証内容                       | 対応AC |
| --------- | ------------------- | ------------------------------ | ------ |
| IT-003-01 | APIキー未設定エラー | API_KEY_MISSING エラー表示     | AC-009 |
| IT-003-02 | 接続エラー          | NETWORK_ERROR + リトライボタン | AC-010 |
| IT-003-03 | タイムアウトエラー  | TIMEOUT エラー + 状態リセット  | AC-011 |
| IT-003-04 | レート制限エラー    | RATE_LIMIT + 待機時間表示      | AC-012 |

---

### 3.4 状態同期テスト

**ファイル**: `apps/desktop/src/renderer/__tests__/llm-state-sync.test.ts`

| ID        | テストケース             | 検証内容                   | 対応AC |
| --------- | ------------------------ | -------------------------- | ------ |
| IT-004-01 | プロバイダー切り替え同期 | 全コンポーネントの状態更新 | AC-020 |
| IT-004-02 | モデル切り替え同期       | 全コンポーネントの状態更新 | AC-020 |
| IT-004-03 | 切り替え状態の永続化     | ページ再読み込み後も維持   | AC-008 |

---

## 4. コンポーネントテスト仕様

### 4.1 LLMSelector

**ファイル**: `apps/desktop/src/renderer/components/Chat/LLMSelector/__tests__/LLMSelector.test.tsx`

| ID        | テストケース                   | 検証内容                     | 対応AC |
| --------- | ------------------------------ | ---------------------------- | ------ |
| CT-001-01 | プロバイダードロップダウン表示 | 4プロバイダーが表示される    | AC-001 |
| CT-001-02 | モデルドロップダウン表示       | 選択プロバイダーのモデル表示 | AC-002 |
| CT-001-03 | デフォルト選択状態             | OpenAI / GPT-4o が選択済み   | AC-003 |
| CT-001-04 | プロバイダー変更時の動作       | モデルリストが更新される     | AC-002 |
| CT-001-05 | disabled 状態                  | 送信中は操作不可             | -      |
| CT-001-06 | APIキー未設定プロバイダー      | グレーアウト + 警告アイコン  | AC-009 |

---

### 4.2 MessageWithLLM

**ファイル**: `apps/desktop/src/renderer/components/Chat/MessageWithLLM/__tests__/MessageWithLLM.test.tsx`

| ID        | テストケース                     | 検証内容                     | 対応AC |
| --------- | -------------------------------- | ---------------------------- | ------ |
| CT-002-01 | LLMバッジ表示（OpenAI）          | 緑色バッジ + "OpenAI GPT-4o" | AC-004 |
| CT-002-02 | LLMバッジ表示（Anthropic）       | オレンジ色バッジ             | AC-004 |
| CT-002-03 | ユーザーメッセージ（バッジなし） | LLMバッジが表示されない      | AC-004 |
| CT-002-04 | ストリーミング中表示             | ローディングインジケーター   | -      |

---

## 5. アクセシビリティテスト

**ファイル**: `apps/desktop/src/renderer/components/Chat/__tests__/accessibility.test.tsx`

| ID      | テストケース   | 検証内容                     | 対応AC |
| ------- | -------------- | ---------------------------- | ------ |
| A11Y-01 | ラベル設定確認 | 全ドロップダウンにラベル     | AC-015 |
| A11Y-02 | キーボード操作 | Tab/Enter/Arrow で操作可能   | AC-015 |
| A11Y-03 | ARIA属性       | role/aria-expanded 等が設定  | AC-015 |
| A11Y-04 | フォーカス管理 | フォーカスが視覚的に識別可能 | AC-015 |

---

## 6. パフォーマンステスト

**ファイル**: `apps/desktop/e2e/performance.test.ts`

| ID      | テストケース           | 検証内容                    | 対応AC |
| ------- | ---------------------- | --------------------------- | ------ |
| PERF-01 | 切り替え応答速度       | UI更新 100ms 以内           | AC-013 |
| PERF-02 | First Token レイテンシ | 2秒以内（ネットワーク依存） | AC-014 |

---

## 7. テストファイル配置

```
packages/shared/
└── src/
    └── types/llm/schemas/
        └── __tests__/
            ├── provider.test.ts       # TS-001, TS-002
            ├── request.test.ts        # TS-003
            ├── response.test.ts       # TS-004, TS-005
            ├── error.test.ts          # TS-006
            └── validators.test.ts     # TS-030

packages/shared/
└── src/
    └── infrastructure/llm-adapters/
        └── __tests__/
            ├── adapter.test.ts        # TS-010
            └── openai-adapter.test.ts # TS-011

apps/desktop/
└── src/
    ├── main/__tests__/
    │   ├── llm-integration.test.ts    # IT-001
    │   ├── llm-dataflow.test.ts       # IT-002
    │   └── llm-error-handling.test.ts # IT-003
    └── renderer/
        ├── store/slices/__tests__/
        │   ├── llmSlice.test.ts       # TS-020
        │   └── chatSlice.test.ts      # TS-021
        ├── components/Chat/
        │   ├── LLMSelector/__tests__/
        │   │   └── LLMSelector.test.tsx  # CT-001
        │   └── MessageWithLLM/__tests__/
        │       └── MessageWithLLM.test.tsx # CT-002
        └── __tests__/
            ├── llm-state-sync.test.ts    # IT-004
            └── accessibility.test.tsx     # A11Y

apps/desktop/
└── e2e/
    └── performance.test.ts           # PERF
```

---

## 8. テスト実行コマンド

```bash
# 全ユニットテスト実行
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 特定テストファイル実行
pnpm --filter @repo/shared test:run -- provider.test.ts

# カバレッジ計測
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage

# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e
```

---

## 9. 受け入れ基準とテストの対応表

| AC ID  | AC タイトル              | テスト ID                      |
| ------ | ------------------------ | ------------------------------ |
| AC-001 | LLMプロバイダー選択      | CT-001-01                      |
| AC-002 | LLMモデル選択            | CT-001-02, CT-001-04           |
| AC-003 | デフォルトLLM設定        | CT-001-03                      |
| AC-004 | LLM識別表示              | CT-002-01, CT-002-02           |
| AC-005 | リアルタイム切り替え     | TS-020-04, TS-020-06           |
| AC-006 | 会話履歴の維持           | IT-002-03                      |
| AC-007 | システムプロンプトの維持 | IT-002-04                      |
| AC-008 | 切り替え状態の永続化     | IT-004-03                      |
| AC-009 | APIキー未設定エラー      | IT-003-01, CT-001-06           |
| AC-010 | API接続エラー            | IT-003-02                      |
| AC-011 | タイムアウトエラー       | IT-003-03                      |
| AC-012 | レート制限エラー         | IT-003-04                      |
| AC-013 | 切り替え応答速度         | PERF-01                        |
| AC-014 | メッセージ送信レイテンシ | PERF-02                        |
| AC-015 | アクセシビリティ         | A11Y-01〜04                    |
| AC-016 | セキュリティ             | （セキュリティレビューで実施） |
| AC-017 | API接続テスト            | IT-001-01〜04                  |
| AC-018 | データフローテスト       | IT-002-01〜02                  |
| AC-019 | 認証連携テスト           | IT-001-05                      |
| AC-020 | 状態同期テスト           | IT-004-01〜02                  |

---

## 10. 関連ドキュメント

| ドキュメント     | パス                                     |
| ---------------- | ---------------------------------------- |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md` |
| API仕様          | `outputs/phase-2/api-specification.md`   |
| スキーマ設計     | `outputs/phase-2/schema-design.md`       |
| テストデータ設計 | `outputs/phase-4/test-data-design.md`    |
| モック設計       | `outputs/phase-4/mock-design.md`         |
