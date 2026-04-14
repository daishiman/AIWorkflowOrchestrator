# 実装ガイド: Q5「主ツール」バッジ表示

## Part 1: 中学生レベルの説明

### このバッジは何を知らせるか

たとえば、グループで遠足に行くとき、みんながいろいろな道具を持ってきます。地図を持つ人、飲み物を持つ人、おやつを持つ人がいても、先頭で案内する人が持つ道具が一番よく使われます。

このアプリでも同じことが起きます。Q5（外部ツール連携）で複数のツールを選ぶと、内側では最初に選んだツールが使われます。`ConversationRoundStep` の「主ツール」バッジは、その関係を画面で見えるようにするラベルです。

### どう見えるか

1. Q5で「Slack」と「GitHub」を選ぶと、Slack の右側に「主ツール」バッジが出る
2. 1つだけ選んだときはバッジが出ない
3. Q3、Q4、Q6 ではバッジが出ない

### なぜ大事か

画面上は全部同じボタンに見えるので、最初に選んだものが特別だと分かりません。バッジがあると、どれが内側で使われるかをすぐ確認できます。

---

## Part 2: 技術者レベルの実装ガイド

### 実装の要点

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                       |
| 判定条件     | `questionKey === "q5"` かつ `selectedOptions.length >= 2` かつ `selectedOptions[0] === optionValue` |
| 表示文言     | 視覚表示は `主ツール`                                                                               |
| 補助ラベル   | `aria-label="主ツールとして使用される"`                                                             |
| ボタン名     | `aria-labelledby` で選択肢ラベルを参照し、`Slack` のような元の名前を保持                            |

### 実装パターン

```tsx
const MAIN_TOOL_BADGE_ENABLED = true;

interface MainToolBadgeProps {
  questionKey: QuestionKey;
  optionValue: string;
  selectedOptions: readonly string[];
}

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}: MainToolBadgeProps): boolean {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}

{
  q.options.map((opt, optionIndex) => {
    const isMainTool = shouldShowMainToolBadge({
      questionKey: key,
      optionValue: opt,
      selectedOptions,
    });
    const optionId = `${key}-${optionIndex}`;
    const optionLabelId = `${optionId}-label`;
    const mainToolBadgeId = `${optionId}-main-tool-badge`;

    return (
      <button
        key={opt}
        type="button"
        onClick={() => handleOptionSelect(key, opt)}
        aria-pressed={selectedOptions.includes(opt)}
        aria-labelledby={optionLabelId}
        aria-describedby={isMainTool ? mainToolBadgeId : undefined}
        className={[
          "inline-flex items-center px-3 py-1.5 rounded-lg text-sm border transition-colors",
          selectedOptions.includes(opt)
            ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
            : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
        ].join(" ")}
      >
        <span id={optionLabelId}>{opt}</span>
        {isMainTool && (
          <span
            id={mainToolBadgeId}
            aria-label="主ツールとして使用される"
            className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
          >
            主ツール
          </span>
        )}
      </button>
    );
  });
}
```

### 重要な設計ポイント

1. `aria-labelledby` を使うことで、ボタンの accessible name を選択肢テキストに固定できる
2. `aria-describedby` でバッジを補助情報として関連付けられる
3. バッジの見た目は `bg-blue-100 text-blue-800` のピル型で、既存UIと揃う
4. 条件は Q5 に閉じるので、他の設問に副作用を持ち込まない

### テストの見方

```ts
expect(screen.getByRole("button", { name: "Slack" })).toBeInTheDocument();
expect(
  within(screen.getByRole("button", { name: "Slack" })).getByText("主ツール"),
).toBeInTheDocument();
expect(screen.getByLabelText("主ツールとして使用される")).toBeInTheDocument();
expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
```

### 削除手順

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了したら、次を削除する。

1. `shouldShowMainToolBadge` と `MAIN_TOOL_BADGE_ENABLED`
2. `aria-describedby` を含むバッジ JSX
3. `ConversationRoundStep.test.tsx` の主ツールバッジ関連テスト
4. 参照している説明文の更新

### スクリーンショット参照

- `outputs/phase-11/screenshots/q5-single-select.png`
- `outputs/phase-11/screenshots/q5-multi-select-badge.png`
- `outputs/phase-11/screenshots/q3-no-badge.png`
- `outputs/phase-11/screenshots/q4-no-badge.png`
- `outputs/phase-11/screenshots/q6-no-badge.png`
