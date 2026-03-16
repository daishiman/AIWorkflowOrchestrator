# フィードバックモデル実装仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 5                                                                                                                                                       |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                                 |
| 作成日     | 2026-03-16                                                                                                                                              |
| 入力成果物 | `outputs/phase-2/feedback-loop-design.md`                                                                                                               |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-5/feedback-model-impl-spec.md`        |
| 配置先     | `packages/shared/src/skill/feedback-types.ts`, `packages/shared/src/skill/feedback-logic.ts`, `apps/desktop/src/renderer/store/slices/feedbackSlice.ts` |

---

## 1. 概要

本ドキュメントはフィードバックモデルの実装仕様を定義する。以下を対象とする。

1. `createFeedback()` ファクトリ関数
2. `transitionFeedbackStatus()` ステータス遷移関数
3. `calculateImprovementPriority()` 改善優先度計算関数
4. `evaluateFeedbackRules()` 還流ルールエンジン
5. `feedbackSlice` Zustand スライス設計

---

## 2. 型定義（feedback-types.ts）

Phase 2 設計書 `feedback-loop-design.md` §2 の型定義を実装仕様として確定する。

```typescript
// packages/shared/src/skill/feedback-types.ts

import { v4 as uuidv4 } from "uuid";

// ================================================================
// ImprovementSuggestion
// ================================================================

export interface ImprovementSuggestion {
  /** 改善対象のスキルセクション */
  targetSection:
    | "prompt_template"
    | "examples"
    | "context"
    | "output_format"
    | "other";
  /** 改善の提案内容（1-500文字） */
  suggestion: string;
  /** 改善の優先度 */
  priority: "low" | "medium" | "high";
}

// ================================================================
// SkillFeedback
// ================================================================

export interface SkillFeedback {
  /** フィードバック固有識別子（UUID v4）。createFeedback() が自動生成 */
  id: string;
  /** 対象スキル識別子（SkillMeta.id と一致） */
  skillId: string;
  /**
   * フィードバック種別:
   * - auto_metric: 自動収集メトリクス（value: number）
   * - user_rating: 5段階レーティング（value: number, 1-5整数）
   * - user_text: 自由記述（value: string, 最大500文字）
   * - improvement_suggestion: 構造化改善提案（value: ImprovementSuggestion）
   */
  feedbackType:
    | "auto_metric"
    | "user_rating"
    | "user_text"
    | "improvement_suggestion";
  /** フィードバック値（feedbackType に応じた型） */
  value: number | string | ImprovementSuggestion;
  /** 発生元ライフサイクルイベントID（SkillLifecycleEvent.id） */
  sourceEventId: string;
  /** フィードバック記録日時（ISO 8601 UTC）。createFeedback() が自動生成 */
  createdAt: string;
  /**
   * 改善アクションに反映された日時（ISO 8601 UTC）。
   * pending 状態では undefined。applied / dismissed 時に設定。
   */
  processedAt?: string;
  /**
   * フィードバック処理ステータス:
   * - pending: 未処理（初期状態）
   * - applied: 改善に反映済み（終端状態）
   * - dismissed: 却下済み（終端状態）
   */
  status: "pending" | "applied" | "dismissed";
}

// ================================================================
// FeedbackAction
// ================================================================

export interface FeedbackAction {
  /** アクション固有識別子（UUID v4）*/
  actionId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /**
   * アクション種別:
   * - improvement_alert: 改善アラート（成功率低下など）
   * - review_suggestion: レビュー提案（ユーザー評価低下など）
   * - auto_improvement: 自動改善提案（高優先度提案あり）
   * - context_accumulation: コンテキスト蓄積通知（テキストフィードバック蓄積）
   */
  actionType:
    | "improvement_alert"
    | "review_suggestion"
    | "auto_improvement"
    | "context_accumulation";
  /**
   * アクションの重要度:
   * - critical: 即時対応が必要（成功率 30% 以下など）
   * - warning: 改善を推奨（閾値到達）
   * - info: 情報提供（閾値未到達だが記録）
   */
  severity: "info" | "warning" | "critical";
  /** アクション生成の根拠となったルール名 */
  triggerRule: string;
  /** 根拠となったフィードバックID一覧 */
  sourceFeedbackIds: string[];
  /** 改善優先度スコア（0.0-1.0） */
  priorityScore: number;
  /** ユーザーへの表示メッセージ */
  message: string;
  /** 推奨改善アクション詳細（auto_improvement の場合のみ設定） */
  suggestedImprovement?: ImprovementSuggestion;
  /** アクション生成日時（ISO 8601 UTC） */
  generatedAt: string;
}

