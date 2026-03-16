# Phase 8: 重複排除レポート

> タスク: TASK-SKILL-LIFECYCLE-07（Skill Lifecycle History & Feedback）
> フェーズ: Phase 8 - リファクタリング
> 作成日: 2026-03-16
> 種別: ドキュメント専用設計タスク（コード実行なし）

---

## 1. 目的

Phase 5 の実装仕様書群における重複ロジック・共通化可能なパターンを検出し、ファクトリ関数・バリデーション・型ガードの共通化方針を定義する。

---

## 2. イベント記録ロジックの重複検出

### 2.1 ファクトリ関数パターン

Phase 5 で以下の3つのファクトリ関数が定義されている。

| ファクトリ関数                   | 定義ファイル                     | 生成対象                  |
| -------------------------------- | -------------------------------- | ------------------------- |
| `createLifecycleEvent()`         | event-model-impl-spec.md         | `SkillLifecycleEvent`     |
| `createFeedback()`               | feedback-model-impl-spec.md      | `SkillFeedback`           |
| `buildPublishReadinessMetrics()` | publish-metrics-api-impl-spec.md | `PublishReadinessMetrics` |

**共通パターンの検出**:

各ファクトリ関数には以下の共通処理が含まれる。

1. **P42準拠 3段バリデーション**: `typeof` チェック → 空文字列チェック → `.trim()` 空文字列チェック
2. **UUID v4 生成**: `crypto.randomUUID()` による一意識別子付与
3. **ISO 8601 タイムスタンプ生成**: `new Date().toISOString()`
4. **`SkillName` 検証**: Branded Type の入力バリデーション

### 2.2 共通化提案: バリデーションユーティリティ

```typescript
// 共通化候補: packages/shared/src/skill/lifecycle-utils.ts

/** P42準拠: 文字列引数の3段バリデーション */
function validateNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw { code: 1001, message: `${fieldName} must be a string` };
  }
  if (value === "") {
    throw { code: 1002, message: `${fieldName} must not be empty` };
  }
  if (value.trim() === "") {
    throw { code: 1003, message: `${fieldName} must not be whitespace-only` };
  }
  return value.trim();
}

/** SkillName バリデーション（P42 + Branded Type） */
function validateSkillName(value: unknown): SkillName {
  const validated = validateNonEmptyString(value, "skillName");
  return toSkillName(validated);
}
```

**重複削減効果**:

- `createLifecycleEvent()`: 3段バリデーション部分を `validateSkillName()` 1行に置換
- `createFeedback()`: 同上
- IPC ハンドラ: `validateNonEmptyString()` で統一（現在各ハンドラに個別実装）

---

## 3. メタデータバリデーションの共通化

### 3.1 現状の重複

Phase 5 `event-model-impl-spec.md` では、5つの EventCategory ごとにメタデータ検証ロジックが定義されている。

| カテゴリ    | メタデータ型          | 固有フィールド数                           |
| ----------- | --------------------- | ------------------------------------------ |
| creation    | `CreationMetadata`    | 2（source, templateName?）                 |
| execution   | `ExecutionMetadata`   | 4（duration, success, errorCode?, input?） |
| evaluation  | `EvaluationMetadata`  | 3（score, evaluator, criteria?）           |
| improvement | `ImprovementMetadata` | 3（changeType, diff?, reason?）            |
| reuse       | `ReuseMetadata`       | 2（context, adaptations?）                 |

### 3.2 共通化提案: メタデータバリデータマップ

```typescript
// EVENT_CATEGORY_MAP を活用した動的バリデーション
const METADATA_VALIDATORS: Record<EventCategory, (meta: unknown) => boolean> = {
  creation: isCreationMetadata,
  execution: isExecutionMetadata,
  evaluation: isEvaluationMetadata,
  improvement: isImprovementMetadata,
  reuse: isReuseMetadata,
};

function validateEventMetadata(
  category: EventCategory,
  metadata: unknown,
): boolean {
  return METADATA_VALIDATORS[category](metadata);
}
```

**P49準拠**: 各型ガード関数は `in` 演算子で実行時プロパティ検証を行う（`as` キャスト禁止）。

---

## 4. 集約計算ロジックの重複検出

### 4.1 Pure Functions 間の共通パターン

Phase 5 `aggregate-logic-impl-spec.md` の4つの純粋関数を分析。

| 関数                           | 入力フィルタリング            | 数値計算          | 出力正規化 |
| ------------------------------ | ----------------------------- | ----------------- | ---------- |
| `calculateSuccessRate`         | 実行イベント抽出（期間/件数） | 成功数/総数       | 0〜1       |
| `calculateTrend`               | 直近N件抽出                   | 線形回帰の傾き    | -1〜1      |
| `calculateRecommendationScore` | なし                          | 重み付き合計      | 0〜1       |
| `buildAggregateView`           | 全イベント                    | 上記3関数の組合せ | 複合型     |

