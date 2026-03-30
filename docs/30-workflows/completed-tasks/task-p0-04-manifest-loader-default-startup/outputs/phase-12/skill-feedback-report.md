# TASK-P0-04: スキルフィードバックレポート

## 改善提案

1. `task-specification-creator` は `completed-tasks` へ移設された workflow に対し、root 欠落を早期検知するガードを強めたい
2. `aiworkflow-requirements` は「public contract 変更なしなら Step 2 no-op」を検索しやすい形で quick-reference に出したい
3. completed-task の summary 文書が実差分より広い責務を主張したときの self-audit checklist があると再発しにくい
4. `unassigned-task` の発動条件を「大きく危険な課題だけ」に固定し、単純な未実行項目は same-wave で閉じるルールを guide と validator に反映したい

## 改善なし項目

- implementation guide の 2部構成要件
- Phase 13 を `blocked` で維持するルール
