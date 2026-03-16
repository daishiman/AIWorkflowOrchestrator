# Phase 11 シナリオB: フィードバック入力→改善→再評価の還流確認

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 11                        |
| タスクID | TASK-SKILL-LIFECYCLE-07   |
| 作成日   | 2026-03-16                |
| シナリオ | B: フィードバック還流確認 |

---

## 1. Phase 1 feedback-collection-spec.md の自動/手動境界確認

### 1.1 自動収集と手動入力の分類

Phase 1 `feedback-collection-spec.md` 5 にて、自動/手動の境界定義マトリクスが定義されている。

| 区分     | 項目数 | 記録プロセス    | 判断根拠                             |
| -------- | ------ | --------------- | ------------------------------------ |
| 自動収集 | 11項目 | Main Process    | 実行エンジン・評価エンジンが客観観測 |
| 手動入力 | 3種別  | Renderer → Main | ユーザーの主観的評価                 |

### 1.2 手動フィードバック3種別の定義確認

| 種別                   | データスキーマ          | バリデーション                              | 定義状況 |
| ---------------------- | ----------------------- | ------------------------------------------- | -------- |
| ユーザー評価（1-5星）  | `UserRating`            | 1以上5以下の整数                            | PASS     |
| テキストフィードバック | `UserTextFeedback`      | 500文字以下、空文字列拒否                   | PASS     |
| 改善提案（構造化）     | `ImprovementSuggestion` | targetSection必須、suggestionText 1-500文字 | PASS     |

**結果**: PASS -- 自動/手動の境界が明確に定義されている。

---

## 2. Phase 2 feedback-loop-design.md の SkillFeedback 型と還流ルール確認

### 2.1 SkillFeedback 型の確認

`feedback-loop-design.md` 2-2 で定義された `SkillFeedback` 型:

| フィールド    | 型                                                                          | 還流での役割                           |
| ------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| id            | string (UUID v4)                                                            | フィードバック固有識別子               |
| skillId       | string                                                                      | 対象スキル識別子                       |
| feedbackType  | `"auto_metric" \| "user_rating" \| "user_text" \| "improvement_suggestion"` | Phase 1 の3種別 + 自動メトリクスを統合 |
| value         | `number \| string \| ImprovementSuggestion`                                 | 種別に応じた値                         |
| sourceEventId | string                                                                      | 発生元ライフサイクルイベントID         |
| createdAt     | string                                                                      | 記録日時                               |
| processedAt   | string (optional)                                                           | 改善適用/却下日時                      |
| status        | `"pending" \| "applied" \| "dismissed"`                                     | ステータス遷移の現在値                 |

**結果**: PASS -- Phase 1 の手動フィードバック3種別 + 自動メトリクスが統合的にカバーされている。

### 2.2 還流ルール（evaluateFeedbackRules）の確認

| ルール名                    | 発火条件                                  | severity | アクション種別       |
| --------------------------- | ----------------------------------------- | -------- | -------------------- |
| LOW_SUCCESS_RATE_CRITICAL   | successRate < 0.30                        | critical | improvement_alert    |
| LOW_SUCCESS_RATE_WARNING    | 0.30 <= successRate <= 0.50               | warning  | improvement_alert    |
| LOW_USER_RATING             | averageUserRating < 3.0                   | warning  | review_suggestion    |
| LOW_USER_RATING_BORDERLINE  | 3.0 <= averageUserRating < 3.5            | info     | review_suggestion    |
| TEXT_FEEDBACK_ACCUMULATED   | pending user_text >= 3件                  | info     | context_accumulation |
| HIGH_IMPROVEMENT_SUGGESTION | priority:"high" の pending提案 >= 1件     | warning  | auto_improvement     |
| COMBINED_LOW_QUALITY        | successRate <= 0.50 かつ latestScore < 50 | critical | improvement_alert    |

7ルールが定義されており、独立評価（短絡評価なし）で severity 降順にソートされる。

**結果**: PASS -- ルールが包括的に定義されている。

---

## 3. Phase 2 data-flow-design.md のフィードバック→改善アクションのフロー完結確認

### 3.1 手動フィードバック入力フロー

Phase 2 `data-flow-design.md` 2 の UI入力点テーブル:

| 入力点                   | コンポーネント         | IPC チャンネル                      |
| ------------------------ | ---------------------- | ----------------------------------- |
| 実行直後の星レーティング | PostExecutionActionBar | `skill:submitUserRating`            |
| 実行直後のコメント       | PostExecutionActionBar | `skill:submitTextFeedback`          |
| スキル詳細からの評価     | SkillDetailPanel       | 同上                                |
| スキル詳細からの改善提案 | ImprovementDialog      | `skill:submitImprovementSuggestion` |
| 履歴画面からの評価       | HistorySearchView      | `skill:submitUserRating`            |
| 履歴画面からのテキスト   | HistorySearchView      | `skill:submitTextFeedback`          |

