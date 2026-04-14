# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 5                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 4                                                                 |
| 後続Phase  | Phase 6                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 2 で設計し Phase 3 でレビュー済みの変更を、実際のソースファイルへ適用する。
7ファイルの修正を順序に従って実施し、型チェックとテストが通ることを確認する。

## 実行タスク

- [ ] `packages/shared/src/types/skillCreator.ts`の`category`型を変更する
- [ ] `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`を修正する
- [ ] `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`を修正する
- [ ] `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`を修正する
- [ ] 修正後に型チェック・テストが通ることを確認する

## 参照資料

| 資料名     | パス                       | 説明                       |
| ---------- | -------------------------- | -------------------------- |
| 設計書     | `phase-2-design.md`        | 変更前・変更後コードの仕様 |
| テスト仕様 | `phase-4-test-creation.md` | 実装後に通るべきテスト     |

## 実行手順

### Step 1: ファイル種別の確認

| ファイル                                                                        | 操作種別 | 変更内容                                                                |
| ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                     | 修正     | `SkillInfoFormData.category`: `SkillCategory[]` へ整理                  |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | 修正     | format 推論をカテゴリ配列対応へ整理                                     |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | 修正     | shared 推論の薄い再利用へ整理                                           |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`           | 修正     | `handleCategoryClick`・`isSelected`・`isNextEnabled`・ボタンスタイル    |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`        | 修正     | Q5 必須判定の配列対応                                                   |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 修正     | `currentQuestion` と Q5 必須判定を配列対応                              |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`              | 修正     | shared 推論の利用・代表カテゴリ解決・LLMモード「次へ」ボタンのCSS変数化 |

### Step 2: `skillCreator.ts`の修正

`SkillInfoFormData`インターフェースの`category`フィールドを以下の通り変更する。未選択は空配列 `[]` で表現し、`null` は使わない。

```typescript
// 変更前
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  /** スキルカテゴリ（未選択時は null） */
  category: SkillCategory | null;
}

// 変更後
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  /** スキルカテゴリ（複数選択可・未選択時は空配列） */
  category: SkillCategory[];
}
```

### Step 3: `SkillInfoStep.tsx`の修正

以下の3箇所を変更する。

**（1）`handleCategoryClick`の変更（複数選択・トグル解除）:**

```typescript
// 変更前
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category === value) return;
  onFormDataChange({ ...formData, category: value });
};

// 変更後
const handleCategoryClick = (value: SkillCategory) => {
  const next = formData.category.includes(value)
    ? formData.category.filter((c) => c !== value)
    : [...formData.category, value];
  onFormDataChange({ ...formData, category: next });
};
```

**（2）`isNextEnabled`の変更:**

```typescript
// 変更前
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;

// 変更後
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category.length > 0;
```

**（3）カテゴリボタンの`isSelected`判定の変更:**

```typescript
// 変更前
const isSelected = formData.category === value;

// 変更後
const isSelected = formData.category.includes(value);
```

**（4）「次へ」ボタンのスタイル変更:**

```tsx
// 変更前
className =
  "rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700";

// 変更後
className =
  "rounded-lg bg-[var(--status-primary)] px-6 py-2 text-sm font-medium text-[var(--text-inverse)] disabled:cursor-not-allowed disabled:opacity-40";
```

### Step 4: shared 推論・`ApplySummaryCard.tsx`・`ConversationRoundStep.tsx` の修正

**（1）shared の format 推論:**

`packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` の `inferFormat` を `SkillCategory[]` 前提に更新する。

```typescript
function inferFormat(category: SkillInfoFormData["category"]): {
  format: SmartDefaultResult["format"];
  log: string | null;
} {
  if (category.includes("code-support")) {
    return {
      format: "code",
      log: "category includes 'code-support' → format = 'code'",
    };
  }
  if (category.includes("data-analysis")) {
    return {
      format: "structured",
      log: "category includes 'data-analysis' → format = 'structured'",
    };
  }
  return { format: null, log: null };
}
```

`apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` は shared の薄い再利用に寄せる。

**（2）`ApplySummaryCard.tsx` の Q5 必須判定:**

```typescript
const isQ5Required = formData.category.includes("external-integration");
```

**（3）`ConversationRoundStep.tsx` の修正:**

`currentQuestion`の計算を動的化する。

```typescript
// 変更前
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);

// 変更後
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);
```

この変更箇所は`ConversationRoundStep`コンポーネント本体の`answers`stateが参照可能なスコープに記述する。

### Step 5: `SkillCreateWizard.tsx`の修正

shared 推論を利用しつつ、代表カテゴリ解決とボタンスタイルを整理する。

```tsx
// 変更前
className = "rounded bg-blue-600 px-4 py-2 text-sm text-white";

// 変更後
className =
  "rounded-lg bg-[var(--status-primary)] px-4 py-2 text-sm text-[var(--text-inverse)]";
```

```typescript
const primaryCategory = resolvePrimaryCategory(formData.category);

trackEvent("skill_wizard_generation_completed", {
  method,
  category: primaryCategory,
  hasExternalIntegration: integration.hasExternalIntegration,
});
```

### Step 6: 動作確認

```bash
# shared パッケージの型チェック
pnpm --filter @repo/shared typecheck

# desktop パッケージの型チェック
pnpm --filter @repo/desktop typecheck

# shared 推論テスト
pnpm --filter @repo/shared test packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# desktop パッケージのテスト
pnpm --filter @repo/desktop test src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# リント
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

### Step 7: エラー発生時の対処

| エラー内容                                                  | 対処方法                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `Type 'string' is not assignable to type 'SkillCategory[]'` | `category`を参照している全箇所で配列前提に更新する             |
| `Property 'includes' does not exist on type 'null'`         | `category` を `[]` 前提に揃える                                |
| `currentQuestion`が`undefined`になる                        | `QUESTION_KEYS` と `isQuestionAnswered` の参照を確認する       |
| ボタンのhoverスタイルが効かない                             | `hover:opacity-90`を追加するか、CSS変数側でhover状態を定義する |

## 成果物

- `packages/shared/src/types/skillCreator.ts`: `category`型変更（修正）
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`: 複数選択・解除・スタイル（修正）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`: `currentQuestion`動的化（修正）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`: ボタンCSS変数化（修正）

## 完了条件

- [ ] `SkillInfoFormData.category`が`SkillCategory[]`型に変更されている
- [ ] `handleCategoryClick`で複数選択・トグル解除が動作する
- [ ] `isNextEnabled`がカテゴリ複数選択に対応している
- [ ] `currentQuestion`が回答済み問数から動的に計算される
- [ ] `bg-blue-600`がウィザード関連ファイルから除去されている
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] 実装後のテストが全件パスする
