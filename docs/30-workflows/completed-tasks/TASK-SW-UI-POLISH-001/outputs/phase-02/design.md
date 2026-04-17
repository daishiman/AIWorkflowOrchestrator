# Phase 2 成果物: 設計書

## 設計日: 2026-04-16

---

## 改善候補1: CSS 変数置換設計

### 置換対象（SkillInfoStep.tsx 172行目）

| Before            | After                                | 用途                   |
| ----------------- | ------------------------------------ | ---------------------- |
| `border-blue-500` | `border-transparent`                 | 選択済みボタン境界     |
| `bg-blue-100`     | `bg-[var(--status-primary,#2563eb)]` | 選択済みボタン背景     |
| `text-blue-700`   | `text-[var(--text-inverse,#ffffff)]` | 選択済みボタンテキスト |

### focus ハードコード（入力フィールド）

- `focus:border-blue-500` → スコープ対象は `bg-blue-*` のみ。focus クラスはAC-1対象外として据え置き

### CSS 変数フォールバック

```tsx
bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)]
```

---

## 改善候補2: カテゴリ選択上限設計

### 定数

```typescript
/** カテゴリ選択の上限数。全5件の半数超えとして3を設定。 */
const MAX_CATEGORY_COUNT = 3;
```

### handleCategoryClick 設計

```typescript
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
  // 上限到達時は何もしない（disabled ボタンはクリック自体不可）
};
```

### isAtLimit フラグ

```typescript
const isAtLimit = formData.category.length >= MAX_CATEGORY_COUNT;
```

---

## 改善候補3: カテゴリアニメーション設計

### 採用クラス: `transition-all duration-200 ease-in-out`

### 状態別スタイル

| 状態               | スタイル                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| 選択済み           | `bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)] border-transparent scale-[1.02]` |
| 未選択（通常）     | `hover:scale-[1.01] hover:opacity-80 border-current`                                                    |
| 未選択（上限到達） | `opacity-40 cursor-not-allowed border-current`                                                          |

---

## 改善候補4: ProgressBar アニメーション設計

### 対象: InterviewProgressBar.tsx

### 追加クラス: `duration-300 ease-in-out`（既存 `transition-all` に追記）

```tsx
<div
  className="h-2 rounded-full bg-[var(--status-primary)] transition-all duration-300 ease-in-out"
  style={{ width: `${percent}%` }}
/>
```

---

## Phase 2 完了確認

- [x] 改善候補1〜4の置換方針・クラス設計確定
- [x] CSS 変数フォールバック設計確定
- [x] MAX_CATEGORY_COUNT = 3 と UI フィードバック方式確定
- [x] transition クラスの採用理由・パフォーマンス影響評価済み
- [x] ProgressBar transition 設計確定