// ================================================================
// SkillMetrics
// ================================================================

export interface SkillMetrics {
  /** 対象スキル識別子 */
  skillId: string;
  /**
   * 直近30日間の実行成功率（0.0-1.0）。
   * 実行0件の場合は null（ルール評価をスキップ）
   */
  successRate: number | null;
  /**
   * 最新評価スコア（0-100）。
   * 未評価の場合は null（INT-M-02 解決に準拠）
   */
  latestScore: number | null;
  /** 直近30日間のユーザーレーティング平均（1.0-5.0）。評価なしは null */
  averageUserRating: number | null;
  /** 未処理フィードバック（status: 'pending'）件数 */
  pendingFeedbackCount: number;
  /** 直近30日間の総実行回数 */
  totalExecutions: number;
}

// ================================================================
// PriorityParams
// ================================================================

export interface PriorityParams {
  /**
   * 成功率の重み（デフォルト: 0.4）。
   * 成功率が低いほどスコアが上がる。
   */
  weightSuccessRate: number;
  /**
   * 正規化スコアの重み（デフォルト: 0.4）。
   * 評価スコアが低いほどスコアが上がる。
   */
  weightNormalizedScore: number;
  /**
   * フィードバック件数の重み（デフォルト: 0.2）。
   * フィードバックが多いほどスコアが上がる（最大10件で頭打ち）。
   */
  weightFeedbackCount: number;
}

export const DEFAULT_PRIORITY_PARAMS: Readonly<PriorityParams> = {
  weightSuccessRate: 0.4,
  weightNormalizedScore: 0.4,
  weightFeedbackCount: 0.2,
} as const;
```

**型ガード関数（P49対策、in 演算子使用）**:

```typescript
/**
 * value が ImprovementSuggestion 型かを判定する型ガード。
 * P49 対策: `as` キャストを使わず `in` 演算子で実行時検証する。
 */
export function isImprovementSuggestion(
  value: unknown,
): value is ImprovementSuggestion {
  return (
    value != null &&
    typeof value === "object" &&
    "targetSection" in value &&
    typeof (value as Record<string, unknown>).targetSection === "string" &&
    "suggestion" in value &&
    typeof (value as Record<string, unknown>).suggestion === "string" &&
    "priority" in value &&
    typeof (value as Record<string, unknown>).priority === "string"
  );
}
```

---

## 3. ファクトリ関数（feedback-logic.ts）

### 3-1. createFeedback

```typescript
// packages/shared/src/skill/feedback-logic.ts

/**
 * SkillFeedback を生成するファクトリ関数。
 *
 * 自動生成:
 *   - id: UUID v4
 *   - createdAt: ISO 8601 UTC（省略時は現在時刻）
 *   - status: "pending"（固定）
 *
 * P42バリデーション（3段階）:
 *   - skillId: 型チェック → 空文字列 → トリム後空文字列
 *   - sourceEventId: 型チェック → 空文字列 → トリム後空文字列
 *
 * @throws {Error} skillId または sourceEventId が空・空白の場合
 */
