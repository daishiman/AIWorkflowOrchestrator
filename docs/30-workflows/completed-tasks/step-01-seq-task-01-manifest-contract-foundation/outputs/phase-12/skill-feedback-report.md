# Phase 12: スキルフィードバックレポート

## aiworkflow-requirements

- close-out drift のような docs-only follow-up では、`task-workflow-completed.md` の親タスク内 bullet と独立 completed entry の両方をどう更新するかを明示すると迷いが減る
- `lessons-learned-phase12-workflow-lifecycle.md` に「解消済み follow-up」と「継続中 follow-up」を 1 表で分けるテンプレートがあると再利用しやすい

## task-specification-creator

- `generate-index.js` は `artifacts.json` の `phases` を配列 / オブジェクト両対応で扱うべきであり、今回その実装とテストを追加した
- docs-only Phase 11 でも `validate-phase-output.js` の補助成果物要件を満たす placeholder PNG を保存し、その用途を manual result に明記するテンプレートがあると再発しにくい

## 今回の next action

- `generate-index.js` の array/object 両対応テストを維持し、Phase 12/13 status drift を再発させない
- NON_VISUAL task 向けの `screenshot-plan.json` placeholder 運用を Phase 11 ガイドへ展開する
