# フィードバック還流モデル設計書

## メタ情報

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| Phase      | 2 タスク3                                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                      |
| 作成日     | 2026-03-16                                                                                   |
| ステータス | 完了                                                                                         |
| 入力成果物 | `outputs/phase-1/feedback-collection-spec.md` / `outputs/phase-1/lifecycle-event-catalog.md` |
| 出力パス   | `outputs/phase-2/feedback-loop-design.md`                                                    |

---

## 1. 概要

実行結果から改善アクションへ戻るフィードバック還流パスを設計する。
Phase 1 で定義した自動収集メトリクス・手動フィードバック型（`AutoMetric` / `UserRating` / `UserTextFeedback` / `ImprovementSuggestion`）を入力として受け取り、スキルの改善優先度を算出し、具体的な改善アクションを生成するエンジンを設計する。

還流の基本フロー:

```
実行/評価イベント
      │
      ▼
SkillFeedback 記録 (pending)
      │
      ▼
evaluateFeedbackRules() ── FeedbackAction[] 生成
      │
      ▼
calculateImprovementPriority() ── 0.0-1.0 スコア算出
      │
      ▼
UI 表示 / 改善アクション実行
      │
      ▼
SkillFeedback.status: applied | dismissed
```

---

## 2. TypeScript 型定義

### 2-1. `ImprovementSuggestion`

```typescript
/**
 * 改善提案（構造化フォーム入力 / ルールエンジン生成の両方で使用）
 * Phase 1 feedback-collection-spec.md の同名型と統合する。
 * - Phase 1 の `suggestionId` は SkillFeedback.id に昇格させて一元管理する
 * - `relatedSkillVersion` は SkillFeedback.skillId からたどれるため省略可
 */
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
```

### 2-2. `SkillFeedback`

```typescript
/**
 * スキルに対するフィードバック記録。
 * 自動収集メトリクス (auto_metric) とユーザー入力 (user_rating / user_text /
 * improvement_suggestion) を統一的に管理するエンベロープ型。
 */
export interface SkillFeedback {
  /** フィードバック固有識別子（UUID v4） */
  id: string;
  /** 対象スキル識別子（SkillMeta.id と一致） */
  skillId: string;
  /**
   * フィードバック種別:
   * - auto_metric: SkillExecutor が自動収集したメトリクス（value: number）
   * - user_rating: 5段階レーティング（value: number, 1-5整数）
   * - user_text: 自由記述テキスト（value: string, 最大500文字）
   * - improvement_suggestion: 構造化改善提案（value: ImprovementSuggestion）
   */
  feedbackType:
    | "auto_metric"
    | "user_rating"
    | "user_text"
    | "improvement_suggestion";
  /**
   * フィードバック値。feedbackType に応じた型を持つ:
   * - auto_metric: 成功率などの数値（0.0-1.0 または 0-100）
   * - user_rating: 1-5 の整数
   * - user_text: フィードバックテキスト
   * - improvement_suggestion: ImprovementSuggestion オブジェクト
   */
  value: number | string | ImprovementSuggestion;
  /** フィードバックの発生元ライフサイクルイベントID（SkillLifecycleEvent.id） */
  sourceEventId: string;
  /** フィードバック記録日時（ISO 8601 UTC） */
  createdAt: string;
  /**
   * 改善アクションに反映された日時（ISO 8601 UTC）。
   * status が 'applied' または 'dismissed' になった時刻。
   * pending 状態では undefined。
   */
  processedAt?: string;
  /**
   * フィードバック処理ステータス:
   * - pending: 未処理（改善アクション未適用）
   * - applied: 改善に反映済み
   * - dismissed: 却下済み（終端状態）
   */
  status: "pending" | "applied" | "dismissed";
}
```

### 2-3. `FeedbackAction`

