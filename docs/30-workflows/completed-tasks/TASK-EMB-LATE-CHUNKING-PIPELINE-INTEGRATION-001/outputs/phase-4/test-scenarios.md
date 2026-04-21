# Phase 4 成果物: テストシナリオ

## テストファイル

`packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

## PI-01〜PI-08 + PI-03b（計 9 件）実装済み

| ID     | 内容                                                    | 状態 |
| ------ | ------------------------------------------------------- | ---- |
| PI-01  | `enabled=true` で `generateChunkEmbeddings()` 呼び出し  | ✓    |
| PI-02  | `enabled=true` で `embedBatch()` 非呼び出し             | ✓    |
| PI-03  | `lateChunking` 未設定で通常フロー                       | ✓    |
| PI-03b | `enabled=false` で通常フロー                            | ✓    |
| PI-04  | `lateChunkingService` 未設定時の失敗伝播                | ✓    |
| PI-05  | `poolingStrategy` の引き渡し確認                        | ✓    |
| PI-06  | `stageTimings.lateChunking` が数値                      | ✓    |
| PI-07  | `PipelineOutput.embeddings` が `EmbeddingResult[]` 形式 | ✓    |
| PI-08  | 無効な `poolingStrategy` で `PipelineError`             | ✓    |

初回実行時（Phase 5 実装前）に RED であることを確認後、Phase 5 実装で全件 GREEN に変換。
