# Task08向けメトリクスAPI実装仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 5                                                                                                                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                               |
| 作成日     | 2026-03-16                                                                                                                                            |
| 入力成果物 | `outputs/phase-2/publish-metrics-interface-design.md`、`outputs/phase-2/data-flow-design.md`、`outputs/phase-3/gate-decision.md`                      |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-5/publish-metrics-api-impl-spec.md` |
| 配置先     | `packages/shared/src/skill/publish-readiness.ts`、`apps/desktop/src/main/handlers/metricsHandlers.ts`                                                 |

---

## 1. 概要

本ドキュメントは Task08（TASK-SKILL-LIFECYCLE-08: 公開・互換性管理）向けのメトリクスAPI実装仕様を定義する。

Task07 は**データ提供**の責務を持ち、Task08 は**判断ロジック**の責務を持つ。この契約境界を明確にした上で、Task07 が提供する以下のAPIを仕様化する。

1. `buildPublishReadinessMetrics()` - 公開準備度メトリクス計算
2. `buildSkillHealthReport()` - スキル総合ヘルスレポート構築
3. IPC ハンドラ仕様（`skill:getPublishReadiness` / `skill:getSkillHealthReport`）

Phase 3 MINOR 指摘 **REQ-M-01**（minUsageCount 差異: Phase 1 の3 vs Phase 2 の5）を本仕様書で解決する。Phase 2 値（5）を採用する。

---

## 2. 型定義 (`publish-readiness.ts`)

### 2-1. PublishReadinessMetrics

```typescript
// packages/shared/src/skill/publish-readiness.ts

import type { SkillLifecycleEvent } from "./lifecycle-types";
import type { SkillFeedback, SkillMetrics } from "./feedback-types";

/**
 * Task07 が Task08 へ提供する公開準備度メトリクス。
 * データ収集・計算は Task07 の責務。
 * readinessLevel の判定は Task08 の責務（本型には含まない）。
 */
export interface PublishReadinessMetrics {
  /** スキル識別子（SkillName 形式） */
  skillId: string;
  /** スキル名（表示用） */
  skillName: string;
  /**
   * 最新の評価スコア（0-100）。
   * 評価未実施の場合は null（INT-M-02 準拠）。
   */
  qualityScore: number | null;
  /**
   * 直近 stabilityWindowSize 回の実行成功率（0.0-1.0）。
   * 実行履歴がない場合は null。
   * INT-M-01 対応: 件数ベースの成功率を使用。
   */
  stabilityScore: number | null;
  /** 安定性計算に使用した実行履歴件数（stabilityWindowSize 以下の実績値） */
  stabilityWindowSize: number;
  /**
   * 累計実行回数（全期間の skill:executed イベント総数）。
   * REQ-M-01 対応: minUsageCount=5 と比較される値。
   */
  usageCount: number;
  /** severity='critical' のフィードバックアクションが存在するか */
  hasCriticalFeedback: boolean;
  /** 最終評価日時（ISO 8601 UTC）。評価未実施は null */
  lastEvaluatedAt: string | null;
  /** メトリクス計算日時（ISO 8601 UTC） */
  calculatedAt: string;
}
```

### 2-2. PublishThresholds

```typescript
/**
 * Task08 が公開判断に使用する閾値セット。
 * Task07 が DEFAULT_PUBLISH_THRESHOLDS を提供し、Task08 がオーバーライド可能。
 *
 * REQ-M-01 解決: minUsageCount は Phase 2 値（5）で統一。
 */
export interface PublishThresholds {
  /** 公開に必要な最低品質スコア（デフォルト: 70） */
  minQualityScore: number;
  /** 公開に必要な最低安定性スコア（デフォルト: 0.8） */
  minStabilityScore: number;
  /** 安定性計算に使用する直近N回の実行数（デフォルト: 10） */
  stabilityWindowSize: number;
  /**
   * 公開に必要な最低実行回数（デフォルト: 5）。
   * REQ-M-01 解決: Phase 2 値（5）で統一。統計的信頼性の観点から5回以上を要求。
   */
  minUsageCount: number;
}

