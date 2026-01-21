# エンティティ抽出サービス (NER) 実装ガイド

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 12                    |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

# Part 1: 概念的な説明（初学者・非技術者向け）

## 1. エンティティ抽出とは何か

### 1.1 日常生活での例え

新聞記事を読むとき、あなたは自然と「重要な単語」を見つけています。

例えば次の文を見てみましょう：

> 「2024年1月15日、**Google**は**東京**で**AI**に関する発表を行いました。」

この文から、以下のような「重要な情報」を取り出せます：

- **Google** → 会社名
- **東京** → 場所
- **AI** → 技術用語
- **2024年1月15日** → 日付

このように**文章の中から意味のある単語（エンティティ）を見つけ出し、種類別に分類する**のが「エンティティ抽出」です。

### 1.2 なぜエンティティ抽出が必要なのか

```
┌─────────────────────────────────────────────────────────────┐
│                    大量のドキュメント                        │
│                                                              │
│  📄 議事録     📄 技術資料    📄 マニュアル    📄 報告書    │
│                                                              │
│               ↓ エンティティ抽出 ↓                          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              整理された情報                            │  │
│  │                                                        │  │
│  │  👤 人物: 山田さん、田中さん...                       │  │
│  │  🏢 組織: Google, Microsoft...                        │  │
│  │  💻 技術: TypeScript, React...                        │  │
│  │  📅 日付: 2024-01-15, 3月末...                        │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│               ↓ 活用 ↓                                      │
│                                                              │
│  ✅ 検索が簡単に     ✅ 関連情報の発見                      │
│  ✅ 知識の可視化     ✅ 質問への回答                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 NER（Named Entity Recognition）とは

**NER（固有表現認識）**は、エンティティ抽出の技術的な名前です。

- **Named Entity** = 名前のついた実体（人名、組織名、地名など）
- **Recognition** = 認識する

つまり、「名前のついた重要なものを自動的に見つける技術」です。

---

## 2. エンティティ抽出の仕組み

### 2.1 2つの抽出方法

本システムでは、2つの方法でエンティティを抽出します：

```
┌─────────────────────────────────────────────────────────────┐
│                    文章（入力）                              │
│  「MicrosoftはTypeScriptを開発しました」                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   方法1: LLM     │    │   方法2: ルール   │
│  （AI による）    │    │ （パターン検索）  │
├──────────────────┤    ├──────────────────┤
│ 特徴:            │    │ 特徴:            │
│ ・高精度         │    │ ・高速           │
│ ・文脈理解       │    │ ・オフライン可   │
│ ・説明文生成     │    │ ・コスト低       │
└─────────┬────────┘    └─────────┬────────┘
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    抽出結果                                  │
│                                                              │
│  [Microsoft] → 組織 (confidence: 90%)                       │
│  [TypeScript] → プログラミング言語 (confidence: 95%)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 52種類のエンティティタイプ

抽出されたエンティティは、52種類に分類されます：

| カテゴリ   | 例                           |
| ---------- | ---------------------------- |
| 人物・組織 | 山田太郎、Google、開発チーム |
| 場所・時間 | 東京、2024-01-15、Q1会議     |
| 技術全般   | 機械学習、Docker、アジャイル |
| コード関連 | TypeScript、React、lodash    |
| 抽象概念   | 依存性注入、SOLID原則        |

### 2.3 信頼度スコア

各エンティティには「どのくらい確信があるか」を示す**信頼度スコア**が付きます。

- **1.0** = 100%確実
- **0.5** = 50%程度の確信
- **0.0** = ほぼ確信なし

例えば：

- "TypeScript" → 0.95（高い確信）
- "それ" → 0.3（エンティティかどうか不確か）

---

## 3. 実際の使用例

### 3.1 技術ドキュメントの整理

```
入力:
  「このプロジェクトではReactとTypeScriptを使用。
   バックエンドはNode.jsで構築しています。」

出力:
  ✓ React (framework)
  ✓ TypeScript (programming_language)
  ✓ Node.js (technology)
```

