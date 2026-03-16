# 集約ビュー設計書

## メタ情報

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 2 タスク2                                                                                                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                       |
| 作成日     | 2026-03-16                                                                                                                                    |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-2/aggregate-view-design.md` |
| 依存成果物 | `outputs/phase-1/lifecycle-event-catalog.md`、`outputs/phase-1/feedback-collection-spec.md`、`outputs/phase-1/task08-metrics-definition.md`   |

---

## 1. 概要

本ドキュメントは `SkillAggregateView`（集約ビュー）の TypeScript 型定義、計算ロジック仕様、更新タイミング設計、パフォーマンス考慮事項を定義する。

集約ビューはスキルのライフサイクル履歴（Phase 1 カタログ定義の全 18 イベント）を集約し、UI レイヤーが「最近使ったスキル」「成功率」「品質推移」「推薦スコア」を一貫したデータモデルで参照するための読み取り専用のビュー型である。

### 設計の原則

- **読み取り専用**: `SkillAggregateView` は集約結果の参照モデル。イベントストアへの書き込みは行わない
- **べき等性**: 同一イベントセットに対して何度計算しても同じ結果を返す
- **決定論的境界値処理**: `totalExecutions === 0` や `scoreHistory.length < 5` のケースは明示的に処理する
- **Phase 1 型との整合性**: `SkillLifecycleEventBase`（lifecycle-event-catalog.md §1）の型定義を `SkillLifecycleEvent` として継承

---

## 2. TypeScript 型定義

```typescript
// ================================================================
// 基本型（Phase 1 lifecycle-event-catalog.md §1 から継承）
// ================================================================

/** Phase 1 定義の共通イベント基底型（参照のみ、再定義しない） */
type SkillLifecycleEvent =
  import("./lifecycle-event-catalog").SkillLifecycleEventBase;

// ================================================================
// スコア履歴データポイント
// ================================================================

/**
 * スコア履歴の1データポイント
 * 評価イベント（skill:evaluated / skill:score_updated）から構築する
 */
export interface ScoreDataPoint {
  /** イベント発生日時（ISO 8601 UTC）。例: "2026-03-16T07:17:53.000Z" */
  timestamp: string;
  /** 評価スコア（0〜100）。整数または小数点以下1桁 */
  score: number;
  /** イベント発生時のスキルバージョン（semver）。例: "1.2.0" */
  version: string;
  /** ソースとなった評価イベントのID（UUID v4） */
  eventId: string;
}

// ================================================================
// トレンド型
// ================================================================

/**
 * 直近5回のスコア変化から導出したトレンド
 * 線形回帰傾きに基づいて判定する（計算方法は §3-2 参照）
 */
export type Trend = "improving" | "stable" | "declining";

// ================================================================
// 推薦スコア計算パラメータ
// ================================================================

/**
 * calculateRecommendationScore() の入力パラメータ
 * 3つの要素（成功率・品質・新近性）を重み付き合成して推薦スコアを算出する
 */
export interface RecommendationParams {
  /** 成功率（0.0〜1.0）。calculateSuccessRate() の返値を使用 */
  successRate: number;
  /** 最新の評価スコア（0〜100）。latestScore をそのまま渡す */
  latestScore: number;
  /**
   * 最終実行日時（ISO 8601 UTC）。
   * null の場合は実行履歴なしとして recency = 0.0 とする
   */
  lastExecutedAt: string | null;
  /**
   * 新近性の計算基準日時（ISO 8601 UTC）。
   * 省略時は現在時刻（new Date().toISOString()）を使用する
   */
  referenceDate?: string;
}

// ================================================================
// 集約ビューのメインインターフェース
// ================================================================

/**
 * スキル集約ビュー
 * ライフサイクルイベントから導出した読み取り専用の集計モデル。
 * Zustand Store の skillAggregateSlice が管理し、
 * UI コンポーネントはこの型を直接参照する。
 */
export interface SkillAggregateView {
  // --- 識別情報 ---
  /** スキル識別子（UUID v4）。SkillMeta.id と一致 */
  skillId: string;
  /** スキル表示名 */
  skillName: string;

