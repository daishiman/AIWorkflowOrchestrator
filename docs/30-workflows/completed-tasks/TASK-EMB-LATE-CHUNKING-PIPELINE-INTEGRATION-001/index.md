# TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| 機能名     | Late Chunking: EmbeddingPipeline・設定導線への正式統合 |
| 作成日     | 2026-04-20                                             |
| タスク種別 | feature-integration                                    |
| ステータス | 完了（Phase 12完了・Phase 13: PR作成）                 |
| 総Phase数  | 13                                                     |
| Issue      | #2315                                                  |

---

## Phase一覧

| Phase | 名称               | ステータス         |
| ----- | ------------------ | ------------------ |
| 1     | 要件定義           | 完了               |
| 2     | 設計               | 完了               |
| 3     | 設計レビューゲート | 完了               |
| 4     | テスト作成（TDD）  | 完了               |
| 5     | 実装               | 完了               |
| 6     | テスト拡充         | 完了               |
| 7     | カバレッジ確認     | 完了               |
| 8     | リファクタリング   | 完了               |
| 9     | 品質保証           | 完了               |
| 10    | 最終レビューゲート | 完了               |
| 11    | 手動テスト検証     | 完了（NON_VISUAL） |
| 12    | ドキュメント更新   | 完了               |
| 13    | PR作成             | 実施中             |

---

## 完了条件チェックリスト

### 機能要件

- [x] `PipelineConfig` に `lateChunking?: { enabled: boolean; poolingStrategy?: PoolingStrategy; maxTokenLength?: number }` が追加されている
- [x] `StageTimings` に `lateChunking?: number` が追加されている
- [x] `lateChunking.enabled=true` 時に `EmbeddingService.generateChunkEmbeddings()` が呼ばれる
- [x] `lateChunking.enabled=true` 時に `EmbeddingService.embedBatch()` が呼ばれない（Stage 3スキップ）
- [x] `lateChunking.enabled` 未設定 / `false` 時は通常フローで動作する
- [x] `PipelineOutput.embeddings` が Late Chunking有効時も `EmbeddingResult[]` 形式で格納される
- [x] `stageTimings.lateChunking` が Late Chunking有効時に設定される
- [x] `"lateChunking"` ステージが `PipelineStage` ユニオン型に追加されている
- [x] 統合テスト16件がすべてPASS

### 後方互換要件

- [x] `PipelineConfig` に `lateChunking` を指定しない既存呼び出しで型エラーが発生しない
- [x] `StageTimings.lateChunking` がオプショナルのため既存のメトリクス集計が壊れない
- [x] 既存の通常フロー（Late Chunking無効）のテストがすべてPASS

---

## 成果物

| ファイル                                                                                           | 変更種別 |
| -------------------------------------------------------------------------------------------------- | -------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`                                         | 修正     |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | 修正     |
| `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | 新規     |
