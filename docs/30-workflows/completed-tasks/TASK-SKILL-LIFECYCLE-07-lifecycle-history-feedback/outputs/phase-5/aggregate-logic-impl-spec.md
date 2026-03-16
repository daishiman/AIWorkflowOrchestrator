# 集約ロジック実装仕様書

## メタ情報

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 5                                                                                                                                                 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                           |
| 作成日     | 2026-03-16                                                                                                                                        |
| 入力成果物 | `outputs/phase-2/aggregate-view-design.md`                                                                                                        |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-5/aggregate-logic-impl-spec.md` |
| 配置先     | `packages/shared/src/skill/lifecycle-aggregate.ts`                                                                                                |

---

## 1. 概要

本ドキュメントは `lifecycle-aggregate.ts` に実装する集約ロジック関数の詳細仕様を定義する。
全関数は**純粋関数**として実装し、副作用を持たない（テスト容易性・冪等性を保証）。

Phase 3 MINOR 指摘の以下2件を本仕様書で解決する。

| MINOR ID | 内容                                                 | 解決方針                                             |
| -------- | ---------------------------------------------------- | ---------------------------------------------------- |
| INT-M-01 | successRate 集計ウィンドウ差異（件数 vs 時間ベース） | 引数 `periodDays` で切り替え可能にし、両方をサポート |
| INT-M-02 | latestScore 型差分（`number` vs `number \| null`）   | Phase 1 契約に従い `number \| null` を採用           |

---

## 2. 型定義

```typescript
// packages/shared/src/skill/lifecycle-aggregate.ts

import type { SkillLifecycleEvent, EventCategory } from "./lifecycle-types";

// ================================================================
// スコア履歴データポイント
// ================================================================

/**
 * スコア履歴の1データポイント。
 * skill:evaluated / skill:score_updated イベントから構築する。
 */
export interface ScoreDataPoint {
  /** イベント発生日時（ISO 8601 UTC） */
  timestamp: string;
  /**
   * 評価スコア（0〜100）。
   * INT-M-02 解決: null を持つことはない（構築時にスコアがないイベントは除外する）。
   */
  score: number;
  /** イベント発生時のスキルバージョン（semver） */
  version: string;
  /** ソースとなった評価イベントのID（UUID v4） */
  eventId: string;
}

// ================================================================
// トレンド型
// ================================================================

/**
 * 直近 windowSize 回のスコア変化から導出したトレンド。
 * 線形回帰傾きに基づいて判定する。
 */
export type Trend = "improving" | "stable" | "declining";

// ================================================================
// 推薦スコア計算パラメータ
// ================================================================

export interface RecommendationParams {
  /** 成功率（0.0〜1.0）。calculateSuccessRate() の返値を使用 */
  successRate: number;
  /**
   * 最新の評価スコア（0〜100）。
   * INT-M-02 解決: latestScore が null（未評価）の場合は 0 として正規化する。
   */
  latestScore: number | null;
  /**
   * 最終実行日時（ISO 8601 UTC）。
   * null の場合は実行履歴なしとして recency = 0.0 とする。
   */
  lastExecutedAt: string | null;
  /**
   * 新近性の計算基準日時（ISO 8601 UTC）。
   * 省略時は現在時刻（new Date().toISOString()）を使用する。
   */
  referenceDate?: string;
}

// ================================================================
// 集約ビューのメインインターフェース
// ================================================================

/**
 * スキル集約ビュー。
 * ライフサイクルイベントから導出した読み取り専用の集計モデル。
 *
 * INT-M-02 解決:
 *   - latestScore は `number | null`（未評価の場合は null）
 *   - Phase 1 契約の `number | null` を採用し、Phase 2 の `number`（0=未評価）設計を修正
 */
export interface SkillAggregateView {
  // --- 識別情報 ---
  skillId: string;
  skillName: string;

  // --- 実行統計（直近30日間）---
  totalExecutions: number;
  /**
   * 直近30日間の実行成功率（0.0〜1.0）。
   * totalExecutions === 0 の場合は 0.0。
   */
  successRate: number;

  // --- 時間情報 ---
  lastExecutedAt: string | null;

  // --- 品質情報 ---
  /**
   * 最新の評価スコア（0〜100）。
   * INT-M-02 解決: 評価履歴がない場合は null（0 ではない）。
   * Phase 1 契約 `number | null` に準拠。
   */
  latestScore: number | null;

