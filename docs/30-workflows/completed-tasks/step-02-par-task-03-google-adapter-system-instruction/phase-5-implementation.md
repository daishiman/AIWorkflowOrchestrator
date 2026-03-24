# Phase 5: 実装 - GoogleAdapter system_instruction 対応（TDD: Green）

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-4-test-creation.md          |

## 目的

TDD の Green フェーズとして、Phase 4 で追加した失敗テストを全て通す実装を `GoogleAdapter.ts` に施す。

## 実行タスク

### Task 5-1: 前提確認

実装前に以下を確認する。

```bash
# Phase 4 のテストが Red であることを確認
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts 2>&1 | tail -20
```

テストが Red でない場合（例: Phase 4 が未完了）は Phase 4 を先に完了させること。

### Task 5-2: baseUrl デフォルト値の変更

**対象ファイル**: `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

**変更箇所** (現在の L49-51):

```typescript
// 変更前
this.baseUrl =
  config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1";

// 変更後
this.baseUrl =
  config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
```

**根拠**: Phase 2 の設計判断: `system_instruction` が `v1beta` で確実に使用可能であるため `v1beta` を採用する。

### Task 5-3: formatContents メソッドのリファクタリング

**変更箇所** (現在の L180-203):

```typescript
// 変更前
private formatContents(request: LLMChatRequestInput) {
  const contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }> = [];

  // Geminiはsystem roleを直接サポートしないため、
  // userロールでシステムプロンプトを追加
  if (request.systemPrompt?.trim()) {
    contents.push({
      role: "user",
      parts: [{ text: `System: ${request.systemPrompt}` }],
    });
  }

  contents.push(
    ...request.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  );

  return contents;
}

// 変更後
private formatContents(request: LLMChatRequestInput) {
  return request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}
```

**変更点の要約**:

- `contents` 配列への `systemPrompt` の `user` ロール挿入ロジックを削除する
- `request.messages` のマッピングのみを残す
- ワークアラウンドを示すコメントも削除する

### Task 5-4: buildRequestBody メソッドの追加

`formatContents` メソッドの直後（現在の L203 付近）に追加する。

```typescript
/**
 * リクエストボディを構築する
 * systemPrompt が指定された場合は system_instruction フィールドを追加する
 */
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt?.trim()) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

### Task 5-5: sendChat のリクエストボディ更新

**変更箇所** (現在の L65-73):

```typescript
// 変更前
body: JSON.stringify({
  contents: this.formatContents(request),
  generationConfig: {
    temperature: request.temperature,
    maxOutputTokens: request.maxTokens,
  },
}),

// 変更後
body: JSON.stringify(this.buildRequestBody(request)),
```

### Task 5-6: streamChat のリクエストボディ更新

**変更箇所** (現在の L111-118):

```typescript
// 変更前
body: JSON.stringify({
  contents: this.formatContents(request),
  generationConfig: {
    temperature: request.temperature,
    maxOutputTokens: request.maxTokens,
  },
}),

// 変更後
body: JSON.stringify(this.buildRequestBody(request)),
```

### Task 5-7: Green 確認

実装完了後、テストが全て Green であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する結果**:

- 全テストが PASS
- 失敗テストが 0 件

### Task 5-8: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待する結果**: コンパイルエラーが 0 件。

## 変更後の GoogleAdapter.ts 全体イメージ

実装後のファイルは以下の構造になる（コア部分のみ抜粋）:

```typescript
constructor(
  apiKey: string,
  config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
) {
  super(apiKey, config);
  this.baseUrl =
    config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta"; // v1beta に変更
}

// sendChat: buildRequestBody を使用
async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
  try {
    const response = await this.fetchWithRetry<GeminiGenerateContentResponse>(
      `${this.baseUrl}/models/${request.modelId}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.buildRequestBody(request)), // 変更
      },
    );
    // ...
  }
}

// streamChat: buildRequestBody を使用
async *streamChat(request: LLMChatRequestInput, signal?: AbortSignal) {
  const stream = this.fetchSSE(
    `${this.baseUrl}/models/${request.modelId}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.buildRequestBody(request)), // 変更
    },
    signal,
  );
  // ...
}

// formatContents: 会話メッセージのみ（systemPrompt 除外）
private formatContents(request: LLMChatRequestInput) {
  return request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

// buildRequestBody: 新規追加
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt?.trim()) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

## 参照資料

| 資料名     | パス                                                  | 内容                                          |
| ---------- | ----------------------------------------------------- | --------------------------------------------- |
| 設計書     | `phase-2-design.md`                                   | 変更前後の差分・`buildRequestBody` 実装コード |
| テスト作成 | `phase-4-test-creation.md`                            | 追加テストケース一覧                          |
| 現行実装   | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | 変更前コード                                  |

## 統合テスト連携

本 Phase 完了後、Phase 6（テスト拡充）でカバレッジ不足箇所を補完する。Task04（step-03 のテスト更新）は本タスクの完了を待ってから開始する。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物               | パス                                                  | 説明                        |
| -------------------- | ----------------------------------------------------- | --------------------------- |
| 更新済み実装ファイル | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | system_instruction 対応済み |

## 完了条件

- [ ] `baseUrl` のデフォルト値が `v1beta` に変更されている
- [ ] `formatContents` から systemPrompt 挿入ロジックが削除されている
- [ ] `buildRequestBody` メソッドが追加されている
- [ ] `sendChat` が `buildRequestBody` を使用している
- [ ] `streamChat` が `buildRequestBody` を使用している
- [ ] `pnpm vitest run` で `GoogleAdapter.test.ts` の全テストが PASS している
- [ ] `pnpm typecheck` がエラー 0 件で PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6: テスト拡充
