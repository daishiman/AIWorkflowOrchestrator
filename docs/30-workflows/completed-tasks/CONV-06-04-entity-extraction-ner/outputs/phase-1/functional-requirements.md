# 機能要件書 - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 1                     |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. IEntityExtractor インターフェース

### 1.1 必須メソッド

| メソッド          | 説明                               | 入力                                  | 出力                                            |
| ----------------- | ---------------------------------- | ------------------------------------- | ----------------------------------------------- |
| `extract()`       | 単一チャンクからエンティティを抽出 | `ChunkEntity`, `ExtractionOptions?`   | `Promise<Result<ExtractionResult, Error>>`      |
| `extractBatch()`  | 複数チャンクからバッチ抽出         | `ChunkEntity[]`, `ExtractionOptions?` | `Promise<Result<BatchExtractionResult, Error>>` |
| `mergeEntities()` | 抽出結果のマージ（重複除去）       | `ExtractionResult[]`                  | `ExtractedEntity[]`                             |

### 1.2 インターフェース定義

```typescript
interface IEntityExtractor {
  /**
   * 単一チャンクからエンティティを抽出
   * @param chunk - 抽出対象のチャンク
   * @param options - 抽出オプション（省略可）
   * @returns 抽出結果またはエラー
   */
  extract(
    chunk: ChunkEntity,
    options?: ExtractionOptions,
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * 複数チャンクからバッチ抽出
   * @param chunks - 抽出対象のチャンク配列
   * @param options - 抽出オプション（省略可）
   * @returns バッチ抽出結果またはエラー
   */
  extractBatch(
    chunks: ChunkEntity[],
    options?: ExtractionOptions,
  ): Promise<Result<BatchExtractionResult, Error>>;

  /**
   * 抽出結果のマージ・重複除去
   * @param results - 抽出結果配列
   * @returns マージ後のエンティティ配列
   */
  mergeEntities(results: ExtractionResult[]): ExtractedEntity[];
}
```

---

## 2. エンティティタイプ定義

### 2.1 対応エンティティタイプ（52種類・10カテゴリ）

既存の `EntityTypes` 定義（`packages/shared/src/types/rag/graph/types.ts`）に準拠。

| カテゴリ             | タイプ数 | 主要タイプ例                                                   |
| -------------------- | -------- | -------------------------------------------------------------- |
| 人物・組織           | 4        | `person`, `organization`, `role`, `team`                       |
| 場所・時間           | 3        | `location`, `date`, `event`                                    |
| ビジネス・経営       | 9        | `company`, `product`, `service`, `strategy`, `metric`          |
| 技術全般             | 5        | `technology`, `tool`, `method`, `standard`, `protocol`         |
| コード・ソフトウェア | 7        | `programming_language`, `framework`, `library`, `api`, `class` |
| 抽象概念             | 5        | `concept`, `theory`, `principle`, `pattern`, `model`           |
| ドキュメント構造     | 5        | `document`, `chapter`, `section`, `paragraph`, `heading`       |
| ドキュメント要素     | 9        | `keyword`, `summary`, `figure`, `table`, `code_snippet`        |
| メディア             | 4        | `image`, `video`, `audio`, `diagram`                           |
| その他               | 1        | `other`                                                        |

---

## 3. 抽出オプション (ExtractionOptions)

### 3.1 オプション定義

```typescript
interface ExtractionOptions {
  /** 抽出対象のエンティティタイプ（デフォルト: 全52タイプ） */
  types?: EntityType[];

  /** 最小信頼度閾値（0.0〜1.0、デフォルト: 0.5） */
  minConfidence?: number;

  /** チャンクあたり最大抽出数（デフォルト: 20） */
  maxEntitiesPerChunk?: number;

  /** 最小名前長（デフォルト: 2文字） */
  minNameLength?: number;

  /** 説明生成を有効化（LLMのみ、デフォルト: true） */
  generateDescriptions?: boolean;

  /** LLM使用フラグ（デフォルト: true） */
  useLLM?: boolean;

  /** LLM温度パラメータ（デフォルト: 0.1） */
  temperature?: number;

  /** 最大トークン数（デフォルト: 2000） */
  maxTokens?: number;
}
```

