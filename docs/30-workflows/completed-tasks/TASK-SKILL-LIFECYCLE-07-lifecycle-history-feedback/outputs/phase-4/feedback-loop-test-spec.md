# フィードバック還流テスト仕様書

## メタ情報

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 4                                                                                                                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                         |
| 作成日     | 2026-03-16                                                                                                                                      |
| ステータス | TDD Red フェーズ（全テストケースは実装前に作成され、実行時点では全て失敗する）                                                                  |
| 入力成果物 | `outputs/phase-2/feedback-loop-design.md`                                                                                                       |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-4/feedback-loop-test-spec.md` |

> **Red フェーズの明示**
> 本仕様書に記載する全テストケースは、Phase 5 実装開始前の時点では **全て失敗する（Red 状態）** ことを意図して設計されている。`transitionFeedbackStatus`、`evaluateFeedbackRules`、`calculateImprovementPriority` のいずれの関数も存在しない状態でテストを実行すると `ReferenceError` が発生することが期待される。

---

## 1. テスト対象ファイルと配置

| テストファイル                                                           | テスト対象                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `packages/shared/src/skill/__tests__/feedback-record.test.ts`            | `SkillFeedback` オブジェクト生成・フィールド検証                |
| `packages/shared/src/skill/__tests__/feedback-priority.test.ts`          | `transitionFeedbackStatus()` / `calculateImprovementPriority()` |
| `packages/shared/src/skill/__tests__/feedback-rules.test.ts`             | `evaluateFeedbackRules()` 全 7 ルール                           |
| `apps/desktop/src/renderer/store/slices/__tests__/feedbackSlice.test.ts` | Zustand feedbackSlice                                           |

---

## 2. フィードバック記録テスト

### 2-1. 4 種別のフィードバック記録

| テストID   | テスト名                                                | 入力                                                                                                                                                      | 期待値                                                                                               | 分類 |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| FB-REC-001 | auto_metric フィードバックを正しく生成できる            | `createMockFeedback({ feedbackType: "auto_metric", value: 0.75 })`                                                                                        | `feedbackType === "auto_metric"`, `typeof value === "number"`, `status === "pending"`                | 正常 |
| FB-REC-002 | user_rating フィードバックを正しく生成できる            | `createMockFeedback({ feedbackType: "user_rating", value: 4 })`                                                                                           | `feedbackType === "user_rating"`, `value >= 1 && value <= 5`, `status === "pending"`                 | 正常 |
| FB-REC-003 | user_text フィードバックを正しく生成できる              | `createMockFeedback({ feedbackType: "user_text", value: "改善が必要です" })`                                                                              | `feedbackType === "user_text"`, `typeof value === "string"`, `status === "pending"`                  | 正常 |
| FB-REC-004 | improvement_suggestion フィードバックを正しく生成できる | `createMockFeedback({ feedbackType: "improvement_suggestion", value: { targetSection: "prompt_template", suggestion: "見直し推奨", priority: "high" } })` | `feedbackType === "improvement_suggestion"`, `value.targetSection` が string, `status === "pending"` | 正常 |
| FB-REC-005 | id が UUID v4 形式である                                | `createMockFeedback({})`                                                                                                                                  | `id` が `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i` にマッチ          | 正常 |
| FB-REC-006 | sourceEventId が設定されている                          | `createMockFeedback({ sourceEventId: "event-uuid-123" })`                                                                                                 | `sourceEventId === "event-uuid-123"`                                                                 | 正常 |
| FB-REC-007 | createdAt が ISO 8601 UTC 形式である                    | `createMockFeedback({})`                                                                                                                                  | `createdAt` が `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/` にマッチ                            | 正常 |
| FB-REC-008 | status の初期値が "pending" である                      | `createMockFeedback({})`                                                                                                                                  | `status === "pending"`                                                                               | 正常 |
| FB-REC-009 | processedAt が初期状態では undefined である             | `createMockFeedback({})`                                                                                                                                  | `processedAt === undefined`                                                                          | 正常 |

---

## 3. ステータス遷移テスト（`transitionFeedbackStatus`）

シグネチャ: `transitionFeedbackStatus(feedback: SkillFeedback, nextStatus: "applied" | "dismissed", now?: string): SkillFeedback`

### 3-1. 許可された遷移

| テストID  | テスト名                                                         | 入力                                                                                  | 期待値                                                                       | 分類 |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| FB-ST-001 | pending → applied 遷移が成功する                                 | `feedback = { status: "pending", ... }`, `nextStatus = "applied"`                     | 返値の `status === "applied"`, `processedAt` が ISO 8601 形式で設定される    | 正常 |
| FB-ST-002 | pending → dismissed 遷移が成功する                               | `feedback = { status: "pending", ... }`, `nextStatus = "dismissed"`                   | 返値の `status === "dismissed"`, `processedAt` が ISO 8601 形式で設定される  | 正常 |
| FB-ST-003 | 遷移後に元の feedback オブジェクトが不変である（イミュータブル） | `feedback = { status: "pending", id: "abc", ... }`, 遷移後に `feedback.status` を確認 | 元の `feedback.status` が `"pending"` のまま（スプレッド構文でコピーされる） | 正常 |
| FB-ST-004 | now パラメータを渡すと processedAt に使用される                  | `now = "2026-03-16T07:17:53.000Z"`                                                    | 返値の `processedAt === "2026-03-16T07:17:53.000Z"`                          | 正常 |
| FB-ST-005 | now を省略した場合に現在時刻が processedAt に設定される          | `now` を省略                                                                          | 返値の `processedAt` が現在時刻±1秒以内の ISO 8601 文字列                    | 正常 |

### 3-2. 禁止された遷移（ビジネスエラー）

| テストID  | テスト名                                   | 入力                                                                                                                  | 期待値                                                                                                                    | 分類 |
| --------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---- |
| FB-ST-006 | applied → pending 遷移を拒否する           | `feedback = { status: "applied", ... }`, `nextStatus = "pending"`（型エラーのため直接テスト不可、実行時エラーを検証） | `InvalidFeedbackStatusTransitionError` を throw、`error.code === "INVALID_STATUS_TRANSITION"`, `error.errorCode === 2001` | 異常 |
| FB-ST-007 | applied → dismissed 遷移を拒否する         | `feedback = { status: "applied", ... }`, `nextStatus = "dismissed"`                                                   | エラーコード `2001` の例外を throw                                                                                        | 異常 |
| FB-ST-008 | dismissed → pending 遷移を拒否する         | `feedback = { status: "dismissed", ... }`, `nextStatus = "applied"`                                                   | エラーコード `2001` の例外を throw                                                                                        | 異常 |
| FB-ST-009 | dismissed → applied 遷移を拒否する         | `feedback = { status: "dismissed", ... }`, `nextStatus = "applied"`                                                   | エラーコード `2001` の例外を throw                                                                                        | 異常 |
| FB-ST-010 | エラーメッセージに現状態と次状態が含まれる | `feedback = { status: "applied", ... }`, `nextStatus = "dismissed"`                                                   | エラーメッセージに `"applied"` と `"dismissed"` の両文字列が含まれる                                                      | 異常 |

---

## 4. 改善優先度計算テスト（`calculateImprovementPriority`）

シグネチャ: `calculateImprovementPriority(metrics: SkillMetrics, feedbackCount: number, params?: PriorityParams): number`
計算式: `(1 - successRate) * 0.4 + (1 - normalizedScore) * 0.4 + min(feedbackCount, 10) / 10 * 0.2`

### 4-1. 正常系

| テストID  | テスト名                                | 入力                                                                                        | 期待値                                                          | 分類 |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---- |
| FB-PR-001 | 典型的な値で正しいスコアを計算する      | `{ successRate: 0.30, latestScore: 40, ... }`, `feedbackCount = 5`                          | `0.72`（(0.70×0.4) + (0.60×0.4) + (0.50×0.2) = 0.28+0.24+0.10） | 正常 |
| FB-PR-002 | 高品質スキルで低いスコアを計算する      | `{ successRate: 0.80, latestScore: 85, ... }`, `feedbackCount = 2`                          | `0.18`（(0.20×0.4) + (0.15×0.4) + (0.20×0.2) = 0.08+0.06+0.04） | 正常 |
| FB-PR-003 | successRate が null で 0 として扱われる | `{ successRate: null, latestScore: null, ... }`, `feedbackCount = 0`                        | `0.80`（(1.0×0.4) + (1.0×0.4) + (0×0.2)）                       | 正常 |
| FB-PR-004 | feedbackCount が 10 で計算する          | `{ successRate: 0.50, latestScore: 50, ... }`, `feedbackCount = 10`                         | `0.60`（(0.50×0.4) + (0.50×0.4) + (1.00×0.2) = 0.20+0.20+0.20） | 正常 |
| FB-PR-005 | カスタム重みパラメータで計算できる      | `params = { weightSuccessRate: 1.0, weightNormalizedScore: 0.0, weightFeedbackCount: 0.0 }` | `successRate` の寄与のみ反映される                              | 正常 |

### 4-2. 境界値

| テストID  | テスト名                                            | 入力                                                               | 期待値                                         | 分類 |
| --------- | --------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ---- |
| FB-PR-006 | feedbackCount が 10 超で頭打ちになる（max10）       | `{ successRate: 0.0, latestScore: 0, ... }`, `feedbackCount = 20`  | `feedbackCount = 10` と同一結果（0.20 の寄与） | 境界 |
| FB-PR-007 | feedbackCount が 0 で feedbackComponent が 0 になる | `{ successRate: 0.0, latestScore: 0, ... }`, `feedbackCount = 0`   | `0.80`（feedbackComponent = 0）                | 境界 |
| FB-PR-008 | latestScore が 0 で normalizedScore が 0 になる     | `{ successRate: 0.0, latestScore: 0, ... }`, `feedbackCount = 0`   | `0.80`                                         | 境界 |
| FB-PR-009 | latestScore が 100 で normalizedScore が 1.0 になる | `{ successRate: 1.0, latestScore: 100, ... }`, `feedbackCount = 0` | `0.0`                                          | 境界 |
| FB-PR-010 | 結果が 0.0 未満にならない（下限クランプ）           | 全要素最大値                                                       | `>= 0.0`                                       | 境界 |
| FB-PR-011 | 結果が 1.0 超にならない（上限クランプ）             | 全要素最小値                                                       | `<= 1.0`                                       | 境界 |

---

## 5. フィードバック還流ルール発火テスト（`evaluateFeedbackRules`）

シグネチャ: `evaluateFeedbackRules(skillId: string, metrics: SkillMetrics, pendingFeedbacks: SkillFeedback[]): FeedbackAction[]`

### 5-1. ルール 1: `LOW_SUCCESS_RATE_CRITICAL`

| テストID  | テスト名                                                      | 入力 `metrics.successRate` | 期待値                                                                                                                                 | 分類 |
| --------- | ------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| FB-RL-001 | successRate が 0.29 でルールが発火する                        | `successRate = 0.29`       | `FeedbackAction[]` に `{ actionType: "improvement_alert", severity: "critical", triggerRule: "LOW_SUCCESS_RATE_CRITICAL" }` が含まれる | 正常 |
| FB-RL-002 | successRate が 0.30 で LOW_SUCCESS_RATE_CRITICAL が発火しない | `successRate = 0.30`       | `triggerRule === "LOW_SUCCESS_RATE_CRITICAL"` のアクションが含まれない                                                                 | 境界 |
| FB-RL-003 | successRate が 0.0 でルールが発火する                         | `successRate = 0.0`        | `triggerRule === "LOW_SUCCESS_RATE_CRITICAL"` のアクションが含まれる                                                                   | 境界 |
| FB-RL-004 | successRate が null でルールが発火しない                      | `successRate = null`       | `triggerRule === "LOW_SUCCESS_RATE_CRITICAL"` のアクションが含まれない                                                                 | 正常 |

### 5-2. ルール 2: `LOW_SUCCESS_RATE_WARNING`

| テストID  | テスト名                                 | 入力 `metrics.successRate` | 期待値                                                                                              | 分類 |
| --------- | ---------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- | ---- |
| FB-RL-005 | successRate が 0.30 でルールが発火する   | `successRate = 0.30`       | `{ actionType: "improvement_alert", severity: "warning", triggerRule: "LOW_SUCCESS_RATE_WARNING" }` | 境界 |
| FB-RL-006 | successRate が 0.50 でルールが発火する   | `successRate = 0.50`       | `triggerRule === "LOW_SUCCESS_RATE_WARNING"` のアクションが含まれる                                 | 境界 |
| FB-RL-007 | successRate が 0.51 でルールが発火しない | `successRate = 0.51`       | `triggerRule === "LOW_SUCCESS_RATE_WARNING"` のアクションが含まれない                               | 境界 |

### 5-3. ルール 3: `LOW_USER_RATING`

| テストID  | テスト名                                                 | 入力 `metrics.averageUserRating` | 期待値                                                                                     | 分類 |
| --------- | -------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| FB-RL-008 | averageUserRating が 2.9 でルールが発火する              | `averageUserRating = 2.9`        | `{ actionType: "review_suggestion", severity: "warning", triggerRule: "LOW_USER_RATING" }` | 正常 |
| FB-RL-009 | averageUserRating が 3.0 で LOW_USER_RATING が発火しない | `averageUserRating = 3.0`        | `triggerRule === "LOW_USER_RATING"` のアクションが含まれない                               | 境界 |
| FB-RL-010 | averageUserRating が null でルールが発火しない           | `averageUserRating = null`       | `triggerRule === "LOW_USER_RATING"` のアクションが含まれない                               | 正常 |

### 5-4. ルール 4: `LOW_USER_RATING_BORDERLINE`

| テストID  | テスト名                                      | 入力 `metrics.averageUserRating` | 期待値                                                                                             | 分類 |
| --------- | --------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| FB-RL-011 | averageUserRating が 3.0 でルールが発火する   | `averageUserRating = 3.0`        | `{ actionType: "review_suggestion", severity: "info", triggerRule: "LOW_USER_RATING_BORDERLINE" }` | 境界 |
| FB-RL-012 | averageUserRating が 3.49 でルールが発火する  | `averageUserRating = 3.49`       | `triggerRule === "LOW_USER_RATING_BORDERLINE"` が含まれる                                          | 境界 |
| FB-RL-013 | averageUserRating が 3.5 でルールが発火しない | `averageUserRating = 3.5`        | `triggerRule === "LOW_USER_RATING_BORDERLINE"` が含まれない                                        | 境界 |

### 5-5. ルール 5: `TEXT_FEEDBACK_ACCUMULATED`

| テストID  | テスト名                                                   | 入力 `pendingFeedbacks`                                            | 期待値                                                                                               | 分類 |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---- |
| FB-RL-014 | user_text の pending が 3 件でルールが発火する             | `user_text` × 3 件（全て pending）                                 | `{ actionType: "context_accumulation", severity: "info", triggerRule: "TEXT_FEEDBACK_ACCUMULATED" }` | 境界 |
| FB-RL-015 | user_text の pending が 2 件でルールが発火しない           | `user_text` × 2 件（全て pending）                                 | `triggerRule === "TEXT_FEEDBACK_ACCUMULATED"` が含まれない                                           | 境界 |
| FB-RL-016 | applied/dismissed の user_text は件数カウントに含めない    | `user_text` × 3 件（applied 含む）で pending は 2 件               | `triggerRule === "TEXT_FEEDBACK_ACCUMULATED"` が含まれない                                           | 正常 |
| FB-RL-017 | improvement_suggestion 種別は user_text カウントに含めない | `user_text` × 2 件 + `improvement_suggestion` × 2 件（全 pending） | `triggerRule === "TEXT_FEEDBACK_ACCUMULATED"` が含まれない                                           | 正常 |

### 5-6. ルール 6: `HIGH_IMPROVEMENT_SUGGESTION`

| テストID  | テスト名                                                             | 入力 `pendingFeedbacks`                                        | 期待値                                                                                                | 分類 |
| --------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| FB-RL-018 | priority: "high" の improvement_suggestion が 1 件でルールが発火する | `improvement_suggestion` × 1 件（priority: "high", pending）   | `{ actionType: "auto_improvement", severity: "warning", triggerRule: "HIGH_IMPROVEMENT_SUGGESTION" }` | 境界 |
| FB-RL-019 | priority: "medium" のみでルールが発火しない                          | `improvement_suggestion` × 3 件（priority: "medium", pending） | `triggerRule === "HIGH_IMPROVEMENT_SUGGESTION"` が含まれない                                          | 正常 |
| FB-RL-020 | priority: "high" の dismissed は件数に含めない                       | `improvement_suggestion` × 1 件（priority: "high", dismissed） | `triggerRule === "HIGH_IMPROVEMENT_SUGGESTION"` が含まれない                                          | 正常 |

### 5-7. ルール 7: `COMBINED_LOW_QUALITY`

| テストID  | テスト名                                                      | 入力                                     | 期待値                                                                                           | 分類 |
| --------- | ------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| FB-RL-021 | successRate <= 0.50 かつ latestScore < 50 でルールが発火する  | `{ successRate: 0.40, latestScore: 45 }` | `{ actionType: "improvement_alert", severity: "critical", triggerRule: "COMBINED_LOW_QUALITY" }` | 正常 |
| FB-RL-022 | successRate が 0.50 かつ latestScore が 49 でルールが発火する | `{ successRate: 0.50, latestScore: 49 }` | `triggerRule === "COMBINED_LOW_QUALITY"` が含まれる                                              | 境界 |
| FB-RL-023 | successRate が 0.51 ではルールが発火しない                    | `{ successRate: 0.51, latestScore: 40 }` | `triggerRule === "COMBINED_LOW_QUALITY"` が含まれない                                            | 境界 |
| FB-RL-024 | latestScore が 50 ではルールが発火しない                      | `{ successRate: 0.40, latestScore: 50 }` | `triggerRule === "COMBINED_LOW_QUALITY"` が含まれない                                            | 境界 |

### 5-8. 複数ルール同時発火・非発火

| テストID  | テスト名                                                | 入力                                                                                      | 期待値                                                                                   | 分類 |
| --------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---- |
| FB-RL-025 | 複数ルールが同時に発火する                              | `{ successRate: 0.20, latestScore: 30, averageUserRating: 2.5 }`                          | `LOW_SUCCESS_RATE_CRITICAL`, `LOW_USER_RATING`, `COMBINED_LOW_QUALITY` の 3 ルールが発火 | 正常 |
| FB-RL-026 | 高品質スキルで全ルールが発火しない                      | `{ successRate: 0.90, latestScore: 85, averageUserRating: 4.5 }`, `pendingFeedbacks = []` | `evaluateFeedbackRules(...)` が空配列を返す                                              | 正常 |
| FB-RL-027 | 返値が severity 降順（critical → warning → info）で並ぶ | 複数ルールが発火する入力                                                                  | 返値配列の severity が `critical, ..., warning, ..., info, ...` の順で並ぶ               | 正常 |

---

## 6. テストケース件数サマリー

| カテゴリ                            | 件数   |
| ----------------------------------- | ------ |
| フィードバック記録テスト            | 9      |
| ステータス遷移テスト（許可）        | 5      |
| ステータス遷移テスト（禁止）        | 5      |
| 改善優先度計算テスト（正常系）      | 5      |
| 改善優先度計算テスト（境界値）      | 6      |
| 還流ルール発火テスト（全 7 ルール） | 27     |
| **合計**                            | **57** |

---

## 7. テスト実装ガイドライン

```typescript
// packages/shared/src/skill/__tests__/feedback-priority.test.ts

