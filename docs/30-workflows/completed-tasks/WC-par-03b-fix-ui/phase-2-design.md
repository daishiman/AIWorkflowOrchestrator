# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 2                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 1                                                                 |
| 後続Phase  | Phase 3                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 1 で確定した要件を具体的な実装設計に落とし込む。
型変更・UI変更・スタイル変更・共有推論の整理について変更後のコードを設計し、後続Phaseで迷わず実装できる状態にする。

## 実行タスク

- [ ] `SkillInfoFormData.category`の型変更設計を確定する
- [ ] `handleCategoryClick`の複数選択・トグル解除設計を確定する
- [ ] `ApplySummaryCard` と `ConversationRoundStep` の Q5 必須判定設計を確定する
- [ ] `isNextEnabled`の判定ロジック変更設計を確定する
- [ ] `InterviewProgressBar`の`currentQuestion`動的計算設計を確定する
- [ ] 共有推論正本・代表カテゴリ解決・ボタンCSS変数統一の設計を確定する
- [ ] subpathエクスポートへの影響方針を確定する

## 参照資料

| 資料名                | パス                                                                            | 説明                       |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------- |
| 要件定義              | `phase-1-requirements.md`                                                       | 確定した要件・受け入れ基準 |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                                     | 変更対象ファイル           |
| shared推論正本        | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | format 推論の正本          |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`           | 変更対象ファイル           |
| ApplySummaryCard      | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`        | Q5 必須判定の変更対象      |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 変更対象ファイル           |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`              | 変更対象ファイル           |
| inferSmartDefaults    | `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | shared 推論の薄い入口      |

## 設計詳細

### 1. `SkillCategory`型変更設計（問題2）

#### 変更方針

`packages/shared/src/types/skillCreator.ts`の`SkillInfoFormData`インターフェースにおける`category`フィールドの型を変更する。未選択は `[]` で表現し、`null` は残さない。

```typescript
// 変更前
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory[]; // 複数選択
}

// 変更後
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory[]; // 複数選択
}
```

#### サブパスexportの方針

`SkillCategory`型自体（union型定義）は変更しない。変更するのは`SkillInfoFormData.category`フィールドの型のみ。
公開経路は`@repo/shared/types/skillCreator`のサブパスexportに閉じており、ルートbarrel（`@repo/shared`）へは影響しない。
`SkillCategory`のunion型は引き続き`CategoryOption.value`の型として`SkillInfoStep.tsx`内で使用する。

### 2. 複数選択UI・トグル解除設計（問題2・問題15）

#### `handleCategoryClick`の変更設計（`SkillInfoStep.tsx`）

```typescript
// 変更前（単一選択・解除不可）
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category.includes(value)) return;
  onFormDataChange({ ...formData, category: [...formData.category, value] });
};

// 変更後（複数選択・トグル解除可）
const handleCategoryClick = (value: SkillCategory) => {
  const next = formData.category.includes(value)
    ? formData.category.filter((c) => c !== value)
    : [...formData.category, value];
  onFormDataChange({ ...formData, category: next });
};
```

#### `isSelected`判定の変更設計

```typescript
// 変更前（単一選択）
const isSelected = formData.category === value;

// 変更後（複数選択）
const isSelected = formData.category.includes(value);
```

#### `isNextEnabled`の変更設計

```typescript
// 変更前
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;

// 変更後
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category.length > 0;
```

#### `ApplySummaryCard` / `ConversationRoundStep` の Q5 必須判定

```typescript
const isQ5Required = formData.category.includes("external-integration");
```

Q5 は `external-integration` を含むカテゴリが 1 つでも選ばれた場合に必須扱いにする。

### 3. ProgressBar動的計算設計（問題11・問題16）

#### `currentQuestion`の変更設計（`ConversationRoundStep.tsx`）

```typescript
// 変更前（固定値）
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);

// 変更後（回答済み問数から動的計算）
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);
```

#### 計算ロジックの詳細