### 3.2 デフォルト値

| オプション             | デフォルト値 | 範囲/制約    |
| ---------------------- | ------------ | ------------ |
| `types`                | 全52タイプ   | EntityType[] |
| `minConfidence`        | 0.5          | 0.0〜1.0     |
| `maxEntitiesPerChunk`  | 20           | 1〜100       |
| `minNameLength`        | 2            | 1〜50        |
| `generateDescriptions` | true         | boolean      |
| `useLLM`               | true         | boolean      |
| `temperature`          | 0.1          | 0.0〜2.0     |
| `maxTokens`            | 2000         | 100〜4000    |

---

## 4. 出力形式

### 4.1 ExtractedEntity型

```typescript
interface ExtractedEntity {
  /** エンティティ名（原形、1〜255文字） */
  name: string;

  /** 正規化名（小文字・空白正規化、検索用） */
  normalizedName: string;

  /** エンティティタイプ（52種類） */
  type: EntityType;

  /** 信頼度スコア（0.0〜1.0） */
  confidence: number;

  /** 説明文（LLM生成時のみ、最大1000文字） */
  description?: string;

  /** 別名・エイリアス（各1〜255文字） */
  aliases: string[];

  /** テキスト内出現情報 */
  mentions: Mention[];
}
```

### 4.2 Mention型（出現情報）

```typescript
interface Mention {
  /** 出現チャンクID */
  chunkId: ChunkId;

  /** 開始位置（文字オフセット、0以上） */
  startPosition: number;

  /** 終了位置（文字オフセット、startPositionより大きい） */
  endPosition: number;

  /** 前後コンテキスト（最大200文字） */
  context: string;
}
```

### 4.3 ExtractionResult型

```typescript
interface ExtractionResult {
  /** 抽出元チャンクID */
  chunkId: ChunkId;

  /** 抽出されたエンティティ配列 */
  entities: ExtractedEntity[];

  /** 抽出処理メトリクス */
  metrics: ExtractionMetrics;
}

interface ExtractionMetrics {
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;

  /** 抽出されたエンティティ数 */
  entityCount: number;

  /** 使用した抽出方式 */
  extractorType: "llm" | "rule-based";
}
```

### 4.4 BatchExtractionResult型

```typescript
interface BatchExtractionResult {
  /** 各チャンクの抽出結果 */
  results: ExtractionResult[];

  /** バッチ処理全体のサマリー */
  summary: BatchSummary;
}

interface BatchSummary {
  /** 処理したチャンク数 */
  totalChunks: number;

  /** 成功したチャンク数 */
  successCount: number;

  /** 失敗したチャンク数 */
  failureCount: number;

  /** 抽出されたユニークエンティティ数 */
  uniqueEntityCount: number;

  /** 合計処理時間（ミリ秒） */
  totalProcessingTimeMs: number;
}
```

---

## 5. バッチ処理仕様

### 5.1 バッチ処理要件

| 項目             | 仕様                                       |
| ---------------- | ------------------------------------------ |
| 最大バッチサイズ | 100チャンク/バッチ                         |
| 並列処理         | Promise.all による並列実行                 |
| 部分失敗時の挙動 | 成功分を返却、失敗分はエラーログ           |
| 重複除去         | `mergeEntities()` で正規化名ベースでマージ |
| タイムアウト     | チャンクあたり30秒、バッチ全体5分          |

### 5.2 バッチ処理フロー

```
入力: ChunkEntity[]
    │
    ▼
┌──────────────────────────────────────────┐
│  1. バッチサイズ検証（100件以下）        │
│  2. 各チャンクを並列抽出 (Promise.all)   │
│  3. 部分失敗をログ記録                   │
│  4. mergeEntities() で重複除去           │
│  5. BatchExtractionResult を構築         │
└──────────────────────────────────────────┘
    │
    ▼
出力: Result<BatchExtractionResult, Error>
```

