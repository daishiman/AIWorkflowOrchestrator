# Phase 4 テスト仕様

## テスト戦略

- 本タスクは docs-only 実装のため、テストは「文書契約の整合」と「参照導線の実在確認」を中心に行う。
- Red テストは gate 不合格条件、sync 区分誤判定、handoff 欠落、path ドリフトの4系統で作る。
- Phase 11 で `test -f` / `rg -n` / validator 実行へ接続できる形にする。

## テストカテゴリ

| カテゴリ           | 検証内容                                      | 主対象                                         |
| ------------------ | --------------------------------------------- | ---------------------------------------------- |
| Gate 判定境界      | PASS / MINOR / MAJOR の境界条件               | `integration-gate-design.md`, `review-gate.md` |
| Sync 区分          | `常時更新 / 条件付き更新 / 更新不要` の妥当性 | `spec-sync-matrix.md`, `spec-sync-targets.md`  |
| downstream handoff | 3タスクへの引き渡し条件                       | `dependency-handoff-plan.md`                   |
| Path 正規化        | current/completed/parent の参照実在性         | parent docs, current workflow                  |

## 検証コマンド方針

```bash
rg -n "PASS|MINOR|MAJOR" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-5/review-gate.md
rg -n "常時更新|条件付き更新|更新不要" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-5/spec-sync-targets.md
rg -n "TASK-UI-02|TASK-UI-03|TASK-UI-04A" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-2/dependency-handoff-plan.md
test -f docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md
```