**共通パターン**: 「イベント配列からのフィルタリング → 数値計算 → 範囲正規化」

### 4.2 共通化提案: フィルタリングユーティリティ

```typescript
/** 期間指定でイベントをフィルタリング */
function filterEventsByPeriod(
  events: readonly SkillLifecycleEvent[],
  category: EventCategory,
  periodDays: number,
): SkillLifecycleEvent[] {
  const cutoff = Date.now() - periodDays * 86400000;
  return events.filter(
    (e) => e.category === category && new Date(e.createdAt).getTime() >= cutoff,
  );
}

/** 件数指定でイベントをフィルタリング */
function filterEventsByCount(
  events: readonly SkillLifecycleEvent[],
  category: EventCategory,
  count: number,
): SkillLifecycleEvent[] {
  return events.filter((e) => e.category === category).slice(-count);
}
```

**重複削減効果**:

- `calculateSuccessRate`: `periodDays === Infinity` の場合は `filterEventsByCount` を使用（INT-M-01対応）
- `calculateTrend`: `filterEventsByCount` で直近N件を取得

---

## 5. フィードバックルール評価の重複検出

### 5.1 現状

Phase 5 `feedback-model-impl-spec.md` の `evaluateFeedbackRules()` は7つのルールを順次評価する。

| ルールID | トリガー条件               | アクション         |
| -------- | -------------------------- | ------------------ |
| R1       | 成功率 < 0.5               | 改善提案生成       |
| R2       | 連続失敗 >= 3              | 緊急アラート       |
| R3       | 未使用期間 > 30日          | アーカイブ提案     |
| R4       | ユーザー評価平均 < 2.0     | レビュー要求       |
| R5       | スコア下降トレンド         | 品質低下警告       |
| R6       | 使用頻度急増               | テンプレート化提案 |
| R7       | フィードバック未対応 > 5件 | 優先対応要求       |

### 5.2 共通化提案: ルールエンジンパターン

```typescript
interface FeedbackRule {
  readonly id: string;
  readonly evaluate: (metrics: SkillMetrics) => boolean;
  readonly action: FeedbackAction;
  readonly priority: number;
}

const FEEDBACK_RULES: readonly FeedbackRule[] = [
  { id: "R1", evaluate: (m) => m.successRate < 0.5, action: ..., priority: 3 },
  // ...
];

function evaluateFeedbackRules(metrics: SkillMetrics): FeedbackAction[] {
  return FEEDBACK_RULES
    .filter((rule) => rule.evaluate(metrics))
    .sort((a, b) => b.priority - a.priority)
    .map((rule) => rule.action);
}
```

**利点**: ルール追加時に配列にエントリを追加するだけで拡張可能（Open-Closed Principle準拠）。

---

## 6. Zustand Slice 間の重複検出

### 6.1 検出結果

Phase 5 で定義された2つの Slice を比較。

| 項目               | `lifecycleHistorySlice`                  | `feedbackSlice`                          |
| ------------------ | ---------------------------------------- | ---------------------------------------- |
| persist config     | `partialize` で `aggregateViews` 除外    | `partialize` で `pendingActions` 除外    |
| P31対策            | 個別セレクタ（`useLifecycleEvents()`等） | 個別セレクタ（`useFeedbackBySkill()`等） |
| P48対策            | `useShallow` for array selectors         | `useShallow` for array selectors         |
| エラーハンドリング | `isLoading` / `error` 状態管理           | `isLoading` / `error` 状態管理           |

### 6.2 共通化提案: Slice ヘルパー

```typescript
/** 共通ローディング状態管理パターン */
interface AsyncSliceState {
  isLoading: boolean;
  error: string | null;
}

/** 共通 async action パターン */
function createAsyncAction<T>(
  set: SetState,
  action: () => Promise<T>,
): Promise<T> {
  set({ isLoading: true, error: null });
  try {
    const result = await action();
    set({ isLoading: false });
    return result;
  } catch (e) {
    set({
      isLoading: false,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}
```

**適用範囲**: 両 Slice の `fetch*` / `add*` アクションに共通適用可能。

---

## 7. 重複排除サマリ

| 重複箇所               | 共通化手段                     | 影響ファイル数 | 優先度 |
| ---------------------- | ------------------------------ | -------------- | ------ |
| P42 3段バリデーション  | `validateNonEmptyString()`     | 5+             | 高     |
| SkillName検証          | `validateSkillName()`          | 3              | 高     |
| メタデータ型ガード     | `METADATA_VALIDATORS` マップ   | 1              | 中     |
| イベントフィルタリング | `filterEventsByPeriod/Count()` | 2              | 中     |
| フィードバックルール   | ルールエンジンパターン         | 1              | 低     |
| Slice async状態管理    | `createAsyncAction()`          | 2              | 低     |
