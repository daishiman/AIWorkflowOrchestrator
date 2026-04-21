# Implementation Guide - TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001

## Part 1: 中学生でもわかる概念説明

### Late Chunking とは何か？（本の例え話）

普通の検索システムは、こんなふうに動きます：

1. 長い文章（本）を小さなかたまり（章）に切り分ける
2. 各章を**個別に**コンピューターに読み込ませてベクトル（数字の羅列）を作る
3. 「この章はどんな内容か」をその章の文字だけで判断する

この方法の問題は、各章が**前後の文脈を知らない**ことです。
例えば「彼はそれを取り上げた」という章は、前の章で「田中さんがりんごを...」と書いていても、
切り分けてしまうと「彼」も「それ」も何を指しているか分かりません。

**Late Chunking は違います：**

1. 長い文章（本）**全体**をコンピューターに読み込ませる
2. 全体を読んだあとで、「この部分（章）はどんな内容か」をまとめる
3. 各章が**前後の文脈を知った状態**でベクトルが作られる

本を最初から最後まで読んでから各章を要約する、ということです。
これにより検索品質が **10〜30% 向上** します。

### EmbeddingPipeline への統合とは？

`EmbeddingPipeline` は「文章 → ベクトル」という変換を自動化する仕組みです。
今回の実装では、パイプラインに **Stage 2.5** を追加しました：

```
変更前のパイプライン:
  Stage 1: 前処理（テキスト正規化）
  Stage 2: チャンキング（文章を小さく分割）
  Stage 3: 埋め込み（各チャンクのベクトルを生成）← embedBatch() を使用
  Stage 4: 重複排除（任意）

変更後のパイプライン:
  Stage 1: 前処理（テキスト正規化）
  Stage 2: チャンキング（境界情報のみを取得）
  Stage 2.5: Late Chunking（全文を一度にエンコードしてチャンク別にプーリング）← 新規
  Stage 3: 埋め込み ← lateChunking.enabled=true の場合はスキップ
  Stage 4: 重複排除（任意）
```

設定で `lateChunking: { enabled: true }` を指定するだけで
自動的に Stage 2.5 フローが使われ、Stage 3（通常の埋め込み）はスキップされます。

---

## Part 2: 開発者向け技術的詳細

### 変更ファイル一覧

| ファイル                                                                                           | 変更種別 | 概要                                                                                                                |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`                                         | 修正     | `PipelineConfig.lateChunking`、`StageTimings.lateChunking`、`PipelineStage` 拡張                                    |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | 修正     | Stage 2.5 実装、`runLateChunkingStage()`、`validateLateChunkingConfig()`、`convertLateChunkingToEmbeddingResults()` |
| `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | 新規     | Late Chunking統合テスト16件                                                                                         |

### 型定義の変更

#### `PipelineConfig` への追加

```typescript
export interface PipelineConfig {
  // ... 既存フィールド ...

  /** Late Chunking設定（オプション） */
  lateChunking?: {
    /** Late Chunking有効化フラグ */
    enabled: boolean;
    /** プーリング戦略（デフォルト: "mean"） */
    poolingStrategy?: PoolingStrategy; // "mean" | "max" | "cls"
    /** 最大トークン長（デフォルト: 512） */
    maxTokenLength?: number;
  };
}
```

#### `StageTimings` への追加

```typescript
export interface StageTimings {
  preprocessing: number;
  chunking: number;
  embedding: number;
  deduplication: number;
  /** Late Chunking有効時のみ記録（無効時は undefined） */
  lateChunking?: number;
}
```

#### `PipelineStage` への追加

```typescript
export type PipelineStage =
  | "preprocessing"
  | "chunking"
  | "lateChunking" // 新規追加
  | "embedding"
  | "deduplication"
  | "completed";
```

### 実行フロー（7ステップ）

`EmbeddingPipeline.process()` 内での Late Chunking フロー：

1. **Stage 1** - `preprocess(text)` でテキスト正規化
2. **Stage 2** - `ChunkingService.chunk()` で境界情報を取得（チャンクオブジェクトを受け取る）
3. **Stage 2.5（新規）** - `runLateChunkingStage()` を呼び出す
   - `config.lateChunking?.enabled !== true` なら `null` を返してスキップ
   - `validateLateChunkingConfig()` でバリデーション実行
   - `onProgress({ currentStage: "lateChunking", progressPercentage: 50, ... })` を通知
   - `chunk.position.start/end` から `ChunkBoundary[]` を構築
   - `EmbeddingService.generateChunkEmbeddings(preprocessedText, boundaries, {...})` を呼び出す
   - `convertLateChunkingToEmbeddingResults()` で chunkId 順序アライメント
   - `stageTimings.lateChunking` を記録
4. **Stage 3** - Late Chunking結果が `null` でなければ `embeddings.push(...lateChunkingEmbeddings)` してスキップ
   - `null` の場合（通常フロー）は `EmbeddingService.embedBatch()` を呼び出す
5. **Stage 4** - 重複排除（設定がある場合のみ）
6. **完了** - `onProgress({ currentStage: "completed", progressPercentage: 100, ... })`
7. **メトリクス記録** - `PipelineMetricsCollector.recordPipelineRun()`

### API シグネチャ

#### `runLateChunkingStage()`（private）