```typescript
/**
 * フィードバックルールエンジンが生成する改善アクション。
 * 改善優先度スコアと推奨アクションをセットで保持する。
 */
export interface FeedbackAction {
  /** アクション固有識別子（UUID v4） */
  actionId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** アクション種別 */
  actionType:
    | "improvement_alert"
    | "review_suggestion"
    | "auto_improvement"
    | "context_accumulation";
  /**
   * アクションの重要度:
   * - info: 情報提供（閾値未到達だが記録）
   * - warning: 改善を推奨（閾値到達）
   * - critical: 即時対応が必要（成功率 30% 以下など）
   */
  severity: "info" | "warning" | "critical";
  /** アクション生成の根拠となったルール名 */
  triggerRule: string;
  /** 根拠となったフィードバックIDの一覧 */
  sourceFeedbackIds: string[];
  /** 改善優先度スコア（0.0-1.0） */
  priorityScore: number;
  /** ユーザーへの表示メッセージ */
  message: string;
  /**
   * 推奨改善アクションの詳細。
   * auto_improvement の場合は ImprovementSuggestion を含む。
   */
  suggestedImprovement?: ImprovementSuggestion;
  /** アクション生成日時（ISO 8601 UTC） */
  generatedAt: string;
}
```

### 2-4. `SkillMetrics`

```typescript
/**
 * フィードバックルール評価に必要なスキルの現在メトリクス。
 * feedbackSlice および SkillAggregateView から取得する。
 */
export interface SkillMetrics {
  /** 対象スキル識別子 */
  skillId: string;
  /**
   * 直近30日間の実行成功率（0.0-1.0）。
   * 実行0件の場合は null（ルール評価をスキップ）。
   */
  successRate: number | null;
  /**
   * 最新評価スコア（0-100）。
   * 未評価の場合は null（正規化時に 0 として扱う）。
   */
  latestScore: number | null;
  /** 直近30日間のユーザーレーティング平均（1.0-5.0）。評価なしは null */
  averageUserRating: number | null;
  /** 未処理フィードバック（status: 'pending'）の件数 */
  pendingFeedbackCount: number;
  /** 直近30日間の総実行回数 */
  totalExecutions: number;
}
```

### 2-5. `PriorityParams`

```typescript
/**
 * 改善優先度計算の重みパラメータ。
 * デフォルト値は phase-2-design.md の要件定義に準拠する。
 * テスト時または重み調整時に差し替え可能。
 */
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

/** デフォルト重みパラメータ */
export const DEFAULT_PRIORITY_PARAMS: PriorityParams = {
  weightSuccessRate: 0.4,
  weightNormalizedScore: 0.4,
  weightFeedbackCount: 0.2,
};
```

---

## 3. ステータス遷移図

### 3-1. テキストベース状態遷移図

```
                  ┌──────────────┐
                  │   pending    │ ← 初期状態（フィードバック記録時）
                  └──────┬───┬──┘
                         │   │
          改善に反映      │   │  却下
                         │   │
                  ┌──────▼──┐ └──►┌───────────┐
                  │ applied │     │ dismissed │
                  └─────────┘     └───────────┘
                  （終端状態）     （終端状態）
```

### 3-2. 許可/禁止マトリクス

| 遷移元 → 遷移先 | pending | applied  | dismissed |
| --------------- | :-----: | :------: | :-------: |
| **pending**     |    -    | **許可** | **許可**  |
| **applied**     |  禁止   |    -     |   禁止    |
| **dismissed**   |  禁止   |   禁止   |     -     |

### 3-3. 遷移時の必須処理

| 遷移                | 必須処理                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- |
| pending → applied   | `processedAt` に現在日時（ISO 8601）を設定する                                     |
| pending → dismissed | `processedAt` に現在日時（ISO 8601）を設定する                                     |
| 禁止遷移            | `InvalidFeedbackStatusTransitionError` を throw し、エラーコード `2001` を付与する |