### 3.2 会議メモからの情報抽出

```
入力:
  「2024年3月31日、山田さんとAWS移行について打ち合わせ。
   4月中に完了予定。」

出力:
  ✓ 2024年3月31日 (date)
  ✓ AWS (service)
  ✓ 4月 (date)
```

---

# Part 2: 技術的詳細（開発者向け）

## 4. IEntityExtractor インターフェース

### 4.1 インターフェース定義

```typescript
// packages/shared/src/services/extraction/interfaces.ts

import type { Result } from "../../types/rag/result";
import type { Chunk } from "../chunking/types";

/**
 * エンティティ抽出インターフェース
 * @description Strategy Pattern for different extraction methods
 */
export interface IEntityExtractor {
  /**
   * 単一チャンクからエンティティを抽出
   */
  extract(
    chunk: Chunk,
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * 複数チャンクからバッチ抽出
   */
  extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<BatchExtractionResult, Error>>;

  /**
   * 複数結果のエンティティをマージ
   */
  mergeEntities(results: ExtractionResult[]): ExtractedEntity[];
}
```

### 4.2 ILLMProvider インターフェース

```typescript
/**
 * LLMプロバイダーインターフェース
 * @description LLMとの通信を抽象化（DI用）
 */
export interface ILLMProvider {
  readonly modelId: string;

  generate(
    prompt: string,
    options?: LLMGenerateOptions,
  ): Promise<Result<LLMGenerateResult, Error>>;
}

export interface LLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}
```

---

## 5. Zodスキーマ定義

### 5.1 ExtractedEntity

```typescript
// packages/shared/src/services/extraction/types.ts

import { z } from "zod";

export const ExtractedEntitySchema = z.object({
  // エンティティ名（原形）
  name: z.string().min(1),

  // 正規化名（重複検出用）
  normalizedName: z.string().min(1),

  // タイプ（52種類のいずれか）
  type: z.enum(EntityTypeValues),

  // 信頼度（0.0〜1.0）
  confidence: z.number().min(0).max(1),

  // 説明文（LLM生成時のみ）
  description: z.string().optional(),

  // 別名・エイリアス
  aliases: z.array(z.string()).default([]),

  // テキスト内出現情報
  mentions: z.array(MentionSchema).default([]),

  // 追加属性
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;
```

### 5.2 EntityExtractionOptions

```typescript
export const EntityExtractionOptionsSchema = z.object({
  // 抽出対象タイプ（省略時は全52タイプ）
  types: z.array(z.enum(EntityTypeValues)).optional(),

  // 最小信頼度閾値
  minConfidence: z.number().min(0).max(1).default(0.5),

  // チャンクあたり最大抽出数
  maxEntitiesPerChunk: z.number().int().positive().default(20),

  // 最小エンティティ名長
  minNameLength: z.number().int().positive().default(2),

  // 説明生成フラグ（LLMのみ有効）
  generateDescriptions: z.boolean().default(true),

  // LLM使用フラグ
  useLLM: z.boolean().default(true),

  // リトライ回数
  maxRetries: z.number().int().nonnegative().default(3),
});
```

### 5.3 ExtractionResult

```typescript
export const ExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
  chunkId: z.string(),
  processingTimeMs: z.number().nonnegative(),
  modelUsed: z.string(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
```

---

## 6. 実装クラス

### 6.1 LLMEntityExtractor

高精度なエンティティ抽出を行うLLMベースの実装です。

```typescript
// 使用例
import { LLMEntityExtractor } from "@repo/shared/services/extraction";

// LLMプロバイダーをDIで注入
const extractor = new LLMEntityExtractor(llmProvider);

// 単一チャンク抽出
const result = await extractor.extract(chunk, {
  minConfidence: 0.7,
  generateDescriptions: true,
});

if (result.isOk()) {
  console.log(result.value.entities);
}
```

**特徴**:

- 52タイプの分類
- コンテキスト理解
- 説明文・エイリアス生成
- 自動リトライ（指数バックオフ）

### 6.2 RuleBasedEntityExtractor