/**
 * Task07 が提供するデフォルト閾値。
 * REQ-M-01 解決: minUsageCount = 5（Phase 2 値で統一）。
 */
export const DEFAULT_PUBLISH_THRESHOLDS: Readonly<PublishThresholds> = {
  minQualityScore: 70,
  minStabilityScore: 0.8,
  stabilityWindowSize: 10,
  minUsageCount: 5,
} as const;
```

### 2-3. ReadinessLevel / ReadinessResult

```typescript
/**
 * readinessLevel の3段階判定。
 * Task08 が算出する（Task07 は参考フローのみ提供）。
 */
export type ReadinessLevel = "not_ready" | "review_needed" | "ready";

/** readinessLevel 判定理由コード */
export type ReadinessReasonCode =
  | "CRITICAL_FEEDBACK_EXISTS"
  | "INSUFFICIENT_USAGE"
  | "QUALITY_SCORE_BELOW_THRESHOLD"
  | "STABILITY_BELOW_THRESHOLD"
  | null;

/**
 * readinessLevel 判定結果。
 * Task08 が PublishReadinessMetrics + PublishThresholds から算出する。
 * Task07 はこの型を定義のみ行い、判定ロジック本体は実装しない。
 */
export interface ReadinessResult {
  level: ReadinessLevel;
  /** not_ready / review_needed の場合の理由コード。ready の場合は null */
  reason: ReadinessReasonCode;
}
```

### 2-4. SkillHealthReport

```typescript
/**
 * スキル総合ヘルスレポート。
 * Task08 またはスキル詳細画面が要求する統合ビュー。
 */
export interface SkillHealthReport {
  /** スキル識別子 */
  skillId: string;
  /** スキル名（表示用） */
  skillName: string;
  /** 公開準備度メトリクス */
  publishReadiness: PublishReadinessMetrics;
  /** 直近30日の実行サマリー */
  recentExecutionSummary: RecentExecutionSummary;
  /** スコア推移（評価イベント昇順） */
  scoreHistory: ScoreHistoryEntry[];
  /** フィードバックサマリー */
  feedbackSummary: FeedbackSummary;
  /** レポート生成日時（ISO 8601 UTC） */
  generatedAt: string;
}

/** 直近30日の実行サマリー */
export interface RecentExecutionSummary {
  /** 総実行回数 */
  totalExecutions: number;
  /** 成功回数 */
  successCount: number;
  /** 失敗回数 */
  failureCount: number;
  /** タイムアウト回数 */
  timeoutCount: number;
  /** 平均実行時間（ミリ秒）。実行0件時は null */
  avgDurationMs: number | null;
}

/** スコア推移の1エントリ */
export interface ScoreHistoryEntry {
  /** 評価日時（ISO 8601 UTC） */
  evaluatedAt: string;
  /** スコア（0-100） */
  score: number;
  /** スキルバージョン（semver） */
  version: string;
}

/** フィードバックサマリー */
export interface FeedbackSummary {
  /** 全フィードバック件数 */
  total: number;
  /** severity='critical' のアクション件数 */
  criticalCount: number;
  /** severity='warning' のアクション件数 */
  warningCount: number;
  /** 平均ユーザーレーティング（1-5）。未評価は null */
  avgUserRating: number | null;
}
```

---

## 3. buildPublishReadinessMetrics 関数仕様

### 3-1. シグネチャ

```typescript
/**
 * 指定スキルの公開準備度メトリクスを計算する。
 * Task07 の責務: データ収集・計算のみ。判定ロジックは Task08 が実装。
 *
 * INT-M-01 対応: stabilityScore は件数ベース（直近 N 件）で計算。
 * REQ-M-01 対応: usageCount は minUsageCount=5 と比較される。
 *
 * @param skillId - 対象スキル識別子（SkillName 形式）
 * @param skillName - 表示名
 * @param events - 対象スキルの全ライフサイクルイベント
 * @param feedbacks - 対象スキルの全フィードバック
 * @param thresholds - 閾値（stabilityWindowSize の取得に使用。省略時は DEFAULT_PUBLISH_THRESHOLDS）
 * @returns PublishReadinessMetrics
 */
