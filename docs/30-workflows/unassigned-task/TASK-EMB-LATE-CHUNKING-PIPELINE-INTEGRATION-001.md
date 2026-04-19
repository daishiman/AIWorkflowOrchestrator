# Late Chunking: EmbeddingPipeline・設定導線への正式統合 - タスク指示書

## メタ情報

```yaml
issue_number: 2315
task_id: TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001
task_name: Late Chunking EmbeddingPipeline・設定導線への正式統合
category: 機能統合
target_feature: packages/shared/src/services/embedding/pipeline / config
priority: 高
scale: 大規模
status: 未実施
source_phase: UNASSIGNED-EMB-005 review wave Phase 10-12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001          |
| タスク名     | Late Chunking: EmbeddingPipeline・設定導線への正式統合   |
| 分類         | 機能統合                                                 |
| 対象機能     | packages/shared/src/services/embedding/pipeline / config |
| 優先度       | 高                                                       |
| 見積もり規模 | 大規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | UNASSIGNED-EMB-005 review wave Phase 10-12               |
| 発見日       | 2026-04-19                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の `EmbeddingPipeline`（`packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`）は以下のフローで動作する。

1. 前処理（`preprocess()`）
2. チャンキング（`ChunkingService.chunk()`）
3. 埋め込み生成（`EmbeddingService.embedBatch()`）
4. 重複排除（オプション）

Late Chunkingは「チャンキング後にEmbeddingServiceで個別埋め込みを生成する」通常フローとは異なり、「文書全体を一度にエンコードしてからチャンク境界でプーリングする」フローを必要とする。

しかし、`EmbeddingPipeline` には Late Chunking専用の処理フロー（`LateChunkingService.applyLateChunking()` の呼び出し）が存在せず、`PipelineConfig` スキーマにも `lateChunking.enabled` フィールドが存在しない。

つまり Late Chunkingは `ChunkingService.chunk()` の `advanced.lateChunking` オプションとしてのみ設定可能であり、`EmbeddingPipeline` レベルでは制御できない。

### 1.2 問題点・課題

**問題1: Late Chunkingが設定ファイルから有効化できない**

`PipelineConfig` に `lateChunking` 設定フィールドが存在しないため、アプリケーション設定（YAML / JSON）やUI設定パネルからLate Chunkingを有効化する手段がない。
現状では `ChunkingService` のコンストラクタに渡すオプションを直接書き換えるしかなく、エンドユーザーが設定できない。

**問題2: `EmbeddingPipeline` が Late Chunkingを認識しない**

`EmbeddingPipeline.process()` は Stage 3 で `EmbeddingService.embedBatch(chunkTexts)` を呼ぶ。
Late Chunkingが有効な場合、この「チャンクごと個別埋め込み」ステップは本来不要（または `LateChunkingService` が生成した埋め込みで代替）だが、パイプラインはこれを区別しない。

**問題3: Late Chunkingの処理結果がパイプライン出力に反映されない**

`PipelineOutput` の `embeddings` フィールドは `EmbeddingResult[]` を持つが、Late Chunkingで生成されたプーリング済みベクトル（`metadata.lateChunking.embeddingDimension`）がここに格納されない。
Late Chunkingの恩恵がパイプラインの下流（ベクトルストア等）に届かない。

**問題4: `StageTimings` に Late Chunking専用ステージが存在しない**

パイプラインのパフォーマンス計測に Late Chunking処理時間が含まれず、チューニングの指標が欠如している。

### 1.3 放置した場合の影響

- Late Chunkingが「実装済み」とドキュメントに記載されているにもかかわらず、実際にはパイプライン経由で利用できない状態が継続する
- 設定ファイルによる動的な有効化が不可能なため、A/Bテスト（通常チャンキング vs Late Chunking）が困難
- Late Chunkingで生成した埋め込みがベクトルストアに保存されないため、RAGパイプラインの精度改善につながらない

---

## 2. 何を達成するか（What）

### 2.1 目的

`PipelineConfig` スキーマに `lateChunking.enabled` を追加し、`EmbeddingPipeline.process()` が Late Chunkingモードで動作できるようにする。
Late Chunking有効時は `LateChunkingService` を使った専用フローに切り替わり、その結果が `PipelineOutput.embeddings` に正しく格納される。

### 2.2 最終ゴール

1. `PipelineConfig` の `chunking` フィールド配下（または最上位）に `lateChunking?: { enabled: boolean; poolingStrategy?: "mean" | "cls" | "attention"; maxSequenceLength?: number }` が追加されている
2. `EmbeddingPipeline.process()` が `config.lateChunking.enabled === true` の場合に Late Chunking専用フロー（`LateChunkingService.applyLateChunking()` → プーリング済みベクトルを `PipelineOutput.embeddings` に格納）で動作する
3. `StageTimings` に `lateChunking` ステージが追加されている
4. Late Chunking有効時の `PipelineOutput.embeddings` が、通常フローと同じ `EmbeddingResult[]` 形式で格納されている（下流互換）
5. 既存の通常フロー（`lateChunking.enabled` なし / `false`）の動作が一切変わらない

### 2.3 スコープ

**含むもの**:

- `PipelineConfig` への `lateChunking` 設定フィールド追加
- `StageTimings` への `lateChunking` フィールド追加
- `EmbeddingPipeline.process()` への Late Chunking分岐実装
- `EmbeddingPipeline` コンストラクタへの `LateChunkingService` 注入
- `PipelineOutput.embeddings` への Late Chunking結果格納（`EmbeddingResult[]` 形式への変換）
- `EmbeddingPipeline` の統合テスト追加
- 設定スキーマのバリデーション（`lateChunking.poolingStrategy` の値チェック）

**含まないもの**:

- UI設定パネルへの `lateChunking` 切り替えトグル追加（別タスクとして分離）
- YAML / JSON設定ファイルのスキーマ更新（アプリケーション層の設定導線は別タスク）
- `EmbeddingPipeline` の `processBatch()` へのLate Chunking対応（単一ドキュメント処理を優先）
- ベクトルストアへの保存処理（`EmbeddingPipeline` の下流）

### 2.4 成果物

| ファイル                                                                                           | 変更種別           | 内容                                                                                     |
| -------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`                                         | 修正               | `PipelineConfig` に `lateChunking` フィールド追加、`StageTimings` に `lateChunking` 追加 |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | 修正               | `LateChunkingService` 注入、Late Chunking分岐実装                                        |
| `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | 新規               | Late Chunking統合テスト                                                                  |
| `packages/shared/src/services/embedding/pipeline/errors.ts`                                        | 修正（必要な場合） | Late Chunking設定バリデーションエラーの追加                                              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 が完了していること（`IEmbeddingClient.getTokenEmbeddings?()` が定義済み）
- TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 が完了していること（`LateChunkingService` が `packages/shared/src/services/embedding/late-chunking/` に存在する）
- `EmbeddingPipeline` の現行フロー（Stage 1〜4）を熟読していること
- `PipelineConfig` / `PipelineOutput` / `StageTimings` の型構造を理解していること

### 3.2 依存タスク

| タスクID                                      | 関係               | 理由                                            |
| --------------------------------------------- | ------------------ | ----------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001     | 先行タスク（必須） | `IEmbeddingClient.getTokenEmbeddings?()` が前提 |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 | 先行タスク（必須） | `LateChunkingService` が前提                    |

**本タスクに後続タスクは存在しない（Late Chunking実装シリーズの最終ステップ）。**

### 3.3 必要な知識

- `EmbeddingPipeline.process()` の現行フロー（Stage 1〜4の処理順序と出力形式）
- `EmbeddingResult` 型（`embedding: number[], tokenCount: number, model: string, processingTimeMs: number`）
- Late Chunkingのプーリング済みベクトルを `EmbeddingResult` 形式に変換する方法（`model` / `tokenCount` の設定方法）
- TypeScript の discriminated union や optional chaining を使った条件分岐設計
- コンストラクタ注入と既存コードの後方互換維持

### 3.4 推奨アプローチ

**`PipelineConfig` の拡張設計**:

```typescript
export interface PipelineConfig {
  chunking: {
    strategy: ChunkingStrategy;
    options: ChunkingOptions;
  };

