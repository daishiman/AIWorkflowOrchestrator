# 境界値テスト仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase      | 6（テスト拡充）                                                                                                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                                            |
| 作成日     | 2026-03-16                                                                                                                                                         |
| 入力成果物 | `outputs/phase-4/*.md`, `outputs/phase-5/*.md`                                                                                                                     |
| テスト状態 | Red（Phase 5 実装後に Green へ移行）                                                                                                                               |
| 実装先     | `packages/shared/src/skill/lifecycle/__tests__/boundary-values.test.ts`, `apps/desktop/src/renderer/store/slices/__tests__/lifecycleHistorySlice.boundary.test.ts` |

---

## 1. 目的

Phase 4 テスト仕様では主要な境界値をカバーしたが、以下の大量データ・空データ・還流ルール発火境界の観点で追加テストが必要。

- 1000件上限到達時のイベント削除動作
- 0件データ時のデフォルト値保証
- 還流ルール・推薦スコア・readiness 判定の閾値境界

---

## 2. テストケース一覧

### 2-1. 大量イベントテスト

| テストID   | テストケース                                      | 入力・シナリオ                                                                   | 期待結果                                                                            | 分類   |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| BND-LG-001 | 1000件上限到達時に最古のイベントが削除される      | State に999件存在する状態で2件追加                                               | `events.length === 1000`、最古の1件が削除されている                                 | 境界値 |
| BND-LG-002 | 1001件目の記録で最古イベントが消失する            | State に1000件存在する状態で1件追加                                              | `events.length === 1000`、最古の1件が削除され、新しいイベントが先頭に追加されている | 境界値 |
| BND-LG-003 | 削除はタイムスタンプ順（最古から）で行われる      | timestamp が `T-1000`, `T-999`, ..., `T-1` のイベント1000件を記録後、新規1件追加 | `T-1000` のイベントが削除され、新規イベントが先頭に存在                             | 境界値 |
| BND-LG-004 | 大量削除（1050件追加→1000件維持）が正しく動作する | 空 State から1050件を連続追加                                                    | `events.length === 1000`、最初の50件が削除されている                                | 境界値 |
| BND-LG-005 | scoreHistory の 200 件上限が正しく動作する        | 250件の skill:evaluated イベントを含む events で `buildAggregateView` 実行       | `scoreHistory.length === 200`、直近200件のみ含まれる                                | 境界値 |
| BND-LG-006 | recentEvents の 10 件上限が正しく動作する         | 15件のイベントを含む events で `buildAggregateView` 実行                         | `recentEvents.length === 10`、最新10件がタイムスタンプ降順で含まれる                | 境界値 |

### 2-2. 空データテスト

| テストID   | テストケース                                                     | 入力                                                                                             | 期待結果                                                                                                                                             | 分類   |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| BND-EM-001 | イベント0件で buildAggregateView のデフォルト値が正しい          | `buildAggregateView("s1", "s1", [])`                                                             | `successRate: 0.0`, `trend: "stable"`, `recentEvents: []`, `scoreHistory: []`, `totalExecutions: 0`, `latestScore: null`, `recommendationScore: 0.0` | 境界値 |
| BND-EM-002 | イベント0件で calculateSuccessRate が 0.0 を返す                 | `calculateSuccessRate([], 30)`                                                                   | `0.0`                                                                                                                                                | 境界値 |
| BND-EM-003 | イベント0件で calculateTrend が "stable" を返す                  | `calculateTrend([], 5)`                                                                          | `"stable"`                                                                                                                                           | 境界値 |
| BND-EM-004 | フィードバック0件で calculateImprovementPriority のデフォルト値  | `metrics: { successRate: null, latestScore: null }`, `feedbackCount: 0`                          | `0.80`（`(1.0*0.4) + (1.0*0.4) + (0.0*0.2)`）                                                                                                        | 境界値 |
| BND-EM-005 | フィードバック0件で evaluateFeedbackRules が空配列を返す         | `metrics: { successRate: 0.9, latestScore: 85, averageUserRating: 4.5 }`, `pendingFeedbacks: []` | `[]`（全ルール非発火）                                                                                                                               | 境界値 |
| BND-EM-006 | 空イベントで buildPublishReadinessMetrics のデフォルト値が正しい | `buildPublishReadinessMetrics("s1", "s1", [], [])`                                               | `qualityScore: null`, `stabilityScore: null`, `usageCount: 0`, `hasCriticalFeedback: false`                                                          | 境界値 |

### 2-3. 還流ルール・集約ロジック境界値テスト