6入力点が定義されており、全て Renderer → Preload → Main の一方向フロー。

### 3.2 フィードバック→改善アクション→再評価の完結フロー

```
1. ユーザー入力 (Renderer)
     |  safeInvoke(IPC_CHANNELS.SKILL_SUBMIT_*)
     v
2. Main Process: IPCハンドラ
     |  SkillFeedback 記録 (SQLite)
     |  IPC通知: skill:lifecycle_event_emitted
     v
3. Renderer: feedbackSlice
     |  addFeedback() → evaluateFeedbackRules()
     |  → FeedbackAction[] 生成
     |  → calculateImprovementPriority() 実行
     v
4. UI 表示（改善アクション一覧・優先度表示）
     |  ユーザーが改善を実行
     v
5. skill:improved イベント発火
     |  parentEventId: skill:feedback_applied.id
     v
6. 再評価トリガー → skill:evaluated → skill:score_updated
     |  SkillAggregateView 更新
     v
7. 還流完了
```

**結果**: PASS -- フィードバック入力から改善アクション生成、改善適用、再評価までの完結フローが設計されている。

---

## 4. AC-2/AC-3 の検証データ存在確認

### 4.1 AC-2: フィードバックデータ定義

Phase 1 `acceptance-criteria-matrix.md` の AC-2 検証結果:

- 自動収集: 17項目定義済み
- 手動入力: 3種別定義済み
- 6型定義（AutoMetric, ScoreChangeMetric, UsageFrequencyAggregate, UserRating, UserTextFeedback, ImprovementSuggestion）
- 自動/手動境界マトリクス定義済み
- 集計仕様（日次/週次/月次）定義済み

**結果**: PASS -- AC-2 充足。

### 4.2 AC-3: Task05 再利用導線との連動

Phase 1 `acceptance-criteria-matrix.md` の AC-3 検証結果:

- 3UIコンポーネント（ScoreGateBadge, PostExecutionActionBar, SkillManagementPanel）連動定義済み
- 4契約型（ScoreHistoryForBadge, ExecutionHistoryForActionBar, RecentlyUsedSkillEntry, SkillHistoryQuery）定義済み
- データフロー図定義済み

**結果**: PASS -- AC-3 充足。

---

## 5. 追跡チェック

### 5.1 SkillFeedback.sourceEventId → SkillLifecycleEvent.id の参照設計

- `SkillFeedback.sourceEventId` は「フィードバックの発生元ライフサイクルイベントID」として定義（Phase 2 feedback-loop-design.md 2-2）
- `SkillLifecycleEvent.id` は UUID v4 で定義（Phase 1 lifecycle-event-catalog.md 1）
- 型が一致（both string UUID v4）し、参照関係が明確

**結果**: PASS

### 5.2 改善優先度計算入力パラメータの集約ビューからの取得可能性

`calculateImprovementPriority()` の入力 `SkillMetrics`:

| SkillMetrics フィールド | SkillAggregateView からの取得パス | 取得可能性 |
| ----------------------- | --------------------------------- | ---------- |
| successRate             | `aggregateView.successRate`       | PASS       |
| latestScore             | `aggregateView.latestScore`       | PASS       |
| averageUserRating       | feedbackSlice から集計            | PASS       |
| pendingFeedbackCount    | feedbackSlice から集計            | PASS       |
| totalExecutions         | `aggregateView.totalExecutions`   | PASS       |

**結果**: PASS -- SkillAggregateView + feedbackSlice から全パラメータが取得可能。

### 5.3 ステータス遷移（pending→applied/dismissed）の設計完結性

Phase 2 `feedback-loop-design.md` 3:

- 状態遷移図: pending → applied / dismissed の2方向のみ
- 許可/禁止マトリクス: applied/dismissed は終端状態（逆遷移禁止）
- `transitionFeedbackStatus()` 関数: 禁止遷移時は `InvalidFeedbackStatusTransitionError`（コード 2001）を throw
- 遷移時必須処理: `processedAt` に現在日時を自動設定
- Phase 5 `feedback-model-impl-spec.md` で同関数の実装仕様が定義済み

**結果**: PASS -- ステータス遷移の設計が完結している。

---

## 6. シナリオB 総合判定

| 検証項目                                            | 結果 |
| --------------------------------------------------- | ---- |
| Phase 1 自動/手動境界定義                           | PASS |
| Phase 2 SkillFeedback 型の網羅性                    | PASS |
| Phase 2 還流ルール（7ルール）の定義                 | PASS |
| Phase 2 フィードバック→改善アクションのフロー完結   | PASS |
| AC-2/AC-3 の検証データ存在                          | PASS |
| sourceEventId → SkillLifecycleEvent.id の参照設計   | PASS |
| 改善優先度計算の入力取得可能性                      | PASS |
| ステータス遷移（pending→applied/dismissed）の完結性 | PASS |

**シナリオB 判定: PASS**

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 11 シナリオB_
