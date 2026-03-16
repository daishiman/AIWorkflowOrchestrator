# Phase 10: 受入基準充足マトリクス

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 10                      |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| 作成日   | 2026-03-16              |
| 目的     | AC-1～AC-4 の充足検証   |

---

## 1. 受入基準充足マトリクス

| AC   | 基準                                           | 充足 | 根拠                                                                                                             |
| ---- | ---------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| AC-1 | 作成/評価/実行/改善/再利用の履歴イベントが定義 | 充足 | Phase 1: 5カテゴリ18イベント種別。Phase 2: SkillEventType Union(18種別)。Phase 5: EVENT_CATEGORY_MAP で網羅保証  |
| AC-2 | 再利用や推薦に使うフィードバックデータが定義   | 充足 | Phase 1: 自動3+手動3=6型。Phase 2: SkillFeedback エンベロープ型+7還流ルール。Phase 5: 全型実装仕様確定           |
| AC-3 | Task05 の再利用導線と連動                      | 充足 | Phase 1: 3UIコンポーネント契約。Phase 2: 集約ビュー+セレクタ。Phase 5: lifecycleHistorySlice で全データ供給経路  |
| AC-4 | Task08 の公開判断材料へ接続                    | 充足 | Phase 1: 6指標定義。Phase 2: PublishReadinessMetrics+2API。Phase 5: buildPublishReadinessMetrics+IPCハンドラ仕様 |

---

## 2. AC-1: 全5カテゴリ18イベント種別の網羅確認

### 2-1. Phase 1 要件 → Phase 2 設計 → Phase 5 実装の追跡

| カテゴリ    | Phase 1 イベント種別                                                                               | Phase 2 SkillEventType Union                                                                       | Phase 5 EVENT_CATEGORY_MAP | 充足 |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- | ---- |
| creation    | `skill:created`, `skill:draft_saved`, `skill:template_applied`                                     | `skill:created`, `skill:imported`, `skill:cloned`                                                  | 3種マッピング済み          | 充足 |
| execution   | `skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`, `skill:execution_timeout` | `skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`, `skill:execution_timeout` | 4種マッピング済み          | 充足 |
| evaluation  | `skill:evaluated`, `skill:score_updated`, `skill:gate_passed`, `skill:gate_failed`                 | `skill:evaluated`, `skill:score_updated`, `skill:reviewed`                                         | 3種マッピング済み          | 充足 |
| improvement | `skill:improved`, `skill:version_bumped`, `skill:feedback_applied`                                 | `skill:improved`, `skill:version_bumped`, `skill:deprecated`, `skill:archived`                     | 4種マッピング済み          | 充足 |
| reuse       | `skill:reused`, `skill:recommended`, `skill:imported`, `skill:forked`                              | `skill:reused`, `skill:shared`, `skill:exported`, `skill:template_created`                         | 4種マッピング済み          | 充足 |

**補足（意図的な変更）**:

Phase 1 から Phase 2/5 にかけてイベント名の精緻化が行われた。これは Phase 3 設計レビューを経て承認済みの設計変更である。

- creation: `skill:draft_saved` → `skill:imported`, `skill:template_applied` → `skill:cloned`（対称性向上）
- evaluation: `skill:gate_passed/failed` → `skill:reviewed`（ゲート判定をレビュー概念に昇格）
- improvement: `skill:feedback_applied` → `skill:deprecated`, `skill:archived` 追加（ライフサイクル終端イベント対応）
- reuse: `skill:recommended/forked` → `skill:shared`, `skill:exported`, `skill:template_created`（再利用経路の具体化）

**種別数**: 3 + 4 + 3 + 4 + 4 = **18種別**。Phase 1 要件の「5カテゴリ、全種別カバー」を充足。

### 2-2. 型安全性保証

- `EVENT_CATEGORY_MAP` は `Record<SkillEventType, EventCategory>` 型で定義（Phase 5 event-model-impl-spec.md）
- TypeScript の型レベルで18種別全てのマッピングが保証される（未定義の eventType は型エラー）
- SkillName は Branded Type + P42準拠3段バリデーション付きファクトリ（`toSkillName()`）で型安全を確保

---

## 3. AC-2: 自動/手動フィードバック4種別の定義確認

### 3-1. フィードバック種別の追跡

| 種別                     | Phase 1 定義 | Phase 2 SkillFeedback.feedbackType                      | Phase 5 実装仕様 | 充足 |
| ------------------------ | ------------ | ------------------------------------------------------- | ---------------- | ---- |
| 自動: 実行結果メトリクス | AutoMetric   | `auto_metric` (value: number)                           | createFeedback() | 充足 |
| 手動: ユーザー評価       | UserRating   | `user_rating` (value: number 1-5)                       | createFeedback() | 充足 |
| 手動: テキストFB         | UserTextFB   | `user_text` (value: string ≤500)                        | createFeedback() | 充足 |
| 手動: 改善提案           | ImprovementS | `improvement_suggestion` (value: ImprovementSuggestion) | createFeedback() | 充足 |

**合計**: 自動1種 + 手動3種 = **4種別**（Phase 1 では自動3種+手動3種=6型として定義されたが、Phase 2/5 で統合され4 feedbackType に集約）。

### 3-2. 還流ルールエンジン