  embedding: {
    modelId: EmbeddingModelId;
    fallbackChain?: EmbeddingModelId[];
    options?: EmbedOptions;
    batchOptions?: BatchEmbedOptions;
  };

  // 新規追加
  lateChunking?: {
    enabled: boolean;
    poolingStrategy?: "mean" | "cls" | "attention";
    maxSequenceLength?: number;
  };

  pipeline?: { ... };
  persistence?: { ... };
}
```

**Late Chunking有効時のフロー設計**:

```
Stage 1: Preprocessing（変更なし）
Stage 2: Chunking（変更なし: チャンク境界のみ使用）
Stage 2.5: [Late Chunking] LateChunkingService.applyLateChunking()
  ↓ チャンクのmetadata.lateChunking.embeddingDimension が設定される
Stage 3: [Late Chunking有効時] metadata からプーリング済みベクトルを取り出して EmbeddingResult に変換
         [Late Chunking無効時] EmbeddingService.embedBatch() で通常生成（現行動作）
Stage 4: Deduplication（変更なし）
```

**`EmbeddingPipeline` コンストラクタへの `LateChunkingService` 注入**:

```typescript
constructor(
  chunkingService: ChunkingService,
  embeddingService: EmbeddingService,
  metricsCollector?: PipelineMetricsCollector,
  batchProcessor?: EmbeddingBatchProcessor,
  lateChunkingService?: LateChunkingService, // 新規追加（オプショナル）
) {
  ...
  this.lateChunkingService = lateChunkingService;
}
```

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- `EmbeddingPipeline.process()` の全フローを追跡し、Late Chunking分岐を挿入する箇所を特定する
- `EmbeddingResult` 型の全フィールドを確認し、Late Chunkingのプーリング済みベクトルをどのフィールドに格納するかを決定する
  - `embedding`: プーリング済みベクトル（`number[]`）
  - `tokenCount`: チャンクのトークン数（`chunk.tokenCount` を使用）
  - `model`: Late Chunkingで使用したモデルID（設定から取得 or `"late-chunking"` の固定文字列）
  - `processingTimeMs`: Late Chunking処理にかかった時間
- `StageTimings` に `lateChunking?: number` を追加することの影響を確認する（既存のメトリクス集計への影響）
- Late Chunking有効時に `EmbeddingService.embedBatch()` が呼ばれないことを確認する（二重処理の排除）
- 既存の `EmbeddingPipeline` テスト（存在する場合）を洗い出す

### Phase 2: 設計

**設計事項1: `PipelineConfig.lateChunking` フィールドの型定義**

```typescript
lateChunking?: {
  enabled: boolean;
  poolingStrategy?: "mean" | "cls" | "attention"; // デフォルト: "mean"
  maxSequenceLength?: number; // デフォルト: 512
};
```

`enabled: false` または `lateChunking` フィールド未設定の場合は通常フロー。

**設計事項2: `StageTimings` への `lateChunking` フィールド追加**

```typescript
export interface StageTimings {
  preprocessing: number;
  chunking: number;
  embedding: number;
  deduplication: number;
  lateChunking?: number; // 新規追加（Late Chunking無効時は undefined）
}
```

既存の `PipelineMetricsCollector.recordPipelineRun()` への影響を確認する（`stageTimings` オブジェクトに新フィールドが追加されるが、既存メトリクスの集計ロジックには影響しない）。

**設計事項3: Late Chunking専用フロー（Stage 2.5）の実装**

```typescript
// Stage 2.5: Late Chunking（config.lateChunking?.enabled === true の場合）
let lateChunkingEmbeddings: EmbeddingResult[] | undefined;

