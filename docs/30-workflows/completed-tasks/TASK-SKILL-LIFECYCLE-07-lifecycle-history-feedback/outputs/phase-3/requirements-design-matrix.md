# 要件-設計整合性マトリクス

## メタ情報

| 項目         | 内容                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase        | 3                                                                                                                                                  |
| タスクID     | TASK-SKILL-LIFECYCLE-07                                                                                                                            |
| 作成日       | 2026-03-16                                                                                                                                         |
| 出力パス     | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-3/requirements-design-matrix.md` |
| レビュー対象 | Phase 1 成果物 5件 / Phase 2 成果物 5件                                                                                                            |

---

## 1. AC別 設計カバレッジ概要

| AC   | 受入基準                                               | 対応Phase 2 成果物                            | カバー状況 | カバー率 |
| ---- | ------------------------------------------------------ | --------------------------------------------- | ---------- | -------- |
| AC-1 | 作成/評価/実行/改善の履歴イベントが定義されている      | event-model-design.md                         | 完全       | 100%     |
| AC-2 | 再利用や推薦に使うフィードバックデータが定義されている | feedback-loop-design.md                       | 完全       | 100%     |
| AC-3 | Task05 の再利用導線と連動している                      | data-flow-design.md, aggregate-view-design.md | 完全       | 100%     |
| AC-4 | Task08 の公開判断材料へ接続できる                      | publish-metrics-interface-design.md           | 完全       | 100%     |

**総合カバー率: 100%（4/4 AC 充足）**

---

## 2. AC-1: イベント定義の設計カバレッジ

### 2-1. Phase 1 イベント一覧（18種別）と Phase 2 SkillEventType Union型の対応

Phase 1 `lifecycle-event-catalog.md` に定義された全18イベント種別が、Phase 2 `event-model-design.md` の `SkillEventType` Union型でカバーされているか確認する。

| #   | Phase 1 イベント名          | カテゴリ    | Phase 2 Union型での定義       | 対応状況 |
| --- | --------------------------- | ----------- | ----------------------------- | -------- |
| 1   | `skill:created`             | creation    | `CreationEventType` に含む    | 対応済   |
| 2   | `skill:draft_saved`         | creation    | `CreationEventType` に含む    | 対応済   |
| 3   | `skill:template_applied`    | creation    | `CreationEventType` に含む    | 対応済   |
| 4   | `skill:evaluated`           | evaluation  | `EvaluationEventType` に含む  | 対応済   |
| 5   | `skill:score_updated`       | evaluation  | `EvaluationEventType` に含む  | 対応済   |
| 6   | `skill:gate_passed`         | evaluation  | `EvaluationEventType` に含む  | 対応済   |
| 7   | `skill:gate_failed`         | evaluation  | `EvaluationEventType` に含む  | 対応済   |
| 8   | `skill:executed`            | execution   | `ExecutionEventType` に含む   | 対応済   |
| 9   | `skill:execution_succeeded` | execution   | `ExecutionEventType` に含む   | 対応済   |
| 10  | `skill:execution_failed`    | execution   | `ExecutionEventType` に含む   | 対応済   |
| 11  | `skill:execution_timeout`   | execution   | `ExecutionEventType` に含む   | 対応済   |
| 12  | `skill:improved`            | improvement | `ImprovementEventType` に含む | 対応済   |
| 13  | `skill:version_bumped`      | improvement | `ImprovementEventType` に含む | 対応済   |
| 14  | `skill:feedback_applied`    | improvement | `ImprovementEventType` に含む | 対応済   |
| 15  | `skill:reused`              | reuse       | `ReuseEventType` に含む       | 対応済   |
| 16  | `skill:recommended`         | reuse       | `ReuseEventType` に含む       | 対応済   |
| 17  | `skill:imported`            | reuse       | `ReuseEventType` に含む       | 対応済   |
| 18  | `skill:forked`              | reuse       | `ReuseEventType` に含む       | 対応済   |

**イベント種別カバー率: 18/18 = 100%（漏れなし）**

### 2-2. カテゴリ別カバー確認

| カテゴリ    | Phase 1 定義数 | Phase 2 Union型定義数       | 差分  |
| ----------- | -------------- | --------------------------- | ----- |
| creation    | 3              | 3（`CreationEventType`）    | 0     |
| evaluation  | 4              | 4（`EvaluationEventType`）  | 0     |
| execution   | 4              | 4（`ExecutionEventType`）   | 0     |
| improvement | 3              | 3（`ImprovementEventType`） | 0     |
| reuse       | 4              | 4（`ReuseEventType`）       | 0     |
| **合計**    | **18**         | **18**                      | **0** |

**判定: 対応漏れなし**

### 2-3. 共通メタデータスキーマの整合性

Phase 1 `SkillLifecycleEventBase`（10フィールド）と Phase 2 `SkillLifecycleEvent` の整合確認。

| フィールド      | Phase 1 定義            | Phase 2 設計                  | 整合状況        |
| --------------- | ----------------------- | ----------------------------- | --------------- |
| `id`            | string (UUID v4)        | string (UUID v4)              | 一致            |
| `skillId`       | string (UUID v4)        | string（SkillName Branded型） | 設計変更（注1） |
| `skillVersion`  | string (semver)         | string (semver)               | 一致            |
| `eventType`     | string (列挙値)         | `SkillEventType` Union型      | 強化済          |
| `category`      | EventCategory           | EventCategory                 | 一致            |
| `timestamp`     | string (ISO 8601)       | string (ISO 8601)             | 一致            |
| `userId`        | string \| null          | string \| null                | 一致            |
| `source`        | EventSource             | EventSource                   | 一致            |
| `parentEventId` | string \| null          | string \| null                | 一致            |
| `metadata`      | Record<string, unknown> | カテゴリ別専用型に強化        | 強化済          |

**注1**: Phase 2 では `skillId` が Phase 1 の UUID v4 形式から `SkillName`（Branded型、ファイルシステム名形式）に変更された。これは実装上の設計判断であり、要件上の整合は保たれているが、識別子形式の変更として記録する。

---

## 3. AC-2: フィードバックデータの設計カバレッジ

### 3-1. Phase 1 フィードバック型 → Phase 2 設計の対応

| Phase 1 定義型            | Phase 2 設計での扱い                                                | カバー状況 |
| ------------------------- | ------------------------------------------------------------------- | ---------- |
| `AutoMetric`              | `SkillFeedback`（feedbackType: "auto_metric"）として統合            | 統合済     |
| `ScoreChangeMetric`       | `SkillAggregateView.scoreHistory` 計算データとして設計              | 対応済     |
| `UsageFrequencyAggregate` | SQLite `usage_frequency_aggregates` テーブル + 日次バッチ集計       | 対応済     |
| `UserRating`              | `SkillFeedback`（feedbackType: "user_rating"）として統合            | 統合済     |
| `UserTextFeedback`        | `SkillFeedback`（feedbackType: "user_text"）として統合              | 統合済     |
| `ImprovementSuggestion`   | `SkillFeedback`（feedbackType: "improvement_suggestion"）として統合 | 統合済     |

**設計の合理化**: Phase 2 `feedback-loop-design.md` では、Phase 1 の6型を `SkillFeedback` 単一エンベロープ型に統合した。これは型数削減による保守性向上の設計判断として妥当。

### 3-2. フィードバックスキーマの完全性確認

| 要件項目                                    | Phase 2 設計での担保                                     | 充足 |
| ------------------------------------------- | -------------------------------------------------------- | ---- |
| 自動収集と手動入力の境界定義                | `feedbackType` 列挙値で明確に分離                        | 充足 |
| ステータス管理（pending/applied/dismissed） | `SkillFeedback.status` + `transitionFeedbackStatus()`    | 充足 |
| フィードバック還流ルール（7ルール）         | `evaluateFeedbackRules()` で全7ルール定義済み            | 充足 |
| 改善優先度計算（0.0-1.0スコア）             | `calculateImprovementPriority()` で算出                  | 充足 |
| SQLite 永続化スキーマ                       | `skill_feedback` テーブル定義（data-flow-design.md）     | 充足 |
| P31/P48 Zustand 対策セレクタ                | `feedbackSlice.selectors.ts` で個別セレクタ + useShallow | 充足 |

---

## 4. AC-3: Task05 連携の設計カバレッジ

### 4-1. Task05 コンポーネント別データ供給の確認

| Task05 コンポーネント  | 必要データ                                      | Phase 2 でのデータソース定義                                                                     | カバー状況 |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| ScoreGateBadge         | latestScore, latestGate, scoreHistory           | `SkillAggregateView.latestScore` + `scoreHistory` 計算ロジック（aggregate-view-design.md §3-4）  | 完全       |
| PostExecutionActionBar | lastExecutionStatus, successRate, scoreDelta    | `SkillAggregateView.successRate` + `SkillAggregateView.lastExecutedAt`（data-flow-design.md §5） | 完全       |
| SkillManagementPanel   | lastUsedAt, skillName, successRate, latestScore | `useRecentlyUsedSkillsAggregates()`（lifecycleHistorySlice のセレクタ）                          | 完全       |

### 4-2. データフロー経路の確認

Phase 2 `data-flow-design.md` §3（統合データフロー図）に示された経路が、Phase 1 `task05-integration-contract.md` §4（データフロー図）と整合するか確認。

| 経路                                                      | Phase 1 要件                       | Phase 2 設計                                         | 整合状況 |
| --------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- | -------- |
| skill:evaluated → ScoreGateBadge                          | ScoreDataPoint 生成経由            | buildAggregateView の scoreHistory 計算経由          | 整合     |
| skill:executed → SkillManagementPanel                     | recentlyUsedSkills 更新経由        | addLifecycleEvent → updateAggregateView 経由         | 整合     |
| skill:execution_succeeded/failed → PostExecutionActionBar | ExecutionSuccessRate 集計経由      | calculateSuccessRate() 経由                          | 整合     |
| IPC 契約型（ScoreHistoryForBadge 等）                     | 4型定義（ScoreHistoryForBadge 等） | SkillAggregateView からのプロジェクション + セレクタ | 整合     |

**注**: Phase 2 では Phase 1 の `ScoreHistoryForBadge` / `ExecutionHistoryForActionBar` / `RecentlyUsedSkillEntry` 各型が `SkillAggregateView` に統合されている。Task05 との契約IFは `packages/shared/src/types/skill-lifecycle-history.ts` で Phase 5 実装時に確定する旨が設計書に明記されており、要件整合は保たれている。

---

## 5. AC-4: Task08 連携の設計カバレッジ

### 5-1. PublishReadinessMetrics フィールドの整合確認

| Phase 1 指標名        | Phase 1 計算方法                       | Phase 2 設計での対応                                                                | 整合状況 |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| `qualityScore`        | 最新 skill:evaluated のスコア          | `getPublishReadiness()` 処理手順 Step 2（publish-metrics-interface-design.md §3.2） | 整合     |
| `stabilityScore`      | 直近N回の execution 成功率             | 処理手順 Step 3（stabilityWindowSize 件の成功率算出）                               | 整合     |
| `usageCount`          | skill:executed 総件数                  | 処理手順 Step 4（実行イベント総数カウント）                                         | 整合     |
| `hasCriticalFeedback` | SkillFeedback severity='critical' 有無 | 処理手順 Step 5（SkillFeedback ストア照会）                                         | 整合     |
| `lastEvaluatedAt`     | 最新評価イベントの timestamp           | 処理手順 Step 2（評価イベントから抽出）                                             | 整合     |
| `stabilityWindowSize` | 安定性計算に使用した実績件数           | `PublishReadinessMetrics.stabilityWindowSize` フィールド                            | 整合     |

### 5-2. デフォルト閾値の整合確認

| 指標                  | Phase 1 デフォルト閾値 | Phase 2 `DEFAULT_PUBLISH_THRESHOLDS` | 差分・判定          |
| --------------------- | ---------------------- | ------------------------------------ | ------------------- |
| `minQualityScore`     | 70                     | 70                                   | 一致                |
| `minStabilityScore`   | 0.8                    | 0.8                                  | 一致                |
| `stabilityWindowSize` | 10                     | 10                                   | 一致                |
| `minUsageCount`       | **3**                  | **5**                                | **差分あり（注2）** |

**注2**: `minUsageCount` が Phase 1（3）から Phase 2（5）に変更されている。Phase 2 では「ゼロ実行スキルの公開防止のため最低3回」から「より信頼性の高い判断のため最低5回」に引き上げた。要件への適合性は保たれているが、Phase 1 要件定義との差分として記録する（MINOR 指摘対象）。

### 5-3. IPC 契約の整合確認

| Phase 1 IPC 仕様                        | Phase 2 設計対応                              | 整合状況 |
| --------------------------------------- | --------------------------------------------- | -------- |
| `skill:getPublishReadiness` チャンネル  | Phase 2 で同一名で定義・P42バリデーション実装 | 整合     |
| `skill:getSkillHealthReport` チャンネル | Phase 2 で同一名で定義・P42バリデーション実装 | 整合     |
| 引数: `skillName: string`               | IPC_CHANNELS 定数管理 + P42 3段バリデーション | 強化済   |
| 責務境界（Task07 提供 / Task08 判定）   | Phase 2 §4（契約境界の定義）で明示            | 整合     |

---

## 6. 整合性サマリー

### 6-1. カバレッジ総括

| AC   | 充足状況 | 設計カバー率 | 特記事項                                                       |
| ---- | -------- | ------------ | -------------------------------------------------------------- |
| AC-1 | 充足     | 100%         | 18/18 イベント種別 Union型定義済み。skillId 識別子形式変更あり |
| AC-2 | 充足     | 100%         | 6型 → SkillFeedback 統合で合理化。ルールエンジン7種定義済み    |
| AC-3 | 充足     | 100%         | 3コンポーネント全対応。IFは SkillAggregateView に統合済み      |
| AC-4 | 充足     | 100%         | 6指標全対応。minUsageCount に Phase 1→2 間差分あり（MINOR）    |

### 6-2. Phase 1→2 間の設計変更点（要追跡）

| 変更点                                   | 変更理由                                   | 影響評価                  |
| ---------------------------------------- | ------------------------------------------ | ------------------------- |
| `skillId` 型: UUID v4 → SkillName        | ファイルシステム名との一致による実装一貫性 | LOW（要件整合は保持）     |
| フィードバック型の統合（6型→1型）        | 保守性向上、エンベロープパターン採用       | LOW（設計上の合理化）     |
| `minUsageCount`: 3 → 5                   | 公開判断の信頼性向上                       | MINOR（閾値変更・要確認） |
| IPC命名: `skill:lifecycle_event_emitted` | data-flow-design.md での命名統一           | LOW（同一意味、命名差異） |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 3_