| 状態                             | `answeredCount` | `currentQuestion` | 表示     |
| -------------------------------- | --------------- | ----------------- | -------- |
| 全未回答（ウィザード開始直後）   | 0               | 1                 | 質問 1/6 |
| Q1のみ回答済み                   | 1               | 1                 | 質問 1/6 |
| Q1・Q2回答済み                   | 2               | 2                 | 質問 2/6 |
| Q1・Q2・Q3回答済み（Page 1完了） | 3               | 3                 | 質問 3/6 |
| Q1〜Q4回答済み（Page 2開始後）   | 4               | 4                 | 質問 4/6 |
| Q1〜Q5回答済み                   | 5               | 5                 | 質問 5/6 |
| Q1〜Q6全回答済み                 | 6               | 6                 | 質問 6/6 |

### 4. ボタンCSS変数統一設計（問題3）

#### 統一するCSS変数

| CSS変数            | 用途                         | 対応するhardcoded値 |
| ------------------ | ---------------------------- | ------------------- |
| `--status-primary` | プライマリボタン背景色       | `bg-blue-600`       |
| `--text-inverse`   | プライマリボタン文字色       | `text-white`        |
| `--border-primary` | ボタンborder色（既に使用中） | -                   |

#### 変更箇所と変更後コード

**`SkillInfoStep.tsx`の「次へ」ボタン:**

```tsx
// 変更前
className =
  "rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700";

// 変更後
className =
  "rounded-lg bg-[var(--status-primary)] px-6 py-2 text-sm font-medium text-[var(--text-inverse)] disabled:cursor-not-allowed disabled:opacity-40";
```

**`SkillCreateWizard.tsx`のLLMモード「次へ」ボタン:**

```tsx
// 変更前
className = "rounded bg-blue-600 px-4 py-2 text-sm text-white";

// 変更後
className =
  "rounded-lg bg-[var(--status-primary)] px-4 py-2 text-sm text-[var(--text-inverse)]";
```

**`SkillCreateWizard.tsx`の代表カテゴリ解決・計装:**

```typescript
const primaryCategory = resolvePrimaryCategory(formData.category);

trackEvent("skill_wizard_generation_completed", {
  method,
  category: primaryCategory,
  hasExternalIntegration: integration.hasExternalIntegration,
});
```

`resolvePrimaryCategory` は固定優先順の代表値を返す。`trackEvent` の契約は単一カテゴリのまま維持する。

**`ConversationRoundStep.tsx`の「次のページ」ボタン:**

すでに`bg-[var(--status-primary)] text-[var(--text-inverse)]`を使用中のため変更不要。
ただし、`rounded-lg`の形状統一は確認する。

### 5. 変更ファイルまとめ

| ファイル                                                                        | 変更種別 | 変更内容                                                                         |
| ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                     | 修正     | `SkillInfoFormData.category`: `SkillCategory[]` へ整理                           |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | 修正     | format 推論を配列対応へ変更                                                      |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | 修正     | shared 推論の薄い再利用に変更                                                    |
| `SkillInfoStep.tsx`                                                             | 修正     | `handleCategoryClick`トグル化・`isSelected`判定・`isNextEnabled`・ボタンスタイル |
| `ApplySummaryCard.tsx`                                                          | 修正     | Q5 必須判定を配列対応へ変更                                                      |
| `ConversationRoundStep.tsx`                                                     | 修正     | `currentQuestion`を動的計算に変更・Q5必須判定を配列対応                          |
| `SkillCreateWizard.tsx`                                                         | 修正     | shared 推論の利用・代表カテゴリ解決・LLMモードの次へボタンをCSS変数化            |

## 成果物

- このファイル（Phase 2 設計書）: 全変更箇所の具体的な変更前・変更後コードを記載

## 完了条件

- [ ] `SkillInfoFormData.category`型変更の具体的なコードが確定している
- [ ] `handleCategoryClick`のトグルロジックが設計されている
- [ ] `currentQuestion`の動的計算ロジックが設計されている
- [ ] ボタンスタイル変更の全箇所が特定・設計されている
- [ ] subpathexportへの影響方針が確定している
