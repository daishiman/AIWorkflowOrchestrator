# Phase 12 実装ガイド: UT-TASK-10A-B-001

## Part 1: 中学生向けの説明

### なぜこの変更が必要だったか

改善提案一覧には「自動で直せる提案」と「手で判断が必要な提案」が混ざっています。毎回1件ずつチェックを付けると時間がかかるため、
「自動で直せるものだけを一気に選ぶボタン」を追加しました。

### 例え話

プリントの問題集で、先生が「このマークが付いている問題は自動採点できる」と教えてくれた場面をイメージしてください。
このボタンは「そのマーク付き問題だけをまとめて選ぶショートカット」です。

### 何が起きるか

- ボタン名: `自動修正可能を選択`
- 押すと `autoFixable=true` の提案だけが選択状態になります。
- 1件もない場合はボタンが押せない状態（disabled）になります。

## Part 2: 開発者向け詳細

### 1. 変更した責務

- UI責務: `SuggestionList` が一括選択ボタンを描画し、親へイベントを通知
- 状態責務: `useSkillAnalysis` が auto-fixable ID集合を作成し、選択状態へ反映
- 結線責務: `SkillAnalysisView` が Hookのハンドラを `SuggestionList` へ渡す

### 2. 型とAPIシグネチャ

```ts
interface SuggestionListProps {
  suggestions: SkillImprovementSuggestion[];
  selectedSuggestionIds: Set<string>;
  onToggleSuggestion: (suggestionId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectAutoFixable: () => void;
}

const buildAutoFixableSelection = (
  suggestions: SkillImprovementSuggestion[],
): Set<string> => {
  return new Set(
    suggestions.filter((suggestion) => suggestion.autoFixable).map((s) => s.id),
  );
};
```

### 3. 使用例

```tsx
<SuggestionList
  suggestions={analysis.improvementSuggestions}
  selectedSuggestionIds={selectedSuggestionIds}
  onToggleSuggestion={handleToggleSuggestion}
  onSelectAll={handleSelectAll}
  onSelectNone={handleSelectNone}
  onSelectAutoFixable={handleSelectAutoFixable}
/>
```

### 4. エッジケース

- `analysis` が `null` のとき: `handleSelectAutoFixable` は何も変更せずreturn
- auto-fixable件数が0件: ボタンdisabled、クリック不可
- 既存の手動選択がある状態: 一括選択実行時は auto-fixable 集合で上書き
- 提案0件: ボタン自体を表示しない

### 5. エラーハンドリング

- 外部I/OやIPCを呼ばないため、例外系は最小
- nullガードで実行時エラーを防止
- UI側は disabled 制御により不正操作を予防

### 6. 設定と互換性

- 追加の環境変数・Feature Flagなし
- IPC/API契約変更なし
- 既存の「すべて選択」「すべて解除」「個別選択」導線と共存

### 7. パフォーマンス

- auto-fixable抽出は1回走査の O(n)
- `SuggestionList` は `useMemo` でカテゴリ集計とauto-fixable件数を同時計算

## 完了状態

- Task 12-1: Completed
