# Phase 1 スコープ定義

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-A

## スコープ内

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `SKILL.md` / `LOGS.md`（2スキル）
- 本ワークフロー `outputs/phase-1` 〜 `outputs/phase-12`

## スコープ外

- `apps/` / `packages/` 配下の実装コード
- 既存未タスク指示書の全面リライト
- Phase 13（PR作成・コミット）

## 依存タスク

- UT-IPC-AUTH-HANDLE-DUPLICATE-001（発見元）
- UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001（baseline/current分離前提）

## リスク

- 既存資産に多数の baseline 違反が残っているため、全体監査は FAIL になり得る
- 対応方針: current 差分監査を分離し、今回タスクの判定は current ベースで行う
