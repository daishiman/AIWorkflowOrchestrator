# Phase 11 成果物: 手動テスト結果

## タスク種別

NON_VISUAL code task

UI/UX変更なしのため Phase 11 スクリーンショット不要

## primary evidence

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`

## 実行コマンド

```bash
pnpm --filter @repo/shared typecheck
pnpm exec vitest run src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts
```

## 実行結果

### TypeScript 型チェック

```text
pnpm --filter @repo/shared typecheck -> PASS
```

### 統合テスト

```text
pnpm exec vitest run src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts
Test Files  1 passed (1)
Tests      18 passed (18)
```

## シナリオ別結果

| シナリオ | 確認内容                                                       | 実測結果                                                                                 | 判定 |
| -------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---- |
| 1        | `lateChunking.enabled=true` で Late Chunking フローが動く      | `generateChunkEmbeddings()` 呼び出し、`currentStage: "lateChunking"` progress 通知を確認 | PASS |
| 2        | `lateChunking` 未設定または `enabled=false` で通常フローに戻る | `embedBatch()` 呼び出し、`stageTimings.lateChunking === undefined` を確認                | PASS |
| 3        | `poolingStrategy` オプションが伝播する                         | `"cls"` / `"mean"` を `generateChunkEmbeddings()` へ渡すテストが PASS                    | PASS |
| 4        | `maxTokenLength` が伝播・検証される                            | `256` 指定伝播、`0` 指定でバリデーションエラーを確認                                     | PASS |
| 5        | Stage 3 が意味論上スキップされる                               | Late Chunking 有効時に `stageTimings.embedding === 0` を確認                             | PASS |
| 6        | `PipelineOutput.embeddings` が下流互換形式を維持する           | `embedding` / `tokenCount` / `model` / `processingTimeMs` を確認                         | PASS |
| 7        | chunk 順と embedding 順が崩れない                              | 逆順レスポンスでも `chunkId` で元順に整列されることを確認                                | PASS |

## 主要観察

- `StageTimings.lateChunking` は数値として記録される。
- `StageTimings.embedding` は Late Chunking 有効時に 0 のままで、Stage 3 の skip を示す。
- `PipelineMetricsCollector` は Late Chunking 有効時も正常に記録される。
- `LateChunkingService is not configured` は `PipelineError` として診断可能な文言を維持して伝播する。

## discovered-issues

| 発見日     | 問題の概要                                                             | 深刻度 | 関連ファイル                        | 対応方針                                                 | 対応状況 |
| ---------- | ---------------------------------------------------------------------- | ------ | ----------------------------------- | -------------------------------------------------------- | -------- |
| 2026-04-20 | `StageTimings.embedding` が Late Chunking 有効時でも計測対象になりうる | 高     | `embedding-pipeline.ts`             | Stage 3 実行時のみ計測するよう修正                       | 解決済み |
| 2026-04-20 | `ChunkEmbeddingResult.chunkId` を使わず順序依存だった                  | 中     | `embedding-pipeline.ts`             | `chunkId` で元チャンク順に整列するよう修正               | 解決済み |
| 2026-04-20 | progress 契約に `lateChunking` ステージが存在しなかった                | 中     | `types.ts`, `embedding-pipeline.ts` | `PipelineStage` と progress 通知へ `lateChunking` を追加 | 解決済み |

## 結論

Phase 11 の primary evidence は揃っており、NON_VISUAL タスクとして必要な代替証跡を満たす。UI/UX 変更はないためスクリーンショットは不要で、型チェックと統合テストで close-out 根拠を確保した。
