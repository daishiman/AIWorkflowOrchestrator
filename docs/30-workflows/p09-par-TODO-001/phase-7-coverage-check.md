# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-TODO-001          |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | 未実施                    |
| 作成日     | 2026-04-16                |

## 目的

Phase 6 で追加したテストを含め、`ConversationRoundStep.tsx` の変更箇所に対するカバレッジが
目標基準を満たしていることを確認する。
本タスクはコメント整理のため、カバレッジ要件は既存テストの維持が主目的となる。

## 実行タスク

### Task 1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep" --coverage
```

### Task 2: AC 対応表確認

| AC   | 対応テスト    | カバレッジ状態 |
| ---- | ------------- | -------------- |
| AC-1 | （手動確認）  | TBD            |
| AC-2 | TC-01, TC-03  | TBD            |
| AC-3 | TC-R01, TC-01 | TBD            |
| AC-4 | typecheck     | TBD            |

### Task 3: branch coverage 確認

`shouldShowMainToolBadge` の条件分岐:

- `MAIN_TOOL_BADGE_ENABLED` が `true` の場合（正常系）: 既存テストでカバー
- フラグ削除後の直接 `true` パス: TC-01 / TC-R01 でカバー

### Task 4: カバレッジ目標達成確認

| 指標              | 最低基準 | 推奨基準 | 実測値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD    |
| Branch Coverage   | 60%      | 70%      | TBD    |
| Function Coverage | 80%      | 90%      | TBD    |

目標未達の場合は Phase 6 に戻りテストを追加する。
ただし本タスクはコメント整理のみであるため、既存カバレッジを維持できていれば基準達成とみなす。

## 参照資料

- `outputs/phase-6/TASK-SW-TODO-001-extended-test-record.md` — テストケース一覧

## 統合テスト連携

- ユニットテストのカバレッジを確認する
- コメント整理のため統合テストカバレッジの変動はない

## 成果物

| 成果物                              | パス                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| TASK-SW-TODO-001-coverage-report.md | `outputs/phase-7/TASK-SW-TODO-001-coverage-report.md` |

## 完了条件

- [ ] カバレッジ測定コマンドを実行した
- [ ] AC 対応表が全件埋まっている
- [ ] branch coverage が最低基準（60%）以上である
- [ ] 目標未達の場合は Phase 6 へ戻る判断を記録している

## タスク100%実行確認【必須】

- [ ] Task 1（カバレッジ測定）を100%実行した
- [ ] Task 2（AC 対応表確認）を100%実行した
- [ ] Task 3（branch coverage 確認）を100%実行した
- [ ] Task 4（カバレッジ目標達成確認）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-coverage-report.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