if (config.lateChunking?.enabled && this.lateChunkingService) {
  const lateChunkingStart = Date.now();

  const processedChunks = await this.lateChunkingService.applyLateChunking(
    preprocessedText,
    chunks,
    {
      enabled: true,
      poolingStrategy: config.lateChunking.poolingStrategy ?? "mean",
      maxSequenceLength: config.lateChunking.maxSequenceLength ?? 512,
    },
  );

  // プーリング済みベクトルを EmbeddingResult に変換
  lateChunkingEmbeddings = processedChunks.map((chunk, index) => ({
    embedding: [], // Stage 3 で実際のベクトルを格納（metadata から取得できない場合の暫定）
    tokenCount: chunk.tokenCount,
    model: config.embedding.modelId,
    processingTimeMs: 0,
  }));

  stageTimings.lateChunking = Date.now() - lateChunkingStart;
}
```

注意: `ChunkingService.applyLateChunking()` は現在チャンクの `metadata.lateChunking.embeddingDimension` のみを設定し、実際のベクトルを返さない。
TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 で `LateChunkingService.applyLateChunking()` が実際のベクトルを返す形になっていることを前提とし、本タスクで統合する。

**設計事項4: バリデーション**

```typescript
private validateLateChunkingConfig(config: PipelineConfig): void {
  if (!config.lateChunking?.enabled) return;

  if (!this.lateChunkingService) {
    throw new PipelineError(
      "lateChunking.enabled is true but LateChunkingService is not provided",
    );
  }

  const validStrategies = ["mean", "cls", "attention"];
  if (
    config.lateChunking.poolingStrategy &&
    !validStrategies.includes(config.lateChunking.poolingStrategy)
  ) {
    throw new PipelineError(
      `Invalid poolingStrategy: ${config.lateChunking.poolingStrategy}. Must be one of: ${validStrategies.join(", ")}`,
    );
  }
}
```

**設計事項5: テストケース一覧**

| テストID | 条件                                                        | 期待動作                                                            |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| PI-01    | `lateChunking.enabled=true`、`LateChunkingService` 注入あり | `LateChunkingService.applyLateChunking()` が呼ばれる                |
| PI-02    | `lateChunking.enabled=true`、`LateChunkingService` 注入あり | `EmbeddingService.embedBatch()` が呼ばれない                        |
| PI-03    | `lateChunking.enabled=false` または未設定                   | `EmbeddingService.embedBatch()` が呼ばれる（通常フロー）            |
| PI-04    | `lateChunking.enabled=true`、`LateChunkingService` 注入なし | `PipelineError` がスローされる                                      |
| PI-05    | `lateChunking.poolingStrategy="attention"`                  | `applyLateChunking()` に `poolingStrategy: "attention"` が渡される  |
| PI-06    | `lateChunking.enabled=true`                                 | `stageTimings.lateChunking` が数値（>= 0）である                    |
| PI-07    | `lateChunking.enabled=true`                                 | `PipelineOutput.embeddings` が `EmbeddingResult[]` 形式で格納される |
| PI-08    | `lateChunking.poolingStrategy="invalid"`                    | `PipelineError` がスローされる（バリデーション）                    |

### Phase 3: 設計レビュー

- Phase 2 の設計事項 1〜5 をレビューする
- `PipelineConfig.lateChunking` がオプショナルであることで、既存の `PipelineConfig` 利用コードに型エラーが生じないことを確認する
- `StageTimings.lateChunking` がオプショナル（`?`）であることで、既存のメトリクス集計ロジックが壊れないことを確認する
- Late Chunking有効時に `EmbeddingService.embedBatch()` が呼ばれないことが設計上保証されているかを確認する
- `LateChunkingService` が注入されていない状態で `lateChunking.enabled=true` が設定された場合のエラーハンドリングが適切かを確認する
- PASS / MINOR / MAJOR / CRITICAL の判定を行い、MAJOR 以上は Phase 2 に差し戻す

### Phase 4: テスト作成（TDD）

`packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` を新規作成する。

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  EmbeddingPipeline,
  PipelineMetricsCollector,
} from "../embedding-pipeline";
import { LateChunkingService } from "../../late-chunking/LateChunkingService";
import type { PipelineConfig } from "../types";

// ChunkingService / EmbeddingService / LateChunkingService のモックを用意

describe("EmbeddingPipeline Late Chunking integration", () => {
  // PI-01: LateChunkingService が呼ばれる
  it("should call LateChunkingService.applyLateChunking when enabled", async () => {
    // 実装
  });

  // PI-02: EmbeddingService.embedBatch が呼ばれない
  it("should NOT call EmbeddingService.embedBatch when lateChunking is enabled", async () => {
    // 実装
  });

  // PI-03: 通常フロー
  it("should use normal embedding flow when lateChunking is not enabled", async () => {
    // 実装
  });

  // PI-04: LateChunkingService 未注入エラー
  it("should throw PipelineError when lateChunking.enabled=true but service not injected", async () => {
    // 実装
  });

  // PI-05: poolingStrategy の引き渡し
  it("should pass poolingStrategy to LateChunkingService", async () => {
    // 実装
  });

  // PI-06: stageTimings.lateChunking が設定される
  it("should record lateChunking stage timing in PipelineOutput", async () => {
    // 実装
  });

  // PI-07: PipelineOutput.embeddings が EmbeddingResult[] 形式
  it("should return embeddings in EmbeddingResult format when lateChunking is enabled", async () => {
    // 実装
  });

  // PI-08: バリデーションエラー
  it("should throw PipelineError for invalid poolingStrategy", async () => {
    // 実装
  });
});
```

