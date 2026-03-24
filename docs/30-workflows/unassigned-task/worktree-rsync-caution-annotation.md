# UT-WORKTREE-RSYNC-CAUTION-001: worktree 環境での rsync 実行注意書きの追加

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-WORKTREE-RSYNC-CAUTION-001                                       |
| 発見元       | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 10 MINOR M-01 |
| 発見日       | 2026-03-23                                                          |
| 優先度       | 低                                                                  |
| 種別         | ドキュメント改善                                                    |
| 関連リスク   | R-15（worktree 環境での rsync 誤実行による mirror 破損）            |
| 関連仕様書   | outputs/phase-9/risk-register.md, outputs/phase-2/design-summary.md |
| GitHub Issue | #1536                                                               |

## 背景

Phase 12 Step E の rsync 実行手順に、worktree 環境固有の注意事項が不足している。
worktree ではカレントディレクトリが main ブランチのルートと異なるため、rsync のソース・宛先パスが意図しない場所を指す可能性がある。

## 対応内容

1. implementation-guide.md Part 2 § 2.4 Step E に以下の注意書きを追加する:
   - worktree 環境では `.claude/skills/` のパスが worktree root 基準であることを明記
   - rsync 実行前に `pwd` と `git rev-parse --show-toplevel` で作業ディレクトリを確認する手順を追加
   - worktree 上での rsync が main ブランチの `.agents/skills/` に影響しないことを確認する手順

2. design-summary.md § 3.2 Bridge Rule に worktree 環境の制約を追記する

## 受入基準

- [ ] implementation-guide.md に worktree 環境注意書きが追加されている
- [ ] design-summary.md に worktree 制約が追記されている
- [ ] 追記後の整合性を `grep -n "worktree" outputs/phase-12/implementation-guide.md` で確認

## 苦戦箇所・教訓

本タスクの検出元となった governance 設計タスクでの苦戦箇所を記録する。同様の課題を将来簡潔に解決するための知見。

| ID         | 苦戦箇所                                                                                                                                    | 将来の解決指針                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L-CBLG-001 | Phase 10 MINOR 照合時に risk-register.md R-15 との cross-reference チェックが不足し、設計への反映が PARTIAL のまま PASS 判定された          | Phase 10 レビューで MINOR 指摘を出す際はリスク台帳との cross-reference を必ず確認する              |
| L-CBLG-002 | 設計タスクで「PRマージ後に仕様書更新」と先送りしそうになった（P57 再発リスク）。Phase 12 完了時点で `.claude/skills/` の実更新を徹底した    | 設計タスクでも Phase 12 完了時点でシステム仕様書を実更新する。「計画文」ではなく「実績ログ」を残す |
| L-CBLG-003 | worktree 環境で rsync を実行する際、カレントディレクトリが main ルートと異なるためパスが意図しない場所を指す可能性がある（R-15 の根本原因） | rsync 実行前に `pwd` と `git rev-parse --show-toplevel` で作業ディレクトリを確認する手順を標準化   |

## 参照

- `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/phase-9/risk-register.md` (R-15)
- `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/phase-2/design-summary.md` (Bridge Rule)
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` (L-CBLG-001/002)