---

## 6. 抽出器実装クラス

### 6.1 LLMEntityExtractor

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 実装場所 | `packages/shared/src/services/extraction/entity-extractor.ts` |
| 特性     | 高精度、未知エンティティ対応                                  |
| 依存     | ILLMProvider（依存性注入）                                    |
| 処理時間 | 数秒〜（LLM API依存）                                         |

**主要機能**:

- プロンプトエンジニアリングによる52タイプ分類
- 説明文・エイリアス生成
- JSON形式でのレスポンスパース
- 未知エンティティの検出

### 6.2 RuleBasedEntityExtractor

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| 実装場所 | `packages/shared/src/services/extraction/rule-based-extractor.ts` |
| 特性     | 高速、パターンマッチ、フォールバック用                            |
| 依存     | なし（純粋関数）                                                  |
| 処理時間 | ミリ秒単位                                                        |

**パターンカテゴリ**:

| カテゴリ           | 検出例                                | 信頼度   |
| ------------------ | ------------------------------------- | -------- |
| 技術名             | TypeScript, React, PostgreSQL, Docker | 0.85-0.9 |
| 組織名             | Google, Microsoft, OpenAI             | 0.9      |
| 日付               | 2024-01-15, 2024年1月15日, 2024/01/15 | 0.9-0.95 |
| プログラミング言語 | JavaScript, Python, Go, Rust          | 0.9      |
| フレームワーク     | Next.js, Express, Django, Rails       | 0.85     |

---

## 7. 永続化連携

### 7.1 データベーステーブル

| テーブル         | 役割                             |
| ---------------- | -------------------------------- |
| `entities`       | エンティティ本体（ノード）       |
| `chunk_entities` | チャンクとエンティティの関連付け |

### 7.2 ExtractedEntity → EntityEntity 変換

| ExtractedEntity  | EntityEntity       | 変換ロジック                 |
| ---------------- | ------------------ | ---------------------------- |
| `name`           | `name`             | そのまま                     |
| `normalizedName` | `normalizedName`   | そのまま                     |
| `type`           | `type`             | EntityType enumにマッピング  |
| `confidence`     | `importance`       | 初期重要度として使用         |
| `description`    | `description`      | そのまま（LLM生成時のみ）    |
| `aliases`        | `aliases`          | JSON配列として格納           |
| `mentions`       | → `chunk_entities` | 位置情報を中間テーブルへ保存 |

### 7.3 永続化フロー

```
ExtractedEntity[]
    │
    ▼
┌──────────────────────────────────────────┐
│  1. 正規化名で既存エンティティ検索       │
│  2. 新規 → entities に INSERT            │
│  3. 既存 → importance スコア更新         │
│  4. chunk_entities に関連付け保存        │
└──────────────────────────────────────────┘
    │
    ▼
EntityEntity[] (Knowledge Graph ノード)
```

---

## 8. LLMプロバイダー連携

### 8.1 ILLMProvider インターフェース

```typescript
interface ILLMProvider {
  /** 使用モデルID */
  readonly modelId: string;

  /**
   * プロンプト送信・応答取得
   * @param prompt - システムプロンプト + ユーザープロンプト
   * @param options - 生成オプション（temperature, maxTokens等）
   * @returns 生成されたテキストまたはエラー
   */
  generate(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<Result<string, LLMError>>;
}
```

### 8.2 対応LLMプロバイダー

| プロバイダー | モデル例          | 特性               |
| ------------ | ----------------- | ------------------ |
| Anthropic    | claude-sonnet-4-5 | 高精度、日本語対応 |
| OpenAI       | gpt-4o            | 汎用、高速         |
| Google       | gemini-2.0-flash  | 大規模コンテキスト |

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