```typescript
/**
 * SkillFeedback のステータスを遷移させる純粋関数。
 * processedAt を自動設定し、禁止遷移は例外を投げる。
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

---

## 4. フィードバック還流ルール仕様

`evaluateFeedbackRules(skillId, metrics)` が評価するルール一覧を以下に定義する。
各ルールは独立しており、複数のルールが同時に発火する場合がある。

### ルール一覧

| #   | ルール名                      | 発火条件                                                                                      | 生成アクション種別     | severity   |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- | ---------- |
| 1   | `LOW_SUCCESS_RATE_CRITICAL`   | `successRate !== null && successRate < 0.30`                                                  | `improvement_alert`    | `critical` |
| 2   | `LOW_SUCCESS_RATE_WARNING`    | `successRate !== null && successRate >= 0.30 && successRate <= 0.50`                          | `improvement_alert`    | `warning`  |
| 3   | `LOW_USER_RATING`             | `averageUserRating !== null && averageUserRating < 3.0`                                       | `review_suggestion`    | `warning`  |
| 4   | `LOW_USER_RATING_BORDERLINE`  | `averageUserRating !== null && averageUserRating >= 3.0 && averageUserRating < 3.5`           | `review_suggestion`    | `info`     |
| 5   | `TEXT_FEEDBACK_ACCUMULATED`   | `pendingFeedbackCount >= 3`（`user_text` 種別のみカウント）                                   | `context_accumulation` | `info`     |
| 6   | `HIGH_IMPROVEMENT_SUGGESTION` | 未処理の `improvement_suggestion` 種別フィードバックに `priority: "high"` が1件以上存在       | `auto_improvement`     | `warning`  |
| 7   | `COMBINED_LOW_QUALITY`        | `successRate !== null && successRate <= 0.50` かつ `latestScore !== null && latestScore < 50` | `improvement_alert`    | `critical` |

### ルール詳細仕様

#### ルール 1: `LOW_SUCCESS_RATE_CRITICAL`

```
発火条件: successRate !== null && successRate < 0.30
生成アクション:
  actionType: "improvement_alert"
  severity: "critical"
  message: "スキルの実行成功率が {successRate * 100}% です。即時の改善を推奨します。"
  suggestedImprovement:
    targetSection: "prompt_template"
    suggestion: "実行失敗率が70%超のため、プロンプトテンプレートの根本的な見直しを行ってください。"
    priority: "high"
```

#### ルール 2: `LOW_SUCCESS_RATE_WARNING`

```
発火条件: successRate !== null && successRate >= 0.30 && successRate <= 0.50
生成アクション:
  actionType: "improvement_alert"
  severity: "warning"
  message: "スキルの実行成功率が {successRate * 100}% です（推奨: 50% 超）。改善を検討してください。"
  suggestedImprovement:
    targetSection: "examples"
    suggestion: "実行成功率を改善するため、examples セクションに成功例を追加してください。"
    priority: "medium"
```

#### ルール 3: `LOW_USER_RATING`

```
発火条件: averageUserRating !== null && averageUserRating < 3.0
生成アクション:
  actionType: "review_suggestion"
  severity: "warning"
  message: "ユーザーの平均評価が {averageUserRating.toFixed(1)} です（推奨: 3.0 以上）。改善を検討してください。"
  suggestedImprovement:
    targetSection: "output_format"
    suggestion: "ユーザー評価が低いため、出力形式・品質を見直してください。テキストフィードバックも参照してください。"
    priority: "medium"
```

#### ルール 4: `LOW_USER_RATING_BORDERLINE`

```
発火条件: averageUserRating !== null && averageUserRating >= 3.0 && averageUserRating < 3.5
生成アクション:
  actionType: "review_suggestion"
  severity: "info"
  message: "ユーザーの平均評価が {averageUserRating.toFixed(1)} です。さらなる品質改善の余地があります。"
  suggestedImprovement: undefined（参考情報のみ）
```

#### ルール 5: `TEXT_FEEDBACK_ACCUMULATED`

```
発火条件: user_text 種別の pending フィードバックが 3 件以上
生成アクション:
  actionType: "context_accumulation"
  severity: "info"
  message: "{pendingFeedbackCount} 件のテキストフィードバックが蓄積されています。改善提案に活用できます。"
  suggestedImprovement: undefined（コンテキスト提供のみ）
```

#### ルール 6: `HIGH_IMPROVEMENT_SUGGESTION`

```
発火条件: priority: "high" の ImprovementSuggestion フィードバックが 1 件以上 pending
生成アクション:
  actionType: "auto_improvement"
  severity: "warning"
  message: "優先度 HIGH の改善提案が {highPriorityCount} 件あります。"
  suggestedImprovement: 最初の HIGH 優先度提案の ImprovementSuggestion