export function buildPublishReadinessMetrics(
  skillId: string,
  skillName: string,
  events: SkillLifecycleEvent[],
  feedbacks: SkillFeedback[],
  thresholds?: PublishThresholds,
): PublishReadinessMetrics;
```

### 3-2. 擬似コード

```
function buildPublishReadinessMetrics(skillId, skillName, events, feedbacks,
                                       thresholds = DEFAULT_PUBLISH_THRESHOLDS):

  // Step 1: qualityScore - 最新の評価イベントのスコア
  evaluationEvents = events
    .filter(e => e.skillId === skillId &&
      ["skill:evaluated", "skill:score_updated"].includes(e.eventType))
    .sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp))

  qualityScore = null
  lastEvaluatedAt = null

  if evaluationEvents.length > 0:
    lastEvalEvent = evaluationEvents[evaluationEvents.length - 1]
    lastEvaluatedAt = lastEvalEvent.timestamp

    // P49 対策: in 演算子で実行時型チェック
    if "score" in lastEvalEvent.metadata && typeof lastEvalEvent.metadata.score === "number":
      qualityScore = lastEvalEvent.metadata.score
    else if "newScore" in lastEvalEvent.metadata && typeof lastEvalEvent.metadata.newScore === "number":
      qualityScore = lastEvalEvent.metadata.newScore

  // Step 2: stabilityScore - 直近 N 件の成功率（件数ベース: INT-M-01 対応）
  executionStartEvents = events
    .filter(e => e.skillId === skillId && e.eventType === "skill:executed")
    .sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp))  // 降順
    .slice(0, thresholds.stabilityWindowSize)  // 直近 N 件

  actualWindowSize = executionStartEvents.length

  if actualWindowSize === 0:
    stabilityScore = null
  else:
    startIds = new Set(executionStartEvents.map(e => e.id))
    successCount = events.filter(e =>
      e.eventType === "skill:execution_succeeded" &&
      e.parentEventId !== null &&
      startIds.has(e.parentEventId)
    ).length
    stabilityScore = successCount / actualWindowSize

  // Step 3: usageCount - 全期間の skill:executed 件数
  usageCount = events.filter(e =>
    e.skillId === skillId && e.eventType === "skill:executed"
  ).length

  // Step 4: hasCriticalFeedback
  hasCriticalFeedback = checkForCriticalFeedback(skillId, events, feedbacks)

  // Step 5: 組み立て
  return {
    skillId,
    skillName,
    qualityScore,
    stabilityScore,
    stabilityWindowSize: actualWindowSize,
    usageCount,
    hasCriticalFeedback,
    lastEvaluatedAt,
    calculatedAt: new Date().toISOString(),
  }
```

### 3-3. hasCriticalFeedback 判定ロジック

```
function checkForCriticalFeedback(skillId, events, feedbacks):
  // SkillMetrics を構築
  successRate30d = calculateSuccessRate(
    events.filter(e => e.skillId === skillId),
    30  // periodDays
  )

  latestScore = extractLatestScore(
    events.filter(e => e.skillId === skillId)
  )  // number | null

  // ユーザーレーティング平均
  userRatings = feedbacks
    .filter(f => f.skillId === skillId &&
      f.feedbackType === "user_rating" &&
      typeof f.value === "number")
    .map(f => f.value as number)

  avgUserRating = userRatings.length > 0
    ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
    : null

  pendingFeedbacks = feedbacks.filter(f =>
    f.skillId === skillId && f.status === "pending"
  )

  metrics: SkillMetrics = {
    skillId,
    successRate: successRate30d > 0 ? successRate30d : null,
    latestScore,
    averageUserRating: avgUserRating,
    pendingFeedbackCount: pendingFeedbacks.length,
    totalExecutions: events.filter(e =>
      e.skillId === skillId && e.eventType === "skill:executed"
    ).length,
  }

  // evaluateFeedbackRules を実行し critical アクションの有無を判定
  actions = evaluateFeedbackRules(skillId, metrics, pendingFeedbacks)
  return actions.some(a => a.severity === "critical")
