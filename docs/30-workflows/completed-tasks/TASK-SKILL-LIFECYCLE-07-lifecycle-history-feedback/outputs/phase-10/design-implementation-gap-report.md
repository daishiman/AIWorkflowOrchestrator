# Phase 10: 設計-実装差分分析レポート

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| Phase    | 10                                     |
| タスクID | TASK-SKILL-LIFECYCLE-07                |
| 作成日   | 2026-03-16                             |
| 目的     | Phase 2 設計 vs Phase 5 実装の差分分析 |

---

## 1. 差分分析総括

| 分類           | 件数 | 詳細                                                     |
| -------------- | ---- | -------------------------------------------------------- |
| 意図的変更     | 4件  | Phase 3 MINOR 4件の解消に伴う設計変更                    |
| 意図しない乖離 | 0件  | Phase 5 は Phase 2 設計を忠実に反映している              |
| 設計の拡張     | 3件  | Phase 2 を超えた追加仕様（Phase 5 で品質向上のため追加） |

---

## 2. SkillLifecycleEvent 型のフィールド差分

### 2-1. フィールド一致確認

| フィールド    | Phase 2 event-model-design.md | Phase 5 event-model-impl-spec.md                | 一致 | 備考                     |
| ------------- | ----------------------------- | ----------------------------------------------- | ---- | ------------------------ |
| id            | string (UUID v4)              | string (UUID v4)                                | 一致 | createLifecycleEvent自動 |
| skillId       | SkillName (Branded Type)      | SkillName (Branded Type)                        | 一致 | toSkillName() 経由       |
| eventType     | SkillEventType (18種)         | SkillEventType (18種)                           | 一致 | Union型                  |
| category      | EventCategory (5種)           | EventCategory (5種)                             | 一致 | MAP自動導出              |
| source        | EventSource (3種)             | EventSource (3種)                               | 一致 | system/user/api          |
| timestamp     | string (ISO 8601 UTC)         | string (ISO 8601 UTC)                           | 一致 | 自動生成可               |
| skillVersion  | string (semver)               | string (semver)                                 | 一致 | P42バリデーション追加    |
| parentEventId | string \| null                | string \| null                                  | 一致 | デフォルトnull           |
| metadata      | LifecycleEventMetadata        | LifecycleEventMetadata \| Record<string, never> | 拡張 | 空メタデータ対応追加     |

### 2-2. イベント名の変更（Phase 1 → Phase 2/5）

Phase 2 設計段階でイベント名が精緻化された。Phase 5 は Phase 2 の名称をそのまま実装している。

| Phase 1 名称             | Phase 2/5 名称           | 変更理由                          |
| ------------------------ | ------------------------ | --------------------------------- |
| `skill:draft_saved`      | `skill:imported`         | インポート操作に特化              |
| `skill:template_applied` | `skill:cloned`           | クローン操作への名称統一          |
| `skill:gate_passed`      | `skill:reviewed`         | レビュー概念に昇格（ゲート+人間） |
| `skill:gate_failed`      | （削除）                 | skill:reviewed に統合             |
| `skill:feedback_applied` | `skill:deprecated`       | ライフサイクル終端イベントに変更  |
| -                        | `skill:archived`         | 新規追加（ライフサイクル完了）    |
| `skill:recommended`      | `skill:shared`           | 共有操作に特化                    |
| `skill:forked`           | `skill:exported`         | エクスポート操作に特化            |
| -                        | `skill:template_created` | 新規追加（テンプレート化）        |

**判定**: Phase 3 設計レビューで承認済みの意図的変更。不整合ではない。

---

## 3. SkillAggregateView 型の差分

### 3-1. latestScore 型変更（INT-M-02 解消）

| 項目                              | Phase 2 aggregate-view-design.md | Phase 5 aggregate-logic-impl-spec.md | 変更種別       |
| --------------------------------- | -------------------------------- | ------------------------------------ | -------------- |
| `SkillAggregateView.latestScore`  | `number`（0=未評価）             | `number \| null`（null=未評価）      | **意図的変更** |
| buildAggregateView の評価なし時   | `latestScore = 0`                | `latestScore = null`                 | **意図的変更** |
| calculateRecommendationScore 引数 | `latestScore: number`            | `latestScore: number \| null`        | **意図的変更** |

**変更根拠**: Phase 3 MINOR INT-M-02 の解決。Phase 1 契約（`number | null`）を正とし、「未評価」と「スコア0」を区別する。Phase 5 実装仕様で明示的に文書化済み。