import { describe, it, expect } from "vitest";
import {
  transitionFeedbackStatus,
  calculateImprovementPriority,
} from "../feedback-priority";
import { createMockFeedback } from "../../__test-utils__/factories";

describe("transitionFeedbackStatus", () => {
  it("FB-ST-001: pending → applied 遷移が成功する", () => {
    const feedback = createMockFeedback({ status: "pending" });
    const now = "2026-03-16T07:17:53.000Z";
    // Phase 5 実装前は ReferenceError が発生する（Red 状態）
    const result = transitionFeedbackStatus(feedback, "applied", now);
    expect(result.status).toBe("applied");
    expect(result.processedAt).toBe(now);
    // イミュータブル確認
    expect(feedback.status).toBe("pending");
  });

  it("FB-ST-006: applied → pending 遷移を拒否する（errorCode 2001）", () => {
    const feedback = createMockFeedback({ status: "applied" });
    expect(() =>
      transitionFeedbackStatus(feedback, "applied" as "applied" | "dismissed"),
    ).toThrow(expect.objectContaining({ errorCode: 2001 }));
  });
});

describe("evaluateFeedbackRules", () => {
  it("FB-RL-026: 高品質スキルで全ルールが発火しない", () => {
    const metrics = {
      skillId: "test-skill",
      successRate: 0.9,
      latestScore: 85,
      averageUserRating: 4.5,
      pendingFeedbackCount: 0,
      totalExecutions: 100,
    };
    // Phase 5 実装前は ReferenceError が発生する（Red 状態）
    const result = evaluateFeedbackRules("test-skill", metrics, []);
    expect(result).toEqual([]);
  });
});
```

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 4_
