# Phase 12 Output: System Spec Sync Checklist

## 目的

Phase 12 Task 2 の Step 1-A / 1-B / 1-C / Step 2 を current 実行結果で固定し、workflow・system spec・completed task spec の drift を残さない。

## Step 1-A: 完了記録と台帳更新

| 項目                | 実行結果                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow            | `index.md`、`phase-4`〜`phase-12`、`outputs/artifacts.json`、`artifacts.json` を completed に同期                                                                                                                                                                                                                            |
| completed task spec | `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` を完了化し `completed_date` を追加                                                                                                                                                                                             |
| issue               | `docs/30-workflows/issues/issue-1161.md` を完了化し `spec_path` を completed path へ更新                                                                                                                                                                                                                                     |
| system spec         | `task-workflow.md`、`workflow-workspace-preview-search-resilience-guard.md`、`ui-ux-components.md`、`ui-ux-feature-components.md`、`ui-ux-search-panel.md`、`arch-state-management.md`、`architecture-implementation-patterns.md`、`error-handling.md`、`lessons-learned.md`、`resource-map.md`、`quick-reference.md` を更新 |
| logs / skill        | `.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/task-specification-creator/LOGS.md`、`.claude/skills/skill-creator/LOGS.md` と 3 つの `SKILL.md` を更新                                                                                                                                                    |
| index / mirror      | `generate-index.js` 実行後に `.claude -> .agents` を `rsync -a` で同期し、3 skill root すべて `diff -qr` で drift なしを確認                                                                                                                                                                                                 |

## Step 1-B: status / spec_created 判定

| 観点                | 判定         | 実測                                                                                              |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| workflow 自身       | completed    | `index.md`、`phase-1`〜`phase-12`、`artifacts.json`、`outputs/artifacts.json` が completed で一致 |
| 実装コード          | completed    | search / preview / taxonomy utility と tests を実装済み                                           |
| completed task spec | completed    | 元の unassigned path を削除し、completed path を canonical に採用                                 |
| issue               | completed    | #1161 を完了状態へ更新                                                                            |
| skill / template    | completed    | task-spec / skill-creator / aiworkflow の 3 root で再監査知見と workflow 正本集約パターンを反映   |
| Phase 13            | blocked 維持 | ユーザー指定により commit / PR は未実施                                                           |

## Step 1-C: related row / exact count / placement

| 観点                   | 実測                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| related row count      | `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001`: 60 hits / 36 files                                                                                                                         |
| parent task count      | `TASK-UI-04C-WORKSPACE-PREVIEW`: 44 hits / 21 files                                                                                                                                                |
| exact count            | `verify-unassigned-links.js`: total 220 / existing 220 / missing 0                                                                                                                                 |
| placement              | 親 task は completed path を維持しつつ、follow-up UT `docs/30-workflows/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md` を追加                                       |
| current audit          | `audit-unassigned-tasks --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md`: current violations 0 / baseline 134 |
| completed parent audit | `audit-unassigned-tasks --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md`: current violations 0 / baseline 134                            |

### exact count の測定スコープ

- `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` / `TASK-UI-04C-WORKSPACE-PREVIEW` の hit 数は、workflow root 全体、completed task spec、issue、system spec 更新対象、index を固定スコープとして計測した
- re-audit で `workflow-workspace-preview-search-resilience-guard.md`、`resource-map.md`、`quick-reference.md` と follow-up UT 導線を追加したため、初回 Phase 12 より hit 数が増えている

### 監査コマンドの補足

- `audit-unassigned-tasks.js` は `completed/unassigned-task` を受けた場合、その親を completed tasks root として推論する
- このため `docs/30-workflows/completed-tasks/*.md` 直下の standalone completed spec も `--target-file` 単独で current 監査できる
- `git diff --name-status HEAD -- docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks` の実測は削除された旧 path 1件のみで、untracked の completed file は `--diff-from HEAD` に乗らない
- よって本タスクの current 監査は `--target-file` を正本とした

## Step 2: 条件付き system spec 更新

| 条件                                                          | 判定 | 更新対象                                                                                                                                            |
| ------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新規 IPC / security contract 追加                             | なし | `api-ipc-system.md`、`security-*` は未更新                                                                                                          |
| renderer local resilience / error taxonomy の再利用ルール追加 | あり | `architecture-implementation-patterns.md`、`error-handling.md`                                                                                      |
| UI/UX / state の completed 実績同期                           | あり | `ui-ux-components.md`、`ui-ux-feature-components.md`、`ui-ux-search-panel.md`、`arch-state-management.md`、`task-workflow.md`、`lessons-learned.md` |
| workflow 正本集約                                             | あり | `workflow-workspace-preview-search-resilience-guard.md`、`resource-map.md`、`quick-reference.md`                                                    |
| skill template 改善の仕様化                                   | あり | `task-specification-creator` guide / template 群、`skill-creator` template / patterns                                                               |

## 実行コマンド

```bash
rg -n "UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001|TASK-UI-04C-WORKSPACE-PREVIEW|UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001" \
  .claude/skills/aiworkflow-requirements/references

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md

node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/skill-creator .agents/skills/skill-creator
```

## 実行結果

- `verify-unassigned-links.js`: PASS（220 / 220 / 0）
- `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...`: PASS（current violations 0 / baseline 134）
- `audit-unassigned-tasks.js --target-file ...`: PASS（current violations 0 / baseline 134）
- `validate-phase12-implementation-guide.js`: PASS（10 / 10）
- `verify-all-specs.js --workflow ... --json`: PASS（13 / 13 phase、0 error、0 warning、0 info）
- `quick_validate.js .claude/skills/aiworkflow-requirements`: PASS（12項目、0 error、135 warning）
- mirror sync: PASS（`diff -qr` で差分なし）

## 完了条件

- [x] Step 1-A / 1-B / 1-C / Step 2 を分けて記録した
- [x] exact count / task ID / path / placement を current 実行結果に合わせた
- [x] diff ベース監査と target-file 監査の用途差を明示した
