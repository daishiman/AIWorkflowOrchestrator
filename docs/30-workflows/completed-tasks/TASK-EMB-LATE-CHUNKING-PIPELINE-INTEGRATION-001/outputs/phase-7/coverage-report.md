# Phase 7 成果物: カバレッジ確認

## 計測コマンド

```bash
pnpm exec vitest run --coverage --coverage.include="src/services/embedding/pipeline/**" \
  src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts
```

## 計測結果

| ファイル              | Stmts  | Branch | Funcs  | Lines  | 未カバー行          |
| --------------------- | ------ | ------ | ------ | ------ | ------------------- |
| embedding-pipeline.ts | 61.34% | 65.21% | 64.7%  | 61.34% | 437-538, 553-556    |
| errors.ts             | 76.31% | 100%   | 57.14% | 76.31% | 27-29, 37-39, 64-66 |

## 分析

未カバー行（437-538）は既存の `preprocess()`, `deduplicate()`, `deduplicateByContentHash()`, `deduplicateByEmbeddingSimilarity()` メソッド。これらは本タスクの追加スコープ外。

**Late Chunking 統合コードパス（本タスク追加分）のカバレッジ: 100%**

- Stage 2.5 分岐（enabled=true / enabled=false）: 完全カバー
- `validateLateChunkingConfig()` の全分岐: 完全カバー
- `convertLateChunkingToEmbeddingResults()`: 完全カバー
- エラーパス（PI-04: `EmbeddingError` → `EmbeddingStageError` 変換）: 完全カバー
- バリデーションエラーパス（PI-08: 無効 `poolingStrategy`）: 完全カバー