```

### 3-4. 境界値処理

| 条件                              | qualityScore | stabilityScore | usageCount | hasCriticalFeedback |
| --------------------------------- | :----------: | :------------: | :--------: | :-----------------: |
| 評価イベント 0 件                 |    `null`    |       -        |     -      |          -          |
| 実行イベント 0 件                 |      -       |     `null`     |    `0`     |          -          |
| 実行件数 < stabilityWindowSize    |      -       |     実績値     |   実績値   |          -          |
| フィードバック 0 件               |      -       |       -        |     -      |       `false`       |
| 全条件最小値                      |    `null`    |     `null`     |    `0`     |       `false`       |
| metadata に score/newScore がない |    `null`    |       -        |     -      |          -          |

---

## 4. readinessLevel 判定（Task08 の責務 - 参考フロー）

Task07 は判定ロジックを**実装しない**。以下は Task08 向けの参考フローである。

### 4-1. 判定アルゴリズム

```
入力: metrics: PublishReadinessMetrics, thresholds: PublishThresholds

Step 1: critical フィードバックチェック（即時 not_ready）
  if metrics.hasCriticalFeedback === true:
    return { level: "not_ready", reason: "CRITICAL_FEEDBACK_EXISTS" }

Step 2: 最低実行回数チェック（REQ-M-01: minUsageCount=5）
  if metrics.usageCount < thresholds.minUsageCount:
    return { level: "not_ready", reason: "INSUFFICIENT_USAGE" }

Step 3: 品質スコアチェック
  qualityScore = metrics.qualityScore ?? 0
  if qualityScore < thresholds.minQualityScore:
    return { level: "not_ready", reason: "QUALITY_SCORE_BELOW_THRESHOLD" }

Step 4: 安定性チェック
  stabilityScore = metrics.stabilityScore ?? 0
  if stabilityScore < thresholds.minStabilityScore:
    return { level: "review_needed", reason: "STABILITY_BELOW_THRESHOLD" }

Step 5: 全条件クリア
  return { level: "ready", reason: null }
```

### 4-2. readinessLevel 判定マトリクス

| readinessLevel  | 条件（すべて満たす場合）                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| `ready`         | qualityScore >= 70 かつ stabilityScore >= 0.8 かつ usageCount >= 5 かつ !hasCriticalFeedback |
| `review_needed` | qualityScore >= 70 かつ usageCount >= 5 かつ !hasCriticalFeedback かつ stabilityScore < 0.8  |
| `not_ready`     | 上記以外（hasCriticalFeedback / usageCount < 5 / qualityScore < 70 のいずれか）              |

### 4-3. REQ-M-01 解決のまとめ

| 項目              | Phase 1 値 | Phase 2 値 | 本仕様書（確定値） | 根拠                                                    |
| ----------------- | :--------: | :--------: | :----------------: | ------------------------------------------------------- |
| minUsageCount     |     3      |     5      |       **5**        | 統計的信頼性の観点から5回以上の実行で安定性を評価すべき |
| minQualityScore   |     70     |     70     |       **70**       | Phase 1/2 で一致                                        |
| minStabilityScore |    0.8     |    0.8     |      **0.8**       | Phase 1/2 で一致                                        |

---

## 5. buildSkillHealthReport 関数仕様

### 5-1. シグネチャ

```typescript
/**
 * スキル総合ヘルスレポートを構築する。
 * PublishReadinessMetrics + 実行サマリー + スコア推移 + フィードバックサマリーを統合。
 *
 * @param skillId - 対象スキル識別子
 * @param skillName - 表示名
 * @param events - 全ライフサイクルイベント
 * @param feedbacks - 全フィードバック
 * @param thresholds - 閾値（省略時は DEFAULT_PUBLISH_THRESHOLDS）
 * @returns SkillHealthReport
 */