  // --- 実行統計（直近30日間） ---
  /**
   * 直近30日間の総実行回数（skill:executed イベントの件数）。
   * 実行履歴が0件の場合は 0
   */
  totalExecutions: number;
  /**
   * 直近30日間の実行成功率（0.0〜1.0）。
   * totalExecutions === 0 の場合は 0.0
   */
  successRate: number;

  // --- 時間情報 ---
  /**
   * 最終実行日時（ISO 8601 UTC）。
   * 実行履歴がない場合は null
   */
  lastExecutedAt: string | null;

  // --- 品質情報 ---
  /**
   * 最新の評価スコア（0〜100）。
   * 評価履歴がない場合は 0
   */
  latestScore: number;
  /**
   * 評価スコアの時系列履歴（古い順）。
   * skill:evaluated / skill:score_updated イベントから構築。
   * 評価履歴なしの場合は空配列 []
   */
  scoreHistory: ScoreDataPoint[];

  // --- 最近のイベント ---
  /**
   * 直近10件のライフサイクルイベント（新しい順）。
   * カテゴリフィルタなし（全カテゴリを対象）。
   * イベントが10件未満の場合は実際の件数分のみ含む
   */
  recentEvents: SkillLifecycleEvent[];

  // --- 推薦・トレンド ---
  /**
   * 直近5回のスコア変化の線形回帰傾きから算出したトレンド。
   * scoreHistory.length < 5 の場合は "stable"（デフォルト）
   */
  trend: Trend;
  /**
   * 推薦スコア（0.0〜1.0）。
   * successRate * 0.4 + (latestScore / 100) * 0.4 + recency * 0.2
   * で算出する（recency の計算方法は §3-3 参照）
   */
  recommendationScore: number;

  // --- メタデータ ---
  /**
   * 集約ビューの最終更新日時（ISO 8601 UTC）。
   * リアルタイム更新時はイベント受信時刻、バッチ更新時はバッチ実行完了時刻
   */
  aggregatedAt: string;
}
```

---

## 3. 計算ロジック仕様

### 3-1. `calculateSuccessRate`

**目的**: 直近 `periodDays` 日間の実行成功率を計算する。

**シグネチャ**:

```typescript
function calculateSuccessRate(
  events: SkillLifecycleEvent[],
  periodDays: number,
): number;
```

**擬似コード**:

```
function calculateSuccessRate(events, periodDays):
  // Step 1: 基準日時の確定
  cutoffTimestamp = now() - periodDays * 24 * 60 * 60 * 1000

  // Step 2: 期間内の実行開始イベントを抽出
  executionStartEvents = events.filter(e =>
    e.eventType === "skill:executed" &&
    toMillis(e.timestamp) >= cutoffTimestamp
  )

  totalExecutions = executionStartEvents.length

  // Step 3: 境界値処理
  if totalExecutions === 0:
    return 0.0

  // Step 4: 成功イベントを対応付け（parentEventId で結合）
  startEventIds = Set(executionStartEvents.map(e => e.id))

  successEvents = events.filter(e =>
    e.eventType === "skill:execution_succeeded" &&
    e.parentEventId !== null &&
    startEventIds.has(e.parentEventId)
  )

  successCount = successEvents.length

  // Step 5: 成功率を計算して返す
  return successCount / totalExecutions
