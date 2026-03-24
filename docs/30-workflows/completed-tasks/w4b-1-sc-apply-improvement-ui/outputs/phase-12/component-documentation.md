# コンポーネントドキュメント: Apply Improvement UI

## ImprovementProposalItem

### Props

| Prop       | 型                                   | 必須 | 説明                         |
| ---------- | ------------------------------------ | ---- | ---------------------------- |
| suggestion | RuntimeSkillCreatorImproveSuggestion | Yes  | 提案データ                   |
| index      | number                               | Yes  | リスト内インデックス         |
| isSelected | boolean                              | Yes  | 選択状態                     |
| onToggle   | (index: number) => void              | Yes  | トグルコールバック           |
| disabled   | boolean                              | No   | 操作無効化（default: false） |

### レンダリング条件

- `suggestion.reason !== ""` の場合のみ reason テキストを表示
- `diffStyles.before/after` で before/after ブロックにスタイル適用

### アクセシビリティ

- `aria-label`: `{section}の改善提案を選択`

## ImprovementProposalList

### Props

| Prop            | 型                                     | 必須 | 説明                 |
| --------------- | -------------------------------------- | ---- | -------------------- |
| suggestions     | RuntimeSkillCreatorImproveSuggestion[] | Yes  | 提案配列             |
| selectedIndices | Set<number>                            | Yes  | 選択済みインデックス |
| onToggle        | (index: number) => void                | Yes  | トグルコールバック   |
| onSelectAll     | () => void                             | Yes  | 全選択               |
| onDeselectAll   | () => void                             | Yes  | 全解除               |
| onApply         | () => void                             | Yes  | 適用実行             |
| isApplying      | boolean                                | Yes  | 適用中フラグ         |
| selectedCount   | number                                 | Yes  | 選択件数             |

### 状態管理

- 空リスト: "改善提案はありません" メッセージ表示
- `isApplying=true`: 全ボタン + チェックボックス disabled
- `selectedCount===0 || isApplying`: 適用ボタン disabled

## ImprovementApplyResult

### Props

| Prop    | 型                     | 必須 | 説明               |
| ------- | ---------------------- | ---- | ------------------ |
| result  | ApplyImprovementResult | Yes  | 適用結果           |
| onClose | () => void             | Yes  | 閉じるコールバック |

### 表示条件

- `result.skipped > 0 || result.skippedDetails.length > 0`: スキップセクション表示
- `result.errors.length > 0`: エラーセクション表示

## ImprovementProposalPanel

### Props

| Prop            | 型                                       | 必須 | 説明                 |
| --------------- | ---------------------------------------- | ---- | -------------------- |
| skillName       | string                                   | Yes  | 対象スキル名         |
| suggestions     | RuntimeSkillCreatorImproveSuggestion[]   | Yes  | 提案配列             |
| onClose         | () => void                               | Yes  | パネル閉じる         |
| onApplyComplete | (result: ApplyImprovementResult) => void | No   | 適用完了コールバック |

### 内部状態

| state           | 型                             | 初期値    | 説明                 |
| --------------- | ------------------------------ | --------- | -------------------- |
| selectedIndices | Set<number>                    | new Set() | 選択済みインデックス |
| isApplying      | boolean                        | false     | 適用中フラグ         |
| applyResult     | ApplyImprovementResult \| null | null      | 適用結果             |
| error           | string \| null                 | null      | エラーメッセージ     |
