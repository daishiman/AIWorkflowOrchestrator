# Phase 4 テスト実行計画

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 4                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 実行順序（固定）

1. Unit

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts`

2. Integration

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts -t "integration"`

3. Regression

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts -t "regression"`

4. 総合確認

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts`
- `pnpm --filter @repo/desktop typecheck`

## 停止条件

- Unit 失敗時: Integration/Regressionを実行しない。
- Integration 失敗時: Regression実行前に `index.ts` / `types.ts` / `sliceBaseline.ts` 整合を修正。
- Typecheck失敗時: Phase 6以降へ進まない。

## 証跡

- 実行ログは Phase 6, 7 の成果物に集約する。
