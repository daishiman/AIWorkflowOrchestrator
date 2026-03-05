# Phase 12 スキルフィードバック

## 観察

- `task-specification-creator` のフェーズ粒度は、実装伴走時にも追跡しやすい
- SubAgent分離(要件/契約/品質)を成果物へ反映するとレビューしやすい

## 改善提案

1. Phase 11 テンプレートに「Apple UI/UX視点の評価項目」を標準項目として追加する
2. Phase 7 で「対象限定カバレッジ実行時の閾値扱い」を明文化する
3. Phase 12 Step 1-C で「旧参照パス一括検査（rg）」を必須チェックに追加する
4. Phase 3/10/12 テンプレートの「実行タスク」は表形式のみだと `validate-phase-output` 警告になりうるため、`- Task X: ...` の箇条書きを標準出力に含める
5. 未タスクの配置先判定（未完了=`docs/30-workflows/unassigned-task/`）を Task 4 の完了条件へ明示し、`completed-tasks/unassigned-task/` 混入を防ぐ

## 改善点なしの場合の宣言

- N/A (改善提案あり)
