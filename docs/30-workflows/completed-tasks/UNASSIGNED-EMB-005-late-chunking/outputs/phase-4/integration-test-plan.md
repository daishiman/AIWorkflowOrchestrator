# 統合テスト計画

## 統合対象

1. `LateChunkingService` + `TokenBoundaryCalculator` + `HiddenStatePooler` + `WindowSplitter`
2. `EmbeddingService` + `LateChunkingService`（`generateChunkEmbeddings`メソッド）

## 統合テスト順序

1. 各コンポーネントのユニットテストがGreen → 統合テストへ
2. `LateChunkingService` のE2Eテスト（モックエンコーダ使用）
3. `EmbeddingService.generateChunkEmbeddings()` のE2Eテスト

## 回帰テスト

- 既存 `embed()` / `embedBatch()` が変更なしで動作することを確認
- 既存の `embedding-pipeline.test.ts` / `batch-processor.test.ts` がパスすることを確認
