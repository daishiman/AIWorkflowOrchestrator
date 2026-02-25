# Phase 12 スキル改善レポート

## ワークフロー改善点

1. `audit-unassigned-tasks.js` の scope分離により、Phase 12 の current判定が機械化された。
2. `phase-11-12-guide.md` の監査手順を「対象→全体」の2段に固定し、誤判定を減らせた。
3. `SKILL.md` の変更履歴を圧縮して、`quick_validate.js` の構造検証（500行制約）を継続的に通せる運用に改善した。

## 技術的教訓

1. baseline違反が大量にあるリポジトリでは、全体FAILを今回FAILと混同しやすい。
2. CLIで `exit 2` を明確化すると運用者の入力ミス切り分けが速い。

## task-specification-creator 改善提案

1. `audit-unassigned-tasks.js` に `--help` を追加し、オプション説明を自己完結化する。
2. `phase-11-12-guide.md` のコマンド例に `{{TASK_FILE}}` 展開チェックを追加し、コピペ事故を防ぐ。
3. `complete-phase.js` 実行後に `generate-index.js --regenerate` を推奨手順へ固定し、indexステータス未同期を防止する。
4. `SKILL.md` は長期履歴を `LOGS.md` に寄せ、`SKILL.md` は直近履歴のみ保持する運用基準を明文化する。

## aiworkflow-requirements 改善提案

1. `task-workflow.md` の未タスク完了化フォーマット（取り消し線 + 完了日）をテンプレート化すると、Step 1-Bの更新ミスをさらに減らせる。

## 新規Pitfall候補

- 候補: 「scope指定なし監査結果を current 判定と誤読する」
- 対策案: Phase 12チェックリストに `currentViolations.total` 明示確認を必須項目として固定。
