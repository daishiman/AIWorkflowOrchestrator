# UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001: Phase 12 skill-feedback-report 必須化

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001                                                    |
| 発見元       | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 12 skill-feedback-report.md 改善提案3 |
| 発見日       | 2026-03-24                                                                                  |
| 優先度       | 中                                                                                          |
| 種別         | スキル改善                                                                                  |
| 対象スキル   | task-specification-creator                                                                  |
| 関連仕様書   | .claude/skills/task-specification-creator/SKILL.md, references/phase-templates.md           |
| 関連Pitfall  | P28（スキルフィードバックレポート未作成）                                                   |
| GitHub Issue | #1552                                                                                       |

## 背景

Phase 12 のテンプレートに skill-feedback-report が含まれていない場合がある。
P28 で「改善点なしでもレポート作成は必須」と定められたが、テンプレート自体に
項目が含まれていないため、実行者が作成を忘れる。

TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 では skill-feedback-report.md を
作成したが、documentation-changelog.md の成果物テーブルから漏れていた（レビューで検出・修正済み）。

## 対応内容

1. Phase 12 テンプレート (`phase-templates.md`) の Task リストに
   `skill-feedback-report.md` を必須項目として追加する

2. `artifacts.json` 生成スクリプトに Phase 12 の成果物として
   `skill-feedback-report.md` を自動追加するロジックを組み込む

3. Phase 12 の完了条件チェックリストに
   「skill-feedback-report.md が作成済みであること」を追加する

4. `05-task-execution.md` の Phase 12 チェックリストに
   「skill-feedback-report の作成確認」行を追加する

## 受入基準

- [ ] phase-templates.md の Phase 12 Task リストに skill-feedback-report が必須項目として含まれている
- [ ] artifacts.json に Phase 12 成果物として skill-feedback-report.md が自動追加される
- [ ] Phase 12 完了条件に skill-feedback-report 確認が含まれている
- [ ] 05-task-execution.md に Phase 12 チェック項目が追加されている
- [ ] P28 教訓との整合性が取れている

## 苦戦箇所・教訓

| ID         | 苦戦箇所                                                                                     | 将来の解決指針                                                                     |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| L-FB-003   | skill-feedback-report.md を作成したが documentation-changelog の成果物テーブルに記載を忘れた | artifacts.json と documentation-changelog の成果物リストを自動照合する仕組みを導入 |
| L-CBLG-003 | worktree 環境で rsync を実行する際、パスが意図しない場所を指す可能性がある                   | rsync 実行前に pwd と git rev-parse --show-toplevel で確認する手順を標準化         |

## 参照

- `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/phase-12/skill-feedback-report.md` (改善提案3)
- `.claude/rules/05-task-execution.md` (Phase 12 チェックリスト)
- `.claude/rules/06-known-pitfalls.md` (P28)
