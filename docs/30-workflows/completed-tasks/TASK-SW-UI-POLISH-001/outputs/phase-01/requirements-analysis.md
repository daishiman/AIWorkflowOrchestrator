# Phase 1 成果物: 要件定義・調査結果

## 調査日: 2026-04-16

---

## 1. bg-blue-\* ハードコードカラー残存箇所リスト

### ウィザードスコープ内（対応対象）

| ファイル            | 行番号 | 内容                                                                     |
| ------------------- | ------ | ------------------------------------------------------------------------ |
| `SkillInfoStep.tsx` | 172    | `"border-blue-500 bg-blue-100 text-blue-700"` （選択済みカテゴリボタン） |

### ウィザードスコープ外（対応対象外）

| ファイル                      | 内容                                           |
| ----------------------------- | ---------------------------------------------- |
| `PermissionDialog.tsx`        | `bg-blue-600 hover:bg-blue-700`                |
| `SkillStreamingView.tsx`      | `bg-blue-500`, `bg-blue-50`, `bg-blue-900/20`  |
| `SkillImportDialog.tsx`       | `bg-blue-100`, `bg-blue-600 hover:bg-blue-700` |
| `SkillCreatorResultPanel.tsx` | `bg-blue-500 hover:bg-blue-600`                |
| `SkillSelector.tsx`           | `bg-blue-50`, `bg-blue-900`                    |
| `SkillEditor.tsx`             | `bg-blue-600 hover:bg-blue-700`, `bg-blue-100` |

### SkillCreateWizard.tsx 監査結果

- `bg-blue-*` 残存: **0件** (既にクリーン)

---

## 2. SkillCategory 全メンバー確認

`packages/shared/src/types/skillCreator.ts` より:

```typescript
export type SkillCategory =
  | "automation" // 自動化
  | "external-integration" // 外部連携
  | "data-analysis" // データ分析
  | "code-support" // コードサポート
  | "other"; // その他
```

**全5件**（仕様書の「7件」は誤記）

### MAX_CATEGORY_COUNT 妥当性検証

- 全カテゴリ数: 5
- 上限値 = 3 → 全体の60%（半数超え）
- 判定: **妥当**。「全てに該当」を防ぎ、適切な分類を促す

---

## 3. InterviewProgressBar 現行CSS確認

`InterviewProgressBar.tsx`:

```tsx
<div
  className="h-2 rounded-full bg-[var(--status-primary)] transition-all"
  style={{ width: `${percent}%` }}
/>
```

- `transition-all`: ✅ 既存
- `duration-300`: ❌ 未設定（追加必要）
- `ease-in-out`: ❌ 未設定（追加必要）

---

## 4. 命名規則分析

| 対象             | 規則                  |
| ---------------- | --------------------- |
| コンポーネント名 | PascalCase            |
| 変数・関数       | camelCase             |
| CSS クラス       | kebab-case (Tailwind) |
| 定数             | SCREAMING_SNAKE_CASE  |

---

## 5. スコープ境界確認

### 含むもの（確定）

- `SkillInfoStep.tsx` の `bg-blue-100 text-blue-700 border-blue-500` → CSS変数置換
- `SkillInfoStep.tsx` に `MAX_CATEGORY_COUNT = 3` 定数追加
- `handleCategoryClick` の上限ガード実装
- カテゴリボタンへの `transition-all duration-200 ease-in-out` 追加
- `InterviewProgressBar.tsx` の進捗バーに `duration-300 ease-in-out` 追加

### 含まないもの（確定）

- スコープ外ファイルの CSS 監査（SkillEditor.tsx等）
- SkillCategory union 型の変更
- ProgressBar のデザイン変更

---

## Phase 1 完了確認

- [x] `bg-blue-*` ハードコードカラーの残存箇所リスト作成済み
- [x] `SkillCategory` 全メンバー数確認済み（5件、上限値3の妥当性検証済み）
- [x] `InterviewProgressBar` の現行 CSS クラス確認済み
- [x] 命名規則の分析・記録完了
- [x] スコープ境界が明確化済み