### Phase 5: 実装

**Step 1: `packages/shared/src/services/embedding/pipeline/types.ts` を修正する**

`PipelineConfig` に `lateChunking?: { ... }` を追加する。
`StageTimings` に `lateChunking?: number` を追加する。

**Step 2: `embedding-pipeline.ts` を修正する**

- コンストラクタに `lateChunkingService?: LateChunkingService` を追加する
- `process()` メソッドに `validateLateChunkingConfig()` 呼び出しを追加する（Stage 1 前）
- Stage 2 の後に Late Chunking分岐（Stage 2.5）を追加する
- Stage 3 を Late Chunking有効時とそれ以外で分岐させる
- `stageTimings` の初期化に `lateChunking: 0` を追加し、Late Chunking後に設定する
- `validateLateChunkingConfig()` private メソッドを追加する

**Step 3: `LateChunkingService.applyLateChunking()` が実際のベクトルを返すことを確認する**

TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 完了後、`LateChunkingService.applyLateChunking()` の戻り値が各チャンクの実際のプーリング済みベクトルを含むことを確認する。
含まない場合は `LateChunkingService` の戻り値型を修正してベクトルを返すようにする。

**Step 4: `EmbeddingResult` への変換ロジックを実装する**

```typescript
// Late Chunking結果を EmbeddingResult 形式に変換する
private convertLateChunkingToEmbeddingResults(
  chunks: Chunk[],
  modelId: EmbeddingModelId,
  processingTimeMs: number,
): EmbeddingResult[] {
  return chunks.map((chunk) => ({
    embedding: chunk.metadata.lateChunking?.embedding ?? [],
    tokenCount: chunk.tokenCount,
    model: modelId,
    processingTimeMs,
  }));
}
```