```

**境界値処理**:

| 条件                                   | 処理                                                 | 返値           |
| -------------------------------------- | ---------------------------------------------------- | -------------- |
| `events` が空配列                      | `totalExecutions = 0` として扱う                     | `0.0`          |
| `totalExecutions === 0`                | ゼロ除算を回避                                       | `0.0`          |
| `periodDays <= 0`                      | 全件対象（cutoff を EPOCH とする）                   | 全期間の成功率 |
| 成功イベントが開始イベントより多い場合 | `parentEventId` 結合で整合性を保証するため発生しない | —              |

---

### 3-2. `calculateTrend`

**目的**: 直近 `windowSize` 件のスコア変化を線形回帰で分析し、トレンドを返す。

**シグネチャ**:

```typescript
function calculateTrend(
  scoreHistory: ScoreDataPoint[],
  windowSize: number,
): Trend;
```

**擬似コード**:

```
function calculateTrend(scoreHistory, windowSize):
  // Step 1: 件数チェック
  if scoreHistory.length < windowSize:
    return "stable"  // データ不足はデフォルト

  // Step 2: 直近 windowSize 件を取得（古い順でソート済み前提）
  window = scoreHistory.slice(-windowSize)  // 末尾 windowSize 件

  // Step 3: x = インデックス（0〜windowSize-1）、y = スコア として
  //         最小二乗法で線形回帰の傾きを計算
  n = windowSize
  xValues = [0, 1, 2, ..., n-1]
  yValues = window.map(p => p.score)

  sumX  = n * (n - 1) / 2              // ∑x
  sumY  = yValues.reduce((a, b) => a + b, 0)
  sumXY = sum(xValues[i] * yValues[i] for i in 0..n-1)
  sumX2 = sum(xValues[i]^2 for i in 0..n-1)

  // 傾き slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX^2)
  denominator = n * sumX2 - sumX * sumX
  if denominator === 0:
    return "stable"  // 全 x が同一（windowSize=1 等、理論上は発生しない）

  slope = (n * sumXY - sumX * sumY) / denominator

  // Step 4: 閾値判定
  if slope > 0.5:
    return "improving"
  else if slope < -0.5:
    return "declining"
  else:
    return "stable"
```

**境界値処理**:

| 条件                               | 処理                                                      | 返値       |
| ---------------------------------- | --------------------------------------------------------- | ---------- |
| `scoreHistory.length < windowSize` | データ不足                                                | `"stable"` |
| `scoreHistory` が空配列            | `length < windowSize` として処理                          | `"stable"` |
| 全スコアが同一値                   | `slope = 0.0`（`-0.5 <= 0.0 <= 0.5`）                     | `"stable"` |
| `windowSize <= 1`                  | `denominator = 0` になるため `slope` 計算不能             | `"stable"` |
| `windowSize` のデフォルト値        | `5`（呼び出し元で指定。`buildAggregateView` は 5 を渡す） | —          |

---

### 3-3. `calculateRecommendationScore`

**目的**: 成功率・品質・新近性の3要素を重み付き合成して推薦スコア（0.0〜1.0）を算出する。

**シグネチャ**:

```typescript
function calculateRecommendationScore(params: RecommendationParams): number;
```

**擬似コード**:

```
function calculateRecommendationScore(params):
  { successRate, latestScore, lastExecutedAt, referenceDate } = params

  // --- 要素1: 成功率スコア（重み 0.4）---
  successComponent = successRate  // 既に 0.0〜1.0

  // --- 要素2: 品質スコア正規化（重み 0.4）---
  normalizedScore = latestScore / 100  // 0〜100 → 0.0〜1.0

  // --- 要素3: 新近性スコア（重み 0.2）---
  if lastExecutedAt === null:
    recency = 0.0
  else:
    referenceMs = toMillis(referenceDate ?? now())
    lastMs      = toMillis(lastExecutedAt)
    daysSinceLastExecution = (referenceMs - lastMs) / (1000 * 60 * 60 * 24)
    recency = max(0.0, 1.0 - daysSinceLastExecution / 90)

  // --- 重み付き合成（合計 = 1.0）---
  score = successComponent * 0.4
        + normalizedScore   * 0.4
        + recency           * 0.2

  // --- 値域クランプ（浮動小数点誤差対策）---
  return clamp(score, 0.0, 1.0)
