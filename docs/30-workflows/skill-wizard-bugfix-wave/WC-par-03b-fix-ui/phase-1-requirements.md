# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 1                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| タスク分類 | UI task（VISUAL）                                                       |
| 前提Phase  | -                                                                       |
| 後続Phase  | Phase 2                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

スキルウィザードのUI整合性問題（クラスターD: 問題2・3・11・15・16）を解消するための要件を確定する。
`SkillInfoFormData.category`の型変更・複数選択UI・カテゴリ解除・ProgressBar動的化・ボタンスタイル統一・Q5必須判定の配列対応の6点を対象とする。

## 受け入れ基準

| AC番号 | 受け入れ基準                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1   | カテゴリを複数選択できる（`SkillInfoFormData.category`が`SkillCategory[]`型、未選択は `[]`）                                                                |
| AC-2   | 選択済みカテゴリを再クリックで解除できる（`handleCategoryClick`でトグル動作、全解除時は `[]`）                                                              |
| AC-3   | Step 0の「次へ」・LLMモードの「次へ」・ConversationRoundStepの「次のページ」が同一のCSS変数ボタンスタイル（`--status-primary`, `--text-inverse`）を使用する |
| AC-4   | `InterviewProgressBar`が実際の回答済み問数（1/6〜6/6）を動的に表示する（固定値1・4ではない）                                                                |
| AC-5   | `ApplySummaryCard` / `ConversationRoundStep` / `SkillCreateWizard` / shared推論の依存が更新され、外部連携判定・推論・計装が回帰していない                   |
| AC-6   | カテゴリ型変更に伴う既存テストの更新が完了している（型の変更による回帰なし）                                                                                |

## 実行タスク

- [ ] `SkillInfoFormData.category`の型変更が既存コードに与える影響範囲を調査する
- [ ] `SkillCategory[]` と `[]` を用いた選択・解除ロジックを確定する
- [ ] `ApplySummaryCard` と `ConversationRoundStep` の Q5 必須判定を確定する
- [ ] `InterviewProgressBar`の`currentQuestion`計算方法を確定する
- [ ] shared 推論正本・代表カテゴリ解決・ボタンスタイルの統一対象ファイルを特定する
- [ ] 既存テストの変更が必要な箇所を特定する

## 参照資料

| 資料名                | パス                                                                          | 説明                               |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                                   | `SkillInfoFormData.category`の現状 |
| shared推論正本        | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`   | format 推論の正本                  |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | カテゴリ選択・次へボタン           |
| ApplySummaryCard      | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | Q5 必須判定の配列対応              |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | ProgressBar・次のページボタン      |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 推論呼び出し・計装・次へボタン     |
| InterviewProgressBar  | `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`  | 進捗バーコンポーネント             |
| バグ修正ウェーブ全体  | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         | 問題番号・全体文脈                 |

## 実行手順

### Step 1: 型変更の影響範囲調査

`SkillInfoFormData.category`を`SkillCategory | null`から`SkillCategory[]`に変更した場合の影響を確認する。未選択は `[]` で表現し、`null` を残さない。

影響を受ける箇所の確認ポイント:

- `SkillInfoStep.tsx`の`handleCategoryClick`（単一選択→複数選択ロジック変更）
- `SkillInfoStep.tsx`の`isNextEnabled`（`category.length > 0`）
- `SkillInfoStep.tsx`のカテゴリボタンの`isSelected`判定（`=== value`→`includes(value)`）
- `ApplySummaryCard.tsx` / `ConversationRoundStep.tsx` の Q5 必須判定
- `SkillCreateWizard.tsx` の代表カテゴリ解決と shared 推論呼び出し
- `SkillInfoFormData`を参照する他コンポーネント・テスト

注意事項: `SkillCategory`型変更は`packages/shared`パッケージへの変更のため、他パッケージへの影響範囲を必ず確認する。
公開経路は`@repo/shared/types/skillCreator`のサブパスexportに閉じているため、`@repo/shared`のルートbarrelへは変更を波及させない。

### Step 2: `handleCategoryClick`のトグル解除ロジック確定

現状のコード（問題15・問題2の原因）:

```typescript
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category === value) return; // 同じ値のクリックを無視
  onFormDataChange({ ...formData, category: value });
};
```

変更後のロジック（複数選択 + トグル解除対応）:

```typescript
const handleCategoryClick = (value: SkillCategory) => {
  const current = formData.category;
  const next = current.includes(value)
    ? current.filter((c) => c !== value) // 解除
    : [...current, value]; // 追加
  onFormDataChange({
    ...formData,
    category: next,
  });
};
```

### Step 3: `InterviewProgressBar`の`currentQuestion`計算方法確定

現状のコード（問題11・問題16の原因）:

```typescript
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);
```

変更後のロジック（回答済み問数の動的計算）:

- Page 1（Q1〜Q3）: `answers` の q1/q2/q3 のうち`selectedOptions.length > 0`または`freeText.trim() !== ""`のものをカウント
- Page 2（Q4〜Q6）: Q1〜Q6 の全回答済み問数をカウント
- 最小値は1（インタビュー開始時点）

```typescript
const answeredCount = Object.values(answers).filter(
  (a) => a.selectedOptions.length > 0 || a.freeText.trim() !== "",
).length;
const currentQuestion = Math.max(1, answeredCount);
```

### Step 4: ボタンスタイル統一対象の特定

| ファイル                    | 行番号（概算） | 現状のクラス                                       | 変更後のクラス                                                                       |
| --------------------------- | -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `SkillInfoStep.tsx`         | 約186行        | `rounded bg-blue-600 px-6 py-2 ... text-white`     | `rounded-lg bg-[var(--status-primary)] px-6 py-2 ... text-[var(--text-inverse)]`     |
| `SkillCreateWizard.tsx`     | 約947行        | `rounded bg-blue-600 px-4 py-2 text-sm text-white` | `rounded-lg bg-[var(--status-primary)] px-4 py-2 text-sm text-[var(--text-inverse)]` |
| `ConversationRoundStep.tsx` | 約587行        | 既に`--status-primary`使用（確認済み）             | 変更不要（確認のみ）                                                                 |

### Step 5: 既存テスト変更対象の特定

`SkillInfoFormData.category`型変更に伴い更新が必要なテスト:

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`
  - `category: SkillCategory | null` → `category: SkillCategory[]` のテスト更新
- `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts`
  - 配列入力の format 推論テスト追加
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`
  - `handleCategoryClick` と `isNextEnabled` の動作テスト更新
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`
  - `external-integration` の判定を配列前提へ更新
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
  - `currentQuestion` の回答済み問数ベース表示テスト更新
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
  - shared 推論の呼び出しと配列入力のテスト更新

## 成果物

- このファイル（Phase 1 要件定義書）: 5件の問題の要件と変更内容を確定

## 完了条件

- [ ] `SkillInfoFormData.category`型変更の影響範囲が特定されている
- [ ] 複数選択・トグル解除のロジックが確定している
- [ ] `InterviewProgressBar`の動的計算方法が確定している
- [ ] ボタンスタイル統一の対象箇所が特定されている
- [ ] 既存テスト変更対象が特定されている
- [ ] AC-1〜AC-5の受け入れ基準が確定している