export function createFeedback(params: {
  skillId: string;
  feedbackType: SkillFeedback["feedbackType"];
  value: SkillFeedback["value"];
  sourceEventId: string;
  createdAt?: string;
}): SkillFeedback {
  const { skillId, feedbackType, value, sourceEventId, createdAt } = params;

  // P42バリデーション: skillId
  if (typeof skillId !== "string") {
    throw new Error("skillId must be a string");
  }
  if (skillId === "") {
    throw new Error("skillId must not be empty");
  }
  if (skillId.trim() === "") {
    throw new Error("skillId must not be blank");
  }

  // P42バリデーション: sourceEventId
  if (typeof sourceEventId !== "string") {
    throw new Error("sourceEventId must be a string");
  }
  if (sourceEventId === "") {
    throw new Error("sourceEventId must not be empty");
  }
  if (sourceEventId.trim() === "") {
    throw new Error("sourceEventId must not be blank");
  }

  return {
    id: uuidv4(),
    skillId: skillId.trim(),
    feedbackType,
    value,
    sourceEventId: sourceEventId.trim(),
    createdAt: createdAt ?? new Date().toISOString(),
    status: "pending",
    // processedAt は未設定（pending 状態では undefined）
  };
}
```

**createFeedback 境界値処理**:

| フィールド      | 条件         | 処理             | 返値        |
| --------------- | ------------ | ---------------- | ----------- |
| `id`            | 常時         | UUID v4 自動生成 | UUID 文字列 |
| `createdAt`     | 省略時       | 現在時刻（UTC）  | ISO 8601    |
| `status`        | 常時         | "pending" で固定 | `"pending"` |
| `processedAt`   | 常時（初期） | 設定しない       | `undefined` |
| `skillId`       | 空・空白     | Error を throw   | —           |
| `sourceEventId` | 空・空白     | Error を throw   | —           |

---

### 3-2. transitionFeedbackStatus

```typescript
/**
 * SkillFeedback のステータスを遷移させる純粋関数。
 *
 * 許可遷移: pending → applied / pending → dismissed
 * 禁止遷移: applied / dismissed から何かへの遷移（終端状態）
 *
 * @param feedback - 遷移対象フィードバック
 * @param nextStatus - 遷移先ステータス（applied / dismissed のみ）
 * @param now - 遷移日時（ISO 8601 UTC）。省略時は現在時刻
 * @returns 遷移後の SkillFeedback（新しいオブジェクト）
 * @throws {Error} 禁止遷移の場合（errorCode: 2001 付き）
 */
export function transitionFeedbackStatus(
  feedback: SkillFeedback,
  nextStatus: "applied" | "dismissed",
  now: string = new Date().toISOString(),
): SkillFeedback {
  if (feedback.status !== "pending") {
    throw Object.assign(
      new Error(
        `Cannot transition feedback status from '${feedback.status}' to '${nextStatus}': only 'pending' can be transitioned.`,
      ),
      { code: "INVALID_STATUS_TRANSITION", errorCode: 2001 },
    );
  }
  return { ...feedback, status: nextStatus, processedAt: now };
}
```

**ステータス遷移マトリクス**:

| 遷移元      | 遷移先      | 許可 / 禁止 | processedAt 処理               |
| ----------- | ----------- | ----------- | ------------------------------ |
| `pending`   | `applied`   | **許可**    | 現在日時（ISO 8601）を設定     |
| `pending`   | `dismissed` | **許可**    | 現在日時（ISO 8601）を設定     |
| `applied`   | 任意        | 禁止        | Error throw（errorCode: 2001） |
| `dismissed` | 任意        | 禁止        | Error throw（errorCode: 2001） |

---

## 4. 改善優先度計算（feedback-logic.ts）

### 4-1. calculateImprovementPriority

```typescript
/**
 * スキルの改善優先度スコアを計算する（0.0-1.0）。
 * スコアが高いほど改善優先度が高い。
 *
 * 計算式:
 *   priority = (1 - successRate) * weight_sr
 *            + (1 - normalizedScore) * weight_ns
 *            + min(feedbackCount, 10) / 10 * weight_fb
 *
 * @param metrics - スキルの現在メトリクス
 * @param feedbackCount - 未処理フィードバック件数
 * @param params - 重みパラメータ（省略時は DEFAULT_PRIORITY_PARAMS）
 * @returns 改善優先度スコア（0.0-1.0）
 */
export function calculateImprovementPriority(
  metrics: SkillMetrics,
  feedbackCount: number,
  params: PriorityParams = DEFAULT_PRIORITY_PARAMS,
): number;
```

**擬似コード**:

```
function calculateImprovementPriority(metrics, feedbackCount, params):
  // --- 入力値の正規化 ---

  // successRate: null の場合は 0（成功実績なし = 最低品質として扱う）
  effectiveSuccessRate = metrics.successRate ?? 0.0

  // latestScore: null の場合は 0（未評価 = 最低品質として扱う）
  // 0-100 の範囲を 0.0-1.0 に正規化
  normalizedScore = (metrics.latestScore ?? 0) / 100.0

  // feedbackCount: 最大10件で頭打ち
  cappedFeedbackCount = Math.min(feedbackCount, 10)
  normalizedFeedback = cappedFeedbackCount / 10.0

  // --- 優先度スコア算出 ---
  // 成功率・品質が低いほど、フィードバックが多いほどスコアが高くなる
  priority = (1 - effectiveSuccessRate) * params.weightSuccessRate
           + (1 - normalizedScore)      * params.weightNormalizedScore
           + normalizedFeedback         * params.weightFeedbackCount

  // --- 範囲保証（浮動小数点誤差対応）---
  return Math.max(0.0, Math.min(1.0, priority))
