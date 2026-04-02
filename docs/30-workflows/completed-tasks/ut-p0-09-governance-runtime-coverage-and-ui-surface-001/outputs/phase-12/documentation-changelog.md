# Phase 12: ドキュメント変更履歴

作成日: 2026-04-02  
タスクID: UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001

## current / baseline / validator

| 区分      | 内容                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| current   | renderer UI, Phase 11 N/A evidence, system spec same-wave sync を current facts に更新                                                      |
| baseline  | 実装ガイドが Part 1/2 未分離、system spec が lessons 1ファイルしか更新されていない、mirror parity 未実施                                    |
| validator | `validate-phase12-implementation-guide` は PASS、`verify-all-specs` は PASS（warningあり）、`validate-phase-output` は PNG 証跡 0 件で FAIL |

## Step 1-A〜2 実更新ファイル

| ファイル                                                                                             | 操作     | 内容                                      |
| ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                | 新規作成 | governance 状態表示コンポーネント         |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                 | 修正     | `GovernanceSummaryPanel` の import と統合 |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | 新規作成 | 13テストケース                            |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx`  | 修正     | 統合描画確認を追加                        |
| `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`            | 新規作成 | 12テストケース                            |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | 修正     | execute-only 前提を全フェーズ完了へ補正   |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`          | 修正     | follow-up 継続表現を current facts に補正 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                       | 修正     | completed ledger に本 UT を追加           |
| `docs/30-workflows/unassigned-task/UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001.md`       | 修正     | source unassigned status を完了済みへ更新 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                     | 修正     | same-wave sync 記録を追記                 |
| `.claude/skills/task-specification-creator/LOGS.md`                                                  | 修正     | Phase 12 guide hardening の反映を追記     |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                                    | 修正     | 変更履歴を追記                            |
| `.claude/skills/task-specification-creator/SKILL.md`                                                 | 修正     | 変更履歴を追記                            |
| `docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/outputs/phase-12/*.md`    | 修正     | Phase 12 成果物を task spec 準拠へ再整理  |

## artifacts 同期

`artifacts.json` と `outputs/artifacts.json` は diff 0 を確認済みです。

## mirror parity

`.claude/skills/aiworkflow-requirements/` と `.claude/skills/task-specification-creator/` の更新後、対応する `.agents/skills/` mirror へ同期します。
