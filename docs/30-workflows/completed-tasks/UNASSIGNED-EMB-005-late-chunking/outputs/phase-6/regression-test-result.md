# 回帰テスト結果

## 状態: GREEN ✅

既存のEmbeddingService API（embed/embedBatch/healthCheckAll）は修正なし。
新規追加の `generateChunkEmbeddings` は `lateChunkingService` 未設定時にエラーをスロー（意図した動作）。

## 既存テスト影響

| テストファイル               | 結果               |
| ---------------------------- | ------------------ |
| `embedding-pipeline.test.ts` | 変更なし・影響なし |
| `batch-processor.test.ts`    | 変更なし・影響なし |
| `qwen3-provider.test.ts`     | 変更なし・影響なし |
