# Phase 2: 設計 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-1-requirements.md           |

## 目的

Phase 1 の要件を満たす `GoogleAdapter.ts` の変更内容をインターフェース・メソッドレベルで設計し、実装者が迷わず実装できる仕様を確定する。

## 実行タスク

### Task 2-1: 変更前後のクラス設計比較

#### 変更前（現状）

```typescript
class GoogleAdapter extends BaseLLMAdapter {
  // formatContents: systemPrompt を user ロールで contents に追加
  private formatContents(
    request: LLMChatRequestInput,
  ): Array<{ role: string; parts: Array<{ text: string }> }>;

  // sendChat: インラインでリクエストボディを構築
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>;

  // streamChat: インラインでリクエストボディを構築
  async *streamChat(
    request: LLMChatRequestInput,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk>;
}
```

#### 変更後（設計）

```typescript
class GoogleAdapter extends BaseLLMAdapter {
  // formatContents: 会話メッセージのみ変換（systemPrompt除外）
  private formatContents(
    request: LLMChatRequestInput,
  ): Array<{ role: string; parts: Array<{ text: string }> }>;

  // buildRequestBody: リクエストボディ共通構築（新規追加）
  private buildRequestBody(
    request: LLMChatRequestInput,
  ): Record<string, unknown>;

  // sendChat: buildRequestBody を使用
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>;

  // streamChat: buildRequestBody を使用
  async *streamChat(
    request: LLMChatRequestInput,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk>;
}
```

### Task 2-2: formatContents メソッド設計

**変更前**:

```typescript
private formatContents(request: LLMChatRequestInput) {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  if (request.systemPrompt) {
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
```

**変更後**:

```typescript
private formatContents(request: LLMChatRequestInput) {
  return request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}
```

**変更点**:

- `request.systemPrompt` の `user` ロール挿入ロジックを削除する
- `request.messages` のみをマッピングする
- `assistant` → `model` のロール変換は維持する

### Task 2-3: buildRequestBody メソッド設計（新規追加）

**シグネチャ**:

```typescript
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown>
```

**実装**:

```typescript
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

**設計判断**:

- 戻り値型は `Record<string, unknown>` とする（`system_instruction` フィールドが条件付きのため、厳密な型定義は複雑になる。IPC ラインでは使用しないため `Record<string, unknown>` で十分）
- `system_instruction` は `request.systemPrompt` が truthy な場合のみ追加する（空文字列では追加しない）
- `body.system_instruction` の追加は型アサーションなしで実現できる（`Record<string, unknown>` へのプロパティ追加は型安全）

### Task 2-4: sendChat / streamChat 更新設計

**sendChat 変更差分**:

変更前 (L65-73):

```typescript
body: JSON.stringify({
  contents: this.formatContents(request),
  generationConfig: {
    temperature: request.temperature,
    maxOutputTokens: request.maxTokens,
  },
}),
```

変更後:

```typescript
body: JSON.stringify(this.buildRequestBody(request)),
```

**streamChat 変更差分**:

変更前 (L111-118):

```typescript
body: JSON.stringify({
  contents: this.formatContents(request),
  generationConfig: {
    temperature: request.temperature,
    maxOutputTokens: request.maxTokens,
  },
}),
```

変更後:

```typescript
body: JSON.stringify(this.buildRequestBody(request)),
```

### Task 2-5: APIバージョン判断

`research/google-models.md` の調査結果に基づく判断:

| 検討事項                                | 内容                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `v1` での `system_instruction` 対応状況 | 要確認。Gemini 2.5 GA で v1 にも追加された可能性あり                    |
| `v1beta` の安定性                       | ベータ版。Breaking change の可能性がある                                |
| 採用方針                                | 安全策として `v1beta` を採用（`system_instruction` の確実な動作を優先） |

**変更**:

```typescript
// 変更前
this.baseUrl =
  config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1";

// 変更後
this.baseUrl =
  config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
```

**理由**: `research/google-models.md` に「安全策: v1beta を使用」と記載されており、v1 での利用可否が未確定であるため、確実に `system_instruction` が動作する `v1beta` を採用する。

### Task 2-6: IPC ハンドラへの影響確認

`buildRequestBody` は `private` メソッドであり、IPC チャンネルに直接影響しない。`sendChat` / `streamChat` のシグネチャは変更しないため、呼び出し元（`BaseLLMAdapter` のインターフェース）への影響はない。

## 参照資料

| 資料名         | パス                                                  | 内容                       |
| -------------- | ----------------------------------------------------- | -------------------------- |
| 要件定義書     | `phase-1-requirements.md`                             | FR-03-01〜FR-03-04、AC定義 |
| 現行実装       | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | 変更前コード               |
| Google API調査 | `../../research/google-models.md`                     | v1/v1beta比較              |

## 成果物

| 成果物 | パス                              | 説明                     |
| ------ | --------------------------------- | ------------------------ |
| 設計書 | `phase-2-design.md`（本ファイル） | 変更前後の設計・実装仕様 |

## 完了条件

- [x] 変更前後のクラス設計が明記されている
- [x] `formatContents` の変更内容（削除するコード）が明確
- [x] `buildRequestBody` の完全な実装コードが記述されている
- [x] `sendChat` / `streamChat` の変更差分が明確
- [x] `baseUrl` のデフォルト値変更の根拠が記録されている
- [x] 型安全性の設計判断が記録されている（`Record<string, unknown>` 採用理由）
- [x] IPC ハンドラへの影響がないことが確認されている

## 統合テスト連携

Task02（AnthropicAdapter更新）は本タスクと並列実行可能であり、互いの設計に依存関係はない。Task04 は本タスクと Task02 の両方が完了してから開始する。

## 次のPhase

Phase 3: 設計レビュー
