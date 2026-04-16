# Phase 5: 実装

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 5                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 4 完了済み（全テストが Red 状態）                                        |
| 状態     | 未着手                                                                         |

## 目的

Phase 4 で定義したテストを Green にするため、4件の改善候補を実装する。TDD の Green フェーズとして、テストパスに必要な最小限の実装を行う。

---

## 実行タスク

- Step 1: CSS 変数監査と修正（SkillCreateWizard.tsx）
- Step 2: カテゴリ選択上限追加（SkillInfoStep.tsx）
- Step 3: カテゴリ解除アニメーション追加（SkillInfoStep.tsx）
- Step 4: ProgressBar アニメーション追加（ConversationRoundStep.tsx）

---

## 実装計画

### 変更ファイル一覧

| ファイルパス                                                                  | 変更種別 | 内容                               |
| ----------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 修正     | CSS 変数監査・残存ハードコード修正 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | 修正     | カテゴリ上限・アニメーション追加   |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 修正     | ProgressBar アニメーション追加     |

---

## Step 1: CSS 変数監査と修正

### 事前調査コマンド

```bash
# 残存ハードコードカラーの検出
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "hover:bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "text-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

### 置換方針

```tsx
// Before: ハードコードカラー
className = "bg-blue-600 text-white hover:bg-blue-700";

// After: CSS 変数 + フォールバック
className =
  "bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)] hover:opacity-90";
```

### 確認コマンド（修正後）

```bash
# 修正後の確認（0件であること）
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

---

## Step 2: カテゴリ選択上限追加

### SkillInfoStep.tsx への変更

```typescript
// 定数定義（コンポーネント外または先頭部）
/**
 * カテゴリ選択の上限数。
 * 全カテゴリ数（7件）の半数として3を設定し、適切な分類を促す。
 */
const MAX_CATEGORY_COUNT = 3;

// handleCategoryClick の修正
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category.includes(value)) {
    // 解除は常に許可
    const next = formData.category.filter((c) => c !== value);
    onFormDataChange({ ...formData, category: next });
  } else if (formData.category.length < MAX_CATEGORY_COUNT) {
    // 上限未満なら追加
    const next = [...formData.category, value];
    onFormDataChange({ ...formData, category: next });
  }
  // 上限到達時は何もしない（ボタンは disabled 表示）
};

// isAtLimit フラグの追加
const isAtLimit = formData.category.length >= MAX_CATEGORY_COUNT;
```

---

## Step 3: カテゴリ解除アニメーション追加

### SkillInfoStep.tsx カテゴリボタン修正

```tsx
// カテゴリボタン部分の修正
{
  SKILL_CATEGORIES.map((category) => {
    const isSelected = formData.category.includes(category);
    return (
      <button
        key={category}
        onClick={() => handleCategoryClick(category)}
        disabled={isAtLimit && !isSelected}
        // transition-all duration-200 ease-in-out を追加
        className={cn(
          "px-3 py-1 rounded-full text-sm border transition-all duration-200 ease-in-out",
          isSelected
            ? "bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)] border-transparent scale-[1.02]"
            : isAtLimit
              ? "opacity-40 cursor-not-allowed border-current"
              : "hover:scale-[1.01] hover:opacity-80 border-current",
        )}
      >
        {SKILL_CATEGORY_LABELS[category]}
      </button>
    );
  });
}
```

---

## Step 4: ProgressBar アニメーション追加

### ConversationRoundStep.tsx の InterviewProgressBar 修正

```tsx
// ProgressBar の幅制御要素に transition-all duration-300 ease-in-out を追加
<div className="h-2 rounded-full bg-[var(--surface-tertiary,#e5e7eb)] overflow-hidden">
  <div
    // transition-all duration-300 ease-in-out を追加
    className="h-full transition-all duration-300 ease-in-out bg-[var(--status-primary,#2563eb)]"
    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
  />
</div>
```

---

## 実装後確認

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# Lint チェック
pnpm --filter @repo/desktop lint

# テスト実行（Phase 4 で作成したテストが Green になること）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillInfoStep|ConversationRoundStep"

# ハードコードカラー残存確認（0件であること）
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

---

## 注意事項

### `SkillInfoFormData.category` 型変更の波及

TASK-SW-FIX-UI-001 で `SkillCategory | null` から `SkillCategory[]` への型変更が実施済み。本タスクの上限ロジック追加は `handleCategoryClick` 内の分岐追加に留まるため影響は限定的。ただし、型変更の波及範囲を実装前に再確認すること。

### CSS 変数とホバー状態の整合性

ホバー状態の `hover:bg-blue-700` 等の Tailwind クラスが残存している場合は、`hover:opacity-90` に統一する。色指定は CSS 変数に集約し、ホバー時は opacity 変化のみで対応する。

### Tailwind transition クラスの選択

`transition-all` は全プロパティを transition 対象とする。ボタンのサイズが小さいため `transition-all` でも許容範囲だが、パフォーマンスに懸念がある場合は `transition-colors transition-opacity` のように個別指定する。

---

## Phase 5 完了条件

- [ ] CSS 変数監査: スキルウィザード関連ファイルに `bg-blue-*` が 0 件
- [ ] カテゴリ上限: `MAX_CATEGORY_COUNT = 3` が定義され、上限ガードが動作している
- [ ] カテゴリアニメーション: `transition-all duration-200` が適用されている
- [ ] ProgressBar アニメーション: `transition-all duration-300` が適用されている
- [ ] Phase 4 の全テスト（TC-01〜TC-09）が Green
- [ ] `pnpm --filter @repo/desktop typecheck` が通過
- [ ] `pnpm --filter @repo/desktop lint` が通過
