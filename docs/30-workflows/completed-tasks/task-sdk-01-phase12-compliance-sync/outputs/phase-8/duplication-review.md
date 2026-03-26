# Phase 8 Duplication Review

## 役割分担

- `system-spec-update-summary.md`: Step 1-A〜Step 2 の判断根拠を残す
- `documentation-changelog.md`: 更新ファイルと validator 実測を列挙する
- `unassigned-task-detection.md`: current / baseline / carry-forward を分けて記録する
- `phase12-task-spec-compliance-check.md`: 完了判定だけを最終確認する

## 重複除去

- parent / follow-up の両方で同じ validator 数値を書く場合は summary と compliance-check に限定した
- `esbuild` blocker は 1 回だけ `carry-forward` として記録し、各ファイルで別名表現を使わない