```

**計算例**:

| successRate | latestScore | feedbackCount | 計算式                           | priority |
| :---------: | :---------: | :-----------: | -------------------------------- | :------: |
|   `0.30`    |    `40`     |      `5`      | (0.70×0.4)+(0.60×0.4)+(0.50×0.2) | **0.72** |
|   `0.80`    |    `85`     |      `2`      | (0.20×0.4)+(0.15×0.4)+(0.20×0.2) | **0.18** |
|   `null`    |   `null`    |      `0`      | (1.00×0.4)+(1.00×0.4)+(0.00×0.2) | **0.80** |
|   `0.50`    |    `50`     |     `10`      | (0.50×0.4)+(0.50×0.4)+(1.00×0.2) | **0.60** |

**スコア解釈**:

| スコア範囲 | 解釈          | 推奨アクション             |
| ---------- | ------------- | -------------------------- |
| 0.0 - 0.2  | 優先度: 低    | 定期的な確認のみ           |
| 0.2 - 0.4  | 優先度: 中-低 | 次スプリントでの改善候補   |
| 0.4 - 0.6  | 優先度: 中    | 早期の改善検討を推奨       |
| 0.6 - 0.8  | 優先度: 高    | 即座の改善アクションを推奨 |
| 0.8 - 1.0  | 優先度: 緊急  | 即時対応が必要             |

---

## 5. 還流ルールエンジン（feedback-logic.ts）

### 5-1. evaluateFeedbackRules 関数シグネチャ

```typescript
/**
 * スキルのメトリクスとフィードバックを入力としてフィードバック還流ルールを評価し、
 * 生成された改善アクションの一覧を返す。
 *
 * ルールは全て独立評価（短絡評価なし）。複数ルールが同時発火する場合がある。
 * 返却順序は severity 降順（critical → warning → info）。
 *
 * @param skillId - 評価対象スキル識別子
 * @param metrics - スキルの現在メトリクス
 * @param pendingFeedbacks - 未処理フィードバック一覧（user_text カウント / high priority 判定に使用）
 * @returns FeedbackAction[] 生成されたアクション（発火ルールがなければ空配列）
 */
