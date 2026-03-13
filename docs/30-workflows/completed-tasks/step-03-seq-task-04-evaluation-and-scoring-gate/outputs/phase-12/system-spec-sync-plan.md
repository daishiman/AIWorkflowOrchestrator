# Phase 12: System Spec Sync Plan

## canonical root

- 正本: `.claude/skills/...`
- mirror: `.agents/skills/...`
- 実施結果: `.claude` 更新後に `.agents` へ同一差分を同期済み

## system spec 同期結果

| ファイル                                                                          | 反映内容                                                                                           | 実施状況 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | `SkillEvaluationPanel`、Task03-Task05 共通 gate UI、screenshot 6件                                 | 同期済み |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `skillEvaluationSlice` ownership、`latestExecutionQuality` 再利用、`recommended -> use_ready` 契約 | 同期済み |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:optimize:evaluate` 再利用、renderer 契約、store action 経由ルール                           | 同期済み |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `window.electronAPI.skill.evaluatePrompt()`、shared type export、quality gate surface              | 同期済み |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Task04 完了台帳、validator 実行結果、未タスク監査                                                  | 同期済み |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | public preload API 見落とし、Phase11/12 validator 依存、mirror 運用教訓                            | 同期済み |

## 関連 skill docs 同期結果

| ファイル                                                                       | 反映内容                                                | 実施状況 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | Task04 再監査ログ                                       | 同期済み |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴 `9.01.89`                                      | 同期済み |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | public preload API / shared export の Step 2 判断ルール | 同期済み |
| `.claude/skills/task-specification-creator/LOGS.md`                            | Task04 テンプレート是正ログ                             | 同期済み |
| `.claude/skills/task-specification-creator/SKILL.md`                           | 変更履歴 `v10.08.61`                                    | 同期済み |

## mirror 同期結果

| ファイル群                                                 | 状態               |
| ---------------------------------------------------------- | ------------------ |
| `.agents/skills/aiworkflow-requirements/*` 対応ファイル    | 同期済み           |
| `.agents/skills/task-specification-creator/*` 対応ファイル | 同期済み           |
| `indexes/topic-map.md`, `indexes/keywords.json`            | 再生成後に同期済み |

## 同期内容の要点

1. Task03 / Task05 間の共通 gate contract を UI / state / IPC / public interface にまたがって固定した。
2. `window.electronAPI.skill.evaluatePrompt()` と shared barrel export を system spec 更新対象として明示した。
3. Phase 11 screenshot 6件、Phase 12 validators、未タスク監査を完了台帳と教訓へ同値転記した。