```

#### ルール 7: `COMBINED_LOW_QUALITY`

```
発火条件: successRate <= 0.50 かつ latestScore < 50
生成アクション:
  actionType: "improvement_alert"
  severity: "critical"
  message: "成功率 {successRate * 100}% かつ評価スコア {latestScore} と、両指標が基準を下回っています。"
  suggestedImprovement:
    targetSection: "prompt_template"
    suggestion: "成功率・品質スコアの両方が基準を下回っています。プロンプトテンプレート全体を見直してください。"
    priority: "high"
```

### `evaluateFeedbackRules` 関数シグネチャ

```typescript
/**
 * スキルのメトリクスを入力としてフィードバック還流ルールを評価し、
 * 生成された改善アクションの一覧を返す。
 * ルールは全て独立評価（短絡評価なし）。順序はseverity降順（critical → warning → info）。
 *
 * @param skillId - 評価対象スキル識別子
 * @param metrics - スキルの現在メトリクス（SkillMetrics）
 * @param pendingFeedbacks - 未処理フィードバックの一覧（user_textカウント / high priority判定に使用）
 * @returns FeedbackAction[] 生成されたアクション（発火ルールがなければ空配列）
 */
export function evaluateFeedbackRules(
  skillId: string,
  metrics: SkillMetrics,
  pendingFeedbacks: SkillFeedback[],
): FeedbackAction[];
```

---

## 5. 改善優先度計算仕様

### 5-1. 関数シグネチャ

```typescript
/**
 * スキルの改善優先度スコアを計算する（0.0-1.0）。
 * スコアが高いほど改善優先度が高い。
 *
 * @param metrics - スキルの現在メトリクス
 * @param feedbackCount - 未処理フィードバック件数（pendingFeedbackCount と同値）
 * @param params - 重みパラメータ（省略時は DEFAULT_PRIORITY_PARAMS を使用）
 * @returns 改善優先度スコア（0.0-1.0）
 *
 * @throws {TypeError} metrics.successRate が null の場合でも例外は投げない（0 として扱う）
 */
export function calculateImprovementPriority(
  metrics: SkillMetrics,
  feedbackCount: number,
  params: PriorityParams = DEFAULT_PRIORITY_PARAMS,
): number;
```

### 5-2. 計算式と擬似コード

```
priority = (1 - successRate) * weightSuccessRate
         + (1 - normalizedScore) * weightNormalizedScore
         + min(feedbackCount, 10) / 10 * weightFeedbackCount
```

```pseudocode
function calculateImprovementPriority(metrics, feedbackCount, params):
  // --- 入力値の正規化 ---

  // successRate: null の場合は 0（成功実績なし = 最低品質として扱う）
  effectiveSuccessRate = metrics.successRate ?? 0.0

  // latestScore: null の場合は 0（未評価 = 最低品質として扱う）
  // 0-100 の範囲を 0.0-1.0 に正規化
  normalizedScore = (metrics.latestScore ?? 0) / 100.0

  // feedbackCount: 最大10件で頭打ち（min関数）
  cappedFeedbackCount = min(feedbackCount, 10)
  normalizedFeedback = cappedFeedbackCount / 10.0

  // --- 優先度スコア算出 ---
  priority = (1 - effectiveSuccessRate) * params.weightSuccessRate
           + (1 - normalizedScore)      * params.weightNormalizedScore
           + normalizedFeedback         * params.weightFeedbackCount

  // --- 範囲保証（浮動小数点誤差対応）---
  return clamp(priority, 0.0, 1.0)