注意: `chunk.metadata.lateChunking.embedding` が存在しない場合（先行タスクの実装状況による）は空配列を返し、`warnings` に記録する。

### Phase 6: テスト拡充

- PI-01〜PI-08 が全件 PASS することを確認する
- `processBatch()` で Late Chunking設定が各ドキュメントに正しく適用されることを確認するテストを1件追加する
- `lateChunking.maxSequenceLength` がデフォルト値（512）で動作することを確認するテストを追加する
- `PipelineMetricsCollector.getStatistics()` が Late Chunking有効時も正常に動作することを確認するテストを追加する

### Phase 7: カバレッジ確認

```bash
pnpm --filter @repo/shared test --coverage -- embedding-pipeline
```

- `EmbeddingPipeline.process()` の Late Chunking分岐（有効・無効）がカバーされていることを確認する
- `validateLateChunkingConfig()` のすべての条件分岐（`enabled=false` / `service未注入` / `invalid strategy`）がカバーされていることを確認する

### Phase 8: リファクタリング

- Stage 2.5 の Late Chunking処理を `private runLateChunkingStage()` メソッドに抽出することを検討する（`process()` の可読性向上）
- `convertLateChunkingToEmbeddingResults()` のロジックが `LateChunkingService` に移動すべき責務かを検討する
- テストの重複モックセットアップを `beforeEach` に集約する
- 不要な `as unknown as` 型アサーションや `any` の除去

### Phase 9: 品質保証

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/shared lint

# テスト（全件）
pnpm --filter @repo/shared test

# EmbeddingPipeline の統合テストのみ
pnpm --filter @repo/shared test -- embedding-pipeline.integration
```

### Phase 10: 最終レビュー

- Phase 2 の設計事項 1〜5 がすべて実装に反映されていることを確認する
- PI-01〜PI-08 のテストが全件 PASS していることを確認する
- 既存の通常フロー（`lateChunking` 未設定）の動作が変わらないことを確認する
- `PipelineConfig` の型変更が既存の呼び出し元に型エラーを引き起こしていないことを確認する
- PASS / MINOR は Phase 11 へ進む。MAJOR は Phase 8 に差し戻す

### Phase 11: 手動テスト

以下のシナリオを `vitest` + デバッグログで確認する。

```bash
# Late Chunking 有効時のパイプライン動作
# config.lateChunking = { enabled: true, poolingStrategy: "mean" } を設定して
# PipelineOutput.embeddings の内容を確認する

