# スキルフィードバックレポート — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## lessons-learned ID

**L-EVALS-VALIDATOR-001**（本タスクのレッスン ID）

## skill-fixture-runner への改善提案

| 提案                               | 詳細                                                                                                  | 優先度 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| validate-evals.js の registry 統合 | `run-all-validations.js` の検証スクリプトリストを設定ファイル化し、新スクリプト追加をゼロコードにする | 低     |
| fixture 除外 allowlist の設定化    | `FIXTURE_EXCLUSION_LIST` をハードコードでなく JSON 設定ファイルから読み込む                           | 低     |
| CLI 契約の単一正本化（既に達成）   | Phase 2 に CLI 契約正本を集約し、Phase 4/5/11/12 が参照する構造は今回で確立                           | 完了   |

## aiworkflow-requirements への改善提案

| 提案                                        | 詳細                                                                                         | 優先度 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| error-handling.md への EVALS エラー分類追記 | L1/L2/L3 エラー分類と exit code 対応表を追加済み。今後は detail companion への展開を検討する | 完了   |
| quality-requirements.md への EVALS 検証追記 | EVALS.json 検証を quality gate として追加済み                                                | 完了   |

## task-specification-creator への波及提案

新スキル生成テンプレートに EVALS.json バリデーションの実行手順を組み込むことで、新規スキル追加時の検証漏れを防止できる（必要な場合のみ）。

## LOGS.md 追記対象

- `.claude/skills/skill-fixture-runner/LOGS.md`: validate-evals.js 追加を記録
- `.claude/skills/aiworkflow-requirements/LOGS.md`: EVALS validator 追加を current facts に記録

## 改善なしの確認

スコープ内で即時反映すべき項目は本 wave で実施済み。残る follow-up は `registry 設定化` と `qualityInsights 詳細検証` に限定される。
