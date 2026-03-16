# テストデータファクトリ定義

## メタ情報

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 4                                                                                                                                                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                                                               |
| 作成日     | 2026-03-16                                                                                                                                                                            |
| ステータス | TDD Red フェーズ（全テストケースは実装前に作成され、実行時点では全て失敗する）                                                                                                        |
| 入力成果物 | `outputs/phase-2/event-model-design.md`, `outputs/phase-2/aggregate-view-design.md`, `outputs/phase-2/feedback-loop-design.md`, `outputs/phase-2/publish-metrics-interface-design.md` |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-4/test-data-factory-definition.md`                                  |
| 配置先     | `packages/shared/src/skill/__test-utils__/factories.ts`                                                                                                                               |

> **Red フェーズの明示**
> 本仕様書に記載する全ファクトリ関数は、Phase 5 実装開始前の時点では **存在しない（Red 状態）** ことを意図している。テスト仕様書（event-model-test-spec.md 等）が参照する `createMockLifecycleEvent`、`createMockFeedback` 等のファクトリを、このファイルに基づいて Phase 5 以前に実装することで、テストの実行環境を整える。

---

## 1. ファクトリファイルの配置と設計方針

### 配置先

```
packages/shared/src/skill/__test-utils__/factories.ts
```

### 設計方針

1. **overrides パターン**: 全ファクトリは `overrides?: Partial<T>` を受け取り、デフォルト値を上書きできる
2. **決定論的デフォルト値**: 日時は `"2026-03-16T07:17:53.000Z"` を基準に固定値を使用（P13対策：タイマー依存を排除）
3. **UUID 生成**: テスト内で一意性が必要な場合は `crypto.randomUUID()` を使用
4. **型安全性**: TypeScript の型定義を strict モードで適用し、`any` 型を使用しない

---

## 2. TypeScript インターフェース定義

```typescript
// packages/shared/src/skill/__test-utils__/factory-types.ts

import type {
  SkillLifecycleEvent,
  SkillEventType,
  EventCategory,
  EventSource,
} from "../lifecycle/types";
import type {
  SkillFeedback,
  ImprovementSuggestion,
} from "../../types/skill-feedback";
import type {
  SkillAggregateView,
  ScoreDataPoint,
  Trend,
} from "../lifecycle/aggregate-types";
import type { PublishReadinessMetrics } from "../../types/skill-lifecycle";

// ================================================================
// ファクトリオプション型定義
// ================================================================

/**
 * createMockLifecycleEvent のオプション型。
 * category と eventType を組み合わせて整合性のある metadata を生成する。
 */
export interface CreateMockLifecycleEventOptions extends Partial<
  Omit<SkillLifecycleEvent, "metadata">
> {
  /** カテゴリ別 metadata の上書き（部分的） */
  metadata?: Record<string, unknown>;
}

/** createMockFeedback のオプション型 */
export type CreateMockFeedbackOptions = Partial<SkillFeedback>;

/** createMockAggregateView のオプション型 */
export type CreateMockAggregateViewOptions = Partial<SkillAggregateView>;

/** createMockPublishReadinessMetrics のオプション型 */
export type CreateMockPublishReadinessMetricsOptions =
  Partial<PublishReadinessMetrics>;

/** createMockScoreDataPoint のオプション型 */
export type CreateMockScoreDataPointOptions = Partial<ScoreDataPoint>;

/**
 * createExecutionEventChain のオプション型。
 * 実行開始・成功・失敗イベントのチェーンを一括生成する補助ファクトリ用。
 */
export interface CreateExecutionEventChainOptions {
  /** 総実行開始回数 */
  totalExecutions: number;
  /** succeeded を生成する件数（totalExecutions 以下） */
  successCount: number;
  /** execution_failed を生成する件数（totalExecutions - successCount 以下） */
  failureCount: number;
  /** 基準日時から何日以内に収めるか（デフォルト: 30） */
  withinDays?: number;
  /** スキルID（デフォルト: "test-skill"） */
  skillId?: string;
}

