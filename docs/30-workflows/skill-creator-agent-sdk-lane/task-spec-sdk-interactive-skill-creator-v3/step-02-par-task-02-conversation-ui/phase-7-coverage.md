# Phase 7: カバレッジチェック — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 7                     |
| 機能名    | conversation-ui       |
| タスクID  | TASK-SDK-SC-02        |
| 作成日    | 2026-04-02            |
| 依存Phase | Phase 6（テスト拡充） |

## 目的

各コンポーネントのテストカバレッジが目標値（≥80%）を達成していることを確認し、  
不足しているカバレッジを補うテストを追加する。

## 実行タスク

### Task 7-1: カバレッジ計測

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/ \
  --coverage \
  --coverage.include="src/renderer/components/skill-creator/*.tsx"
```

### Task 7-2: 目標カバレッジ

| コンポーネント                      | 目標カバレッジ | 計測対象         |
| ----------------------------------- | -------------- | ---------------- |
| `ChoiceButton.tsx`                  | ≥ 80%          | Lines / Branches |
| `FreeTextInput.tsx`                 | ≥ 80%          | Lines / Branches |
| `ConversationProgress.tsx`          | ≥ 80%          | Lines / Branches |
| `QuestionCard.tsx`                  | ≥ 80%          | Lines / Branches |
| `SkillCreatorConversationPanel.tsx` | ≥ 80%          | Lines / Branches |

### Task 7-3: カバレッジ不足箇所の分析と補完

#### ChoiceButton.tsx の想定カバレッジ不足箇所

| ブランチ                                          | 対応テスト         | 状態   |
| ------------------------------------------------- | ------------------ | ------ |
| `isSelected=true` のスタイル分岐                  | T-03-detail で対応 | OK     |
| `isSelected=false` のスタイル分岐                 | T-03-detail で対応 | OK     |
| `isFreeText=true` のスタイル分岐                  | T-03-detail で対応 | OK     |
| `disabled=true` のクリック無効化                  | T-03-detail で対応 | OK     |
| `isFreeText=true && isSelected=true` の組み合わせ | Phase 7 で追加     | 要追加 |

#### FreeTextInput.tsx の想定カバレッジ不足箇所

| ブランチ                               | 対応テスト     | 状態   |
| -------------------------------------- | -------------- | ------ |
| `isVisible=false` の null 返却         | T-04-1 で対応  | OK     |
| `isSecret=true` の password フィールド | T-04-6 で対応  | OK     |
| `isSecret=false` の textarea           | T-04-2 で対応  | OK     |
| Enter キー送信（空文字）               | T-04-5 で対応  | OK     |
| Enter キー送信（非空文字）             | T-04-3 で対応  | OK     |
| Shift+Enter（改行のみ）                | T-04-4 で対応  | OK     |
| `disabled=true` 時のフィールド無効化   | Phase 7 で追加 | 要追加 |

#### QuestionCard.tsx の想定カバレッジ不足箇所

| ブランチ                                          | 対応テスト          | 状態   |
| ------------------------------------------------- | ------------------- | ------ |
| `type=single_select` の分岐                       | T-01, T-02 で対応   | OK     |
| `type=multi_select` の分岐                        | T-02b で対応        | OK     |
| `type=free_text` の分岐                           | Phase 4 で対応      | OK     |
| `type=secret` の分岐                              | Phase 7 で追加      | 要追加 |
| `type=confirm` の分岐                             | T-05 で対応         | OK     |
| `context` あり/なしの分岐                         | T-01, T-08-3 で対応 | OK     |
| 「その他（自由入力）」選択時の FreeTextInput 展開 | T-08-2 で対応       | OK     |

### Task 7-4: 補完テストの追加

```typescript
// ChoiceButton: isFreeText=true && isSelected=true の組み合わせ
it("isFreeText=true かつ isSelected=true のとき選択済みスタイルが優先される", () => {
  render(
    <ChoiceButton
      label="その他（自由入力）"
      isSelected={true}
      isFreeText={true}
      onClick={() => {}}
    />,
  );
  const btn = screen.getByRole("button");
  expect(btn).toHaveClass("bg-blue-500");
  // isSelected=true のとき border-dashed は適用されない
  expect(btn).not.toHaveClass("border-dashed");
});

// FreeTextInput: disabled=true 時
it("disabled=true のとき FreeTextInput が無効化される", () => {
  render(
    <FreeTextInput onSubmit={() => {}} isVisible={true} disabled={true} />,
  );
  expect(screen.getByRole("textbox")).toBeDisabled();
});

// QuestionCard: secret タイプ
it("secret タイプで FreeTextInput が isSecret=true で表示される", () => {
  const question: QuestionPayload = {
    type: "secret",
    question: "APIキーを入力してください",
    choices: [],
  };
  render(<QuestionCard question={question} onAnswer={() => {}} />);
  const input = document.querySelector('input[type="password"]');
  expect(input).toBeInTheDocument();
});
```

### Task 7-5: カバレッジ再計測

補完テスト追加後に再度計測し、全コンポーネントが ≥80% を達成していることを確認する。

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/ \
  --coverage \
  --coverage.include="src/renderer/components/skill-creator/*.tsx" \
  --reporter=verbose
```

期待する結果:

```
------------------------|---------|----------|---------|---------|
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
ChoiceButton.tsx        |   ≥80   |   ≥80    |   ≥80   |   ≥80   |
FreeTextInput.tsx       |   ≥80   |   ≥80    |   ≥80   |   ≥80   |
ConversationProgress.tsx|   ≥80   |   ≥80    |   ≥80   |   ≥80   |
QuestionCard.tsx        |   ≥80   |   ≥80    |   ≥80   |   ≥80   |
SkillCreatorConversationPanel.tsx | ≥80 | ≥80 | ≥80 | ≥80 |
------------------------|---------|----------|---------|---------|
```

## 参照資料

| 資料名         | パス                        |
| -------------- | --------------------------- |
| Phase 4 テスト | `phase-4-test-creation.md`  |
| Phase 6 テスト | `phase-6-test-expansion.md` |
| Phase 5 実装   | `phase-5-implementation.md` |

## 成果物

| 成果物                           | パス                  | 形式     |
| -------------------------------- | --------------------- | -------- |
| カバレッジ報告（本ファイル記録） | `phase-7-coverage.md` | Markdown |

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] 全5コンポーネントのカバレッジが ≥80% であることを確認した
- [ ] カバレッジ不足箇所を特定し、補完テストを追加した
- [ ] 補完テスト追加後に再計測し、全コンポーネントが ≥80% を達成した

## 次の Phase: Phase 8 (phase-8-refactoring.md)
