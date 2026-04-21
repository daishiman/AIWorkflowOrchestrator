# Phase 1: 要件定義

## メタ情報

| 項目                | 値                                                         |
| ------------------- | ---------------------------------------------------------- |
| Phase               | 1                                                          |
| タスクID            | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001            |
| タスク種別          | NON_VISUAL code task                                       |
| 目的                | Late Chunking を EmbeddingPipeline・設定導線へ正式統合する |
| implementation_mode | new                                                        |

## 目的

`EmbeddingPipeline` に Late Chunking の設定導線と実行分岐を追加し、正本仕様の `EmbeddingService.generateChunkEmbeddings()` 契約へ整合させる。

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | `EmbeddingPipeline.process()` 内に Late Chunking 専用フロー（Stage 2.5）を挿入し、通常 Embedding フローと排他的に動作させること |
| 依存関係・責務境界 | `LateChunkingService` が埋め込み生成責務を担い、`EmbeddingPipeline` は分岐制御と型整合に責務を限定する                          |
| 価値とコスト       | 高価値は Late Chunking の文脈保持精度向上。コストは `PipelineConfig`/`StageTimings` 型変更と統合テスト新規作成                  |
| 改善優先順位       | 型定義修正 → 分岐実装 → バリデーション → 統合テスト作成                                                                         |
| 4条件評価          | 初期状態では 4条件すべて FAIL。Phase 1 で修正対象ファイルと受入基準を確定する                                                   |

## P50 チェック

### 実コード確認

- `packages/shared/src/services/embedding/pipeline/types.ts`
  - `PipelineConfig` に `lateChunking` フィールドが存在しない
  - `StageTimings` に `lateChunking` フィールドが存在しない（`preprocessing`/`chunking`/`embedding`/`deduplication` の 4 フィールドのみ）
- `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`
  - `process()` の Stage 3 で常に `EmbeddingService.embedBatch()` が呼ばれる（Late Chunking 分岐がない）
- `packages/shared/src/services/embedding/embedding-service.ts`
  - `generateChunkEmbeddings()` が存在する
  - `lateChunkingService` 未設定時は `EmbeddingError` を throw する
- `packages/shared/src/services/embedding/late-chunking/late-chunking-interfaces.ts`
  - `ILateChunkingService.generateChunkEmbeddings()` が `text`/`chunkBoundaries`/`config` を引数に取る
- `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`
  - `PoolingStrategy = "mean" | "max" | "cls"` として定義済み
  - `LateChunkingConfig.poolingStrategy` が `PoolingStrategy` 型

### 判断

- `lateChunking.enabled=true` 時は `embedBatch()` を呼ばず `EmbeddingService.generateChunkEmbeddings()` を呼ぶ排他フローが必要
- `PipelineConfig.lateChunking.poolingStrategy` は既存 `PoolingStrategy` 型（`"mean" | "max" | "cls"`）と整合を取る
- `PipelineConfig.lateChunking.maxTokenLength` を採用し、正本仕様の `LateChunkingConfig` と名前を揃える
- `StageTimings.lateChunking` をオプショナルで追加し、既存メトリクスを破壊しない

### implementation_mode 判定

| 確認項目                            | 判定 | 根拠                                       |
| ----------------------------------- | ---- | ------------------------------------------ |
| current branch に対象実装が存在する | No   | Pipeline 側には Late Chunking 分岐が未実装 |
| upstream にマージ済み               | No   | 既存仕様書・実装に当該統合が見当たらない   |
| 前提タスクが完了済み                | No   | 先行タスク文書は未実施状態                 |

結論: `implementation_mode: "new"` とし、Phase 4 で RED テスト、Phase 5 で実装を行う。

## 実行タスク

1. P50 チェック結果を確定し、`implementation_mode: "new"` を明記する。
2. Late Chunking 契約を `EmbeddingService.generateChunkEmbeddings()` / `PoolingStrategy = "mean" | "max" | "cls"` / `maxTokenLength` に統一する。
3. 受入基準と Phase 2 へ渡す責務境界を固定する。

## task classification【必須】

| 項目                 | 判定   | 理由                                                           |
| -------------------- | ------ | -------------------------------------------------------------- |
| UI task              | いいえ | Renderer 変更がない                                            |
| docs-only            | いいえ | 対象は型定義・パイプライン実装・統合テストのコード変更         |
| NON_VISUAL code task | はい   | 変更の主対象は `packages/shared` の Service 層とその統合テスト |

## 受入基準