/**
 * createExecutionEventChain の返値型
 */
export interface ExecutionEventChain {
  /** 全イベント（executed + succeeded + failed）を結合した配列 */
  events: SkillLifecycleEvent[];
  /** skill:executed イベントのみ */
  executedEvents: SkillLifecycleEvent[];
  /** skill:execution_succeeded イベントのみ */
  succeededEvents: SkillLifecycleEvent[];
  /** skill:execution_failed イベントのみ */
  failedEvents: SkillLifecycleEvent[];
}
```

---

## 3. ファクトリ関数定義

### 3-1. `createMockLifecycleEvent`

```typescript
/**
 * SkillLifecycleEvent のモックオブジェクトを生成する。
 *
 * デフォルト値:
 * - id: crypto.randomUUID()
 * - skillId: "test-skill" (SkillName branded type)
 * - skillVersion: "1.0.0"
 * - eventType: "skill:created"
 * - category: "creation"
 * - timestamp: "2026-03-16T07:17:53.000Z"
 * - userId: "test-user-uuid"
 * - source: "main"
 * - parentEventId: null
 * - metadata: category に応じたデフォルト metadata
 *
 * @example
 * // creation カテゴリのデフォルトイベント
 * const event = createMockLifecycleEvent();
 *
 * // execution カテゴリの成功イベント
 * const successEvent = createMockLifecycleEvent({
 *   category: "execution",
 *   eventType: "skill:execution_succeeded",
 *   parentEventId: executedEvent.id,
 * });
 */
export function createMockLifecycleEvent(
  overrides?: CreateMockLifecycleEventOptions,
): SkillLifecycleEvent;
```

#### カテゴリ別デフォルト metadata

| category        | eventType（デフォルト）       | デフォルト metadata                                                                                                                                                                                                                                                                |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"creation"`    | `"skill:created"`             | `{ skillName: "test-skill", creationMethod: "manual", templateId: null, initialPromptLength: 100, tags: [], isPublic: false }`                                                                                                                                                     |
| `"creation"`    | `"skill:draft_saved"`         | `{ draftNumber: 1, promptLength: 100, changedFields: ["prompt"], autoSaved: false }`                                                                                                                                                                                               |
| `"creation"`    | `"skill:template_applied"`    | `{ templateId: "template-uuid", templateName: "Basic Template", templateVersion: "1.0.0", overriddenFields: [] }`                                                                                                                                                                  |
| `"evaluation"`  | `"skill:evaluated"`           | `{ score: 75, evaluatorModel: "claude-sonnet-4", evaluationDurationMs: 3000, scoringDimensions: [{ dimension: "clarity", score: 75, weight: 0.6 }, { dimension: "completeness", score: 75, weight: 0.4 }], promptTokensUsed: 500, completionTokensUsed: 200, evaluationRound: 1 }` |
| `"evaluation"`  | `"skill:score_updated"`       | `{ previousScore: 65, newScore: 75, scoreDelta: 10, updateReason: "re_evaluation", updatedBy: "test-user-uuid" }`                                                                                                                                                                  |
| `"evaluation"`  | `"skill:gate_passed"`         | `{ score: 75, thresholdScore: 70, gateId: "publish_gate", unlockedActions: ["publish"] }`                                                                                                                                                                                          |
| `"evaluation"`  | `"skill:gate_failed"`         | `{ score: 60, thresholdScore: 70, gateId: "publish_gate", scoreDeficit: 10, blockedActions: ["publish"], suggestedImprovements: [] }`                                                                                                                                              |
| `"execution"`   | `"skill:executed"`            | `{ executionId: "exec-uuid", triggerSource: "user_initiated", inputTokenCount: 200, executionContext: { chatId: null, taskId: null }, modelId: "claude-sonnet-4", permissionMode: "default" }`                                                                                     |
| `"execution"`   | `"skill:execution_succeeded"` | `{ executionId: "exec-uuid", durationMs: 5000, outputTokenCount: 300, totalTokenCount: 500, toolCallCount: 2, userSatisfactionHint: null }`                                                                                                                                        |
| `"execution"`   | `"skill:execution_failed"`    | `{ executionId: "exec-uuid", durationMs: 2000, errorCode: "TOOL_CALL_FAILED", errorCategory: "external_service", errorMessage: "Mock error", retryable: true, retryCount: 0 }`                                                                                                     |
| `"execution"`   | `"skill:execution_timeout"`   | `{ executionId: "exec-uuid", timeoutMs: 30000, partialOutputTokenCount: 50 }`                                                                                                                                                                                                      |
| `"improvement"` | `"skill:improved"`            | `{ previousVersion: "1.0.0", newVersion: "1.1.0", changedSections: ["prompt_template"], improvementSummary: "テスト用改善" }`                                                                                                                                                      |
| `"improvement"` | `"skill:rollback"`            | `{ targetVersion: "1.0.0", rollbackReason: "quality_regression", previousVersion: "1.1.0" }`                                                                                                                                                                                       |
| `"reuse"`       | `"skill:reused"`              | `{ reuseContext: "test-context", adaptationRequired: false, adaptationNotes: null }`                                                                                                                                                                                               |