  scoreHistory: ScoreDataPoint[];

  // --- 最近のイベント ---
  recentEvents: SkillLifecycleEvent[];

  // --- 推薦・トレンド ---
  trend: Trend;
  recommendationScore: number;

  // --- メタデータ ---
  aggregatedAt: string;
}
```

---

## 3. 関数仕様

### 3-1. calculateSuccessRate

**目的**: 直近 `periodDays` 日間（または全件）の実行成功率を計算する。

**INT-M-01 解決**: `periodDays` 引数で時間ベース（30日）と件数ベース（`Infinity`）を切り替え可能にする。

```typescript
/**
 * 指定期間内の実行成功率を計算する（0.0〜1.0）。
 *
 * INT-M-01 解決:
 *   - periodDays = 30 → 時間ベース（直近30日）: buildAggregateView / UI 用
 *   - periodDays = Infinity → 全件対象: 件数ベース集計の前処理として事前 slice 済み配列を渡す
 *
 * ゼロ除算対策: totalExecutions === 0 の場合は 0.0 を返す。
 *
 * @param events - 対象イベント一覧（スキル絞り込み済み）
 * @param periodDays - 集計期間（日数）。Infinity で全件対象
 * @returns 成功率（0.0〜1.0）
 */
export function calculateSuccessRate(
  events: SkillLifecycleEvent[],
  periodDays: number,
): number;
```

**擬似コード**:

```
function calculateSuccessRate(events, periodDays):
  // Step 1: 基準日時の確定
  if periodDays === Infinity または periodDays <= 0:
    cutoffMs = 0  // EPOCH（全件対象）
  else:
    cutoffMs = Date.now() - periodDays * 24 * 60 * 60 * 1000

  // Step 2: 期間内の実行開始イベントを抽出
  executionStartEvents = events.filter(e =>
    e.eventType === "skill:executed" &&
    new Date(e.timestamp).getTime() >= cutoffMs
  )
  totalExecutions = executionStartEvents.length

  // Step 3: 境界値処理（ゼロ除算回避）
  if totalExecutions === 0:
    return 0.0

  // Step 4: 成功イベントを parentEventId で対応付け
  startEventIds = new Set(executionStartEvents.map(e => e.id))

  successEvents = events.filter(e =>
    e.eventType === "skill:execution_succeeded" &&
    e.parentEventId !== null &&
    startEventIds.has(e.parentEventId)
  )
  successCount = successEvents.length

  // Step 5: 成功率を計算して返す
  return successCount / totalExecutions
```

**境界値処理一覧**:

| 条件                      | 処理                       | 返値               |
| ------------------------- | -------------------------- | ------------------ |
| `events` が空配列         | totalExecutions = 0        | `0.0`              |
| `totalExecutions === 0`   | ゼロ除算回避               | `0.0`              |
| `periodDays <= 0`         | cutoff = EPOCH（全件対象） | 全期間の成功率     |
| `periodDays === Infinity` | cutoff = EPOCH（全件対象） | 全期間の成功率     |
| `periodDays = 30`         | 直近30日の成功率           | 直近30日内の成功率 |

---

### 3-2. calculateTrend

**目的**: 直近 `windowSize` 件のスコア変化を線形回帰で分析し、トレンドを返す。

```typescript
/**
 * スコア履歴から線形回帰傾きを計算し、トレンドを返す。
 *
 * @param scoreHistory - スコア履歴（古い順ソート済み）
 * @param windowSize - 分析対象件数（デフォルト: 5。buildAggregateView は 5 を渡す）
 * @returns Trend（"improving" / "stable" / "declining"）
 */
