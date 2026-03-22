# Phase 12: システム仕様書更新サマリー

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 作成日   | 2026-03-21                                 |
| 記録方針 | 実績記録（計画表現を残さない）             |

---

## 実際に更新したファイル一覧

| ファイル                                                                                                        | 変更種別    | 変更内容                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                | 追記        | Task02 最終再監査の headline / 実装 gap formalize を記録                                                      |
| `.claude/skills/task-specification-creator/LOGS.md`                                                             | 追記        | Phase 12 最終再監査セクションを追加                                                                           |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                                               | 追記        | 変更履歴 9.02.08 を追加                                                                                       |
| `.claude/skills/task-specification-creator/SKILL.md`                                                            | 追記        | 変更履歴 v10.09.11 を追加し、worktree 先送りルールを是正                                                      |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                  | 追記        | design task は workflow root=`implementation_ready`、completed record=`spec_created` とする誤判断ガードを追加 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                    | 追記        | follow-up 4件を backlog へ登録                                                                                |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                  | 追記        | Task02 を design-complete entry として追加                                                                    |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | 更新        | current snapshot と follow-up backlog を 4件構成へ同期                                                        |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`               | 追記        | 最終再監査で判明した code sweep 必須ルールを追加                                                              |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                   | 再生成      | `generate-index.js` 実行で再生成                                                                              |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                                  | 再生成      | `generate-index.js` 実行で再生成                                                                              |
| `.agents/skills/` 配下                                                                                          | Mirror Sync | `rsync --checksum` で `.claude/skills/` から同期                                                              |

## Step 1-B / Step 2 の判断

- workflow root status: `completed` ではなく **`implementation_ready`**
- completed ledger status: **`spec_created`**
- Step 1-B 実施内容: `index.md` / `artifacts.json` / `outputs/artifacts.json` / `phase-1..13` の表現を整合化
- Step 2 domain spec sync: **追加実装なしのため新規 interface/API 変更はなし**
  - 今回の監査対象は「centralization 実装が完了していない事実の同期」であり、新しい仕様追加ではない
  - 代わりに implementation closure task を formalize して、実装 gap を台帳へ昇格した

## 実装実体のスナップショット

最終再監査では current code も確認し、Task02 の close-out が feature 完了ではないことを以下の実体で確認した。

- `apps/desktop/src/main/ipc/skillHandlers.ts` / `agentHandlers.ts` は依然として `RuntimeResolver` 系の消費経路を持つ
- `apps/desktop/src/main/ipc/index.ts` の composition root は `RuntimePolicyResolver` への完全切り替えを閉じていない
- `apps/desktop/src/main/ipc/aiHandlers.ts` は runtime policy を経由しない経路と `AI_CHECK_CONNECTION` legacy handler を保持している
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `execute()` は resolve した decision を実行制御に使っていない
- shared runtime decision transport と cross-process test coverage が不足している

## formalize した follow-up

| タスクID                                                            | 目的                                                | 優先度 |
| ------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` | actual consumer / shared contract / test の実装収束 | 高     |
| `UT-CLEANUP-AI-CHECK-CONNECTION-001`                                | legacy health route cleanup                         | 低     |
| `UT-CLEANUP-RUNTIME-RESOLVER-001`                                   | deprecated resolver cleanup                         | 低     |
| `UT-DESIGN-SANITIZE-PLACEMENT-001`                                  | sanitize 配置判断の固定                             | 中     |