export function evaluateFeedbackRules(
  skillId: string,
  metrics: SkillMetrics,
  pendingFeedbacks: SkillFeedback[],
): FeedbackAction[];
```

### 5-2. ルール一覧（3ルール統合版）

Phase 2 設計書では7ルールを定義したが、Phase 3 ゲート判定で「3ルール（successRate<=0.5, avgRating<=3.0, hasCritical）を基本ルールとし、他は拡張ルール」として明記。
本仕様書では**コアルール3種 + 拡張ルール4種**の7ルールを実装する。

**コアルール（必須）**:

| #   | ルール名                    | 発火条件                                                 | actionType          | severity   |
| --- | --------------------------- | -------------------------------------------------------- | ------------------- | ---------- |
| 1   | `LOW_SUCCESS_RATE_CRITICAL` | `successRate !== null && successRate < 0.30`             | `improvement_alert` | `critical` |
| 2   | `LOW_SUCCESS_RATE_WARNING`  | `successRate !== null && successRate >= 0.30 && <= 0.50` | `improvement_alert` | `warning`  |
| 3   | `LOW_USER_RATING`           | `averageUserRating !== null && averageUserRating < 3.0`  | `review_suggestion` | `warning`  |

**拡張ルール（追加）**:

| #   | ルール名                      | 発火条件                                                                              | actionType             | severity   |
| --- | ----------------------------- | ------------------------------------------------------------------------------------- | ---------------------- | ---------- |
| 4   | `LOW_USER_RATING_BORDERLINE`  | `averageUserRating !== null && >= 3.0 && < 3.5`                                       | `review_suggestion`    | `info`     |
| 5   | `TEXT_FEEDBACK_ACCUMULATED`   | `user_text` 種別の pending フィードバックが 3 件以上                                  | `context_accumulation` | `info`     |
| 6   | `HIGH_IMPROVEMENT_SUGGESTION` | `priority: "high"` の `improvement_suggestion` 種別 pending フィードバックが 1 件以上 | `auto_improvement`     | `warning`  |
| 7   | `COMBINED_LOW_QUALITY`        | `successRate !== null && <= 0.50` かつ `latestScore !== null && < 50`                 | `improvement_alert`    | `critical` |

### 5-3. 評価ロジック擬似コード

```
function evaluateFeedbackRules(skillId, metrics, pendingFeedbacks):
  actions = []

  // --- ルール1: LOW_SUCCESS_RATE_CRITICAL ---
  if metrics.successRate !== null && metrics.successRate < 0.30:
    actions.push({
      actionId: uuidv4(),
      skillId,
      actionType: "improvement_alert",
      severity: "critical",
      triggerRule: "LOW_SUCCESS_RATE_CRITICAL",
      sourceFeedbackIds: [],
      priorityScore: calculateImprovementPriority(metrics, metrics.pendingFeedbackCount),
      message: `スキルの実行成功率が ${Math.round(metrics.successRate * 100)}% です。即時の改善を推奨します。`,
      suggestedImprovement: {
        targetSection: "prompt_template",
        suggestion: "実行失敗率が70%超のため、プロンプトテンプレートの根本的な見直しを行ってください。",
        priority: "high",
      },
      generatedAt: new Date().toISOString(),
    })

  // --- ルール2: LOW_SUCCESS_RATE_WARNING ---
  else if metrics.successRate !== null && metrics.successRate >= 0.30 && metrics.successRate <= 0.50:
    actions.push({ /* ... severity: "warning" ... */ })

  // --- ルール3: LOW_USER_RATING ---
  if metrics.averageUserRating !== null && metrics.averageUserRating < 3.0:
    actions.push({ /* ... severity: "warning" ... */ })

  // --- ルール4: LOW_USER_RATING_BORDERLINE ---
  if metrics.averageUserRating !== null && metrics.averageUserRating >= 3.0 && metrics.averageUserRating < 3.5:
    actions.push({ /* ... severity: "info", suggestedImprovement: undefined ... */ })

  // --- ルール5: TEXT_FEEDBACK_ACCUMULATED ---
  userTextPendingCount = pendingFeedbacks.filter(fb =>
    fb.feedbackType === "user_text" && fb.status === "pending"
  ).length
  if userTextPendingCount >= 3:
    actions.push({ /* ... severity: "info" ... */ })

  // --- ルール6: HIGH_IMPROVEMENT_SUGGESTION ---
  highPriorityPending = pendingFeedbacks.filter(fb =>
    fb.feedbackType === "improvement_suggestion" &&
    fb.status === "pending" &&
    isImprovementSuggestion(fb.value) &&
    fb.value.priority === "high"
  )
  if highPriorityPending.length >= 1:
    firstHigh = highPriorityPending[0]
    actions.push({
      /* ... suggestedImprovement: firstHigh.value as ImprovementSuggestion ... */
    })

  // --- ルール7: COMBINED_LOW_QUALITY ---
  if metrics.successRate !== null && metrics.successRate <= 0.50 &&
     metrics.latestScore !== null && metrics.latestScore < 50:
    actions.push({ /* ... severity: "critical" ... */ })

  // 返却順序: severity 降順（critical → warning → info）
  return actions.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })
```

**境界値処理**:

| ルール                         | `successRate === null` 時       | `averageUserRating === null` 時 | `latestScore === null` 時 |
| ------------------------------ | ------------------------------- | ------------------------------- | ------------------------- |
| ルール1/2                      | 発火しない                      | —                               | —                         |
| ルール3/4                      | —                               | 発火しない                      | —                         |
| ルール7                        | 発火しない                      | —                               | 発火しない                |
| evaluateFeedbackRules の冪等性 | 同一入力 → 同一出力（純粋関数） | —                               | —                         |

---

## 6. feedbackSlice 設計（feedbackSlice.ts）

### 6-1. State

```typescript
// apps/desktop/src/renderer/store/slices/feedbackSlice.ts