pnpm --filter @repo/shared test -- --reporter=verbose embedding-pipeline

# stageTimings.lateChunking が記録されることを確認
# PipelineOutput.embeddings[0].embedding.length > 0 であることを確認
```

### Phase 12: ドキュメント更新

本タスクで変更した内容を以下のドキュメントに反映する。

- `embedding-pipeline.ts` の `process()` メソッドの JSDoc に「Late Chunking有効時は Stage 2.5 が追加される」旨を記載する
- `PipelineConfig` の `lateChunking` フィールドに JSDoc コメントを付与する（各サブフィールドの説明・デフォルト値）
- `StageTimings.lateChunking` フィールドに JSDoc で「Late Chunking無効時は `undefined`」と明記する
- 本タスク仕様書（`TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001.md`）の「ステータス」を「実施済み」に更新する
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md` の「依然として残る本体スコープ」から「`EmbeddingPipeline` / schema / 設定導線への正式統合」を削除し、`UNASSIGNED-EMB-005` の残課題が0件になったことを記録する

### Phase 13: PR作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b feat/emb-late-chunking-pipeline-integration-001

# コミット
git commit -m "feat(embedding): TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 EmbeddingPipelineへのLate Chunking統合と設定導線追加"

# push
git push -u origin feat/emb-late-chunking-pipeline-integration-001

# PR 作成
gh pr create \
  --title "feat(embedding): TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 EmbeddingPipeline・設定導線への正式統合" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `PipelineConfig` に `lateChunking?: { enabled: boolean; poolingStrategy?: "mean" | "cls" | "attention"; maxSequenceLength?: number }` が追加されている
- [ ] `StageTimings` に `lateChunking?: number` が追加されている
- [ ] `EmbeddingPipeline` コンストラクタが `lateChunkingService?: LateChunkingService` を受け入れる
- [ ] `lateChunking.enabled=true` 時に `LateChunkingService.applyLateChunking()` が呼ばれる（PI-01）
- [ ] `lateChunking.enabled=true` 時に `EmbeddingService.embedBatch()` が呼ばれない（PI-02）
- [ ] `lateChunking.enabled` 未設定 / `false` 時は通常フローで動作する（PI-03）
- [ ] `LateChunkingService` 未注入で `enabled=true` の場合 `PipelineError` がスローされる（PI-04）
- [ ] `PipelineOutput.embeddings` が Late Chunking有効時も `EmbeddingResult[]` 形式で格納される（PI-07）
- [ ] `stageTimings.lateChunking` が Late Chunking有効時に設定される（PI-06）
- [ ] PI-01〜PI-08 のテストが全件 PASS している

### 後方互換要件

- [ ] `PipelineConfig` に `lateChunking` を指定しない既存呼び出しで型エラーが発生しない
- [ ] `StageTimings.lateChunking` がオプショナルのため既存のメトリクス集計が壊れない
- [ ] `EmbeddingPipeline` の既存コンストラクタ呼び出し（4引数）が型エラーなしで動作する
- [ ] 既存の通常フロー（Late Chunking無効）のテストがすべてPASSする

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] Late Chunking分岐（有効・無効）の両方がテストカバレッジで網羅されている
- [ ] `validateLateChunkingConfig()` の全分岐がカバーされている
- [ ] `any` 型の新規使用がない

### ドキュメント要件

- [ ] `PipelineConfig.lateChunking` に JSDoc コメントが付与されている
- [ ] `EmbeddingPipeline.process()` の JSDoc が Late Chunking有効時の動作を説明している
- [ ] 本タスク仕様書のステータスが「実施済み」に更新されている
- [ ] `UNASSIGNED-EMB-005` の残課題リストが更新されている（全3件がクリアされたことを記録）

---

## 6. 検証方法

### テストケース

