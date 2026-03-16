# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装                                   |
| 前提Phase  | Phase 4（テスト作成）                  |
| 後続Phase  | Phase 6（テスト拡充）                  |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計                                   |

---

## 目的

Phase 2 の設計と Phase 4 のテスト仕様に基づき、ライフサイクル履歴モデル・集約ビュー・フィードバック記録・公開メトリクスの実装仕様書を作成する。本タスクは設計タスクであるため、`.claude` 配下の正本仕様書への設計反映と、実装ガイドとなる仕様書の作成が中心となる。TDD の Green フェーズとして、Phase 4 のテスト仕様が全て通過する設計を提供する。

## 背景

本タスクの成果物は実行可能なコードではなく、将来の実装タスクが参照する仕様書群である。Phase 2 で確定した型定義（`SkillLifecycleEvent`, `SkillAggregateView`, `SkillFeedback`, `PublishReadinessMetrics`）を `.claude` 正本仕様書に反映し、Zustand Store スライス設計、集約計算ロジック仕様、IPC ハンドラ仕様を詳細化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillLifecycleEvent 型定義の実装仕様作成

**目的**: Phase 2 で設計した `SkillLifecycleEvent` 型とその関連型を、正本仕様書に反映可能な精度で仕様化する。

**実行手順**:

1. 型定義の詳細仕様を作成する:
   - `SkillLifecycleEvent` の全フィールド型・制約・デフォルト値
   - `SkillEventType` ユニオン型の全メンバー定義（17イベント種別）
   - `EventCategory` ユニオン型（`'creation' | 'evaluation' | 'execution' | 'improvement' | 'reuse'`）
   - `EventSource` ユニオン型（`'main' | 'renderer' | 'cli'`）
2. カテゴリ別 metadata スキーマを仕様化する:
   - creation: `{ templateId?: string, draftId?: string }`
   - evaluation: `{ score: number, previousScore?: number, gateResult?: 'passed' | 'failed' }`
   - execution: `{ duration: number, exitCode?: number, errorMessage?: string }`
   - improvement: `{ changeDescription: string, versionBefore: string, versionAfter: string }`
   - reuse: `{ sourceSkillId?: string, recommendation?: boolean }`
3. イベント生成ファクトリ関数の仕様を作成する:
   - `createLifecycleEvent(params: CreateEventParams): SkillLifecycleEvent`
   - UUID v4 自動生成、ISO 8601 タイムスタンプ自動設定
   - P42 準拠の入力バリデーション仕様
4. 配置先を決定する:
   - 共有型: `packages/shared/src/skill/lifecycle-types.ts`
   - ファクトリ: `packages/shared/src/skill/lifecycle-event-factory.ts`

**期待される成果物**:

- SkillLifecycleEvent 実装仕様書（型定義、metadata スキーマ、ファクトリ仕様、配置先）

---

### タスク2: lifecycleHistorySlice 設計仕様作成

**目的**: Zustand Store の `lifecycleHistorySlice` の詳細設計を仕様化する。

**実行手順**:

1. Slice の State 型を仕様化する:
   ```typescript
   interface LifecycleHistoryState {
     events: SkillLifecycleEvent[];
     isLoading: boolean;
     error: string | null;
     lastSyncedAt: string | null;
   }
   ```
2. Slice の Action 型を仕様化する:
   ```typescript
   interface LifecycleHistoryActions {
     recordEvent: (event: CreateEventParams) => void;
     getEventsBySkill: (skillId: string) => SkillLifecycleEvent[];
     getEventsByCategory: (category: EventCategory) => SkillLifecycleEvent[];
     getRecentEvents: (limit: number) => SkillLifecycleEvent[];
     clearEvents: () => void;
     syncFromPersistence: () => Promise<void>;
   }
   ```
