# Phase 2: 設計

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 2                                                    |
| タスクID | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001      |
| 前Phase  | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase  | [phase-3-design-review.md](phase-3-design-review.md) |

## 目的

Phase 1 で確定した受入基準を満たすために、型定義・パイプライン分岐・バリデーション・テスト構成を設計する。

## 実行タスク

1. `PipelineConfig.lateChunking` の shape を正本契約と整合させる。
2. `EmbeddingPipeline` と `EmbeddingService` の責務境界を固定する。
3. Phase 4 へ渡す PI テストと正本仕様同期ポイントを定義する。

## 設計事項 1: `PipelineConfig.lateChunking` フィールドの型定義

`packages/shared/src/services/embedding/pipeline/types.ts` の `PipelineConfig` インタフェースに以下のオプショナルフィールドを追加する。

```typescript
lateChunking?: {
  enabled: boolean;
  poolingStrategy?: "mean" | "max" | "cls";
  maxTokenLength?: number;
};
```

### 設計根拠

| 観点                 | 判断                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| オプショナル採用理由 | 既存の `PipelineConfig` 利用箇所を無変更のまま動作させるため                                         |
| `poolingStrategy` 型 | 正本 `PoolingStrategy = "mean" \| "max" \| "cls"` に合わせる                                         |
| `maxTokenLength`     | `LateChunkingConfig.maxTokenLength` と同名にして変換コストをなくす                                   |
| `enabled` フラグ必須 | `lateChunking` フィールド自体は省略可能だが、存在する場合は `enabled` を明示することで意図を強制する |

## 設計事項 2: `StageTimings` への `lateChunking` フィールド追加

```typescript
export interface StageTimings {
  preprocessing: number;
  chunking: number;
  embedding: number;
  deduplication: number;
  lateChunking?: number; // 追加（Late Chunking 有効時のみ記録）
}
```

### 設計根拠

| 観点                      | 判断                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------- |
| オプショナル採用理由      | 通常フローでは `lateChunking` ステージが存在しないため、既存メトリクス収集を破壊しない |
| 記録タイミング            | Stage 2.5（Late Chunking フロー）の開始〜終了時間を計測して代入する                    |
| `PipelineMetric` への影響 | `PipelineMetric.stageTimings` も同 `StageTimings` 型を参照するため自動的に追随する     |

## 設計事項 3: Late Chunking 専用フロー（Stage 2.5）の実装設計

`EmbeddingPipeline.process()` における分岐設計：

```
Stage 1: Preprocessing
Stage 2: Chunking
    ↓
[config.lateChunking?.enabled === true?]
    YES → Stage 2.5: Late Chunking Embedding
            - EmbeddingService.generateChunkEmbeddings() を呼ぶ
            - ChunkEmbeddingResult[] を EmbeddingResult[] に変換
            - stageTimings.lateChunking に処理時間を記録
            - Stage 3（embedBatch）をスキップ
    NO  → Stage 3: Embedding（既存フロー）
            - EmbeddingService.embedBatch() を呼ぶ
Stage 4: Deduplication（共通）
```

### `EmbeddingPipeline` の責務変更

```typescript
constructor(
  chunkingService: ChunkingService,
  embeddingService: EmbeddingService,
  metricsCollector?: PipelineMetricsCollector,
  batchProcessor?: EmbeddingBatchProcessor,
)
```

`EmbeddingPipeline` は `EmbeddingServiceConfig.lateChunkingService` の内部構成を知らず、`EmbeddingService` の公開メソッドだけを使う。これにより service 境界を崩さず、Pipeline 側は分岐制御と整形に集中できる。

### `ChunkEmbeddingResult` → 既存出力契約の変換方針

`EmbeddingService.generateChunkEmbeddings()` が返す `ChunkEmbeddingResult[]` は以下の形式：

```typescript
interface ChunkEmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount: number;
}
```

`EmbeddingResult` 型の必須フィールドに合わせてマッピングを行う。変換は `process()` 内のインライン処理とし、別ユーティリティは作成しない（YAGNI 原則）。

### `ChunkBoundary` 生成方針