```typescript
private async runLateChunkingStage(
  chunks: Chunk[],
  preprocessedText: string,
  config: PipelineConfig,
  stageTimings: StageTimings,
  startTime: number,
  onProgress?: (progress: PipelineProgress) => void,
): Promise<EmbeddingResult[] | null>
```

- `config.lateChunking?.enabled !== true` の場合は `null` を即返却
- 成功時は `EmbeddingResult[]`（chunks と同じ長さ、chunkId 順に整列済み）

#### `validateLateChunkingConfig()`（private）

```typescript
private validateLateChunkingConfig(config: PipelineConfig): void
```

- `poolingStrategy` が `"mean" | "max" | "cls"` 以外 → `PipelineError`
- `maxTokenLength <= 0` → `PipelineError`

#### `convertLateChunkingToEmbeddingResults()`（private）

```typescript
private convertLateChunkingToEmbeddingResults(
  chunks: Chunk[],
  results: ChunkEmbeddingResult[],
): EmbeddingResult[]
```

- `Map<chunkId, ChunkEmbeddingResult>` でルックアップし、元の chunk 順序に整列
- 対応する結果が見つからないチャンクは空の `EmbeddingResult` を返す

### Consumer Contract（使用方法）

| 設定パターン                                              | 挙動                                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `lateChunking` 未設定                                     | 通常フロー（`embedBatch()`）                                                                               |
| `lateChunking: { enabled: false }`                        | 通常フロー（`embedBatch()`）                                                                               |
| `lateChunking: { enabled: true }`                         | Late Chunking フロー（`generateChunkEmbeddings()`）、デフォルト poolingStrategy="mean", maxTokenLength=512 |
| `lateChunking: { enabled: true, poolingStrategy: "max" }` | Late Chunking フロー、max プーリング                                                                       |
| `lateChunking: { enabled: true, maxTokenLength: 256 }`    | Late Chunking フロー、最大256トークン                                                                      |

### 使用例

```typescript
import { EmbeddingPipeline } from "@repo/shared/services/embedding/pipeline";
import type { PipelineConfig } from "@repo/shared/services/embedding/pipeline";

const config: PipelineConfig = {
  chunking: {
    strategy: "fixed-size",
    options: { maxTokens: 512 },
  },
  embedding: {
    modelId: "text-embedding-ada-002",
  },
  // Late Chunking を有効化
  lateChunking: {
    enabled: true,
    poolingStrategy: "mean",
    maxTokenLength: 512,
  },
};

const result = await pipeline.process(input, config, (progress) => {
  console.log(progress.currentStage); // "preprocessing" | "chunking" | "lateChunking" | "completed"
  console.log(progress.progressPercentage); // 0-100
});

// Late Chunking 結果は通常フローと同じ形式で格納される
console.log(result.embeddings); // EmbeddingResult[]
console.log(result.stageTimings.lateChunking); // number（ms）
```

### エラーハンドリング

| エラーケース                       | 例外                      | メッセージ                                                         |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| 不正な `poolingStrategy`           | `PipelineError`           | `Invalid poolingStrategy: <value>. Must be one of: mean, max, cls` |
| `maxTokenLength <= 0`              | `PipelineError`           | `Invalid maxTokenLength: <value>. Must be positive.`               |
| `generateChunkEmbeddings()` が失敗 | `PipelineError`（ラップ） | `Pipeline failed for document <id>: ...`                           |
| `LateChunkingService` 未設定       | `EmbeddingError`          | `LateChunkingService is not configured.`                           |

### エッジケース・注意事項

1. **chunkId 不一致**: `generateChunkEmbeddings()` が一部の chunkId を返さない場合、該当チャンクは `embedding: [], tokenCount: 0` の空結果になる。警告は出ないが `embeddings[i].embedding.length === 0` で検出可能。

2. **Stage 3 完全スキップ**: `lateChunking.enabled=true` の場合、`EmbeddingService.embedBatch()` は一切呼ばれない。二重課金・二重処理は発生しない。

3. **progressPercentage の変化**:
   - Late Chunking なし: 10（preprocessing）→ 30（chunking）→ 30-70（embedding）→ 100
   - Late Chunking あり: 10（preprocessing）→ 30（chunking）→ 50（lateChunking 開始）→ 65（lateChunking 完了）→ 70（embedding progress, すぐ完了）→ 100

4. **`stageTimings.embedding`**: Late Chunking有効時も `0` として記録される（Stage 3スキップのため）。`stageTimings.lateChunking` で実処理時間を確認すること。

5. **後方互換性**: `StageTimings.lateChunking` はオプショナル（`?`）のため、既存のメトリクス集計コードへの影響なし。`PipelineConfig` も `lateChunking` はオプショナルのため、既存の呼び出しコードへの型エラーなし。

### テストカバレッジ

`packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

| カテゴリ                | テスト数 | 内容                                                                                   |
| ----------------------- | -------- | -------------------------------------------------------------------------------------- |
| Late Chunking無効       | 3        | 未設定・disabled・stageTimings検証                                                     |
| Late Chunking有効フロー | 8        | generateChunkEmbeddings呼び出し、Stage 3スキップ、境界値、タイミング、progressイベント |
| バリデーション          | 3        | 不正poolingStrategy、maxTokenLength=0/負値                                             |
| 後方互換性              | 2        | 既存stageTimings形式、重複排除との共存                                                 |
| **合計**                | **16**   | 全件 PASS                                                                              |
