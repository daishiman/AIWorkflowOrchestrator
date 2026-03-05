# Phase 2 コンポーネント設計: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 2                 |
| 作成日   | 2026-03-05        |
| SubAgent | A（UI）           |

## 変更対象

- `SuggestionList.tsx`
- `SkillAnalysisView.tsx`

## UI設計

### `SuggestionList` props 拡張

```ts
interface SuggestionListProps {
  suggestions: Suggestion[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onSelectAutoFixable: () => void;
}
```

### 追加UI

- ラベル: `自動修正可能を選択`
- 配置: 提案リストの先頭（リスト見出しより上）
- 活性条件: `autoFixable` 件数が 1 件以上
- 非活性条件: `autoFixable` 件数が 0 件
- a11y: `aria-label="自動修正可能な提案のみを選択"`

### 表示ルール

| 状態                       | 表示                                       |
| -------------------------- | ------------------------------------------ |
| 提案あり + autoFixableあり | ボタン有効                                 |
| 提案あり + autoFixableなし | ボタン無効                                 |
| 提案0件                    | 既存の空状態メッセージ表示（操作導線なし） |

## `SkillAnalysisView` 結線

- `useSkillAnalysis` から `handleSelectAutoFixable` を受け取る。
- `SuggestionList` に `onSelectAutoFixable={handleSelectAutoFixable}` を渡す。
- 既存「選択を適用」ボタンの活性条件は変更しない（`selectedSuggestions.size > 0`）。

## 回帰影響

- 既存 `onToggle` フローは無変更。
- 優先度別グルーピングとバッジ表示は無変更。
- footer アクション（適用/全自動改善）は無変更。