export function calculateTrend(
  scoreHistory: ScoreDataPoint[],
  windowSize: number = 5,
): Trend;
```

**擬似コード**:

```
function calculateTrend(scoreHistory, windowSize = 5):
  // Step 1: 件数チェック（データ不足はデフォルト "stable"）
  if scoreHistory.length < windowSize:
    return "stable"

  // Step 2: 直近 windowSize 件を取得（古い順ソート済み前提）
  window = scoreHistory.slice(-windowSize)

  // Step 3: 線形回帰の傾きを最小二乗法で計算
  n = windowSize
  xValues = [0, 1, 2, ..., n-1]
  yValues = window.map(p => p.score)

  sumX  = n * (n - 1) / 2              // ∑x (等差数列の和)
  sumY  = yValues.reduce((a, b) => a + b, 0)
  sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)

  // 傾き slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX^2)
  denominator = n * sumX2 - sumX * sumX
  if denominator === 0:
    return "stable"  // windowSize=1 等の異常ケース

  slope = (n * sumXY - sumX * sumY) / denominator

  // Step 4: 閾値判定（±0.5 で3分類）
  if slope > 0.5:
    return "improving"
  else if slope < -0.5:
    return "declining"
  else:
    return "stable"
```

**境界値処理一覧**:

| 条件                               | 処理                                 | 返値       |
| ---------------------------------- | ------------------------------------ | ---------- |
| `scoreHistory.length < windowSize` | データ不足                           | `"stable"` |
| `scoreHistory` が空配列            | `length < windowSize` として処理     | `"stable"` |
| 全スコアが同一値                   | `slope = 0.0`（-0.5 〜 0.5 の範囲）  | `"stable"` |
| `windowSize <= 1`                  | `denominator = 0` → スロープ計算不能 | `"stable"` |
| `windowSize` デフォルト値          | `5`                                  | 通常計算   |

**傾き閾値の根拠**:

| 傾き      | 判定          | 意味                                       |
| --------- | ------------- | ------------------------------------------ |
| > 0.5     | `"improving"` | 5回のスコア変化で合計 2.5 ポイント以上改善 |
| < -0.5    | `"declining"` | 5回のスコア変化で合計 2.5 ポイント以上悪化 |
| ±0.5 以内 | `"stable"`    | 変化が軽微で安定状態                       |

---

### 3-3. calculateRecommendationScore

**目的**: 成功率・品質・新近性の3要素を重み付き合成して推薦スコア（0.0〜1.0）を算出する。

```typescript
/**
 * 推薦スコアを計算する（0.0〜1.0）。
 * 重み: successRate × 0.4 + normalizedScore × 0.4 + recency × 0.2
 *
 * INT-M-02 解決:
 *   - params.latestScore が null の場合（未評価）は normalizedScore = 0.0 として扱う。
 *   - これは Phase 1 契約の null 許容と一致する。
 *
 * @param params - 推薦スコア計算パラメータ
 * @returns 推薦スコア（0.0〜1.0）
 */
export function calculateRecommendationScore(
  params: RecommendationParams,
): number;
```

**擬似コード**:

```
function calculateRecommendationScore(params):
  { successRate, latestScore, lastExecutedAt, referenceDate } = params

  // --- 要素1: 成功率スコア（重み 0.4）---
  successComponent = successRate  // 既に 0.0〜1.0

  // --- 要素2: 品質スコア正規化（重み 0.4）---
  // INT-M-02 解決: latestScore が null の場合は 0 として扱う
  effectiveScore = latestScore ?? 0
  normalizedScore = effectiveScore / 100  // 0〜100 → 0.0〜1.0

  // --- 要素3: 新近性スコア（重み 0.2）---
  if lastExecutedAt === null:
    recency = 0.0
  else:
    referenceMs = new Date(referenceDate ?? new Date().toISOString()).getTime()
    lastMs      = new Date(lastExecutedAt).getTime()
    daysSinceLastExecution = (referenceMs - lastMs) / (1000 * 60 * 60 * 24)
    recency = Math.max(0.0, 1.0 - daysSinceLastExecution / 90)

  // --- 重み付き合成（重みの合計 = 1.0）---
  score = successComponent * 0.4
        + normalizedScore   * 0.4
        + recency           * 0.2

  // --- 値域クランプ（浮動小数点誤差対策）---
  return Math.max(0.0, Math.min(1.0, score))
