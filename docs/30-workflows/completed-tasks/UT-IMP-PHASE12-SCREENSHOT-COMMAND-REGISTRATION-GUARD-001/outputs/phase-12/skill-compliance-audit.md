# Phase 12 スキル準拠監査

## 監査対象

- `task-specification-creator`
- `aiworkflow-requirements`

## 1) task-specification-creator 準拠

| 観点                 | 結果 | 根拠                                    |
| -------------------- | ---- | --------------------------------------- |
| Phase 1〜13 仕様存在 | PASS | workflow配下に phase-1..13 が存在       |
| 必須成果物出力       | PASS | Phase 1〜12 の outputs を生成           |
| 検証コマンド実行     | PASS | verify/validate/coverage/audit 実行済み |
| artifacts更新        | PASS | Phase 1〜12 完了登録を反映              |

## 2) aiworkflow-requirements 準拠

| 観点                 | 結果 | 根拠                       |
| -------------------- | ---- | -------------------------- |
| task-workflow 同期   | PASS | 完了追補・変更履歴追記     |
| lessons-learned 同期 | PASS | 苦戦箇所・手順追記         |
| index再生成          | PASS | `generate-index.js` 実行   |
| unassigned監査分離   | PASS | `current=0`, `baseline=95` |

## 3) 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```