| テストID | 対象                          | 入力/操作                                                          | 期待結果                                                           | 備考               |
| -------- | ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------ |
| PI-01    | `EmbeddingPipeline.process()` | `config.lateChunking.enabled=true`、`LateChunkingService` 注入あり | `LateChunkingService.applyLateChunking()` が1回呼ばれる            | 主要検証           |
| PI-02    | `EmbeddingPipeline.process()` | `config.lateChunking.enabled=true`                                 | `EmbeddingService.embedBatch()` が呼ばれない                       | 二重処理排除       |
| PI-03    | `EmbeddingPipeline.process()` | `config.lateChunking` 未設定                                       | `EmbeddingService.embedBatch()` が呼ばれる                         | 通常フロー維持     |
| PI-04    | `EmbeddingPipeline.process()` | `config.lateChunking.enabled=true`、`LateChunkingService` 未注入   | `PipelineError` がスローされる                                     | エラーハンドリング |
| PI-05    | `EmbeddingPipeline.process()` | `config.lateChunking.poolingStrategy="attention"`                  | `applyLateChunking()` に `poolingStrategy: "attention"` が渡される | 設定の引き渡し     |
| PI-06    | `EmbeddingPipeline.process()` | `config.lateChunking.enabled=true`                                 | `output.stageTimings.lateChunking >= 0`                            | タイミング記録     |
| PI-07    | `EmbeddingPipeline.process()` | `config.lateChunking.enabled=true`                                 | `output.embeddings[0].embedding` が `number[]` 形式                | 出力形式           |
| PI-08    | `EmbeddingPipeline.process()` | `config.lateChunking.poolingStrategy="invalid"`                    | `PipelineError` がスローされる                                     | バリデーション     |

### 実行コマンド

```bash
# EmbeddingPipeline 統合テストのみ実行
pnpm --filter @repo/shared test -- embedding-pipeline.integration

# EmbeddingPipeline の全テスト（既存テスト含む）
pnpm --filter @repo/shared test -- embedding-pipeline

# カバレッジ付き実行
pnpm --filter @repo/shared test --coverage -- embedding-pipeline
```

---

## 7. リスクと対策

| リスク                                                                                                                                 | 影響度 | 発生確率 | 対策                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LateChunkingService.applyLateChunking()` が実際のベクトルを返さない（`metadata.lateChunking.embeddingDimension` のみ設定）            | 高     | 中       | Phase 5 Step 3 で `LateChunkingService` の戻り値を確認し、ベクトルを返せない場合は `LateChunkingService` の戻り値型を修正する。`chunk.metadata.lateChunking.embedding` フィールドを追加する         |
| `StageTimings.lateChunking` をオプショナルにした場合、既存のメトリクス集計で `undefined` が混入する                                    | 中     | 低       | `PipelineMetricsCollector.recordPipelineRun()` および `getStatistics()` が `undefined` を適切に扱うことを確認する。テスト（Phase 6 追加テスト）で検証する                                           |
| Late Chunking有効時に `EmbeddingService.embedBatch()` を呼ばないことで下流の期待値が壊れる                                             | 高     | 低       | PI-02 のテストで「`embedBatch` が呼ばれないこと」を明示的に検証する。`PipelineOutput.embeddings` の長さがチャンク数と一致することをPI-07で確認する                                                  |
| 先行タスク（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）が未完了の状態で本タスクを開始した場合に `LateChunkingService` が存在しない | 高     | 中       | 本タスクの Phase 1 冒頭で先行タスクの完了確認（`packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts` の存在確認）を実施する。未完了の場合は作業を中止する                   |
| `PipelineConfig.lateChunking` と `ChunkingInput.advanced.lateChunking` が二重に設定された場合の優先順位が不明確                        | 中     | 中       | `EmbeddingPipeline` が `LateChunkingService` を直接呼ぶ場合、`ChunkingService.chunk()` への `advanced.lateChunking` は渡さない（`enabled: false` として渡す）ことで重複処理を防ぐ。JSDoc に明記する |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                        | パス                                                                                 | 説明                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| UNASSIGNED-EMB-005 review wave index          | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`                        | 本タスクの発見元                   |
| TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001     | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001.md`     | 先行タスク（インターフェース拡張） |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md` | 先行タスク（責務分離）             |

### 関連ファイル

| ファイル                                                                                           | 変更種別 | 内容                                              |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`                                         | 修正     | `PipelineConfig` / `StageTimings` 拡張            |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | 修正     | `LateChunkingService` 注入・Late Chunking分岐実装 |
| `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | 新規     | Late Chunking統合テスト                           |

### 対象コードの位置