| ID   | 基準                                                                                         | 検証方法                |
| ---- | -------------------------------------------------------------------------------------------- | ----------------------- |
| AC-1 | `PipelineConfig.lateChunking` フィールドが型安全にオプショナルで定義されている               | TypeScript 型チェック   |
| AC-2 | `StageTimings.lateChunking` フィールドがオプショナルで追加され、既存フィールドが壊れていない | 型チェック + 既存テスト |
| AC-3 | `lateChunking.enabled=true` 時に `EmbeddingService.generateChunkEmbeddings()` が呼ばれる     | PI-01 テスト            |
| AC-4 | `lateChunking.enabled=true` 時に `EmbeddingService.embedBatch()` が呼ばれない                | PI-02 テスト            |
| AC-5 | `lateChunking` 未設定または `enabled=false` 時に従来フローが維持される                       | PI-03 テスト            |
| AC-6 | `lateChunkingService` 未設定で `enabled=true` の場合に失敗が診断可能な形で伝播する           | PI-04 テスト            |
| AC-7 | `stageTimings.lateChunking` が Late Chunking 有効時に数値として記録される                    | PI-06 テスト            |
| AC-8 | `PipelineOutput.embeddings` が既存下流互換を維持して返却される                               | PI-07 テスト            |

## 成果物

| 成果物       | パス                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 要件定義     | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-1-requirements.md`  |
| 設計         | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-2-design.md`        |
| 設計レビュー | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-3-design-review.md` |
| テスト作成   | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-4-test-creation.md` |

## 確認事項

### `EmbeddingPipeline.process()` フロー追跡

現行の `process()` は以下のステージで構成される：

1. Stage 1: Preprocessing（テキスト正規化）
2. Stage 2: Chunking（`ChunkingService.chunk()` 呼び出し）
3. Stage 3: Embedding（`EmbeddingService.embedBatch()` 呼び出し）←**Late Chunking 分岐挿入箇所**
4. Stage 4: Deduplication（オプション）

Late Chunking 有効時は Stage 3 を Stage 2.5 に差し替え、`EmbeddingService.embedBatch()` の代わりに `EmbeddingService.generateChunkEmbeddings()` を呼ぶ。

### `EmbeddingResult` 型の全フィールド確認

`ChunkEmbeddingResult` と現在の `PipelineOutput.embeddings` 契約の差分は正本仕様と実コードでずれている可能性がある。Phase 2 では `number[][]` と `EmbeddingResult[]` のどちらを維持するかを明示し、Phase 12 で正本仕様へ同期する。

### `StageTimings.lateChunking?: number` 追加の影響

- `StageTimings` を参照する `PipelineOutput.stageTimings`、`PipelineMetric.stageTimings` が影響を受ける
- オプショナル（`?`）にすることで既存コードへの影響を最小化できる
- `PipelineMetricsCollector.recordPipelineRun()` の引数型も追随して変更が必要

### Late Chunking 有効時の `embedBatch()` 非呼び出し確認

`lateChunking.enabled=true` の分岐で `EmbeddingService.embedBatch()` を呼ぶコードパスを通らないことを PI-02 テストで保証する。モック検証（`expect(mockEmbeddingService.embedBatch).not.toHaveBeenCalled()`）で確認する。

### 既存 `EmbeddingPipeline` テストの洗い出し

- `packages/shared/src/services/embedding/pipeline/` 配下に `__tests__` ディレクトリは存在しない（未作成）
- 既存の Late Chunking テスト: `packages/shared/src/services/embedding/__tests__/late-chunking/late-chunking-service.test.ts` が存在する
- 統合テストファイルを新規作成: `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

## 参照資料

- `packages/shared/src/services/embedding/pipeline/types.ts`
- `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`
- `packages/shared/src/services/embedding/pipeline/errors.ts`
- `packages/shared/src/services/embedding/embedding-service.ts`
- `packages/shared/src/services/embedding/late-chunking/late-chunking-interfaces.ts`
- `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`
- `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`

## 統合テスト連携

- Phase 4 で `PI-01`〜`PI-08` を RED として設計する。
- Phase 5 で Stage 2.5 分岐と `generateChunkEmbeddings()` 呼び出しを実装する。
- Phase 9 で型・lint・対象テストの全 PASS を品質ゲートとする。

## 完了条件

- [ ] P50 チェック結果を記録した
- [ ] task classification を確定した
- [ ] AC-1 から AC-8 を確定した
- [ ] Canonical Artifacts 一覧を固定した
- [ ] Phase 2 に渡す真の論点と優先順位を確定した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-2-design.md`