```

**境界値処理一覧**:

| 条件                           | 処理                                                 | recency / normalizedScore 値 | 最終スコア                  |
| ------------------------------ | ---------------------------------------------------- | ---------------------------- | --------------------------- |
| `lastExecutedAt === null`      | 実行履歴なし                                         | recency = `0.0`              | 最大 `0.8`（成功+品質のみ） |
| `daysSinceLastExecution >= 90` | `max(0.0, 1.0 - 90/90) = 0.0`                        | recency = `0.0`              | 成功+品質のみ               |
| `daysSinceLastExecution = 0`   | `1.0 - 0 = 1.0`                                      | recency = `1.0`              | 最大 `1.0`                  |
| `latestScore = null`           | INT-M-02: null → 0 として正規化                      | normalizedScore = `0.0`      | 成功+新近性のみ             |
| `latestScore = 0`              | `0 / 100 = 0.0`                                      | normalizedScore = `0.0`      | 成功+新近性のみ             |
| 浮動小数点誤差で 1.0 超過      | `clamp(score, 0.0, 1.0)` で吸収                      | —                            | 最大 `1.0`                  |
| 全要素最小値                   | successRate=0, latestScore=null, lastExecutedAt=null | —                            | `0.0`                       |

---

### 3-4. buildAggregateView

**目的**: 指定スキルのライフサイクルイベント一覧から `SkillAggregateView` を構築する。

```typescript
/**
 * スキルの集約ビューを構築する純粋関数。
 *
 * INT-M-02 解決:
 *   - latestScore は評価履歴がない場合 null を返す（0 ではない）。
 *
 * @param skillId - 対象スキルID（SkillName）
 * @param skillName - 表示名
 * @param events - 全イベント一覧（スキル絞り込みは本関数内で実施）
 * @returns SkillAggregateView
 */
