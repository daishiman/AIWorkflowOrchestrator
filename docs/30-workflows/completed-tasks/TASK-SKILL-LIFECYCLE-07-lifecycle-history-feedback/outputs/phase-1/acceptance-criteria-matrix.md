# Phase 1 タスク5: 受入基準検証マトリクス

## メタ情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | TASK-SKILL-LIFECYCLE-07        |
| Phase    | 1                              |
| タスク   | 5 - 受入基準検証マトリクス作成 |
| 作成日   | 2026-03-16                     |

---

## 受入基準検証マトリクス

| AC   | 基準                                                   | 検証方法                                                             | 検証データソース                                 | 充足状況 |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------ | -------- |
| AC-1 | 作成/評価/実行/改善の履歴イベントが定義されている      | lifecycle-event-catalog.md で全5カテゴリ・17イベント種別をカバー確認 | `outputs/phase-1/lifecycle-event-catalog.md`     | 充足     |
| AC-2 | 再利用や推薦に使うフィードバックデータが定義されている | feedback-collection-spec.md で自動/手動の分類表とデータスキーマ確認  | `outputs/phase-1/feedback-collection-spec.md`    | 充足     |
| AC-3 | Task05 の再利用導線と連動している                      | task05-integration-contract.md でデータフロー図と契約IF確認          | `outputs/phase-1/task05-integration-contract.md` | 充足     |
| AC-4 | Task08 の公開判断材料へ接続できる                      | task08-metrics-definition.md でメトリクスIFと責務分担確認            | `outputs/phase-1/task08-metrics-definition.md`   | 充足     |

---

## AC-1: 作成/評価/実行/改善の履歴イベント定義

### 検証結果

| カテゴリ    | イベント数 | イベント種別                                                                                       | カバー状況 |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------- | ---------- |
| creation    | 3          | `skill:created`, `skill:draft_saved`, `skill:template_applied`                                     | 完全       |
| evaluation  | 4          | `skill:evaluated`, `skill:score_updated`, `skill:gate_passed`, `skill:gate_failed`                 | 完全       |
| execution   | 4          | `skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`, `skill:execution_timeout` | 完全       |
| improvement | 3          | `skill:improved`, `skill:version_bumped`, `skill:feedback_applied`                                 | 完全       |
| reuse       | 4          | `skill:reused`, `skill:recommended`, `skill:imported`, `skill:forked`                              | 完全       |

**合計**: 5カテゴリ, 18イベント種別（仕様の17種別 + `skill:forked` を対称性確保のため追加定義）

### 検証データ

- 共通メタデータスキーマ: 10フィールド定義（id, skillId, skillVersion, eventType, category, timestamp, userId, source, parentEventId, metadata）
- カテゴリ別metadata: 全5カテゴリで固有metadataスキーマが定義済み
- 因果関係ルール: 5パターン定義（実行シーケンス, 評価→ゲート, フィードバック→改善, テンプレート起源, 推薦→再利用）
- 永続化方針: Zustand persist（最新50件キャッシュ）+ SQLite（全履歴）の二段階構造

---

## AC-2: フィードバックデータ定義

### 検証結果

| フィードバック種別     | 収集方式 | データスキーマ          | 定義状況 |
| ---------------------- | -------- | ----------------------- | -------- |
| 実行結果メトリクス     | 自動     | AutoMetric              | 定義済み |
| スコア変化メトリクス   | 自動     | ScoreChangeMetric       | 定義済み |
| 利用頻度集計           | 自動     | UsageFrequencyAggregate | 定義済み |
| ユーザー評価           | 手動     | UserRating              | 定義済み |
| テキストフィードバック | 手動     | UserTextFeedback        | 定義済み |
| 改善提案               | 手動     | ImprovementSuggestion   | 定義済み |

### 検証データ