| メソッド名 / 型名                  | ファイル                          | 内容                                   |
| ---------------------------------- | --------------------------------- | -------------------------------------- |
| `PipelineConfig`                   | `pipeline/types.ts` L46-L76       | `lateChunking` フィールド追加対象      |
| `StageTimings`                     | `pipeline/types.ts` L122-L127     | `lateChunking` フィールド追加対象      |
| `EmbeddingPipeline` コンストラクタ | `embedding-pipeline.ts` L89-L99   | `lateChunkingService` 注入対象         |
| `EmbeddingPipeline.process()`      | `embedding-pipeline.ts` L109-L311 | Late Chunking分岐（Stage 2.5）追加対象 |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                                                                     | 症状                                                                                                                                                                                        | 原因                                                                                                                   | 対応                                                                                                                                                                                                                                             | 再発防止                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LateChunkingService.applyLateChunking()` が実際の埋め込みベクトルを返すかどうかが先行タスクの実装に依存する | 本タスクの Stage 3 で `chunk.metadata.lateChunking.embedding` を参照しようとしても、先行タスクがこのフィールドを定義していない場合に実装が止まる                                            | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 の完了定義に「実際のベクトルを返す」が含まれているかが不明確             | Phase 1 で先行タスクの `LateChunkingService.applyLateChunking()` の戻り値型を確認する。含まれていない場合は本タスクの Phase 5 Step 3 で修正する                                                                                                  | タスク間の依存関係設計時に「先行タスクが返すデータ形式」を成果物の一部として明記する                                                             |
| `PipelineConfig.lateChunking` と `ChunkingInput.advanced.lateChunking` の二重設定問題                        | `EmbeddingPipeline` が `ChunkingService.chunk()` を呼ぶ際に `advanced.lateChunking` も渡すと、Late Chunkingが二重に適用される                                                               | `EmbeddingPipeline` が `ChunkingService` に `advanced` オプションを透過的に渡す設計になっている                        | `EmbeddingPipeline` で Late Chunking を使う場合は `ChunkingInput.advanced.lateChunking.enabled: false` を明示的に渡し、`ChunkingService` 側ではLate Chunkingを無効化する。JSDoc に「`lateChunking` は `EmbeddingPipeline` が管理する」と明記する | `PipelineConfig` に Late Chunking設定を追加する際に「`ChunkingService` との責務境界」を設計事項として明示する                                    |
| `StageTimings` への `lateChunking` 追加が既存の `recordPipelineRun()` 呼び出し箇所に影響する                 | `stageTimings` オブジェクトに `lateChunking` フィールドを追加すると、既存の `recordPipelineRun()` 呼び出し箇所で型エラーが生じる可能性がある                                                | `StageTimings` が `EmbeddingPipeline` 内部で `{}` として初期化されており、すべてのフィールドが必須の場合に問題が生じる | `StageTimings.lateChunking` をオプショナル（`?`）にし、Late Chunking無効時は設定しないことで既存コードへの影響を排除する                                                                                                                         | 型定義の変更時は「既存の初期化コードへの影響」を Phase 1 で洗い出す                                                                              |
| Late Chunking有効時の `PipelineOutput.embeddings` の形式保証                                                 | `EmbeddingResult` の `model` フィールドに何を設定すべきか不明確。Late Chunkingは「モデル」ではなく「処理手法」であるため、`config.embedding.modelId` をそのまま使うと誤解を招く可能性がある | Late Chunkingは埋め込みモデルを別途使うのではなく、既存の埋め込みモデルからのhidden stateを使う処理手法                | `EmbeddingResult.model` には `config.embedding.modelId`（Late Chunking処理に使った埋め込みモデルID）を設定し、`metadata` フィールド（将来的な拡張として `lateChunking: true` フラグ等）で処理手法を区別する方針とする                            | `EmbeddingResult` の `model` フィールドの意味（「埋め込みモデルID」）をJSDocで明確にし、処理手法の識別は別フィールドで行う方針を設計時に決定する |

### 発見経緯

UNASSIGNED-EMB-005 の review wave（2026-04-19）において、`EmbeddingPipeline` が Late Chunkingを認識しておらず、設定ファイルからLate Chunkingを有効化する手段が存在しないことが Phase 10 のfinal reviewで確認された。review waveのスコープが「`ChunkingService` の改善」に限定されており、`EmbeddingPipeline` 層の変更は対象外として本タスクが分離された。本タスクはLate Chunking実装シリーズ（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 → TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 → 本タスク）の最終ステップであり、完了時点で `UNASSIGNED-EMB-005` の全残課題がクリアされる。