---

### 3-2. `createMockFeedback`

```typescript
/**
 * SkillFeedback のモックオブジェクトを生成する。
 *
 * デフォルト値:
 * - id: crypto.randomUUID()
 * - skillId: "test-skill"
 * - feedbackType: "user_rating"
 * - value: 4
 * - sourceEventId: "source-event-uuid"
 * - createdAt: "2026-03-16T07:17:53.000Z"
 * - processedAt: undefined
 * - status: "pending"
 *
 * @example
 * // デフォルト（user_rating: 4, pending）
 * const feedback = createMockFeedback();
 *
 * // improvement_suggestion フィードバック
 * const suggestionFeedback = createMockFeedback({
 *   feedbackType: "improvement_suggestion",
 *   value: {
 *     targetSection: "prompt_template",
 *     suggestion: "プロンプトを見直してください",
 *     priority: "high",
 *   },
 * });
 *
 * // applied 状態のフィードバック
 * const appliedFeedback = createMockFeedback({
 *   status: "applied",
 *   processedAt: "2026-03-16T08:00:00.000Z",
 * });
 */
export function createMockFeedback(
  overrides?: CreateMockFeedbackOptions,
): SkillFeedback;
```

#### 種別別デフォルト value

| feedbackType               | デフォルト value                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `"auto_metric"`            | `0.75`（number）                                                                                                        |
| `"user_rating"`            | `4`（number, 1-5）                                                                                                      |
| `"user_text"`              | `"テスト用フィードバックテキストです"`（string）                                                                        |
| `"improvement_suggestion"` | `{ targetSection: "prompt_template", suggestion: "テスト用改善提案です", priority: "medium" }`（ImprovementSuggestion） |

---

### 3-3. `createMockAggregateView`

```typescript
/**
 * SkillAggregateView のモックオブジェクトを生成する。
 *
 * デフォルト値（中程度の品質スキルを想定）:
 * - skillId: "test-skill"
 * - skillName: "テストスキル"
 * - totalExecutions: 10
 * - successRate: 0.8
 * - lastExecutedAt: "2026-03-16T07:17:53.000Z"
 * - latestScore: 75
 * - scoreHistory: [createMockScoreDataPoint()] × 3件
 * - recentEvents: [createMockLifecycleEvent()] × 5件
 * - trend: "stable"
 * - recommendationScore: 0.72（successRate*0.4 + 0.75*0.4 + recency*0.2 の概算）
 * - aggregatedAt: "2026-03-16T07:17:53.000Z"
 *
 * @example
 * // デフォルト集約ビュー
 * const view = createMockAggregateView();
 *
 * // 高品質スキルの集約ビュー
 * const highQualityView = createMockAggregateView({
 *   successRate: 1.0,
 *   latestScore: 95,
 *   trend: "improving",
 *   recommendationScore: 0.96,
 * });
 *
 * // 実行履歴なしの集約ビュー（初期状態）
 * const emptyView = createMockAggregateView({
 *   totalExecutions: 0,
 *   successRate: 0.0,
 *   lastExecutedAt: null,
 *   latestScore: 0,
 *   scoreHistory: [],
 *   recentEvents: [],
 *   trend: "stable",
 *   recommendationScore: 0.0,
 * });
 */
export function createMockAggregateView(
  overrides?: CreateMockAggregateViewOptions,
): SkillAggregateView;
```

