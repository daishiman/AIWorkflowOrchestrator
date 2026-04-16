# Phase 2: 設計

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 2                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 1 完了済み                                                               |
| 状態     | 未着手                                                                         |

## 目的

Phase 1 で確認した要件に基づき、4件の改善候補それぞれの実装設計を確定する。CSS 変数置換方針、カテゴリ上限ガード、アニメーションクラス設計を定義する。

---

## 実行タスク

- 改善候補1設計: 残存ハードコード一覧と CSS 変数への置換設計（ホバー状態含む）
- 改善候補2設計: `MAX_CATEGORY_COUNT` 定数と上限ガード設計。上限到達時の UI フィードバック方式確定
- 改善候補3設計: カテゴリボタンの transition クラス設計。選択・非選択状態の CSS プロパティ差分一覧
- 改善候補4設計: ProgressBar の transition 適用設計。既存 CSS 定義との整合性確認

---

## 改善候補1: CSS 変数監査設計

### 検出アプローチ

```bash
# ハードコードカラー残存確認
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "hover:bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "text-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "border-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

### 置換設計

| Before                   | After                        | 用途               |
| ------------------------ | ---------------------------- | ------------------ |
| `bg-blue-600`            | `bg-[var(--status-primary)]` | 通常状態ボタン背景 |
| `bg-blue-500`            | `bg-[var(--status-primary)]` | 通常状態ボタン背景 |
| `hover:bg-blue-700`      | `hover:opacity-90`           | ホバー状態         |
| `hover:bg-blue-600`      | `hover:opacity-90`           | ホバー状態         |
| `text-white`（ボタン内） | `text-[var(--text-inverse)]` | ボタン内テキスト   |

### CSS 変数フォールバック設計

```tsx
// CSS 変数未定義テーマへの対策
className =
  "bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)]";
```

---

## 改善候補2: カテゴリ選択上限設計

### 定数定義

```typescript
/**
 * カテゴリ選択上限数。
 * 全カテゴリ数（7件）の半数として3を設定し、意味のある分類を促す。
 */
const MAX_CATEGORY_COUNT = 3;
```

### ハンドラー設計

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
  // 上限到達時は何もしない（ボタンは disabled 表示）
};

const isAtLimit = formData.category.length >= MAX_CATEGORY_COUNT;
```

### UI フィードバック設計

```tsx
// 未選択ボタンの disabled + opacity 設計
<button
  key={category}
  onClick={() => handleCategoryClick(category)}
  disabled={isAtLimit && !isSelected}
  className={cn(
    "transition-all duration-200 ease-in-out",
    isSelected
      ? "bg-[var(--status-primary,#2563eb)] text-[var(--text-inverse,#ffffff)]"
      : isAtLimit
        ? "opacity-40 cursor-not-allowed"
        : "hover:opacity-80",
  )}
>
  {SKILL_CATEGORY_LABELS[category]}
</button>
```

---

## 改善候補3: カテゴリアニメーション設計

### transition クラス設計方針

**採用クラス**: `transition-all duration-200 ease-in-out`

理由:

- `transition-all` は全プロパティを対象とするが、ボタンサイズが小さいためパフォーマンス影響は軽微
- `duration-200` は視認しやすい速度（100ms は速すぎ、300ms は遅すぎ）
- `ease-in-out` は自然なイージング

### 状態別スタイル差分

| 状態           | スタイル                                                             |
| -------------- | -------------------------------------------------------------------- |
| 選択済み       | `bg-[var(--status-primary)] text-[var(--text-inverse)] scale-[1.02]` |
| 未選択（通常） | `hover:scale-[1.01] hover:opacity-80`                                |
| 未選択（上限） | `opacity-40 cursor-not-allowed`                                      |

---

## 改善候補4: ProgressBar アニメーション設計

### 対象コンポーネント

`apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` 内の `InterviewProgressBar` または同等コンポーネント

### transition クラス設計

```tsx
// ProgressBar の幅制御要素
<div
  className="h-full transition-all duration-300 ease-in-out bg-[var(--status-primary,#2563eb)]"
  style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
/>
```

**採用クラス**: `transition-all duration-300 ease-in-out`

理由:

- `duration-300` はカテゴリボタン（200ms）より少し長め。進捗変化は大きい変化なので視認性重視
- `ease-in-out` で滑らかな進捗表示

---

## コンポーネント設計依存関係

```
SkillCreateWizard.tsx
  └── SkillInfoStep.tsx        ← 改善候補2・3
        └── カテゴリボタン群
  └── ConversationRoundStep.tsx ← 改善候補4
        └── InterviewProgressBar

改善候補1: SkillCreateWizard.tsx 全体（上記両ファイル含む）
```

---

## Phase 2 完了条件

- [ ] 改善候補1〜4 の置換方針・クラス設計がすべて確定済み
- [ ] CSS 変数フォールバック設計確定済み
- [ ] カテゴリ上限値（`MAX_CATEGORY_COUNT`）と UI フィードバック方式確定済み
- [ ] transition クラスの採用理由・パフォーマンス影響評価済み
- [ ] ProgressBar transition 設計確定済み