```

**境界値処理**:

| 条件                                                                    | 処理                                | recency 値     |
| ----------------------------------------------------------------------- | ----------------------------------- | -------------- |
| `lastExecutedAt === null`                                               | 実行履歴なし                        | `0.0`          |
| `daysSinceLastExecution >= 90`                                          | `1.0 - 90/90 = 0` → `max(0.0, 0.0)` | `0.0`          |
| `daysSinceLastExecution = 0`                                            | `1.0 - 0 = 1.0`                     | `1.0`          |
| `latestScore = 0`                                                       | `normalizedScore = 0.0`             | —              |
| `successRate = 0.0` かつ `latestScore = 0` かつ `lastExecutedAt = null` | 全要素最小値                        | 最終結果 `0.0` |
| 浮動小数点誤差で 1.0 超過                                               | `clamp(score, 0.0, 1.0)` で吸収     | —              |

---

### 3-4. `buildAggregateView`

**目的**: 指定スキルのライフサイクルイベント一覧から `SkillAggregateView` を構築する。

**シグネチャ**:

```typescript
function buildAggregateView(
  skillId: string,
  skillName: string,
  events: SkillLifecycleEvent[],
): SkillAggregateView;
```

**擬似コード**:

```
function buildAggregateView(skillId, skillName, events):
  // Step 1: 事前ソート（timestamp 昇順 = 古い順）
  sortedEvents = events
    .filter(e => e.skillId === skillId)
    .sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp))

  // Step 2: totalExecutions と successRate（直近30日）
  successRate = calculateSuccessRate(sortedEvents, 30)

  executionStartEvents30d = sortedEvents.filter(e =>
    e.eventType === "skill:executed" &&
    toMillis(e.timestamp) >= now() - 30 * DAY_MS
  )
  totalExecutions = executionStartEvents30d.length

  // Step 3: lastExecutedAt
  //   skill:executed, skill:execution_succeeded, skill:execution_failed,
  //   skill:execution_timeout のいずれかの最大 timestamp
  executionRelatedEvents = sortedEvents.filter(e =>
    ["skill:executed", "skill:execution_succeeded",
     "skill:execution_failed", "skill:execution_timeout"].includes(e.eventType)
  )
  lastExecutedAt = executionRelatedEvents.length > 0
    ? executionRelatedEvents[executionRelatedEvents.length - 1].timestamp
    : null

  // Step 4: scoreHistory（評価イベントから構築）
  scoreHistory = sortedEvents
    .filter(e => ["skill:evaluated", "skill:score_updated"].includes(e.eventType))
    .map(e => ({
      timestamp: e.timestamp,
      score:     e.metadata.score ?? e.metadata.newScore,  // skill:score_updated は newScore
      version:   e.skillVersion,
      eventId:   e.id,
    }))

  // Step 5: latestScore
  latestScore = scoreHistory.length > 0
    ? scoreHistory[scoreHistory.length - 1].score
    : 0

  // Step 6: recentEvents（最新10件、降順）
  recentEvents = [...sortedEvents]
    .reverse()
    .slice(0, 10)

  // Step 7: trend（直近5回のスコア、windowSize=5）
  trend = calculateTrend(scoreHistory, 5)

  // Step 8: recommendationScore
  recommendationScore = calculateRecommendationScore({
    successRate,
    latestScore,
    lastExecutedAt,
  })

  // Step 9: 集約ビューを組み立て
  return {
    skillId,
    skillName,
    totalExecutions,
    successRate,
    lastExecutedAt,
    latestScore,
    scoreHistory,
    recentEvents,
    trend,
    recommendationScore,
    aggregatedAt: now().toISOString(),
  }
```

**境界値処理**:

| 条件                                                       | 処理                                                                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `events` が空配列                                          | `totalExecutions=0`, `successRate=0.0`, `lastExecutedAt=null`, `latestScore=0`, `scoreHistory=[]`, `recentEvents=[]`, `trend="stable"`, `recommendationScore=0.0` |
| `events` に対象 `skillId` のイベントが含まれない           | 同上（フィルタ後が空配列）                                                                                                                                        |
| 評価イベントのみで実行イベントなし                         | `totalExecutions=0`, `successRate=0.0`, `lastExecutedAt=null` のまま `latestScore` と `scoreHistory` は構築される                                                 |
| `skill:score_updated` の metadata に `newScore` がない場合 | フォールバックとして `score` フィールドを参照。両方ない場合は当該ポイントを `scoreHistory` から除外                                                               |

---

## 4. 更新タイミング設計

### 4-1. リアルタイム更新（イベント発生時）

**トリガー**: IPC チャンネル `skill:lifecycle-event` (Main → Renderer) の受信

**対象**: Zustand Store の `skillAggregateSlice`

**処理フロー**:

```
[Main Process]
  SkillExecutor / ScoringGate / FeedbackCollector
    └── LifecycleEventStore.save(event)  // SQLite 永続化
    └── IPC push: "skill:lifecycle-event" に event を送信