#### プリセット集約ビュー

| プリセット名 | 説明                       | 主要フィールド値                                                                                       |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| 高品質スキル | 成功率・スコア共に高い     | `successRate: 1.0, latestScore: 95, trend: "improving", recommendationScore: 0.96`                     |
| 標準スキル   | デフォルト値（中程度）     | `successRate: 0.8, latestScore: 75, trend: "stable", recommendationScore: 0.72`                        |
| 低品質スキル | 改善が必要                 | `successRate: 0.3, latestScore: 40, trend: "declining", recommendationScore: 0.26`                     |
| 未実行スキル | 実行・評価なし（初期状態） | `totalExecutions: 0, successRate: 0.0, lastExecutedAt: null, latestScore: 0, recommendationScore: 0.0` |

---

### 3-4. `createMockPublishReadinessMetrics`

```typescript
/**
 * PublishReadinessMetrics のモックオブジェクトを生成する。
 *
 * デフォルト値（公開可能な高品質スキルを想定）:
 * - skillId: "test-skill"
 * - skillName: "テストスキル"
 * - qualityScore: 80
 * - stabilityScore: 0.9
 * - stabilityWindowSize: 10
 * - usageCount: 15
 * - hasCriticalFeedback: false
 * - lastEvaluatedAt: "2026-03-16T07:17:53.000Z"
 * - calculatedAt: "2026-03-16T07:17:53.000Z"
 *
 * @example
 * // デフォルト（ready 状態）
 * const metrics = createMockPublishReadinessMetrics();
 *
 * // not_ready: critical フィードバックあり
 * const criticalMetrics = createMockPublishReadinessMetrics({
 *   hasCriticalFeedback: true,
 * });
 *
 * // review_needed: 安定性不足
 * const reviewMetrics = createMockPublishReadinessMetrics({
 *   stabilityScore: 0.7,
 * });
 *
 * // not_ready: 評価未実施
 * const unevaluatedMetrics = createMockPublishReadinessMetrics({
 *   qualityScore: null,
 *   lastEvaluatedAt: null,
 * });
 */
export function createMockPublishReadinessMetrics(
  overrides?: CreateMockPublishReadinessMetricsOptions,
): PublishReadinessMetrics;
```

#### プリセット公開準備度メトリクス

| プリセット名                | 期待される readinessLevel                      | 主要フィールド値                                                                      |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| ready（全条件クリア）       | `"ready"`                                      | `qualityScore: 80, stabilityScore: 0.9, usageCount: 15, hasCriticalFeedback: false`   |
| review_needed（安定性不足） | `"review_needed"`                              | `qualityScore: 80, stabilityScore: 0.7, usageCount: 15, hasCriticalFeedback: false`   |
| not_ready（critical）       | `"not_ready"`（CRITICAL_FEEDBACK_EXISTS）      | `qualityScore: 90, stabilityScore: 0.95, usageCount: 20, hasCriticalFeedback: true`   |
| not_ready（使用回数不足）   | `"not_ready"`（INSUFFICIENT_USAGE）            | `qualityScore: 80, stabilityScore: 0.9, usageCount: 4, hasCriticalFeedback: false`    |
| not_ready（品質不足）       | `"not_ready"`（QUALITY_SCORE_BELOW_THRESHOLD） | `qualityScore: 69, stabilityScore: 0.9, usageCount: 15, hasCriticalFeedback: false`   |
| not_ready（未評価）         | `"not_ready"`（QUALITY_SCORE_BELOW_THRESHOLD） | `qualityScore: null, stabilityScore: 0.9, usageCount: 15, hasCriticalFeedback: false` |

