# System Spec Update Summary

## current fact 判定

| 項目      | 判定                                          | 根拠                                                                                          |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| task 種別 | code+docs wave / `implemented-with-followups` | current branch には Task06 実装差分が存在し、workflow root も current fact に合わせて更新した |
| Step 1-B  | 必須                                          | `implemented-with-followups` と Phase 11 residual の記録が必要                                |
| Step 2    | PASS                                          | domain contract は `.agents` 正本仕様へ同期済み                                               |

## Step 1-A: 完了記録

| 項目          | 内容                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| 対象 workflow | `step-04-par-task-06-verify-and-improve-lifecycle-surface`                                              |
| ステータス    | `implemented-with-followups`                                                                            |
| 主題          | verify detail surface / improve selection / apply result / re-entry                                     |
| 関連成果物    | `index.md`, `phase-1..13`, `artifacts.json`, `outputs/phase-*`, `outputs/phase-11/screenshot-plan.json` |
| 変更履歴      | runtime 実装反映後の false green 是正、Phase 11 evidence chain 追加、Phase 12 summary 再分類            |

## Step 1-B: 実装状況テーブル相当の整理

| 対象          | 記録値                       | 根拠                                                                        |
| ------------- | ---------------------------- | --------------------------------------------------------------------------- |
| workflow root | `implemented-with-followups` | 実装・テスト・spec sync を反映済みで、live capture は residual として別管理 |
| Phase 1-10    | `complete`                   | 実装・テスト・Phase 10 gate までは current branch で確認済み                |
| Phase 11      | `blocked`                    | screenshot plan はあるが actual PNG coverage が未充足                       |
| Phase 12      | `complete`                   | blocker と Step 2 sync 状態を current fact に合わせて再記録                 |
| Phase 13      | `blocked`                    | ユーザー承認前につき固定                                                    |

## Step 1-C: 関連 task 境界

| 関連 task | Task06 に残す内容                         | 委譲する内容                                 |
| --------- | ----------------------------------------- | -------------------------------------------- |
| Task05    | result surface から create へ戻らない境界 | create 主導線の最終設計                      |
| Task07    | terminal handoff guidance の表示境界      | governance / disclosure / approval hardening |
| Task08    | re-verify までの surface 契約             | session persistence / resume compatibility   |

## Step 2: domain spec sync 判定

| 対象                                                                                                    | 判定             | 理由                                                                                                    |
| ------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                              | 同期済み         | `skill-creator:get-verify-detail` / `skill-creator:reverify-workflow` と Task06 current fact が追記済み |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`               | 今回追加更新不要 | current branch 差分で interface drift は未検出                                                          |
| `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | 今回追加更新不要 | 評価 gate の reuse だけで、Task06 固有差分は `api-ipc-system-core.md` で閉じている                      |

## validator / 整合チェック

| コマンド / 観点                                                                                                                                                         | 結果    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/step-04-par-task-06-verify-and-improve-lifecycle-surface --phase 12` | PASS    |
| artifacts root / outputs parity                                                                                                                                         | PASS    |
| Phase 5-10 artifact の実在性                                                                                                                                            | PASS    |
| 未来表現の残存有無                                                                                                                                                      | PASS    |
| api/ipc/preload/renderer/shared 実装の存在確認                                                                                                                          | PASS    |
| Phase 11 actual screenshot evidence                                                                                                                                     | BLOCKED |