export interface FeedbackState {
  /**
   * スキルID をキーとした未処理フィードバックマップ。
   * 直近50件のみ Zustand に保持（SQLite が真の永続化層）。
   */
  feedbacksBySkillId: Record<string, SkillFeedback[]>;

  /**
   * スキルID をキーとした改善アクションマップ。
   * evaluateFeedbackRules() の実行結果を保持する。
   */
  feedbackActionsBySkillId: Record<string, FeedbackAction[]>;

  /**
   * スキルID をキーとした改善優先度スコアマップ（0.0-1.0）。
   * calculateImprovementPriority() の実行結果を保持する。
   */
  priorityScoreBySkillId: Record<string, number>;

  /** フィードバック送信中フラグ */
  isSubmitting: boolean;

  /** 最後に発生したエラーメッセージ（null = エラーなし） */
  lastError: string | null;
}

/** 初期 State */
const initialFeedbackState: FeedbackState = {
  feedbacksBySkillId: {},
  feedbackActionsBySkillId: {},
  priorityScoreBySkillId: {},
  isSubmitting: false,
  lastError: null,
};
```

### 6-2. Actions

```typescript
export interface FeedbackActions {
  /**
   * フィードバックを追加し、ルール評価と優先度計算を即時実行する。
   * Main Process への IPC 送信も同時に行う。
   */
  addFeedback: (feedback: SkillFeedback, metrics: SkillMetrics) => void;

  /**
   * フィードバックのステータスを applied に遷移させる。
   * transitionFeedbackStatus() を内部で呼び出す。
   */
  applyFeedback: (feedbackId: string, skillId: string) => Promise<void>;

  /**
   * フィードバックのステータスを dismissed に遷移させる。
   */
  dismissFeedback: (feedbackId: string, skillId: string) => Promise<void>;

  /**
   * 指定スキルのフィードバックアクションを再評価する。
   */
  reevaluateActions: (skillId: string, metrics: SkillMetrics) => void;

  /**
   * Main Process から IPC 経由でフィードバック一覧を初期ロードする。
   */
  loadFeedbacks: (skillId: string) => Promise<void>;

  /** エラー状態をクリアする */
  clearError: () => void;
}
```

### 6-3. 個別セレクタ（P31/P48 対策準拠）

```typescript
import { useShallow } from "zustand/react/shallow";
import { useFeedbackStore } from "../feedbackStore";

// ================================================================
// 単一値セレクタ（useShallow 不要）
// ================================================================

export const useFeedbackPriorityScore = (skillId: string): number =>
  useFeedbackStore((state) => state.priorityScoreBySkillId[skillId] ?? 0);

export const useIsFeedbackSubmitting = (): boolean =>
  useFeedbackStore((state) => state.isSubmitting);

export const useFeedbackLastError = (): string | null =>
  useFeedbackStore((state) => state.lastError);

// ================================================================
// 配列セレクタ（useShallow 必須: P48対策）
// ================================================================

/**
 * 指定スキルの pending フィードバック一覧を取得する。
 * filter() で新規配列を生成するため useShallow を適用。
 */
export const usePendingFeedbacks = (skillId: string): SkillFeedback[] =>
  useFeedbackStore(
    useShallow((state) =>
      (state.feedbacksBySkillId[skillId] ?? []).filter(
        (fb) => fb.status === "pending",
      ),
    ),
  );

/**
 * 指定スキルの改善アクション一覧を取得する。
 * 配列参照を返すため useShallow を適用。
 */
export const useFeedbackActions = (skillId: string): FeedbackAction[] =>
  useFeedbackStore(
    useShallow((state) => state.feedbackActionsBySkillId[skillId] ?? []),
  );

/**
 * 指定スキルの critical アクションを取得する。
 * filter() で新規配列を生成するため useShallow を適用。
 */
export const useCriticalFeedbackActions = (skillId: string): FeedbackAction[] =>
  useFeedbackStore(
    useShallow((state) =>
      (state.feedbackActionsBySkillId[skillId] ?? []).filter(
        (action) => action.severity === "critical",
      ),
    ),
  );

