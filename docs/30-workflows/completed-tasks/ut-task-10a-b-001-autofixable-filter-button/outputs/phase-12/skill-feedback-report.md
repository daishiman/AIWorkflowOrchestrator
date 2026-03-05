# Phase 12 スキルフィードバックレポート

## 対象スキル

- `task-specification-creator`
- `aiworkflow-requirements`
- `skill-creator`

## 改善提案

| ID    | 対象                       | 提案                                                                                                                                   | 期待効果                                    |
| ----- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| FB-01 | task-specification-creator | `audit-unassigned-tasks` の `--json` 出力に「差分判定サマリー（new/regressed/unchanged）」を標準追加する                               | Phase12で baseline と current の誤読を防止  |
| FB-02 | task-specification-creator | `phase12-checklist-definition.md` に `spec-update-summary.md` 必須化を明記する                                                         | 成果物漏れの防止                            |
| FB-03 | aiworkflow-requirements    | `task-workflow.md` の派生タスク更新セクションに「件数再計算式（完了数/残数）」テンプレートを追加する                                   | 件数ドリフト再発防止                        |
| FB-04 | aiworkflow-requirements    | `generate-index.js` 実行後に差分サマリー（更新ファイル数/行数）を表示する                                                              | Step 1-D の監査可能性向上                   |
| FB-05 | task-specification-creator | UI撮影スクリプトのモックテーマを `prefers-color-scheme` と同期するガードを `phase-11-12-guide.md` に追加する                           | light/dark 証跡の取り違え防止               |
| FB-06 | task-specification-creator | screenshot再撮影前に `lsof -nP -iTCP:<port> -sTCP:LISTEN` を必須チェック化し、競合時の分岐記録をテンプレート化する                     | Port競合での証跡欠落防止                    |
| FB-07 | skill-creator              | Phase 12パターンに「完了済みUT指示書の `completed-tasks` 直下移管」と「未実施UTの `unassigned-task` 分離配置」を成功条件として追加する | 完了/未実施の配置混在による参照ドリフト防止 |
| FB-08 | skill-creator              | Phase 12パターンに `verify-unassigned-links`（リンク整合）と `audit --diff-from HEAD`（差分合否）の2軸を同時必須化する                 | 全体baseline誤読と差分合否の混同防止        |

## 今回のフィードバック反映状況

- `.claude/skills/aiworkflow-requirements/LOGS.md` 追記済み
- `.claude/skills/task-specification-creator/LOGS.md` 追記済み
- `.claude/skills/skill-creator/LOGS.md` 追記済み
- `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴追記済み
- `.claude/skills/task-specification-creator/SKILL.md` 変更履歴追記済み
- `.claude/skills/skill-creator/SKILL.md` 変更履歴追記済み

## quick_validate 結果メモ

- `skill-creator`: 0エラー / 26警告
- `task-specification-creator`: 0エラー / 3警告
- `aiworkflow-requirements`: 0エラー / 149警告

警告はいずれも「SKILL.mdから未リンクreferenceが存在」の既知系で、今回差分で新規エラーはありません。

## 完了状態

- Task 12-5: Completed