```

### 5-3. 重みパラメータ表

| パラメータ名            | デフォルト値 | 意味                                   | 影響範囲 |
| ----------------------- | :----------: | -------------------------------------- | -------- |
| `weightSuccessRate`     |     0.4      | 実行成功率が低いほどスコアが上がる     | 0.0-0.4  |
| `weightNormalizedScore` |     0.4      | 評価スコアが低いほどスコアが上がる     | 0.0-0.4  |
| `weightFeedbackCount`   |     0.2      | フィードバックが多いほどスコアが上がる | 0.0-0.2  |
| **合計**                |   **1.0**    | -                                      | 0.0-1.0  |

### 5-4. スコア解釈ガイドライン

| スコア範囲 | 解釈          | 推奨アクション             |
| ---------- | ------------- | -------------------------- |
| 0.0 - 0.2  | 優先度: 低    | 定期的な確認のみ           |
| 0.2 - 0.4  | 優先度: 中-低 | 次スプリントでの改善候補   |
| 0.4 - 0.6  | 優先度: 中    | 早期の改善検討を推奨       |
| 0.6 - 0.8  | 優先度: 高    | 即座の改善アクションを推奨 |
| 0.8 - 1.0  | 優先度: 緊急  | 即時対応が必要             |

### 5-5. 計算例

| successRate | latestScore | feedbackCount | 計算式                               |         priority          |
| :---------: | :---------: | :-----------: | ------------------------------------ | :-----------------------: |
|    0.30     |     40      |       5       | (0.70×0.4) + (0.60×0.4) + (0.50×0.2) | 0.38+0.24+0.10 = **0.72** |
|    0.80     |     85      |       2       | (0.20×0.4) + (0.15×0.4) + (0.20×0.2) | 0.08+0.06+0.04 = **0.18** |
|    null     |    null     |       0       | (1.00×0.4) + (1.00×0.4) + (0.00×0.2) | 0.40+0.40+0.00 = **0.80** |
|    0.50     |     50      |      10       | (0.50×0.4) + (0.50×0.4) + (1.00×0.2) | 0.20+0.20+0.20 = **0.60** |

---

## 6. feedbackSlice 設計

### 6-1. State

```typescript
export interface FeedbackState {
  /**
   * スキルID をキーとした未処理フィードバックマップ。
   * 直近50件のみ Zustand persist に保持（SQLite が真の永続化層）。
   */
  feedbacksBySkillId: Record<string, SkillFeedback[]>;

  /**
   * スキルID をキーとした改善アクションマップ。
   * evaluateFeedbackRules() の実行結果を保持する。
   * UI 表示・通知の基盤データ。
   */
  feedbackActionsBySkillId: Record<string, FeedbackAction[]>;

  /**
   * スキルID をキーとした改善優先度スコアマップ（0.0-1.0）。
   * calculateImprovementPriority() の実行結果を保持する。
   */
  priorityScoreBySkillId: Record<string, number>;

  /** フィードバック送信中の状態管理 */
  isSubmitting: boolean;

  /** 最後に発生したエラーメッセージ（null = エラーなし） */
  lastError: string | null;
}
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
   * IPC 経由で Main Process / SQLite にも反映する。
   */
  applyFeedback: (feedbackId: string, skillId: string) => Promise<void>;

  /**
   * フィードバックのステータスを dismissed に遷移させる。
   * IPC 経由で Main Process / SQLite にも反映する。
   */
  dismissFeedback: (feedbackId: string, skillId: string) => Promise<void>;

  /**
   * 指定スキルのフィードバックアクションを再評価する。
   * SkillMetrics が更新された際に呼び出す（イベント駆動）。
   */
  reevaluateActions: (skillId: string, metrics: SkillMetrics) => void;

  /**
   * Main Process から IPC 経由でフィードバック一覧を初期ロードする。
   * アプリ起動時に一度呼び出す。
   */
  loadFeedbacks: (skillId: string) => Promise<void>;

  /** エラー状態をクリアする */
  clearError: () => void;
}
```

### 6-3. 個別セレクタ（P31/P48 対策準拠）

P31（合成Hook無限ループ）および P48（派生セレクタ無限ループ）対策として、
全セレクタを個別セレクタとして設計し、配列/オブジェクトを返すセレクタには `useShallow` を適用する。

```typescript
// --- 単一値セレクタ（useShallow 不要）---

/** 指定スキルの改善優先度スコアを取得する */
export const useFeedbackPriorityScore = (skillId: string): number =>
  useFeedbackStore((state) => state.priorityScoreBySkillId[skillId] ?? 0);

/** フィードバック送信中フラグを取得する */
export const useIsFeedbackSubmitting = (): boolean =>
  useFeedbackStore((state) => state.isSubmitting);

/** 最後のエラーメッセージを取得する */
export const useFeedbackLastError = (): string | null =>
  useFeedbackStore((state) => state.lastError);

// --- 配列/オブジェクトセレクタ（useShallow 必須: P48対策）---

