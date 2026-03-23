# Phase 2: 設計 - LLM Provider & Model Modernization

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| 機能名 | llm-provider-model-modernization |
| 作成日 | 2026-03-23                       |

## 目的

Phase 1 で定義した要件に基づき、5タスク（Data/Adapter/Test/Schema lane）の設計とタスク間依存関係を確定する。

## 参照資料

| 資料名     | パス                           | 内容               |
| ---------- | ------------------------------ | ------------------ |
| 要件定義   | `phase-1-requirements.md`      | FR/NFR/AC 定義     |
| 仕様パック | `index.md`                     | 全体概要・Lane分離 |
| OpenAI     | `research/openai-models.md`    | API仕様詳細        |
| Anthropic  | `research/anthropic-models.md` | API仕様詳細        |
| Google     | `research/google-models.md`    | API仕様詳細        |
| xAI        | `research/xai-models.md`       | API仕様詳細        |

## アーキテクチャ設計

### レイヤー影響分析

```
Renderer (llmSlice.ts)         ← 変更不要（モデルリストは動的取得）
  |
Preload (channels.ts)          ← 変更不要（チャンネル定義はそのまま）
  |
Main Process
  ├── handlers/llm.ts          ← Task01: PROVIDER_CONFIGS + inferProviderId
  └── adapters/llm/
      ├── AnthropicAdapter.ts  ← Task02: ヘルスチェックモデル更新
      ├── GoogleAdapter.ts     ← Task03: system_instruction 対応
      ├── OpenAIAdapter.ts     ← 変更不要
      └── xAIAdapter.ts        ← 変更不要
  |
packages/shared
  └── types/llm/schemas/
      └── provider.ts          ← Task05: description フィールド検討
```

### 依存関係グラフ

```
Task01 ─┬→ Task02 ─┐
        └→ Task03 ─┤→ Task04 → Task05(optional)
                    │
```

- Task01 は全タスクの前提条件（モデル ID が変わるため）
- Task02, Task03 は互いに独立で並列実行可能
- Task04 は Task01-03 すべての完了後に実行
- Task05 はオプションで Task04 完了後

## タスク設計詳細

### Task01: PROVIDER_CONFIGS + inferProviderId 更新（Data lane）

**変更点**:

1. `PROVIDER_CONFIGS` 配列内の全プロバイダーのモデル定義を差し替え
2. 型定義に `description?: string` を追加
3. `inferProviderId` に `o3`/`o4` プレフィックスパターンを追加

**設計判断**:

| 判断事項                     | 決定                        | 根拠                                                                    |
| ---------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| デフォルトモデルの選定       | 各社の主力モデル            | OpenAI: gpt-4.1, Anthropic: claude-sonnet-4-6, Google: gemini-2.5-flash |
| Context Window 値            | 各社公式ドキュメント値      | research/\*.md 参照                                                     |
| OpenRouter モデル            | 変更しない                  | スコープ外                                                              |
| `description` フィールド追加 | `PROVIDER_CONFIGS` 型に追加 | LLMModelSchema との整合性                                               |

**影響範囲**: `handleGetProviders` の戻り値が変わるため、テスト期待値の更新が必須（Task04）。

### Task02: AnthropicAdapter ヘルスチェック更新（Adapter lane）

**変更点**: L207 のヘルスチェックモデル ID を `claude-haiku-4-5` に更新

**設計判断**:

| 判断事項             | 決定               | 根拠                      |
| -------------------- | ------------------ | ------------------------- |
| ヘルスチェックモデル | `claude-haiku-4-5` | 最安・最速モデル          |
| `anthropic-version`  | 変更なし           | `2023-06-01` が最新のまま |
| リクエスト形式       | 変更なし           | Messages API に変更なし   |

**影響範囲**: 最小限。モデル ID 文字列の置換のみ。

### Task03: GoogleAdapter system_instruction 対応（Adapter lane）

**変更点**:

1. `formatContents` から systemPrompt ロジックを分離
2. `buildRequestBody` ヘルパーメソッドを追加
3. `sendChat` / `streamChat` のリクエストボディを更新
4. API バージョンの判断

**設計判断**:

