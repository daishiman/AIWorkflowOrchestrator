# 手動検証チェックリスト

> Phase 4 タスク2 成果物
> 作成日: 2026-04-21

## 追記内容の完全性確認（Phase 5 完了後に実施）

### 正本（evals-schema-spec.md §6）の確認

- [ ] `qualityInsights.patternAdoptionRate` の定義が正本に存在する
- [ ] `qualityInsights.coverageTargetHitRate` の定義が正本に存在する
- [ ] `qualityInsights.unassignedTaskDetectionRate` の定義が正本に存在する
- [ ] `qualityInsights.notes` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics` の定義が正本に存在する（タスクIDキー辞書として）
- [ ] `qualityInsights.taskMetrics.{TASK_ID}.completedPhases` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.{TASK_ID}.totalTests` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` の定義が正本に存在する

### 削除確認（誤記述の除去）

- [ ] `taskMetrics.createdCount` が正本から**削除**されている
- [ ] `taskMetrics.completedCount` が正本から**削除**されている
- [ ] `taskMetrics.failedCount` が正本から**削除**されている
- [ ] `taskMetrics.retriedCount` が正本から**削除**されている
- [ ] `taskMetrics.cancelRate` が正本から**削除**されている
- [ ] `taskMetrics.blockedCount` が正本から**削除**されている
- [ ] `taskMetrics.lastUpdated` が正本から**削除**されている

## フィールド定義品質の確認

- [ ] 各フィールドに writer（手動メンテ）が明記されている
- [ ] 各フィールドに運用責任者（タスク担当者）が明記されている
- [ ] 各フィールドに更新タイミング（Phase 12 closeout）が明記されている
- [ ] 数値スコアフィールドには値域が記載されている（0.0〜1.0 または 0.0〜100.0）
- [ ] docs-only 時の `totalTests`/`avgCoverage` = 0 の運用が記載されている

## 記述スタイルの統一確認

- [ ] 既存の正本フォーマットと整合している
- [ ] セクション見出しレベルが既存と一致している（`## 6.`）
- [ ] テーブル形式が既存と一致している（列名・順序）
- [ ] 変更履歴（§8）に本タスクの修正が記録されている

## 索引確認

- [ ] topic-map に `qualityInsights` エントリが存在する
- [ ] quick-reference に `qualityInsights` エントリが存在する
- [ ] 両エントリのリンク先（`evals-schema-spec.md#qualityInsights`）が正確である