3. 個別セレクタの仕様を作成する（P31/P48 対策）:
   - `useLifecycleEvents()` - 全イベント取得
   - `useLifecycleEventsBySkill(skillId)` - スキル別イベント（useShallow 必須: P48）
   - `useLifecycleEventsByCategory(category)` - カテゴリ別イベント（useShallow 必須: P48）
   - `useRecentLifecycleEvents(limit)` - 最新N件（useShallow 必須: P48）
   - `useLifecycleIsLoading()` - ローディング状態
   - `useRecordLifecycleEvent()` - イベント記録アクション
4. persist middleware の設計を仕様化する:
   - ストレージキー: `lifecycle-history`
   - 保持件数上限: 最新1000件（超過時は古いイベントから削除）
   - バージョン管理: `version: 1` でマイグレーション対応
5. 配置先を決定する:
   - `apps/desktop/src/renderer/store/slices/lifecycleHistorySlice.ts`

**期待される成果物**:

- lifecycleHistorySlice 設計仕様書（State/Action/セレクタ/persist 設計）

---

### タスク3: 集約ロジックの実装仕様作成

**目的**: `SkillAggregateView` を計算する集約ロジックの実装仕様を作成する。

**実行手順**:

1. 成功率計算の実装仕様を作成する:
   ```
   function calculateSuccessRate(events: SkillLifecycleEvent[], periodDays: number): number
   - 対象: eventType が 'skill:execution_succeeded' または 'skill:execution_failed'
   - 期間: 直近 periodDays 日間（デフォルト30日）
   - 計算: successCount / totalCount（totalCount === 0 の場合は 0.0）
   ```
2. トレンド判定の実装仕様を作成する:
   ```
   function calculateTrend(scoreHistory: ScoreDataPoint[], windowSize: number): Trend
   - windowSize: 直近N件（デフォルト5件）
   - windowSize 未満の場合: 'stable' を返す
   - 判定: 線形回帰の傾きを計算
     - 傾き > +threshold: 'improving'
     - 傾き < -threshold: 'declining'
     - 上記以外: 'stable'
   - threshold: 0.5（スコア100点満点基準で1回あたり0.5点の変動）
   ```
3. 推薦スコア計算の実装仕様を作成する:
   ```
   function calculateRecommendationScore(params: RecommendationParams): number
   - successRate: 0.0-1.0
   - normalizedScore: latestScore / 100（0.0-1.0）
   - recency: max(0, 1 - daysSinceLastExecution / 90)（90日で0に減衰）
   - score = successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2
   - 戻り値: 0.0-1.0 にクランプ
   ```
4. 集約ビュー構築関数の実装仕様を作成する:
   ```
   function buildAggregateView(skillId: string, events: SkillLifecycleEvent[]): SkillAggregateView
   - events から skillId に該当するイベントをフィルタ
   - 各計算関数を呼び出して集約ビューを構築
   - recentEvents: 最新10件
   - scoreHistory: evaluation カテゴリイベントからスコアを時系列抽出
   ```
5. 配置先を決定する:
   - `packages/shared/src/skill/lifecycle-aggregate.ts`

**期待される成果物**:

- 集約ロジック実装仕様書（各計算関数のシグネチャ・アルゴリズム・境界値処理）

---

### タスク4: フィードバックモデルの実装仕様作成

**目的**: `SkillFeedback` の記録・ステータス管理・改善優先度計算の実装仕様を作成する。

**実行手順**:

1. フィードバック記録の実装仕様を作成する:
   - `createFeedback(params: CreateFeedbackParams): SkillFeedback`
   - UUID v4 自動生成、`createdAt` 自動設定、`status` は `'pending'` 初期値
   - `sourceEventId` の実在検証は呼び出し元の責務（バリデーションは IPC 層で実施）
2. ステータス遷移の実装仕様を作成する:
   - 許可される遷移:
     - `pending` -> `applied`
     - `pending` -> `dismissed`
   - 禁止される遷移（エラーを返す）:
     - `applied` -> `pending`
     - `applied` -> `dismissed`
     - `dismissed` -> `pending`
     - `dismissed` -> `applied`
   - 遷移時に `processedAt` を現在時刻で設定する