Stage 2（Chunking）の結果 `Chunk[]` から `ChunkBoundary[]` を生成する。各 `Chunk` の `startChar`/`endChar` フィールドを `ChunkBoundary` にマッピングする。

## 設計事項 4: バリデーション設計（`validateLateChunkingConfig`）

`EmbeddingPipeline.process()` の冒頭または Stage 2.5 の直前に以下のバリデーションを実行する：

| チェック内容                                           | エラー種別      | メッセージ例                                           |
| ------------------------------------------------------ | --------------- | ------------------------------------------------------ |
| `poolingStrategy` が許容値（`"mean"/"max"/"cls"`）以外 | `PipelineError` | `"Invalid poolingStrategy: <value>"`                   |
| `maxTokenLength` が 1 未満                             | `PipelineError` | `"lateChunking.maxTokenLength must be greater than 0"` |

バリデーション関数のシグネチャ：

```typescript
private validateLateChunkingConfig(
  config: PipelineConfig,
): void
```

条件を満たさない場合は `PipelineError` を throw する。

## 設計事項 5: テストケース一覧（PI-01〜PI-08）

| ID    | テスト名                                                                               | 分類   | 対象メソッド                                     |
| ----- | -------------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| PI-01 | `lateChunking.enabled=true` で `EmbeddingService.generateChunkEmbeddings()` が呼ばれる | 正常系 | `EmbeddingPipeline.process()`                    |
| PI-02 | `lateChunking.enabled=true` で `embedBatch()` が呼ばれない                             | 正常系 | `EmbeddingPipeline.process()`                    |
| PI-03 | `lateChunking.enabled=false` または未設定で通常フロー維持                              | 正常系 | `EmbeddingPipeline.process()`                    |
| PI-04 | Late Chunking サービス未設定時に失敗が診断可能に伝播する                               | 異常系 | `EmbeddingPipeline.process()`                    |
| PI-05 | `poolingStrategy` / `maxTokenLength` が `generateChunkEmbeddings()` に正しく渡る       | 正常系 | `EmbeddingPipeline.process()`                    |
| PI-06 | `stageTimings.lateChunking` が数値として記録される                                     | 正常系 | `EmbeddingPipeline.process()` → `PipelineOutput` |
| PI-07 | `PipelineOutput.embeddings` が `EmbeddingResult[]` 形式                                | 正常系 | `EmbeddingPipeline.process()` → `PipelineOutput` |
| PI-08 | 無効な `poolingStrategy` で `PipelineError`                                            | 異常系 | `EmbeddingPipeline.process()`                    |

## 依存関係整合

| 依存        | 理由                                                       |
| ----------- | ---------------------------------------------------------- |
| Phase 1 → 2 | task classification と受入基準が確定してから設計を進める   |
| Phase 2 → 3 | 設計レビューで型変更の副作用と排他フローの妥当性を確認する |
| Phase 3 → 4 | レビュー PASS 後にテストケースの詳細仕様を確定する         |
| Phase 4 → 5 | RED テストが揃ってから実装に着手する（TDD）                |

## 成果物

| 成果物           | パス                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 設計ドキュメント | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-2-design.md` |

## 参照資料

- `.agents/skills/aiworkflow-requirements/references/api-internal-embedding.md`
- `.agents/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`
- `packages/shared/src/services/embedding/embedding-service.ts`
- `packages/shared/src/services/embedding/pipeline/types.ts`
- `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`

## 統合テスト連携

- Phase 4 の PI-01〜PI-08 は本設計をそのまま観測可能なテストへ落とす。
- Phase 12 では `llm-embedding.md` / `api-internal-embedding.md` / `architecture-embedding-pipeline.md` の同期要否を判定する。

## 完了条件

- [ ] `PipelineConfig.lateChunking` フィールドの型定義が確定している
- [ ] `StageTimings.lateChunking` フィールドの追加設計が確定している
- [ ] Stage 2.5 の分岐ロジックと `embedBatch()` 非呼び出し保証が設計されている
- [ ] `validateLateChunkingConfig` のバリデーション仕様が定義されている
- [ ] テストケース PI-01〜PI-08 が一覧化されている
- [ ] 依存関係整合が説明されている