---

### 3-5. `createMockScoreDataPoint`

```typescript
/**
 * ScoreDataPoint のモックオブジェクトを生成する。
 * scoreHistory 配列の要素として使用する。
 *
 * デフォルト値:
 * - timestamp: "2026-03-16T07:17:53.000Z"
 * - score: 75
 * - version: "1.0.0"
 * - eventId: crypto.randomUUID()
 *
 * @example
 * // スコア改善のシナリオ
 * const scoreHistory = [
 *   createMockScoreDataPoint({ score: 60, timestamp: "2026-03-14T00:00:00.000Z" }),
 *   createMockScoreDataPoint({ score: 70, timestamp: "2026-03-15T00:00:00.000Z" }),
 *   createMockScoreDataPoint({ score: 80, timestamp: "2026-03-16T00:00:00.000Z" }),
 * ];
 */
export function createMockScoreDataPoint(
  overrides?: CreateMockScoreDataPointOptions,
): ScoreDataPoint;
```

---

### 3-6. `createExecutionEventChain`（補助ファクトリ）

```typescript
/**
 * skill:executed → skill:execution_succeeded/failed のイベントチェーンを一括生成する。
 * calculateSuccessRate() のテストで parentEventId 連結を簡単に構築するために使用する。
 *
 * @example
 * // 10回実行、8回成功、2回失敗
 * const { events } = createExecutionEventChain({
 *   totalExecutions: 10,
 *   successCount: 8,
 *   failureCount: 2,
 *   withinDays: 30,
 * });
 * expect(calculateSuccessRate(events, 30)).toBe(0.8);
 *
 * // 31日以上前のイベントを含む（periodDays フィルタのテスト）
 * const oldEvents = createExecutionEventChain({
 *   totalExecutions: 5,
 *   successCount: 5,
 *   failureCount: 0,
 *   withinDays: 40, // 40日前のイベントも含む
 * });
 */
export function createExecutionEventChain(
  options: CreateExecutionEventChainOptions,
): ExecutionEventChain;
```

#### 生成ルール

| 条件                                               | 処理                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `successCount + failureCount` <= `totalExecutions` | 残りは succeeded/failed なしの執行開始のみ（timeout 扱い）                                      |
| `withinDays` が指定された場合                      | 各 executed イベントの timestamp を `now - withinDays * DAY_MS` から `now` の範囲にランダム分散 |
| `withinDays` が省略された場合                      | 全イベントを `"2026-03-16T07:17:53.000Z"` 前後1時間に分散                                       |
| succeeded/failed の parentEventId                  | 対応する executed イベントの id を設定する                                                      |
| succeeded/failed の executionId                    | 対応する executed イベントの metadata.executionId と同一値を設定する                            |

---

## 4. ファクトリ実装ファイル構造