3. 改善優先度計算の実装仕様を作成する:
   ```
   function calculateImprovementPriority(params: PriorityParams): number
   - weight_sr: 0.4（成功率の逆数への重み）
   - weight_ns: 0.4（スコアの逆数への重み）
   - weight_fb: 0.2（フィードバック件数への重み、上限10件で正規化）
   - priority = (1 - successRate) * 0.4 + (1 - normalizedScore) * 0.4 + min(feedbackCount, 10) / 10 * 0.2
   - 戻り値: 0.0-1.0
   ```
4. 還流ルールエンジンの実装仕様を作成する:
   - `evaluateFeedbackRules(skillId: string, metrics: SkillMetrics): FeedbackAction[]`
   - ルール1: `successRate <= 0.5` -> `{ action: 'alert', severity: 'warning', message: '...' }`
   - ルール2: `averageRating <= 3.0` -> `{ action: 'alert', severity: 'info', message: '...' }`
   - ルール3: `hasCriticalFeedback === true` -> `{ action: 'alert', severity: 'critical', message: '...' }`
   - 複数ルールが発火する場合は全て返す（severity の高い順にソート）
5. feedbackSlice の仕様を作成する（lifecycleHistorySlice と同構造）:
   - State: `{ feedbacks: SkillFeedback[], isLoading: boolean, error: string | null }`
   - Actions: `submitFeedback`, `updateFeedbackStatus`, `getFeedbacksBySkill`, `getPendingFeedbacks`
   - 個別セレクタ: `useFeedbacks()`, `usePendingFeedbacks()`, `useSubmitFeedback()` 等
6. 配置先を決定する:
   - 型・ロジック: `packages/shared/src/skill/feedback-types.ts`, `feedback-logic.ts`
   - Slice: `apps/desktop/src/renderer/store/slices/feedbackSlice.ts`

**期待される成果物**:

- フィードバックモデル実装仕様書（記録・遷移・優先度・還流ルール・Slice 設計）

---

### タスク5: Task08 向けメトリクス API 仕様作成

**目的**: Task08（公開・互換性）が使う `PublishReadinessMetrics` 提供 API の実装仕様を作成する。

**実行手順**:

1. メトリクス計算の実装仕様を作成する:
   ```
   function calculatePublishReadiness(skillId: string, events: SkillLifecycleEvent[], feedbacks: SkillFeedback[]): PublishReadinessMetrics
   - qualityScore: 最新の evaluation イベントから取得（存在しない場合は 0）
   - stabilityScore: calculateSuccessRate(events, 30) で算出
   - usageCount: execution カテゴリのイベント総数
   - hasCriticalFeedback: feedbacks に severity 'critical' が存在するか
   - readinessLevel の判定:
     - qualityScore >= 70 && stabilityScore >= 0.8 && usageCount >= 5 && !hasCriticalFeedback -> 'ready'
     - qualityScore >= 50 && stabilityScore >= 0.5 && usageCount >= 1 -> 'review_needed'
     - 上記以外 -> 'not_ready'
   ```
2. IPC ハンドラ仕様を作成する:
   - チャンネル: `IPC_CHANNELS.METRICS_GET_PUBLISH_READINESS`
   - 引数: `skillId: string`（P42 準拠3段バリデーション）
   - レスポンス: `{ success: true, data: PublishReadinessMetrics } | { success: false, error: IPCError }`
3. Task08 との契約境界を仕様化する:
   - 本タスク（Task07）の責務: メトリクスデータの計算と提供
   - Task08 の責務: 閾値の決定と公開可否判断ロジック
   - 閾値はデフォルト値を Task07 が提供するが、Task08 がオーバーライド可能とする
4. 配置先を決定する:
   - ロジック: `packages/shared/src/skill/publish-readiness.ts`
   - IPC ハンドラ: `apps/desktop/src/main/handlers/metricsHandlers.ts`

**期待される成果物**:

- Task08 向けメトリクス API 実装仕様書（計算ロジック・IPC 仕様・契約境界）

---

## 参照資料