- 自動収集: 17項目（実行結果9項目 + スコア変化6項目 + 利用頻度2項目）
- 手動入力: 3種別（レーティング, テキスト, 改善提案）
- 自動/手動の境界: Main Process（客観観測） vs Renderer→IPC→Main（主観評価）
- 集計仕様: 日次（90日保持）/ 週次（52週）/ 月次（24ヶ月）
- バリデーション: P42準拠3段バリデーション定義済み

---

## AC-3: Task05 再利用導線との連動

### 検証結果

| UIコンポーネント       | 必要データ             | データソース                 | 連動状況     |
| ---------------------- | ---------------------- | ---------------------------- | ------------ |
| ScoreGateBadge         | スコア履歴             | ScoreHistoryForBadge         | 連動定義済み |
| PostExecutionActionBar | 実行履歴・成功率       | ExecutionHistoryForActionBar | 連動定義済み |
| SkillManagementPanel   | 最近使ったスキルリスト | RecentlyUsedSkillEntry[]     | 連動定義済み |

### 検証データ

- 「最近使ったスキル」リスト: 表示10件, lastUsedAt降順, 削除済み除外
- スコア推移グラフ: ScoreDataPoint型定義, 直近30件上限, ゲートしきい値線
- データフロー図: イベント発生源→集計層→UIコンポーネントの経路定義
- 契約インターフェース: 4型定義（ScoreHistoryForBadge, ExecutionHistoryForActionBar, RecentlyUsedSkillEntry, SkillHistoryQuery）
- Task05既存Propsとの整合性チェックリスト定義済み

---

## AC-4: Task08 公開判断材料への接続

### 検証結果

| メトリクス指標      | 定義状況 | データソース                              | Task08契約 |
| ------------------- | -------- | ----------------------------------------- | ---------- |
| qualityScore        | 定義済み | 最新evaluationイベントのscore             | 提供       |
| stabilityScore      | 定義済み | execution成功率（直近N回）                | 提供       |
| usageCount          | 定義済み | executionカテゴリ総イベント数             | 提供       |
| hasCriticalFeedback | 定義済み | SkillFeedback severity='critical'チェック | 提供       |
| lastEvaluatedAt     | 定義済み | 最新evaluationイベントのtimestamp         | 提供       |
| stabilityWindowSize | 定義済み | 安定性計算のウィンドウサイズ              | 提供       |

### 検証データ

- TypeScript型: PublishReadinessMetrics, PublishThresholds, ReadinessLevel, ReadinessResult, SkillHealthReport（6型）
- デフォルト閾値: qualityScore=70, stabilityScore=0.8, usageCount=3
- readinessLevel判定: 5ステップフロー（not_ready / review_needed / ready）
- 責務分担: 12項目で Task07（データ提供）vs Task08（判断ロジック）を明確化
- API仕様: getPublishReadiness, getSkillHealthReport の2エンドポイント

---

## 検証サマリー

| AC   | 充足状況 | 根拠                                                            |
| ---- | -------- | --------------------------------------------------------------- |
| AC-1 | 充足     | 5カテゴリ18イベント定義、メタデータ・因果関係・永続化方針を網羅 |
| AC-2 | 充足     | 自動17項目+手動3種別、6型定義、境界マトリクスと集計仕様を網羅   |
| AC-3 | 充足     | 3UIコンポーネント連動、4契約型、データフロー図とチェックリスト  |
| AC-4 | 充足     | 6指標6型、閾値・判定フロー・責務分担・2API仕様を網羅            |

**Phase 1 完了判定**: 全4受入基準が充足。Phase 2（設計）への進行が可能。

---

## 完了条件チェックリスト

- [x] ライフサイクルイベント一覧が全5カテゴリ（作成/評価/実行/改善/再利用）をカバーしている
- [x] 各イベントの記録データ（メタデータ）が定義されている
- [x] 自動収集と手動フィードバックの境界が明確に定義されている
- [x] Task05 の CTA 制御マトリクスに必要な履歴データが特定されている
- [x] Task08 の公開判断に必要な最小指標セットが定義されている
- [x] 受入基準 AC-1〜AC-4 の検証方法が定義されている
- [x] 全成果物が `outputs/phase-1/` に生成されている