[Renderer Process]
  ipcRenderer.on("skill:lifecycle-event", (event) => {
    // 1. lifecycleEventSlice へ event を追加（最新50件キャッシュ）
    store.dispatch(addLifecycleEvent(event))

    // 2. 対象スキルの集約ビューをインクリメンタル更新
    store.dispatch(updateAggregateView(event.skillId))
    //   ↑ 現在の Zustand Store の events から buildAggregateView を再実行
  })
```

**インクリメンタル更新の実装方針**:

全件再計算（`buildAggregateView` を再実行）を採用する。

- Zustand Store が保持するイベントキャッシュは直近50件のみ
- `buildAggregateView` の計算コストは O(n) で n=50 以下の場合は無視できる
- 部分更新（フィールドごとの差分計算）は実装複雑度が高く、境界値でのバグリスクが大きい

**リアルタイム更新が必要なイベント**（他は Zustand に保持するが即時集約更新は不要）:

| イベント種別                | 理由                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| `skill:executed`            | `totalExecutions`, `lastExecutedAt`, `recentEvents` に即時反映           |
| `skill:execution_succeeded` | `successRate`, `recentEvents` に即時反映                                 |
| `skill:execution_failed`    | `successRate`, `recentEvents` に即時反映                                 |
| `skill:execution_timeout`   | `successRate`, `recentEvents` に即時反映                                 |
| `skill:evaluated`           | `latestScore`, `scoreHistory`, `trend`, `recommendationScore` に即時反映 |
| `skill:score_updated`       | `latestScore`, `scoreHistory`, `trend`, `recommendationScore` に即時反映 |
| `skill:improved`            | `recentEvents` に即時反映                                                |

### 4-2. バッチ更新（日次再計算）

**トリガー**: 日次バッチ実行（JST 0:00）

**対象**: SQLite の全スキル集約データ（`skill_aggregate_snapshots` テーブル）

**処理フロー**:

```
[Main Process - Batch Scheduler]
  0:00 JST トリガー
    └── 全スキル ID を取得
    └── 各スキルに対して:
          events = SQLite.query(
            "SELECT * FROM skill_lifecycle_events WHERE skill_id = ? ORDER BY timestamp ASC",
            skillId
          )
          aggregateView = buildAggregateView(skillId, skillName, events)
          SQLite.upsert("skill_aggregate_snapshots", aggregateView)
    └── IPC push: "skill:aggregate-snapshots-refreshed" を Renderer に通知

[Renderer Process]
  ipcRenderer.on("skill:aggregate-snapshots-refreshed", () => {
    // Zustand Store の集約ビューキャッシュ全件を SQLite から再取得して置換
    store.dispatch(refreshAllAggregateViews())
  })