```typescript
// packages/shared/src/skill/__test-utils__/factories.ts

import { randomUUID } from "crypto";
import type {
  CreateMockLifecycleEventOptions,
  CreateMockFeedbackOptions,
  CreateMockAggregateViewOptions,
  CreateMockPublishReadinessMetricsOptions,
  CreateMockScoreDataPointOptions,
  CreateExecutionEventChainOptions,
  ExecutionEventChain,
} from "./factory-types";
import type { SkillLifecycleEvent } from "../lifecycle/types";
import type { SkillFeedback } from "../../types/skill-feedback";
import type {
  SkillAggregateView,
  ScoreDataPoint,
} from "../lifecycle/aggregate-types";
import type { PublishReadinessMetrics } from "../../types/skill-lifecycle";

// ================================================================
// 定数
// ================================================================

/** テストで使用する固定基準日時（P13対策：タイマー依存を排除） */
export const MOCK_NOW = "2026-03-16T07:17:53.000Z";

/** テストで使用する固定スキルID */
export const MOCK_SKILL_ID = "test-skill";

/** テストで使用する固定ユーザーID */
export const MOCK_USER_ID = "test-user-uuid-0000-0000-000000000000";

// ================================================================
// ファクトリ実装（Phase 5 で実装する）
// ================================================================

export function createMockLifecycleEvent(
  overrides?: CreateMockLifecycleEventOptions,
): SkillLifecycleEvent {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createMockLifecycleEvent is not implemented yet");
}

export function createMockFeedback(
  overrides?: CreateMockFeedbackOptions,
): SkillFeedback {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createMockFeedback is not implemented yet");
}

export function createMockAggregateView(
  overrides?: CreateMockAggregateViewOptions,
): SkillAggregateView {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createMockAggregateView is not implemented yet");
}

export function createMockPublishReadinessMetrics(
  overrides?: CreateMockPublishReadinessMetricsOptions,
): PublishReadinessMetrics {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createMockPublishReadinessMetrics is not implemented yet");
}

export function createMockScoreDataPoint(
  overrides?: CreateMockScoreDataPointOptions,
): ScoreDataPoint {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createMockScoreDataPoint is not implemented yet");
}

export function createExecutionEventChain(
  options: CreateExecutionEventChainOptions,
): ExecutionEventChain {
  // Phase 5 実装前は未実装（Red 状態）
  throw new Error("createExecutionEventChain is not implemented yet");
}
```

---

## 5. ファクトリ使用パターンの例

### 5-1. バリデーションテストでの使用

```typescript
import { createMockLifecycleEvent } from "../../__test-utils__/factories";

// 必須フィールドの存在確認
const event = createMockLifecycleEvent({
  category: "execution",
  eventType: "skill:executed",
});
expect(event.id).toBeDefined();
expect(event.timestamp).toMatch(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
);
```

### 5-2. 成功率計算テストでの使用

```typescript
import { createExecutionEventChain } from "../../__test-utils__/factories";
import { calculateSuccessRate } from "../aggregate-logic";

const { events } = createExecutionEventChain({
  totalExecutions: 10,
  successCount: 8,
  failureCount: 2,
  withinDays: 30,
});
expect(calculateSuccessRate(events, 30)).toBe(0.8);
```

### 5-3. フィードバック還流テストでの使用

```typescript
import { createMockFeedback } from "../../__test-utils__/factories";
import { evaluateFeedbackRules } from "../feedback-rules";

// user_text フィードバックを 3 件作成（TEXT_FEEDBACK_ACCUMULATED ルールの発火確認）
const pendingFeedbacks = [
  createMockFeedback({ feedbackType: "user_text", status: "pending" }),
  createMockFeedback({ feedbackType: "user_text", status: "pending" }),
  createMockFeedback({ feedbackType: "user_text", status: "pending" }),
];
const metrics = {
  skillId: "test-skill",
  successRate: 0.9,
  latestScore: 85,
  averageUserRating: 4.0,
  pendingFeedbackCount: 3,
  totalExecutions: 30,
};
const actions = evaluateFeedbackRules("test-skill", metrics, pendingFeedbacks);
expect(actions.some((a) => a.triggerRule === "TEXT_FEEDBACK_ACCUMULATED")).toBe(
  true,
);
```

### 5-4. PublishReadinessMetrics テストでの使用

```typescript
import { createMockPublishReadinessMetrics } from "../../__test-utils__/factories";

// ready プリセット
const readyMetrics = createMockPublishReadinessMetrics();
expect(readyMetrics.hasCriticalFeedback).toBe(false);

// not_ready: critical フィードバックあり
const criticalMetrics = createMockPublishReadinessMetrics({
  hasCriticalFeedback: true,
});
// Task08 の calculatePublishReadiness を呼ぶと "not_ready" になることを検証
```

---

## 6. ファクトリファイル一覧サマリー

| ファイルパス                                                | 内容                       |
| ----------------------------------------------------------- | -------------------------- |
| `packages/shared/src/skill/__test-utils__/factories.ts`     | 全ファクトリ関数の実装     |
| `packages/shared/src/skill/__test-utils__/factory-types.ts` | ファクトリオプション型定義 |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 4_