| 参照資料                       | パス                                              | 内容               |
| ------------------------------ | ------------------------------------------------- | ------------------ |
| Phase 1 成果物                 | `outputs/phase-1/`                                | 要件定義の全成果物 |
| Phase 2 成果物                 | `outputs/phase-2/`                                | 設計の全成果物     |
| Phase 3 成果物                 | `outputs/phase-3/`                                | 設計レビュー結果   |
| Phase 4 成果物                 | `outputs/phase-4/`                                | テスト仕様書       |
| イベントモデルテスト仕様書     | `outputs/phase-4/event-model-test-spec.md`        | Phase 4 成果物     |
| 集約ロジックテスト仕様書       | `outputs/phase-4/aggregate-logic-test-spec.md`    | Phase 4 成果物     |
| フィードバック還流テスト仕様書 | `outputs/phase-4/feedback-loop-test-spec.md`      | Phase 4 成果物     |
| IPC契約テスト仕様書            | `outputs/phase-4/ipc-contract-test-spec.md`       | Phase 4 成果物     |
| テストデータファクトリ定義     | `outputs/phase-4/test-data-factory-definition.md` | Phase 4 成果物     |

### システム仕様（aiworkflow-requirements）

> 実装仕様作成時に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| interfaces-agent-sdk-history         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         | SDK履歴インターフェース    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |

---

## 成果物

| 成果物                           | パス                                               | 内容                                       |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| SkillLifecycleEvent 実装仕様書   | `outputs/phase-5/event-model-impl-spec.md`         | 型定義、metadata スキーマ、ファクトリ仕様  |
| lifecycleHistorySlice 設計仕様書 | `outputs/phase-5/lifecycle-history-slice-spec.md`  | State/Action/セレクタ/persist 設計         |
| 集約ロジック実装仕様書           | `outputs/phase-5/aggregate-logic-impl-spec.md`     | 計算関数のシグネチャ・アルゴリズム・境界値 |
| フィードバックモデル実装仕様書   | `outputs/phase-5/feedback-model-impl-spec.md`      | 記録・遷移・優先度・還流ルール・Slice 設計 |
| Task08 メトリクス API 実装仕様書 | `outputs/phase-5/publish-metrics-api-impl-spec.md` | 計算ロジック・IPC 仕様・契約境界           |

---

## 統合テスト連携

- Phase 4 のテスト仕様書を入力とし、本 Phase の実装仕様が全テストケースを通過する設計であることを検証する
- Phase 6（テスト拡充）で本 Phase の実装仕様に基づく追加テストケースを設計する
- Phase 8（リファクタリング）で本 Phase の仕様書を基にコード品質改善の基準とする
- `.claude` 正本仕様書の更新は Phase 12（ドキュメント）で実施する

---

## 完了条件

- [ ] `SkillLifecycleEvent` 型と関連型の全フィールド仕様が確定している
- [ ] カテゴリ別 metadata スキーマが定義されている
- [ ] `lifecycleHistorySlice` の State/Action/セレクタが P31/P48 対策込みで設計されている
- [ ] persist middleware の設計（ストレージキー、保持件数上限、バージョン）が確定している
- [ ] 成功率・トレンド・推薦スコアの計算アルゴリズムが擬似コードで記述されている
- [ ] 境界値処理（ゼロ除算、データ不足、期間外）が仕様に含まれている
- [ ] フィードバックステータス遷移の許可/禁止マトリクスが定義されている
- [ ] 改善優先度計算の重みパラメータと正規化方法が確定している
- [ ] 還流ルールエンジンの発火条件と出力フォーマットが定義されている
- [ ] `PublishReadinessMetrics` の `readinessLevel` 判定ロジックが確定している
- [ ] Task08 との契約境界（データ提供 vs 判断ロジック）が明確に記述されている
- [ ] 全モジュールの配置先（パッケージ・ディレクトリ）が決定している
- [ ] Phase 4 のテスト仕様を全て通過する設計であることが検証されている
- [ ] 全成果物が `outputs/phase-5/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-6-test-expansion.md`