| ルール                      | 発火条件                       | severity | Phase 5 仕様 |
| --------------------------- | ------------------------------ | -------- | ------------ |
| LOW_SUCCESS_RATE_CRITICAL   | successRate < 0.30             | critical | 定義済み     |
| LOW_SUCCESS_RATE_WARNING    | 0.30 <= successRate <= 0.50    | warning  | 定義済み     |
| LOW_USER_RATING             | averageUserRating < 3.0        | warning  | 定義済み     |
| LOW_USER_RATING_BORDERLINE  | 3.0 <= averageUserRating < 3.5 | info     | 定義済み     |
| TEXT_FEEDBACK_ACCUMULATED   | user_text pending >= 3         | info     | 定義済み     |
| HIGH_IMPROVEMENT_SUGGESTION | high priority pending >= 1     | warning  | 定義済み     |
| COMBINED_LOW_QUALITY        | successRate<=0.50 && score<50  | critical | 定義済み     |

**7ルール全て定義済み**。ステータス遷移（pending → applied / dismissed）も `transitionFeedbackStatus()` で完全定義。

---

## 4. AC-3: Task05 連携確認

### 4-1. UIコンポーネントへのデータ供給

| UIコンポーネント       | 必要データ                | 供給元（Phase 5）                                                                       | 供給可能性 |
| ---------------------- | ------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| ScoreGateBadge         | latestScore, scoreHistory | `SkillAggregateView.latestScore` (number\|null), `.scoreHistory` (ScoreDataPoint[])     | 供給可能   |
| PostExecutionActionBar | recentEvents, successRate | `SkillAggregateView.recentEvents` (最新10件), `.successRate`                            | 供給可能   |
| SkillManagementPanel   | 最近使ったスキルリスト    | `SkillAggregateView.lastExecutedAt` でソート可能、`useRecentLifecycleEvents()` セレクタ | 供給可能   |

### 4-2. セレクタ経路の確認

- **時間ベース成功率**: `useSuccessRateBySkill(skillId)` → `SkillAggregateView.successRate`（直近30日）
- **件数ベース成功率**: `useSuccessRateByCount(skillId, windowSize)` → INT-M-01 対応
- **スコア履歴**: `useSkillAggregateView(skillId).scoreHistory` → 最新200件
- **最近のイベント**: `useRecentLifecycleEvents(limit)` → 全スキル対象、最新N件
- **フィードバック入力 → 保存**: `useAddFeedback()` → `feedbackSlice.addFeedback()` → IPC → SQLite

---

## 5. AC-4: Task08 連携確認

### 5-1. PublishReadinessMetrics フィールド供給

| フィールド          | Phase 1 定義 | Phase 5 buildPublishReadinessMetrics      | 供給 |
| ------------------- | ------------ | ----------------------------------------- | ---- |
| qualityScore        | 定義済み     | 最新評価イベントのスコア（number\|null）  | 供給 |
| stabilityScore      | 定義済み     | 直近N件の件数ベース成功率（INT-M-01対応） | 供給 |
| stabilityWindowSize | 定義済み     | actualWindowSize（実績値）                | 供給 |
| usageCount          | 定義済み     | 全期間の skill:executed 件数              | 供給 |
| hasCriticalFeedback | 定義済み     | evaluateFeedbackRules() 経由で判定        | 供給 |
| lastEvaluatedAt     | 定義済み     | 最新評価イベントのtimestamp               | 供給 |
| calculatedAt        | 定義済み     | メトリクス計算日時                        | 供給 |

### 5-2. API 仕様確認

| API                       | チャンネル定数                | 引数               | 戻り値                  | P42 | 実装責務 |
| ------------------------- | ----------------------------- | ------------------ | ----------------------- | --- | -------- |
| getPublishReadiness       | SKILL_GET_PUBLISH_READINESS   | skillName          | PublishReadinessMetrics | 3段 | Task07   |
| getSkillHealthReport      | SKILL_GET_SKILL_HEALTH_REPORT | skillName          | SkillHealthReport       | 3段 | Task07   |
| calculatePublishReadiness | -                             | metrics+thresholds | ReadinessResult         | -   | Task08   |

**Task07→Task08 のデータフロー**: 1回の IPC 呼び出し (`getPublishReadiness`) で全データ取得可能。Task08 は `calculatePublishReadiness()` で ReadinessResult を算出する。

### 5-3. REQ-M-01 解決確認

`DEFAULT_PUBLISH_THRESHOLDS.minUsageCount` は Phase 2 値（5）で統一。Phase 5 `publish-metrics-api-impl-spec.md` で明示的に確定済み。

---

## 6. 検証サマリー

| AC   | 充足 | 根拠要約                                                                                           |
| ---- | ---- | -------------------------------------------------------------------------------------------------- |
| AC-1 | 充足 | 5カテゴリ18イベント種別が SkillEventType Union + EVENT_CATEGORY_MAP で型レベル網羅保証             |
| AC-2 | 充足 | 4 feedbackType + 7還流ルール + ステータス遷移（pending/applied/dismissed）が完全定義               |
| AC-3 | 充足 | ScoreGateBadge/PostExecutionActionBar/SkillManagementPanel への全データ供給経路がセレクタで提供    |
| AC-4 | 充足 | PublishReadinessMetrics 7フィールド + 2 IPC API + DEFAULT_PUBLISH_THRESHOLDS(minUsageCount=5) 提供 |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 10 成果物1_