// ================================================================
// アクションセレクタ（P31対策: 安定した参照）
// ================================================================

export const useAddFeedback = () =>
  useFeedbackStore((state) => state.addFeedback);

export const useApplyFeedback = () =>
  useFeedbackStore((state) => state.applyFeedback);

export const useDismissFeedback = () =>
  useFeedbackStore((state) => state.dismissFeedback);

export const useReevaluateActions = () =>
  useFeedbackStore((state) => state.reevaluateActions);

export const useLoadFeedbacks = () =>
  useFeedbackStore((state) => state.loadFeedbacks);
```

### 6-4. persist 設定

```typescript
/**
 * feedbackSlice の persist 設定。
 *
 * feedbacksBySkillId: 直近50件のみ persist。
 *   - security-principles.md 準拠: metadata.errorMessage 等の機密フィールドを partialize で除外
 * feedbackActionsBySkillId: persist 対象外（再計算可能な派生データ）
 * priorityScoreBySkillId: persist 対象外（再計算可能）
 * isSubmitting / lastError: persist 対象外（揮発性フラグ）
 *
 * ストレージキー: "feedback-store"
 * version: 1
 */
const persistConfig = {
  name: "feedback-store",
  version: 1,
  partialize: (state: FeedbackState): Partial<FeedbackState> => ({
    feedbacksBySkillId: Object.fromEntries(
      Object.entries(state.feedbacksBySkillId).map(([skillId, feedbacks]) => [
        skillId,
        // 直近50件のみ保持
        feedbacks.slice(0, 50),
      ]),
    ),
    // feedbackActionsBySkillId / priorityScoreBySkillId は除外
  }),
};
```

---

## 7. 配置先ファイル一覧

| ファイルパス                                                             | 内容                                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `packages/shared/src/skill/feedback-types.ts`                            | 型定義（SkillFeedback / FeedbackAction 等）                                                      |
| `packages/shared/src/skill/feedback-logic.ts`                            | createFeedback / transitionFeedbackStatus / calculateImprovementPriority / evaluateFeedbackRules |
| `apps/desktop/src/renderer/store/slices/feedbackSlice.ts`                | FeedbackState / FeedbackActions / Store定義                                                      |
| `apps/desktop/src/renderer/store/slices/feedbackSlice.selectors.ts`      | 個別セレクタ（§6-3）                                                                             |
| `packages/shared/src/skill/__tests__/feedback-logic.test.ts`             | 全関数のユニットテスト                                                                           |
| `apps/desktop/src/renderer/store/slices/__tests__/feedbackSlice.test.ts` | Store スライステスト                                                                             |

---

## 8. テスト対象一覧

| テスト対象                                          | 優先度 | テストケース例                                       |
| --------------------------------------------------- | ------ | ---------------------------------------------------- |
| `createFeedback()` P42バリデーション                | 高     | skillId="", " " → Error throw                        |
| `createFeedback()` 自動フィールド生成               | 高     | id=UUID, createdAt=ISO8601, status="pending"         |
| `transitionFeedbackStatus()` 許可遷移               | 高     | pending→applied, pending→dismissed, processedAt 設定 |
| `transitionFeedbackStatus()` 禁止遷移               | 高     | applied→applied → errorCode: 2001                    |
| `calculateImprovementPriority()` null 入力          | 高     | successRate=null, latestScore=null → 0.80            |
| `calculateImprovementPriority()` feedbackCount 上限 | 中     | feedbackCount=15 → cappedCount=10                    |
| `evaluateFeedbackRules()` ルール1発火               | 高     | successRate=0.25 → critical                          |
| `evaluateFeedbackRules()` ルール7発火               | 高     | successRate=0.40 && latestScore=45 → critical        |
| `evaluateFeedbackRules()` null で発火しない         | 高     | successRate=null → ルール1/2/7 発火しない            |
| `evaluateFeedbackRules()` 複数ルール同時発火        | 中     | ルール1+ルール3同時発火 → critical が先              |
| `evaluateFeedbackRules()` 冪等性                    | 中     | 同一入力で2回呼び出し → 同一出力                     |
| `isImprovementSuggestion()` P49 型ガード            | 中     | null / 文字列 / 不完全オブジェクト → false           |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 5 成果物4_
