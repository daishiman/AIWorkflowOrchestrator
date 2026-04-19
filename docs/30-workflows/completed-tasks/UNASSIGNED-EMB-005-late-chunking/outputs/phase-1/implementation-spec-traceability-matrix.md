# トレーサビリティ行列

| 要件ID  | 要件内容                         | 設計コンポーネント                         | テストケース                           |
| ------- | -------------------------------- | ------------------------------------------ | -------------------------------------- |
| FR-001  | LateChunkingService              | `LateChunkingService`                      | `late-chunking-service.test.ts`        |
| FR-002  | TokenBoundaryCalculator          | `TokenBoundaryCalculator`                  | `token-boundary-calculator.test.ts`    |
| FR-003  | HiddenStatePooler (mean/max/cls) | `HiddenStatePooler`                        | `hidden-state-pooler.test.ts`          |
| FR-004  | WindowSplitter                   | `WindowSplitter`                           | `window-splitter.test.ts`              |
| FR-005  | EmbeddingService統合             | `EmbeddingService.embed()`                 | `embedding-service.regression.test.ts` |
| NFR-001 | Float16メモリ効率                | `LateChunkingConfig.useFloat16`            | `late-chunking-service.test.ts`        |
| NFR-002 | 後方互換性                       | `useLateChunking` フラグ                   | `late-chunking-edge.test.ts`           |
| NFR-003 | エラーハンドリング               | `InvalidBoundaryError`, `OutOfMemoryError` | `late-chunking-edge.test.ts`           |
| NFR-004 | 検索品質向上                     | `compareWithEarlyChunking()`               | ベンチマークテスト                     |