```

**バッチ更新の目的**:

| 目的                               | 説明                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 30日ウィンドウの補正               | 日をまたいで `totalExecutions` と `successRate` の計算対象期間が変化するため、日次で全再計算して正確な値に補正する |
| Zustand キャッシュと SQLite の同期 | Renderer 再起動や crashrestore 後にキャッシュが失われた場合の復旧                                                  |
| 推薦スコアの新近性再計算           | `daysSinceLastExecution` は現在日時に依存するため日次で更新が必要                                                  |

### 4-3. オンデマンド更新（明示的要求）

**トリガー**: IPC `skill:get-aggregate-view` (Renderer → Main invoke)

**用途**: スキル詳細画面を開いた際の最新データ取得

**処理**: Main Process が SQLite から全イベントを取得し `buildAggregateView` を実行して返す。Zustand Store のキャッシュは上書きしない（参照用途のみ）。

---

## 5. パフォーマンス考慮

### 5-1. キャッシュ戦略

| レイヤー                  | 対象データ                       | キャッシュ方式                                        | 無効化タイミング                                  |
| ------------------------- | -------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Zustand Store（Renderer） | 直近50件のライフサイクルイベント | `lifecycleEventSlice`（`persist` ミドルウェア）       | 新規イベント受信時に古い方から削除                |
| Zustand Store（Renderer） | 全スキルの `SkillAggregateView`  | `skillAggregateSlice`（メモリのみ、`persist` 対象外） | 対象スキルのイベント受信時 / バッチ更新通知受信時 |
| SQLite（Main）            | 全ライフサイクルイベント         | テーブル `skill_lifecycle_events`                     | 永続化のみ（削除なし）                            |
| SQLite（Main）            | 集約スナップショット             | テーブル `skill_aggregate_snapshots`                  | 日次バッチ更新時に `upsert`                       |

**Zustand の `skillAggregateSlice` を `persist` 対象外とする理由**:

- 集約ビューは常にイベントから導出可能な派生データ
- ストレージへのシリアライズコストが `scoreHistory` 配列の長さに比例して増大する
- アプリ起動時はバッチ更新スナップショット（SQLite）から再構築するため、永続化不要

### 5-2. 増分計算 vs 全再計算の判断基準

| 条件                                         | 採用方式                         | 根拠                                                                                        |
| -------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| Zustand Store 内イベント（n ≤ 50）           | 全再計算（`buildAggregateView`） | O(50) は無視できるコスト。増分計算の実装複雑度を避ける                                      |
| SQLite 全イベント（バッチ処理）              | 全再計算（全イベントを読み込み） | 日次バッチは一度のみ実行。SQLite インデックス（`skill_id, timestamp DESC`）により取得は高速 |
| 将来的にイベント件数が 10,000 件を超える場合 | 増分計算に切り替える候補         | `scoreHistory` 構築と `calculateSuccessRate` の filter をウィンドウ付きクエリに変更         |

### 5-3. SQLite インデックス最適化

Phase 1 の lifecycle-event-catalog.md §5 で定義されたインデックスを集約ビュー計算の観点で評価する。

| インデックス                 | 使用クエリ                                                                    | 集約ビュー計算での用途                             |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| `(skill_id, timestamp DESC)` | `buildAggregateView` の全件取得 / `recentEvents`                              | 最重要。1スキルの全イベントを timestamp 順で取得   |
| `(event_type)`               | `calculateSuccessRate` の `skill:executed` / `skill:execution_succeeded` 抽出 | `event_type` + `skill_id` の複合クエリで使用       |
| `(category, timestamp DESC)` | カテゴリ別集計（evaluation / execution / improvement）                        | `scoreHistory` 構築（`evaluation` カテゴリ）に使用 |

**追加インデックスの推奨**:

バッチ処理の `calculateSuccessRate`（30日ウィンドウ）に対して以下の複合インデックスを追加することを推薦する。Phase 5 実装時に確定する。

```sql
CREATE INDEX idx_skill_events_execution
  ON skill_lifecycle_events (skill_id, event_type, timestamp DESC);
```

### 5-4. `scoreHistory` のサイズ上限

`scoreHistory` 配列は評価イベントの件数に比例して増大する。UI の折れ線グラフ表示を考慮して、`buildAggregateView` の返値では最新200件に制限する。バッチ処理での全件集計（Task08 向け `getSkillHealthReport`）は制限なしとする。

```typescript
// buildAggregateView 内での制限
const scoreHistory = allScoreHistory.slice(-200);
```

---

## 6. 型定義サマリー

| 型名                   | 用途                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `SkillAggregateView`   | 集約ビューのメインインターフェース。Zustand Store で管理     |
| `ScoreDataPoint`       | スコア履歴の1データポイント。`scoreHistory` 配列の要素型     |
| `Trend`                | トレンド判定結果。`"improving"` / `"stable"` / `"declining"` |
| `RecommendationParams` | `calculateRecommendationScore` の入力パラメータ              |

## 7. 関数シグネチャサマリー

| 関数名                                           | 入力                                        | 出力                 | 計算量        |
| ------------------------------------------------ | ------------------------------------------- | -------------------- | ------------- |
| `calculateSuccessRate(events, periodDays)`       | `SkillLifecycleEvent[]`, `number`           | `number` (0.0〜1.0)  | O(n)          |
| `calculateTrend(scoreHistory, windowSize)`       | `ScoreDataPoint[]`, `number`                | `Trend`              | O(windowSize) |
| `calculateRecommendationScore(params)`           | `RecommendationParams`                      | `number` (0.0〜1.0)  | O(1)          |
| `buildAggregateView(skillId, skillName, events)` | `string`, `string`, `SkillLifecycleEvent[]` | `SkillAggregateView` | O(n)          |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 2 タスク2_