**UI表示への影響**: `latestScore === null` は「未評価」、`latestScore === 0` は「スコア: 0」として表示する。null ガードが必要。

### 3-2. 他フィールドの一致確認

| フィールド          | Phase 2               | Phase 5               | 一致 |
| ------------------- | --------------------- | --------------------- | ---- |
| skillId             | string                | string                | 一致 |
| skillName           | string                | string                | 一致 |
| totalExecutions     | number                | number                | 一致 |
| successRate         | number (0.0-1.0)      | number (0.0-1.0)      | 一致 |
| lastExecutedAt      | string \| null        | string \| null        | 一致 |
| scoreHistory        | ScoreDataPoint[]      | ScoreDataPoint[]      | 一致 |
| recentEvents        | SkillLifecycleEvent[] | SkillLifecycleEvent[] | 一致 |
| trend               | Trend                 | Trend                 | 一致 |
| recommendationScore | number (0.0-1.0)      | number (0.0-1.0)      | 一致 |
| aggregatedAt        | string (ISO 8601)     | string (ISO 8601)     | 一致 |

---

## 4. SkillFeedback 型の差分

### 4-1. 型定義一致確認

| フィールド    | Phase 2 feedback-loop-design.md           | Phase 5 feedback-model-impl-spec.md       | 一致 |
| ------------- | ----------------------------------------- | ----------------------------------------- | ---- |
| id            | string (UUID v4)                          | string (UUID v4)                          | 一致 |
| skillId       | string                                    | string                                    | 一致 |
| feedbackType  | 4種別 Union                               | 4種別 Union                               | 一致 |
| value         | number \| string \| ImprovementSuggestion | number \| string \| ImprovementSuggestion | 一致 |
| sourceEventId | string                                    | string                                    | 一致 |
| createdAt     | string (ISO 8601)                         | string (ISO 8601)                         | 一致 |
| processedAt   | string \| undefined                       | string \| undefined                       | 一致 |
| status        | "pending" \| "applied" \| "dismissed"     | "pending" \| "applied" \| "dismissed"     | 一致 |

### 4-2. ステータス遷移ルール一致確認

| 遷移              | Phase 2 許可/禁止 | Phase 5 許可/禁止 | 一致 |
| ----------------- | ----------------- | ----------------- | ---- |
| pending→applied   | 許可              | 許可              | 一致 |
| pending→dismissed | 許可              | 許可              | 一致 |
| applied→任意      | 禁止              | 禁止              | 一致 |
| dismissed→任意    | 禁止              | 禁止              | 一致 |

**エラーコード**: 禁止遷移時 `errorCode: 2001`（Business Error 範囲）-- Phase 2/5 で一致。

---

## 5. PublishReadinessMetrics 型の差分

### 5-1. minUsageCount 変更（REQ-M-01 解消）

| 項目                                     | Phase 1 定義 | Phase 2 設計 | Phase 5 確定値 | 変更種別       |
| ---------------------------------------- | :----------: | :----------: | :------------: | -------------- |
| DEFAULT_PUBLISH_THRESHOLDS.minUsageCount |      3       |      5       |     **5**      | **意図的変更** |
| minQualityScore                          |      70      |      70      |       70       | 一致           |
| minStabilityScore                        |     0.8      |     0.8      |      0.8       | 一致           |
| stabilityWindowSize                      |      -       |      10      |       10       | 一致           |

**変更根拠**: Phase 3 MINOR REQ-M-01 の解決。統計的信頼性の観点から5回以上の実行で安定性を評価すべきとの判断。Phase 5 で明示的に確定。

### 5-2. qualityScore / stabilityScore の null 対応

| フィールド          | Phase 2 設計     | Phase 5 確定     | 一致 |
| ------------------- | ---------------- | ---------------- | ---- |
| qualityScore        | `number \| null` | `number \| null` | 一致 |
| stabilityScore      | `number \| null` | `number \| null` | 一致 |
| usageCount          | number           | number           | 一致 |
| hasCriticalFeedback | boolean          | boolean          | 一致 |
| lastEvaluatedAt     | `string \| null` | `string \| null` | 一致 |
| calculatedAt        | string           | string           | 一致 |

---

## 6. 集約ロジックの差分

### 6-1. 成功率計算（INT-M-01 解消）