export function buildSkillHealthReport(
  skillId: string,
  skillName: string,
  events: SkillLifecycleEvent[],
  feedbacks: SkillFeedback[],
  thresholds?: PublishThresholds,
): SkillHealthReport;
```

### 5-2. 擬似コード

```
function buildSkillHealthReport(skillId, skillName, events, feedbacks,
                                 thresholds = DEFAULT_PUBLISH_THRESHOLDS):

  // Step 1: PublishReadinessMetrics
  publishReadiness = buildPublishReadinessMetrics(
    skillId, skillName, events, feedbacks, thresholds
  )

  // Step 2: recentExecutionSummary（直近30日）
  cutoff30d = Date.now() - 30 * 24 * 60 * 60 * 1000
  recentExecEvents = events.filter(e =>
    e.skillId === skillId &&
    e.category === "execution" &&
    toMillis(e.timestamp) >= cutoff30d
  )

  totalExecutions = recentExecEvents.filter(
    e => e.eventType === "skill:executed"
  ).length

  successCount = recentExecEvents.filter(
    e => e.eventType === "skill:execution_succeeded"
  ).length

  failureCount = recentExecEvents.filter(
    e => e.eventType === "skill:execution_failed"
  ).length

  timeoutCount = recentExecEvents.filter(
    e => e.eventType === "skill:execution_timeout"
  ).length

  // 平均実行時間（P49 対策: in 演算子で metadata.durationMs をチェック）
  durations = recentExecEvents
    .filter(e =>
      ["skill:execution_succeeded", "skill:execution_failed",
       "skill:execution_timeout"].includes(e.eventType) &&
      "durationMs" in e.metadata &&
      typeof e.metadata.durationMs === "number"
    )
    .map(e => e.metadata.durationMs as number)

  avgDurationMs = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : null

  recentExecutionSummary = {
    totalExecutions, successCount, failureCount, timeoutCount, avgDurationMs
  }

  // Step 3: scoreHistory（評価イベント昇順）
  scoreHistory = events
    .filter(e =>
      e.skillId === skillId &&
      ["skill:evaluated", "skill:score_updated"].includes(e.eventType))
    .sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp))
    .flatMap(e => {
      // P49 対策: in 演算子で実行時型チェック
      let score: number | undefined
      if "score" in e.metadata && typeof e.metadata.score === "number":
        score = e.metadata.score
      else if "newScore" in e.metadata && typeof e.metadata.newScore === "number":
        score = e.metadata.newScore
      if score === undefined:
        return []
      return [{ evaluatedAt: e.timestamp, score, version: e.skillVersion }]
    })

  // Step 4: feedbackSummary
  skillFeedbacks = feedbacks.filter(f => f.skillId === skillId)

  // ルールエンジン結果から critical/warning カウント取得
  metrics = buildSkillMetricsFromEvents(skillId, events, feedbacks)
  pendingFbs = skillFeedbacks.filter(f => f.status === "pending")
  actions = evaluateFeedbackRules(skillId, metrics, pendingFbs)

  criticalCount = actions.filter(a => a.severity === "critical").length
  warningCount = actions.filter(a => a.severity === "warning").length

  // 平均ユーザーレーティング
  userRatings = skillFeedbacks
    .filter(f => f.feedbackType === "user_rating" && typeof f.value === "number")
    .map(f => f.value as number)

  avgUserRating = userRatings.length > 0
    ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
    : null

  feedbackSummary = {
    total: skillFeedbacks.length,
    criticalCount,
    warningCount,
    avgUserRating,
  }

  // Step 5: 組み立て
  return {
    skillId,
    skillName,
    publishReadiness,
    recentExecutionSummary,
    scoreHistory,
    feedbackSummary,
    generatedAt: new Date().toISOString(),
  }