/**
 * 指定スキルの未処理フィードバック一覧を取得する。
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
 * 指定スキルの critical severity アクションを取得する。
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

// --- アクションセレクタ（Zustand アクション参照は安定: P31対策）---

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

---

## 7. 配置先ディレクトリ計画

### 7-1. 型定義

| ファイルパス                                  | 内容                                                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-feedback.ts` | `SkillFeedback` / `ImprovementSuggestion` / `FeedbackAction` / `SkillMetrics` / `PriorityParams` / `DEFAULT_PRIORITY_PARAMS` |

`packages/shared` に配置する根拠: Renderer（feedbackSlice）と Main Process（IPCハンドラ）の両方が参照するため、`architecture-rules.md` の「共有コードは `packages/shared` に配置」原則に従う。

### 7-2. ルールエンジン・計算関数

| ファイルパス                                     | 内容                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `packages/shared/src/skill/feedback-rules.ts`    | `evaluateFeedbackRules()` 実装                                       |
| `packages/shared/src/skill/feedback-priority.ts` | `calculateImprovementPriority()` / `transitionFeedbackStatus()` 実装 |

純粋関数として実装し、`packages/shared` に配置することで Renderer/Main 双方からのテストを容易にする。

### 7-3. Zustand Store スライス

| ファイルパス                                                        | 内容                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/feedbackSlice.ts`           | `FeedbackState` / `FeedbackActions` / Zustand スライス実装 |
| `apps/desktop/src/renderer/store/slices/feedbackSlice.selectors.ts` | 個別セレクタ一覧（`usePendingFeedbacks` 等）               |

### 7-4. IPC ハンドラ（Main Process）

| ファイルパス                                 | 内容                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/feedback.ts` | `skill:feedback:submit` / `skill:feedback:update-status` / `skill:feedback:list` ハンドラ |

### 7-5. IPC チャンネル定数

| ファイルパス                                    | 追加チャンネル                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `packages/shared/src/constants/ipc-channels.ts` | `SKILL_FEEDBACK_SUBMIT` / `SKILL_FEEDBACK_UPDATE_STATUS` / `SKILL_FEEDBACK_LIST` |

### 7-6. テスト

| ファイルパス                                                             | 内容                                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `packages/shared/src/skill/__tests__/feedback-rules.test.ts`             | `evaluateFeedbackRules()` ルール別テスト                               |
| `packages/shared/src/skill/__tests__/feedback-priority.test.ts`          | `calculateImprovementPriority()` / `transitionFeedbackStatus()` テスト |
| `apps/desktop/src/renderer/store/slices/__tests__/feedbackSlice.test.ts` | Store スライステスト                                                   |

---

## 8. 設計上の注意事項

### 8-1. 終端状態からの遷移禁止（P02-code-quality 準拠）

`applied` / `dismissed` は終端状態であり、いかなる遷移も禁止する。
誤遷移は `transitionFeedbackStatus()` でビジネスエラー（コード `2001`）として検出する。

### 8-2. フィードバック値の型ガード

`SkillFeedback.value` は `number | string | ImprovementSuggestion` のユニオン型である。
実行時に値を参照する際は必ず型ガードを経由する:

```typescript
function isImprovementSuggestion(
  value: unknown,
): value is ImprovementSuggestion {
  return (
    value != null &&
    typeof value === "object" &&
    "targetSection" in value &&
    typeof (value as Record<string, unknown>).targetSection === "string" &&
    "suggestion" in value &&
    typeof (value as Record<string, unknown>).suggestion === "string" &&
    "priority" in value
  );
}
```

（P49: type predicate 内の `as` キャスト vs `in` 演算子 対策として `in` 演算子を使用）

### 8-3. Zustand persist 対象の制限

`feedbacksBySkillId` は直近50件を Zustand persist に保持するが、
`metadata.errorMessage` を含む機密フィールドは `partialize` で除外する（`security-principles.md` 準拠）。
全履歴の永続化は SQLite（Main Process）が担う。

### 8-4. ルール評価の冪等性

`evaluateFeedbackRules()` は純粋関数として実装し、同一入力に対して常に同一の出力を返す。
副作用（IPC送信・SQLite書き込み）は Store の `addFeedback` / `reevaluateActions` アクションに委譲する。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 2 タスク3_
