# Phase 2 状態遷移設計: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 2                 |
| 作成日   | 2026-03-05        |
| SubAgent | B（State）        |

## 変更対象

- `useSkillAnalysis.ts`

## 新規ハンドラ

```ts
const handleSelectAutoFixable = useCallback(() => {
  if (!analysis) return;
  const next = new Set<number>();
  analysis.suggestions.forEach((suggestion, index) => {
    if (suggestion.autoFixable) next.add(index);
  });
  setSelectedSuggestions(next);
}, [analysis]);
```

## 状態遷移

| 操作                     | 事前状態                     | 事後状態                       |
| ------------------------ | ---------------------------- | ------------------------------ |
| 一括選択（混在）         | 任意の `selectedSuggestions` | auto-fixable の index のみ保持 |
| 一括選択（全false）      | 任意                         | 空Set                          |
| 一括選択（analysisなし） | `analysis === null`          | 変化なし（guard）              |

## 計算量

- 提案配列を1回走査するため O(n)。
- 副作用は `setSelectedSuggestions` のみ。

## 責務分離

- UI: ボタンクリックイベントを発火するだけ。
- Hook: 選択Setを構築する実ロジックを保持。
- View: Hook と UI の結線のみ。

## API/型境界

- 利用型: 既存 `Suggestion.autoFixable: boolean`。
- 変更なし: Shared 型、IPCチャンネル、Main Process API。