export function buildAggregateView(
  skillId: string,
  skillName: string,
  events: SkillLifecycleEvent[],
): SkillAggregateView;
```

**擬似コード**:

```
function buildAggregateView(skillId, skillName, events):
  // Step 1: 対象スキルのイベントを抽出してタイムスタンプ昇順ソート
  sortedEvents = events
    .filter(e => e.skillId === skillId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Step 2: totalExecutions と successRate（直近30日）
  successRate = calculateSuccessRate(sortedEvents, 30)

  cutoff30d = Date.now() - 30 * 24 * 60 * 60 * 1000
  executionStartEvents30d = sortedEvents.filter(e =>
    e.eventType === "skill:executed" &&
    new Date(e.timestamp).getTime() >= cutoff30d
  )
  totalExecutions = executionStartEvents30d.length

  // Step 3: lastExecutedAt（実行関連イベントの最新タイムスタンプ）
  executionRelatedEvents = sortedEvents.filter(e =>
    ["skill:executed", "skill:execution_succeeded",
     "skill:execution_failed", "skill:execution_timeout"].includes(e.eventType)
  )
  lastExecutedAt = executionRelatedEvents.length > 0
    ? executionRelatedEvents[executionRelatedEvents.length - 1].timestamp
    : null

  // Step 4: scoreHistory（評価イベントから構築）
  allScoreHistory = sortedEvents
    .filter(e => ["skill:evaluated", "skill:score_updated"].includes(e.eventType))
    .flatMap(e => {
      // スコア値を metadata から抽出
      let score: number | undefined
      if ("score" in e.metadata && typeof e.metadata.score === "number"):
        score = e.metadata.score
      else if ("newScore" in e.metadata && typeof e.metadata.newScore === "number"):
        score = e.metadata.newScore
      // スコアがない場合はデータポイントを除外
      if (score === undefined):
        return []
      return [{
        timestamp: e.timestamp,
        score,
        version: e.skillVersion,
        eventId: e.id,
      }]
    })

  // scoreHistory は最新200件に制限（UI折れ線グラフ表示考慮）
  scoreHistory = allScoreHistory.slice(-200)

  // Step 5: latestScore（INT-M-02 解決: 評価なしは null）
  latestScore = scoreHistory.length > 0
    ? scoreHistory[scoreHistory.length - 1].score
    : null  // ← Phase 1 契約準拠（0 ではなく null）

  // Step 6: recentEvents（最新10件、新しい順）
  recentEvents = [...sortedEvents]
    .reverse()
    .slice(0, 10)

  // Step 7: trend（直近5回のスコア、windowSize=5）
  trend = calculateTrend(scoreHistory, 5)

  // Step 8: recommendationScore
  recommendationScore = calculateRecommendationScore({
    successRate,
    latestScore,    // null 許容（calculateRecommendationScore 内で 0 として処理）
    lastExecutedAt,
  })

  // Step 9: 集約ビューを組み立て
  return {
    skillId,
    skillName,
    totalExecutions,
    successRate,
    lastExecutedAt,
    latestScore,    // number | null（INT-M-02 解決）
    scoreHistory,
    recentEvents,
    trend,
    recommendationScore,
    aggregatedAt: new Date().toISOString(),
  }
```

**境界値処理一覧**:

| 条件                                           | 処理                                                                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `events` が空配列                              | totalExecutions=0, successRate=0.0, lastExecutedAt=null, **latestScore=null**, scoreHistory=[], recentEvents=[], trend="stable", recommendationScore=0.0 |
| 対象 skillId のイベントなし                    | フィルタ後が空配列のため上記と同一                                                                                                                       |
| 評価イベントのみ・実行イベントなし             | totalExecutions=0, successRate=0.0, lastExecutedAt=null のまま latestScore と scoreHistory は構築される                                                  |
| `skill:score_updated` に `newScore` がない場合 | `score` フィールドにフォールバック。両方ない場合はそのデータポイントを除外                                                                               |
| `scoreHistory.length < 5`                      | `calculateTrend()` が "stable" を返す（データ不足）                                                                                                      |

---

## 4. INT-M-02 解決のまとめ

Phase 3 指摘 `INT-M-02`（latestScore 型差分）の解決を以下に整理する。

| 箇所                             | Phase 2 設計（修正前）                       | Phase 5 実装仕様（修正後）                      | 根拠                          |
| -------------------------------- | -------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| `SkillAggregateView.latestScore` | `number`（0=未評価）                         | `number \| null`（null=未評価）                 | Phase 1 契約準拠              |
| `buildAggregateView` Step 5      | `scoreHistory.length === 0 ? 0 : last.score` | `scoreHistory.length === 0 ? null : last.score` | 未評価を 0 と区別するため     |
| `calculateRecommendationScore`   | `latestScore: number`                        | `latestScore: number \| null`                   | null は内部で 0 として正規化  |
| セレクタ `useSkillAggregateView` | latestScore の null チェック不要             | null ガードが必要                               | `P19 non-null assertion 禁止` |

**UI 表示への影響**:

- `latestScore === null` の場合: 「未評価」として表示する（"0点"ではない）
- `latestScore === 0` の場合: 「スコア: 0」として表示する
- null と 0 の区別により、ユーザーへの誤解を防ぐ

---

## 5. 配置先ファイル一覧

| ファイルパス                                                      | 内容                 |
| ----------------------------------------------------------------- | -------------------- |
| `packages/shared/src/skill/lifecycle-aggregate.ts`                | 全集約関数・型定義   |
| `packages/shared/src/skill/__tests__/lifecycle-aggregate.test.ts` | 各関数の境界値テスト |

---

## 6. テスト対象一覧

| テスト対象                                        | 優先度 | テストケース例                                        |
| ------------------------------------------------- | ------ | ----------------------------------------------------- |
| `calculateSuccessRate()` ゼロ除算                 | 高     | events=[], periodDays=30 → 0.0                        |
| `calculateSuccessRate()` 30日ウィンドウ境界       | 高     | 31日前のイベントが対象外になること                    |
| `calculateSuccessRate()` `Infinity` 全件          | 高     | INT-M-01 対応: periodDays=Infinity で全件対象         |
| `calculateTrend()` windowSize=5 未満              | 高     | scoreHistory.length=4 → "stable"                      |
| `calculateTrend()` 傾き閾値 ±0.5 境界値           | 高     | slope=0.5 → "stable", slope=0.51 → "improving"        |
| `calculateTrend()` 全スコア同一値                 | 中     | slope=0.0 → "stable"                                  |
| `calculateRecommendationScore()` null latestScore | 高     | INT-M-02 対応: latestScore=null → normalizedScore=0.0 |
| `calculateRecommendationScore()` recency 90日境界 | 高     | daysSinceLastExecution=90 → recency=0.0               |
| `buildAggregateView()` events 空配列              | 高     | latestScore=null (INT-M-02), recentEvents=[]          |
| `buildAggregateView()` 評価なし・実行あり         | 高     | latestScore=null, totalExecutions>0                   |
| `buildAggregateView()` scoreHistory 200件上限     | 中     | 201件の評価イベント → scoreHistory.length=200         |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 5 成果物3_