```

---

## 6. IPC ハンドラ仕様

### 6-1. チャンネル一覧

| チャンネル名                 | 定数名                          | 方向             | 説明                         |
| ---------------------------- | ------------------------------- | ---------------- | ---------------------------- |
| `skill:getPublishReadiness`  | `SKILL_GET_PUBLISH_READINESS`   | Renderer -> Main | 公開準備度メトリクス取得     |
| `skill:getSkillHealthReport` | `SKILL_GET_SKILL_HEALTH_REPORT` | Renderer -> Main | スキル総合ヘルスレポート取得 |

### 6-2. IPC_CHANNELS 定数追加

```typescript
// packages/shared/src/ipc/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存 ...
  SKILL_GET_PUBLISH_READINESS: "skill:getPublishReadiness",
  SKILL_GET_SKILL_HEALTH_REPORT: "skill:getSkillHealthReport",
} as const;
```

### 6-3. skill:getPublishReadiness ハンドラ

```typescript
// apps/desktop/src/main/handlers/metricsHandlers.ts

/**
 * 公開準備度メトリクスを取得する IPC ハンドラ。
 *
 * P42 バリデーション（3段階）:
 *   Stage 1: typeof チェック
 *   Stage 2: 空文字列チェック
 *   Stage 3: トリム後空文字列チェック
 *
 * P44/P45 対策: 引数名は skillName（セマンティクスに一致する命名）。
 */
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_PUBLISH_READINESS,
  async (event, skillName: unknown) => {
    // Stage 1: 型チェック
    if (typeof skillName !== "string") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must be a string",
        },
      };
    }
    // Stage 2: 空文字列チェック
    if (skillName === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be empty",
        },
      };
    }
    // Stage 3: トリム後空文字列チェック
    if (skillName.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be blank",
        },
      };
    }

    try {
      const trimmedName = skillName.trim();

      // SQLite からイベントとフィードバックを取得
      const events = await lifecycleEventStore.getEventsBySkill(trimmedName);
      const feedbacks = await feedbackStore.getFeedbacksBySkill(trimmedName);

      const metrics = buildPublishReadinessMetrics(
        trimmedName,
        trimmedName,
        events,
        feedbacks,
      );

      return { success: true, data: metrics };
    } catch (error) {
      // エラーメッセージのサニタイズ（PII 除外: security-principles.md 準拠）
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? sanitizeErrorMessage(error.message)
              : "Unknown error occurred",
        },
      };
    }
  },
);
```

### 6-4. skill:getSkillHealthReport ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_SKILL_HEALTH_REPORT,
  async (event, skillName: unknown) => {
    // P42 バリデーション: skill:getPublishReadiness と同一の3段階を適用
    if (typeof skillName !== "string") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must be a string",
        },
      };
    }
    if (skillName === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be empty",
        },
      };
    }
    if (skillName.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be blank",
        },
      };
    }

    try {
      const trimmedName = skillName.trim();

      const events = await lifecycleEventStore.getEventsBySkill(trimmedName);
      const feedbacks = await feedbackStore.getFeedbacksBySkill(trimmedName);

      const report = buildSkillHealthReport(
        trimmedName,
        trimmedName,
        events,
        feedbacks,
      );

      return { success: true, data: report };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? sanitizeErrorMessage(error.message)
              : "Unknown error occurred",
        },
      };
    }
  },
);
```

---

## 7. Task08 契約境界

### 7-1. 責務分担マトリクス

| 責務項目                            | Task07 の責務                  | Task08 の責務    |
| ----------------------------------- | ------------------------------ | ---------------- |
| ライフサイクルイベントの記録        | 実装・管理                     | 参照のみ         |
| SkillFeedback の保存                | 実装・管理                     | 参照のみ         |
| `qualityScore` の計算               | 実装（評価イベントから抽出）   | 閾値比較のみ     |
| `stabilityScore` の計算             | 実装（実行イベントから算出）   | 閾値比較のみ     |
| `usageCount` の集計                 | 実装（実行イベントをカウント） | 閾値比較のみ     |
| `hasCriticalFeedback` の判定        | 実装（ルールエンジン経由）     | 公開ブロック判断 |
| `DEFAULT_PUBLISH_THRESHOLDS` の提供 | 実装（定数として公開）         | オーバーライド   |
| `readinessLevel` の判定             | **参考フロー提供のみ**         | **実装・決定**   |
| `PublishThresholds` の最終設定      | デフォルト値提供のみ           | 最終値決定・管理 |
| 公開アクション（UI・IPC）           | 対象外                         | 実装             |
| Skill Center との連携               | 対象外                         | 実装             |