| テストID   | テストケース                                                                  | 入力                                                                        | 期待結果                                                                                       | 分類   |
| ---------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| BND-TH-001 | successRate = 0.5 で `LOW_SUCCESS_RATE_WARNING` が発火する（`<= 0.50` 境界）  | `metrics.successRate = 0.50`                                                | `triggerRule === "LOW_SUCCESS_RATE_WARNING"` のアクションが含まれる                            | 境界値 |
| BND-TH-002 | successRate = 0.51 で `LOW_SUCCESS_RATE_WARNING` が発火しない                 | `metrics.successRate = 0.51`                                                | `triggerRule === "LOW_SUCCESS_RATE_WARNING"` のアクションが含まれない                          | 境界値 |
| BND-TH-003 | averageUserRating = 3.0 で `LOW_USER_RATING` が発火しない（`< 3.0` 境界）     | `metrics.averageUserRating = 3.0`                                           | `triggerRule === "LOW_USER_RATING"` が含まれない、`LOW_USER_RATING_BORDERLINE` が含まれる      | 境界値 |
| BND-TH-004 | averageUserRating = 2.99 で `LOW_USER_RATING` が発火する                      | `metrics.averageUserRating = 2.99`                                          | `triggerRule === "LOW_USER_RATING"` が含まれる                                                 | 境界値 |
| BND-TH-005 | usageCount = 5 で ready 候補になる（`>= 5` 境界: REQ-M-01）                   | `usageCount: 5`, `qualityScore: 80`, `stabilityScore: 0.9`, `!hasCritical`  | Task08 参考フローで `readinessLevel: "ready"` となるデータが提供される                         | 境界値 |
| BND-TH-006 | usageCount = 4 で ready にならない                                            | `usageCount: 4`, 他条件は全てクリア                                         | Task08 参考フローで `readinessLevel: "not_ready"`, `reason: "INSUFFICIENT_USAGE"` となるデータ | 境界値 |
| BND-TH-007 | recency = 90日で recency スコアが 0.0 になる（`1.0 - 90/90 = 0.0` 境界）      | `lastExecutedAt` が referenceDate の90日前                                  | `calculateRecommendationScore` の recency 成分が 0.0                                           | 境界値 |
| BND-TH-008 | recency = 89日で recency スコアが 0.0 超になる                                | `lastExecutedAt` が referenceDate の89日前                                  | recency = `max(0, 1.0 - 89/90)` = 約 0.011                                                     | 境界値 |
| BND-TH-009 | normalizedScore = 100 で normalizedScore が 1.0 になる（`100/100` 境界）      | `latestScore: 100`                                                          | `calculateRecommendationScore` の normalizedScore 成分が 0.4（`1.0 * 0.4`）                    | 境界値 |
| BND-TH-010 | normalizedScore = 0 で normalizedScore が 0.0 になる                          | `latestScore: 0`                                                            | `calculateRecommendationScore` の normalizedScore 成分が 0.0                                   | 境界値 |
| BND-TH-011 | slope 境界値 0.5 ちょうどで calculateTrend が "stable" を返す                 | `slope === 0.5` となるスコア列（例: `[70, 70, 70, 70, 72]` 等、計算で確認） | `"stable"`（`slope > 0.5` が improving の条件のため）                                          | 境界値 |
| BND-TH-012 | slope 境界値 -0.5 ちょうどで calculateTrend が "stable" を返す                | `slope === -0.5` となるスコア列                                             | `"stable"`（`slope < -0.5` が declining の条件のため）                                         | 境界値 |
| BND-TH-013 | feedbackCount = 10 と feedbackCount = 11 で同一の改善優先度を返す             | `feedbackCount: 10` と `feedbackCount: 11` で同一 metrics                   | 両方とも同一の priority 値を返す（10件で頭打ち）                                               | 境界値 |
| BND-TH-014 | latestScore = 49 かつ successRate = 0.50 で COMBINED_LOW_QUALITY が発火する   | `metrics: { successRate: 0.50, latestScore: 49 }`                           | `triggerRule === "COMBINED_LOW_QUALITY"` が含まれる                                            | 境界値 |
| BND-TH-015 | latestScore = 50 かつ successRate = 0.50 で COMBINED_LOW_QUALITY が発火しない | `metrics: { successRate: 0.50, latestScore: 50 }`                           | `triggerRule === "COMBINED_LOW_QUALITY"` が含まれない（`< 50` の条件を満たさない）             | 境界値 |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
packages/shared/src/skill/lifecycle/__tests__/
  boundary-values.test.ts  # BND-EM-*, BND-TH-*（純粋関数の境界値）

apps/desktop/src/renderer/store/slices/__tests__/
  lifecycleHistorySlice.boundary.test.ts  # BND-LG-*（Store の大量データ）
```

### 3-2. 既知パターン対策

| パターン | 対策                                  |
| -------- | ------------------------------------- |
| P9       | `beforeEach` で Store 状態をリセット  |
| P42      | skillId は `toSkillName()` 経由で生成 |
| P13      | 純粋関数テストのためタイマー不使用    |

### 3-3. テストデータ依存

- `createMockLifecycleEvent()`, `createMockFeedback()`, `createExecutionEventChain()` ファクトリを使用
- 大量データテスト（BND-LG-\*）では `createExecutionEventChain()` で一括生成

---

## 4. テストケース件数サマリー

| カテゴリ                             | 件数   |
| ------------------------------------ | ------ |
| 大量イベントテスト                   | 6      |
| 空データテスト                       | 6      |
| 還流ルール・集約ロジック境界値テスト | 15     |
| **合計**                             | **27** |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 6_
