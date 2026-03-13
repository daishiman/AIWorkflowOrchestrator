# Phase 1 Output: Source Task Mapping

## source inventory

| source                                                                             | 現行 status | この workflow での扱い                                           |
| ---------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/task-imp-task-spec-skill-md-line-budget-001.md` | 未実施      | origin requirement として参照し、scope を 6 concern へ拡張       |
| GitHub Issue #1144                                                                 | CLOSED      | source rationale として参照し、implementation は未開始のまま維持 |

## 拡張ポリシー

1. `SKILL.md` 単独対処は採用しない。
2. target directory の 500 行超 Markdown を同一 batch へ集約する。
3. 実作業の切り分けは concern 単位で行う。
4. implementation は別 run とし、この workflow は `spec_created` で停止する。

## follow-up で更新する台帳

| 台帳                                 | 更新タイミング        |
| ------------------------------------ | --------------------- |
| `task-workflow.md`                   | 実装完了後の Phase 12 |
| `lessons-learned.md`                 | 実装完了後の Phase 12 |
| `aiworkflow-requirements/LOGS.md`    | 実装完了後の Phase 12 |
| `task-specification-creator/LOGS.md` | 実装完了後の Phase 12 |