### 7-2. 設計上の不変条件

1. Task07 は `PublishReadinessMetrics` を提供するが、`readinessLevel` フィールドを持たない。`readinessLevel` の算出は Task08 の責務とする
2. `hasCriticalFeedback = true` の場合の公開ブロックは安全側固定。Task08 はこれをオーバーライドしない
3. IPC チャンネル名は `IPC_CHANNELS` 定数で管理し、文字列リテラルを直接使用しない（P27 対策）

---

## 8. 配置先ファイル一覧

| ファイルパス                                                       | 内容                                         |
| ------------------------------------------------------------------ | -------------------------------------------- |
| `packages/shared/src/skill/publish-readiness.ts`                   | 型定義・計算関数・閾値定数                   |
| `apps/desktop/src/main/handlers/metricsHandlers.ts`                | IPC ハンドラ                                 |
| `packages/shared/src/skill/__tests__/publish-readiness.test.ts`    | 計算関数テスト                               |
| `apps/desktop/src/main/handlers/__tests__/metricsHandlers.test.ts` | IPC ハンドラテスト（P42 バリデーション含む） |

---

## 9. テスト対象一覧

| テスト対象                                                     | テストファイル              | 優先度 |
| -------------------------------------------------------------- | --------------------------- | ------ |
| `buildPublishReadinessMetrics` 基本ケース                      | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` イベント0件: qualityScore=null  | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` 実行0件: stabilityScore=null    | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` usageCount=5 境界値（REQ-M-01） | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` hasCriticalFeedback=true        | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` 件数ベース stabilityScore       | `publish-readiness.test.ts` | 高     |
| `buildPublishReadinessMetrics` metadata の P49 型ガード        | `publish-readiness.test.ts` | 中     |
| `buildSkillHealthReport` 基本ケース                            | `publish-readiness.test.ts` | 高     |
| `buildSkillHealthReport` avgDurationMs 計算（P49 型ガード）    | `publish-readiness.test.ts` | 中     |
| `buildSkillHealthReport` avgUserRating null ケース             | `publish-readiness.test.ts` | 中     |
| `buildSkillHealthReport` スコア欠損時の scoreHistory 除外      | `publish-readiness.test.ts` | 中     |
| IPC `skill:getPublishReadiness` P42 Stage 1-3                  | `metricsHandlers.test.ts`   | 高     |
| IPC `skill:getPublishReadiness` 正常応答                       | `metricsHandlers.test.ts`   | 高     |
| IPC `skill:getSkillHealthReport` P42 Stage 1-3                 | `metricsHandlers.test.ts`   | 高     |
| IPC エラー時のサニタイズ（PII 除外確認）                       | `metricsHandlers.test.ts`   | 中     |
| `DEFAULT_PUBLISH_THRESHOLDS.minUsageCount === 5`（REQ-M-01）   | `publish-readiness.test.ts` | 高     |

---

## 10. re-export

```typescript
// packages/shared/src/skill/index.ts に追加
export type {
  PublishReadinessMetrics,
  PublishThresholds,
  ReadinessLevel,
  ReadinessReasonCode,
  ReadinessResult,
  SkillHealthReport,
  RecentExecutionSummary,
  ScoreHistoryEntry,
  FeedbackSummary,
} from "./publish-readiness";

export {
  DEFAULT_PUBLISH_THRESHOLDS,
  buildPublishReadinessMetrics,
  buildSkillHealthReport,
} from "./publish-readiness";
```

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 5 成果物5_