| 項目                  | Phase 2 設計                | Phase 5 確定                                  | 変更種別       |
| --------------------- | --------------------------- | --------------------------------------------- | -------------- |
| buildAggregateView 用 | periodDays=30（時間ベース） | periodDays=30（時間ベース）-- 変更なし        | 一致           |
| PublishReadiness 用   | 時間ベース（30日）のみ      | 件数ベース（直近N件）を追加サポート           | **意図的変更** |
| セレクタ              | 1種のみ                     | useSuccessRateBySkill + useSuccessRateByCount | **設計拡張**   |

**変更根拠**: Phase 3 MINOR INT-M-01 の解決。Task05（UI表示）は時間ベース、Task08（公開判断）は件数ベースの両方を必要とするため、`calculateSuccessRate()` に `periodDays` 引数を追加して両方をサポート。

### 6-2. トレンド計算

| 項目                   | Phase 2 設計 | Phase 5 確定 | 一致 |
| ---------------------- | ------------ | ------------ | ---- |
| windowSize デフォルト  | 5            | 5            | 一致 |
| 傾き閾値               | ±0.5         | ±0.5         | 一致 |
| データ不足時デフォルト | "stable"     | "stable"     | 一致 |
| 線形回帰アルゴリズム   | 最小二乗法   | 最小二乗法   | 一致 |

### 6-3. 推薦スコア計算

| 項目                  | Phase 2 設計 | Phase 5 確定          | 差分         |
| --------------------- | ------------ | --------------------- | ------------ |
| 重み: successRate     | 0.4          | 0.4                   | 一致         |
| 重み: normalizedScore | 0.4          | 0.4                   | 一致         |
| 重み: recency         | 0.2          | 0.2                   | 一致         |
| latestScore null時    | （未定義）   | null → 0 として正規化 | **設計拡張** |
| recency 減衰期間      | 90日         | 90日                  | 一致         |
| clamp                 | 0.0-1.0      | 0.0-1.0               | 一致         |

---

## 7. persist 設定の差分（TECH-M-01 解消）

| フィールド      | Phase 2 data-flow-design.md | Phase 2 aggregate-view-design.md | Phase 5 確定 | 変更種別       |
| --------------- | --------------------------- | -------------------------------- | ------------ | -------------- |
| aggregateViews  | persist 対象                | persist 対象外                   | **対象外**   | **意図的変更** |
| events          | -                           | -                                | 対象外       | SQLite正本     |
| lastSyncedAt    | -                           | -                                | 対象         | 設計拡張       |
| isLoading/error | -                           | -                                | 対象外       | 揮発性フラグ   |

**変更根拠**: Phase 3 MINOR TECH-M-01 の解決。`aggregate-view-design.md` の「派生データは persist 不要」方針を採用し、`partialize` から除外。起動時は SQLite スナップショットから再構築する。

---

## 8. 設計拡張（Phase 5 で追加された仕様）

Phase 2 には明示されていなかったが、Phase 5 で品質向上のために追加された仕様。

| #   | 追加仕様                                           | 理由                                                                     | 影響範囲                        |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| 1   | metadata フィールドに `Record<string, never>` 許容 | メタデータなしイベントの型安全な表現                                     | event-model-impl-spec.md        |
| 2   | scoreHistory の200件上限                           | UI折れ線グラフのパフォーマンス考慮（Phase 2 で言及あり、Phase 5 で確定） | aggregate-logic-impl-spec.md    |
| 3   | events 配列の1000件上限                            | Zustand Store のメモリ管理                                               | lifecycle-history-slice-spec.md |

---

## 9. 差分分析サマリー

### 9-1. 意図的変更（Phase 3 MINOR 解消）

| MINOR ID  | 変更内容                                 | Phase 5 での解決方法                  | 検証結果 |
| --------- | ---------------------------------------- | ------------------------------------- | -------- |
| TECH-M-01 | aggregateViews の persist 設定矛盾       | partialize から除外（派生データ方針） | 解決済み |
| REQ-M-01  | minUsageCount: Phase 1(3) vs Phase 2(5)  | Phase 2 値（5）で統一                 | 解決済み |
| INT-M-01  | successRate 集計ウィンドウ差異           | periodDays 引数で両方サポート         | 解決済み |
| INT-M-02  | latestScore 型: number vs number \| null | Phase 1 契約（number \| null）を採用  | 解決済み |

### 9-2. 意図しない乖離

**検出件数: 0件**

Phase 5 実装仕様は Phase 2 設計を忠実に反映しており、Phase 3 MINOR 4件の解消以外に意図しない乖離は存在しない。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 10 成果物2_
