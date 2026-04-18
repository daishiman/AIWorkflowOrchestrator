# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 7                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

`notifySkillCreationFailure()` の追加箇所のカバレッジを確認する。

## カバレッジ目標

| 項目                                        | 目標 |
| ------------------------------------------- | ---- |
| `notifySkillCreationFailure()` の branch    | 100% |
| optional chaining 分岐（undefined/defined） | 100% |
| `catch {}` ブロック                         | 100% |

## 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="notification"
```

## 成果物

| 成果物             | 配置先                               |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] 全カバレッジ目標を達成している
- [ ] Phase 8 開始条件が整っている

## 次Phase

→ [Phase 8: リファクタリング](phase-8-refactoring.md)