| 判断事項                    | 決定                                      | 根拠                                  |
| --------------------------- | ----------------------------------------- | ------------------------------------- |
| API バージョン              | `v1beta` に変更（安全策）                 | `system_instruction` の確実なサポート |
| `formatContents` リファクタ | systemPrompt を分離                       | SoC（関心の分離）                     |
| `buildRequestBody` 導入     | sendChat/streamChat の共通化              | DRY 原則                              |
| systemPrompt 省略時         | `system_instruction` フィールド自体を省略 | API 仕様に準拠                        |

**コード設計**:

```typescript
// GoogleAdapter.ts の設計

// 1. formatContents: 会話メッセージのみ
private formatContents(request: LLMChatRequestInput) {
  return request.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

// 2. buildRequestBody: リクエストボディ構築（system_instruction 含む）
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

### Task04: テスト期待値更新（Test lane）

**変更点**: 全テストファイルのモデル ID 期待値を新定義に更新し、新規テストケースを追加

**テスト変更マトリクス**:

| テストファイル              | 変更種別   | 変更内容                                      |
| --------------------------- | ---------- | --------------------------------------------- |
| `llm.test.ts`               | 期待値更新 | handleGetProviders のモデル ID 更新           |
| `llm.test.ts`               | テスト追加 | inferProviderId に o3/o4-mini テストケース    |
| `AnthropicAdapter.test.ts`  | 期待値更新 | ヘルスチェックモデル ID                       |
| `GoogleAdapter.test.ts`     | テスト追加 | system_instruction フィールドの送信確認       |
| `GoogleAdapter.test.ts`     | テスト追加 | systemPrompt なし時の system_instruction 省略 |
| `OpenAIAdapter.test.ts`     | 確認       | モデル ID 直接使用箇所があれば更新            |
| `xAIAdapter.test.ts`        | 確認       | モデル ID 直接使用箇所があれば更新            |
| `LLMAdapterFactory.test.ts` | 確認       | ファクトリーテストの整合性                    |

### Task05: 共有型スキーマ拡張（Schema lane, オプション）

**変更点**: `PROVIDER_CONFIGS` の型定義に `description?: string` を追加

**設計判断**:

| 判断事項                      | 決定                                  | 根拠                         |
| ----------------------------- | ------------------------------------- | ---------------------------- |
| `LLMModelSchema` への変更     | 不要（既に `description` が定義済み） | `provider.ts:34` に existing |
| `PROVIDER_CONFIGS` 型への変更 | `description?: string` を追加         | LLMModelSchema との整合性    |
| Renderer 側対応               | スコープ外（未タスク化）              | UI変更は別タスクで対応       |

## 実行計画

```
Phase 1: 設計完了（本ドキュメント）
  |
  v
Step-01 (直列): Task01 — PROVIDER_CONFIGS + inferProviderId
  |
  +--- Step-02 (並列): Task02 — AnthropicAdapter
  +--- Step-02 (並列): Task03 — GoogleAdapter
  |
  v (全完了待ち)
Step-03 (直列): Task04 — テスト期待値更新
  |
  v
Step-04 (直列): Task05 — スキーマ拡張（オプション）
```

## リスク分析

| リスク                                    | 影響度 | 対策                                        |
| ----------------------------------------- | ------ | ------------------------------------------- |
| GoogleAdapter の v1/v1beta 判断ミス       | 中     | Task03 内で API バージョン検証テストを実施  |
| inferProviderId の o3/o4 パターン漏れ     | 高     | Task04 で網羅的テストケースを追加           |
| 保存済み設定との不整合                    | 中     | NFR-01 に基づくフォールバック検討           |
| system_instruction フィールドの後方互換性 | 低     | v1beta で確実にサポートされることを確認済み |

## 成果物

| 成果物 | パス                              | 説明       |
| ------ | --------------------------------- | ---------- |
| 設計書 | `phase-2-design.md`（本ファイル） | 全体設計書 |

## 完了条件

- [x] 全5タスクの設計詳細が記載されている
- [x] タスク間依存関係が明確に定義されている
- [x] 各タスクの設計判断とその根拠が記載されている
- [x] リスク分析と対策が記載されている
- [x] 実行計画（直列/並列）が定義されている

## 次のPhase

Phase 3: 設計レビュー
