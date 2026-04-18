# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 9                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

targeted test / typecheck / lint の3系統で品質を確認する。

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

## 実行タスク

- Task 9-1: targeted test 実行
- Task 9-2: typecheck 実行
- Task 9-3: lint 実行

## 参照資料

| 資料名         | パス                                      | 説明          |
| -------------- | ----------------------------------------- | ------------- |
| Phase 5 成果物 | `outputs/phase-5/implementation-notes.md` | 差分確認結果  |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`      | coverage 確認 |

## 成果物

| 成果物           | 配置先                                        |
| ---------------- | --------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` |

## 完了条件

- [ ] targeted test の結果を記録した
- [ ] typecheck の結果を記録した
- [ ] lint の結果を記録した

## 次Phase

→ [Phase 10: 最終レビューゲート](phase-10-final-review.md)
