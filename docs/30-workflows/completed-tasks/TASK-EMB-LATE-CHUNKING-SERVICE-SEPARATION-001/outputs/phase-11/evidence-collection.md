# Evidence Collection

タスク ID: `TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001`

## コマンド証跡

| コマンド                                                                                                                                                                                                                                                                                                                                     | 終了コード | 要約                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------- |
| `pnpm exec vitest run src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts`                                                                                                                                                                                                                                 | `0`        | 11 tests passed     |
| `pnpm exec vitest run src/services/chunking/__tests__/chunking-service.integration.test.ts`                                                                                                                                                                                                                                                  | `0`        | 24 tests passed     |
| `pnpm exec tsc --noEmit`                                                                                                                                                                                                                                                                                                                     | `0`        | stdout 空           |
| `pnpm exec eslint src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts src/services/embedding/late-chunking/index.ts src/services/chunking/chunking-service.ts src/services/chunking/__tests__/chunking-service.integration.test.ts` | `0`        | error 0 / warning 0 |

## primary evidence 対応

- 自動テスト詳細: `automated-test-evidence.md`
- 静的解析詳細: `static-analysis-evidence.md`
- NON_VISUAL 判定根拠: `non-visual-classification.md`
