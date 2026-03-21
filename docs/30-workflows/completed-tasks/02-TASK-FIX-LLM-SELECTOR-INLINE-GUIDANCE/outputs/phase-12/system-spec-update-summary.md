# System Spec Update Summary

## メタ情報

| 項目           | 値                                                            |
| -------------- | ------------------------------------------------------------- |
| タスクID       | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE                         |
| 作成日         | 2026-03-21                                                    |
| canonical root | `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` |

## Step 1-A: タスク完了記録

- `docs/30-workflows/ai-chat-llm-integration-fix/index.md` の Task 02 を `completed + re-audited` に更新
- `.claude/skills/aiworkflow-requirements/LOGS.md` に Task 02 同期ログを追加
- `.claude/skills/task-specification-creator/LOGS.md` に Task 02 Phase 11/12 同期ログを追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` に再発防止ルールを追記

## Step 1-B: 実装状況テーブル

- parent workflow の Phase 12 同期ステータスを更新
- `workflow-ai-chat-llm-integration-fix.md` の Task 02 状態を `実装 + Phase 11/12 再監査済み` へ更新

## Step 1-C: 関連タスクテーブル

- `task-workflow-completed-chat-lifecycle-tests.md` に Task 02 完了記録を追加
- `task-workflow-backlog.md` に follow-up 2件を追加
- `outputs/phase-12/unassigned-task-detection.md` から root `unassigned-task/` へのリンクを追加

## Step 1-D: index / quick reference

- `generate-index.js` による aiworkflow-requirements index 再生成を実施
- `generate-index.js --workflow ... --regenerate` による workflow index 再生成を実施
- `indexes/quick-reference.md` へ Task 02 canonical root を追加

## Step 1-E: same-wave sync

更新対象:

- `workflow-ai-chat-llm-integration-fix.md`
- `workflow-ai-chat-llm-integration-fix-artifact-inventory.md`
- `ui-ux-llm-selector.md`
- `legacy-ordinal-family-register.md`
- `task-workflow-completed-chat-lifecycle-tests.md`
- `task-workflow-backlog.md`
- `lessons-learned-phase12-workflow-lifecycle.md`
- `lessons-learned-current.md`
- `LOGS.md` / `SKILL.md` 2系統

## Step 2: システム仕様更新

- IPC / Preload / shared types の新規契約追加はなし
- 一方で workflow family の current canonical set、artifact inventory、legacy compatibility、backlog、lessons、quick reference は更新対象だったため、domain spec 側を実更新した

## Step 3: IPC 契約検証

- 対象外。`llm:set-selected-config` / `AI_CHAT` / preload channel の契約変更はない

## Validation

- validator 実測値と mirror parity は `phase12-task-spec-compliance-check.md` に集約する

## Path Relocation

- canonical root: `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`
- legacy path: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`
- `legacy-ordinal-family-register.md` に relocation 行を追加し、parent workflow / inventory / selector spec の参照先を揃えた