パターンマッチングによる高速抽出を行う実装です。

```typescript
// 使用例
import { RuleBasedEntityExtractor } from "@repo/shared/services/extraction";

const extractor = new RuleBasedEntityExtractor();

// 即座に結果が返る（外部API不要）
const result = await extractor.extract(chunk);
```

**特徴**:

- 外部依存なし
- ミリ秒単位の処理
- 決定論的（テスト容易）
- LLMフォールバック用

### 6.3 フォールバック戦略

```typescript
// LLM失敗時は自動的にRuleBasedにフォールバック
const llmExtractor = new LLMEntityExtractor(llmProvider, {
  fallbackExtractor: new RuleBasedEntityExtractor(),
});

// LLMがエラーでもRuleBasedの結果が返る
const result = await llmExtractor.extract(chunk);
```

---

## 7. バッチ処理

### 7.1 extractBatch() の使用

```typescript
// 複数チャンクを並列処理
const chunks = [chunk1, chunk2, chunk3 /* ... */];

const result = await extractor.extractBatch(chunks, {
  maxEntitiesPerChunk: 10,
});

if (result.isOk()) {
  const { results, totalEntities, processingTimeMs } = result.value;

  // 各チャンクの結果
  for (const r of results) {
    console.log(`Chunk ${r.chunkId}: ${r.entities.length} entities`);
  }
}
```

### 7.2 mergeEntities() によるマージ

```typescript
// 複数結果をマージ（重複除去・統合）
const mergedEntities = extractor.mergeEntities(results);

// マージロジック:
// - normalizedNameで重複検出
// - confidence最大値を採用
// - mentions配列を結合
// - aliases配列を統合
```

---

## 8. エラーハンドリング

### 8.1 Result型パターン

```typescript
import { Result, ok, err } from "neverthrow";

const result = await extractor.extract(chunk);

// パターン1: isOk/isErr
if (result.isOk()) {
  const entities = result.value.entities;
} else {
  console.error("Error:", result.error.message);
}

// パターン2: match
result.match(
  (value) => console.log("Success:", value.entities.length),
  (error) => console.error("Error:", error.message),
);
```

### 8.2 エラーコード

| エラーコード       | 説明                    | 対処                    |
| ------------------ | ----------------------- | ----------------------- |
| LLM_TIMEOUT        | LLM呼び出しタイムアウト | リトライ→フォールバック |
| LLM_RATE_LIMIT     | レート制限超過          | 待機後リトライ          |
| LLM_RESPONSE_PARSE | JSONパース失敗          | 空結果またはリトライ    |
| INVALID_CHUNK      | チャンク入力が不正      | バリデーションエラー    |

---

## 9. パフォーマンス特性

### 9.1 処理速度目安

| 処理                   | RuleBased | LLM        |
| ---------------------- | --------- | ---------- |
| 単一チャンク (1KB)     | < 10ms    | 500-2000ms |
| バッチ (100チャンク)   | < 1000ms  | 5-30秒     |
| mergeEntities (1000件) | < 100ms   | < 100ms    |

### 9.2 推奨バッチサイズ

| ユースケース     | 推奨サイズ | 理由                   |
| ---------------- | ---------- | ---------------------- |
| リアルタイム処理 | 1-10       | 低レイテンシ           |
| バッチ処理       | 50-100     | スループット最大化     |
| 大量データ       | 100        | メモリ効率とのバランス |

---

## 10. テスト用ユーティリティ

### 10.1 モックLLMプロバイダー

```typescript
import { createMockLLMProvider } from "@repo/shared/services/extraction";

const mockProvider = createMockLLMProvider({
  responses: new Map([["test prompt", '{"entities": [...]}']]),
});

const extractor = new LLMEntityExtractor(mockProvider);
```

### 10.2 フィクスチャ

```typescript
import {
  createTestChunk,
  SAMPLE_ENTITIES,
} from "@repo/shared/services/extraction/__tests__/fixtures";

const chunk = createTestChunk("TypeScriptとReactを使用しています");
```

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
