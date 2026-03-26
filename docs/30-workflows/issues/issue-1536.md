# [#1536] [UT-WORKTREE-RSYNC-CAUTION-001] worktree 環境での rsync 実行注意書きの追加

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスクID   | UT-WORKTREE-RSYNC-CAUTION-001                                       |
| 発見元     | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 10 MINOR M-01 |
| 優先度     | 低                                                                  |
| 種別       | ドキュメント改善                                                    |
| 関連リスク | R-15（worktree 環境での rsync 誤実行による mirror 破損）            |

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

## 指示書

`docs/30-workflows/unassigned-task/worktree-rsync-caution-annotation.md`
