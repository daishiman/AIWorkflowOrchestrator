# Phase 6: テスト拡充 - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 6                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |
| 前提   | Phase 5（実装）完了済み           |

## 目的

Phase 4 で作成した基本テスト（Happy Path）を補完し、以下の3カテゴリのテストを追加することで、
実装の堅牢性・回帰安全性・アクセシビリティ適合を保証する。

1. **フェイルパステスト**: 境界ケース・異常系の動作検証
2. **回帰ガードテスト**: 既存の単一選択ユースケースが複数選択移行後も壊れないことの確認
3. **補助テスト（アクセシビリティ）**: `aria-pressed` の複数ボタン独立制御の検証

---

## 1. フェイルパステスト

### 1-1. `selectedOptions` が空のときの動作

#### FP-01: `selectedOptions: []` の初期状態で「選択済み」バッジが表示されない

**対象コンポーネント**: `ConversationRoundStep`

**テストファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`

**テストコード骨格**:

```typescript
it("selectedOptions が空のとき「選択済み」バッジが表示されない", () => {
  const answers: ConversationAnswers = {
    q1: { selectedOptions: [], freeText: "" },
    // ...他問も同様
  };
  render(<ConversationRoundStep answers={answers} ... />);
  expect(screen.queryByText(/選択済み/)).not.toBeInTheDocument();
});
```

**確認観点**:

- `selectedOptions.length === 0` のとき `<span>選択済み</span>` が DOM に存在しないこと
- `aria-pressed` がすべてのボタンで `"false"` になっていること

---

#### FP-02: 全選択解除後に `selectedOptions: []` になる

**対象コンポーネント**: `ConversationRoundStep`

**テストコード骨格**:

```typescript
it("選択済みボタンを再クリックすると selectedOptions が空になる", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  // 1回クリックで選択
  fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
  // もう1回クリックで解除
  fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q1.selectedOptions).toEqual([]);
});
```

**確認観点**:

- トグルによる2回クリックで `selectedOptions` が `[]` に戻ること
- `onAnswersChange` が2回呼ばれていること（各クリックで1回）

---

#### FP-03: `selectedOptions: []` 状態で `isQuestionAnswered()` が `false` を返す

**対象関数**: `isQuestionAnswered`（ConversationRoundStep 内部ロジック）

**テスト方針**: `ConversationRoundStep` の「次のページ」ボタン活性化状態で間接的に確認する、
またはユニットエクスポートがある場合は直接テストする。

**確認観点**:

- Q1〜Q3 がすべて未回答（`selectedOptions: []` かつ `freeText: ""`）のとき、
  「次のページ」ボタンが適切な状態（disabled または通過可能）であること
- `scheduleConfig` が `undefined` かつ `selectedOptions: []` かつ `freeText: ""` のとき
  `isQuestionAnswered` が `false` を返すこと

---

### 1-2. Q3 境界ケース

#### FP-04: Q3 で「定期実行」と他の選択肢を同時選択した場合でも ScheduleConfigInput が展開される

**受け入れ基準**: AC-06

**テストコード骨格**:

```typescript
it("Q3 で「定期実行」と「手動実行」を同時選択すると ScheduleConfigInput が展開される", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  fireEvent.click(screen.getByRole("button", { name: "手動実行" }));

  // ScheduleConfigInput は「定期実行」が selectedOptions に含まれる限り展開
  expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q3.selectedOptions).toContain("定期実行");
  expect(latestAnswers.q3.selectedOptions).toContain("手動実行");
});
```

**確認観点**:

- `selectedOptions.includes("定期実行")` が `true` のとき ScheduleConfigInput が表示されること
- 「手動実行」を追加しても `scheduleConfig` が `undefined` にならないこと

---

#### FP-05: Q3 で「定期実行」のみ選択解除すると ScheduleConfigInput が閉じる

**受け入れ基準**: AC-05

**テストコード骨格**:

```typescript
it("Q3 で「定期実行」を選択後、再クリックで解除すると ScheduleConfigInput が非表示になる", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 解除
  expect(screen.queryByLabelText(/cron式/)).not.toBeInTheDocument();

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q3.scheduleConfig).toBeUndefined();
});
```

---

#### FP-06: Q3 で「定期実行」を再選択すると scheduleConfig が復元される

**確認観点**:

- 解除後に再度「定期実行」を選択すると `scheduleConfig` が `DEFAULT_SCHEDULE_CONFIG` で初期化されること
- 前回の cron 設定は引き継がれないこと（`DEFAULT_SCHEDULE_CONFIG` で上書き）

**テストコード骨格**:

```typescript
it("Q3 で「定期実行」を解除後に再選択すると scheduleConfig が DEFAULT で復元される", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 解除
  fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 再選択

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q3.scheduleConfig).toBeDefined();
  expect(latestAnswers.q3.selectedOptions).toContain("定期実行");
});
```

---

#### FP-07: Q3 で「定期実行」+「手動実行」の状態から「定期実行」のみ解除する

**確認観点**:

- 「手動実行」が `selectedOptions` に残ること
- `scheduleConfig` が `undefined` になること（「定期実行」が消えたため）

**テストコード骨格**:

```typescript
it("「定期実行」+「手動実行」の状態から「定期実行」を解除すると scheduleConfig がクリアされ「手動実行」が残る", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  fireEvent.click(screen.getByRole("button", { name: "手動実行" }));
  fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 定期実行のみ解除

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q3.selectedOptions).not.toContain("定期実行");
  expect(latestAnswers.q3.selectedOptions).toContain("手動実行");
  expect(latestAnswers.q3.scheduleConfig).toBeUndefined();
});
```

---

### 1-3. `ApplySummaryCard` 境界ケース

#### FP-08: `selectedOptions: []` かつ `freeText: ""` のとき未回答と判定される

**対象コンポーネント**: `ApplySummaryCard`

**テストファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`

**テストコード骨格**:

```typescript
it("selectedOptions が空かつ freeText が空のとき未回答と判定される", () => {
  const answers: ConversationAnswers = {
    q1: { selectedOptions: [], freeText: "" },
    // 他問も全て未回答
  };
  const smartDefaults: SmartDefaultResult = {
    who: "自分のみ",
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  render(<ApplySummaryCard answers={answers} smartDefaults={smartDefaults} ... />);

  // 未回答 Q1 のデフォルト値がリストに表示される
  expect(screen.getByText(/自分のみ/)).toBeInTheDocument();
});
```

---

#### FP-09: `selectedOptions: ["自分のみ"]` のとき回答済みと判定される（デフォルト表示なし）

**テストコード骨格**:

```typescript
it("selectedOptions に値が入っているとき回答済みと判定されデフォルト表示されない", () => {
  const answers: ConversationAnswers = {
    q1: { selectedOptions: ["自分のみ"], freeText: "" },
    q2: { selectedOptions: [], freeText: "" },
    // ...他問も未回答
  };
  const smartDefaults: SmartDefaultResult = {
    who: "チームメンバー", // Q1 が回答済みなのでこちらは無視される
    input: "テキスト",
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  render(<ApplySummaryCard answers={answers} smartDefaults={smartDefaults} ... />);

  // Q1 は回答済みなので SmartDefault の "チームメンバー" はリストに表示されない
  expect(screen.queryByText(/チームメンバー/)).not.toBeInTheDocument();
  // Q2 は未回答なので SmartDefault の "テキスト" がリストに表示される
  expect(screen.getByText(/テキスト/)).toBeInTheDocument();
});
```

---

#### FP-10: `external-integration` カテゴリで Q5 `selectedOptions: []` のとき警告表示

**テストコード骨格**:

```typescript
it("category=external-integration で Q5 selectedOptions が空のとき警告が表示される", () => {
  const formData = { ...defaultFormData, category: "external-integration" };
  const answers: ConversationAnswers = {
    ...defaultAnswers,
    q5: { selectedOptions: [], freeText: "" },
  };
  render(<ApplySummaryCard answers={answers} formData={formData} ... />);
  expect(screen.getByText(/Q5.*必須|外部ツール連携.*必須/)).toBeInTheDocument();
});
```

---

### 1-4. `resolveExternalIntegration` 境界ケース

#### FP-11: Q5 が `selectedOptions: []` のとき統合なし扱いになる

**対象**: `SkillCreateWizard` の `resolveExternalIntegration` 呼び出し結果

**テストコード骨格**:

```typescript
it("Q5 selectedOptions が空のとき外部統合なし扱いになる", async () => {
  render(<SkillCreateWizard onClose={mockOnClose} />);
  // Q1〜Q6 を全て未回答のまま生成フローへ進む
  // resolveExternalIntegration の結果が "なし" 相当になることを確認
  // （間接確認: 生成ボタンクリック後に createSkill が呼ばれ、外部統合オプションが未設定）
});
```

**注意**: `resolveExternalIntegration` は内部関数のため、`SkillCreateWizard.test.tsx` 内で
生成ボタン経由の統合テストとして検証する。

---

#### FP-12: Q5 が `selectedOptions: ["Slack", "GitHub"]` のとき先頭値 "Slack" が参照される

**受け入れ基準**: AC-13

**テストコード骨格**:

```typescript
it("Q5 に複数選択がある場合、先頭値が外部統合ツールとして参照される", async () => {
  // SkillCreateWizard の統合テスト内で Q5 を複数選択させ、
  // createSkill 呼び出し時の引数が "Slack" ベースになることを確認
  // または resolveExternalIntegration をエクスポートしてユニットテスト
});
```

**設計補足**: M-01 対処（Phase 3）として実装時に注釈が入ること。
`selectedOptions[0]` が先頭値優先参照であることをテストコメントに明記する。

---

## 2. 回帰ガードテスト

### 目的

Phase 5 の実装後も、Phase 4 以前に想定していた「単一選択ユースケース」が
複数選択対応後も正しく動作することを保証する。

---

### RG-01: 1つだけ選択した場合の動作が単一選択時代と同等である

**対象コンポーネント**: `ConversationRoundStep`

**テストコード骨格**:

```typescript
describe("回帰ガード: 単一選択ユースケース", () => {
  it("1つのボタンをクリックすると selectedOptions に1要素が入る", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));

    const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
    expect(latestAnswers.q1.selectedOptions).toEqual(["自分のみ"]);
    expect(latestAnswers.q1.selectedOptions).toHaveLength(1);
  });

  it("1つ選択後に別のボタンをクリックすると2要素になる（単一選択時代は上書きだったが、複数選択では追加）", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
    fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));

    const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
    // 複数選択対応後は両方が残る（単一選択時代と挙動が変わる部分）
    expect(latestAnswers.q1.selectedOptions).toContain("自分のみ");
    expect(latestAnswers.q1.selectedOptions).toContain("チームメンバー");
  });
});
```

**注意**: このテストは「単一選択時代の上書き挙動」が意図的に変わることを文書化するものである。
「別のボタンをクリックすると前の選択が消える」という単一選択の挙動は複数選択対応後は発生しない。

---

### RG-02: SmartDefaults が1値を返す場合の適用が正しく機能する

**対象**: `createQuestionAnswer()` による SmartDefault 変換

**テストコード骨格**:

```typescript
it("SmartDefault が 'チームメンバー' を返すとき selectedOptions: ['チームメンバー'] に変換される", () => {
  const smartDefaults: SmartDefaultResult = {
    who: "チームメンバー",
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  render(
    <ConversationRoundStep
      smartDefaults={smartDefaults}
      answers={defaultAnswers}
      ...
    />
  );

  // SmartDefault 適用後に Q1 の「チームメンバー」ボタンが aria-pressed="true" になる
  expect(screen.getByRole("button", { name: "チームメンバー" }))
    .toHaveAttribute("aria-pressed", "true");
});
```

---

### RG-03: `freeText` が入力された場合の挙動が変わらない

**テストコード骨格**:

```typescript
it("自由入力に値が入っている場合、selectedOptions が空でも isQuestionAnswered が true になる（freeText による回答）", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.change(screen.getByLabelText("Q1 自由入力"), {
    target: { value: "社内の担当者" },
  });

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q1.freeText).toBe("社内の担当者");
  expect(latestAnswers.q1.selectedOptions).toEqual([]); // selectedOptions は空のまま
});
```

---

### RG-04: `scheduleConfig` による回答済み判定が変わらない

**テストコード骨格**:

```typescript
it("Q3 で定期実行を選択すると scheduleConfig が設定され isQuestionAnswered が true になる", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));

  const latestAnswers = mockOnAnswersChange.mock.calls.at(-1)?.[0];
  expect(latestAnswers.q3.scheduleConfig).toBeDefined();
  expect(latestAnswers.q3.selectedOptions).toContain("定期実行");
});
```

---

### RG-05: ページング（Page1 / Page2）の切り替えが複数選択後も動作する

**テストコード骨格**:

```typescript
it("Q1 に複数選択した状態でも「次のページ」クリックで Page2 に遷移できる", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
  fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));
  fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));

  expect(screen.getByText("Q4: 出力先（どこへ）")).toBeInTheDocument();
  expect(screen.queryByText("Q1: 利用者（誰が使うか）")).not.toBeInTheDocument();
});
```

---

### RG-06: `ApplySummaryCard` のスマートデフォルト表示が単一値ユースケースで壊れない

**テストコード骨格**:

```typescript
it("selectedOptions に1値が入っているとき未回答扱いにならず SmartDefault が表示されない", () => {
  const answers: ConversationAnswers = {
    q1: { selectedOptions: ["自分のみ"], freeText: "" },
    q2: { selectedOptions: [], freeText: "" },
    q3: { selectedOptions: [], freeText: "" },
    q4: { selectedOptions: [], freeText: "" },
    q5: { selectedOptions: [], freeText: "" },
    q6: { selectedOptions: [], freeText: "" },
  };
  const smartDefaults: SmartDefaultResult = {
    who: "チームメンバー", // Q1 が回答済みのためスキップされる
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  render(<ApplySummaryCard answers={answers} smartDefaults={smartDefaults} ... />);

  // Q1 は回答済みなので SmartDefault の "チームメンバー" はリストに出ない
  expect(screen.queryByText(/チームメンバー/)).not.toBeInTheDocument();
});
```

---

## 3. 補助テスト（アクセシビリティ）

### 目的

複数選択トグルボタンの `aria-pressed` 属性が、各ボタンで独立して `true` / `false` を返すことを確認する。
WCAG 2.1 SC 4.1.2 に準拠していることを DOM アサーションで保証する。

---

### A11Y-01: 未選択時は全ボタンの `aria-pressed` が `"false"`

**受け入れ基準**: AC-09

**テストコード骨格**:

```typescript
describe("アクセシビリティ: aria-pressed 複数ボタン独立制御", () => {
  it("初期状態で Q1 の全ボタンの aria-pressed が false", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);

    const q1Section = screen.getByRole("region", { name: /Q1|利用者/ });
    // Q1 の選択肢ボタンをすべて取得
    const buttons = within(q1Section).getAllByRole("button", { hidden: false });
    // ナビゲーションボタンを除いた選択肢ボタンのみ確認
    const optionButtons = buttons.filter(
      (btn) => btn.hasAttribute("aria-pressed")
    );
    optionButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-pressed", "false");
    });
  });
```

---

### A11Y-02: 1つ選択後は選択ボタンのみ `aria-pressed="true"`、他は `"false"`

**テストコード骨格**:

```typescript
  it("「自分のみ」選択後は「自分のみ」ボタンのみ aria-pressed=true で他は false", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));

    expect(screen.getByRole("button", { name: "自分のみ" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "チームメンバー" }))
      .toHaveAttribute("aria-pressed", "false");
  });
```

---

### A11Y-03: 複数選択後は選択された複数ボタンがそれぞれ `aria-pressed="true"`

**テストコード骨格**:

```typescript
  it("「自分のみ」と「チームメンバー」を選択後、両方の aria-pressed が true", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
    fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));

    expect(screen.getByRole("button", { name: "自分のみ" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "チームメンバー" }))
      .toHaveAttribute("aria-pressed", "true");
  });
```

---

### A11Y-04: 選択解除後は `aria-pressed` が `"false"` に戻る

**テストコード骨格**:

```typescript
  it("選択後に再クリックで解除すると aria-pressed が false に戻る", () => {
    render(<ConversationRoundStep answers={defaultAnswers} ... />);
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
    expect(screen.getByRole("button", { name: "自分のみ" }))
      .toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
    expect(screen.getByRole("button", { name: "自分のみ" }))
      .toHaveAttribute("aria-pressed", "false");
  });
});
```

---

### A11Y-05: Q3「選択済み」バッジが `selectedOptions.length > 0` のときのみ表示

**テストコード骨格**:

```typescript
it("Q3 で「定期実行」を選択すると「選択済み」バッジが表示される", () => {
  render(<ConversationRoundStep answers={defaultAnswers} ... />);
  expect(screen.queryAllByText(/選択済み/)).toHaveLength(0);

  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  expect(screen.getAllByText(/選択済み/).length).toBeGreaterThan(0);
});
```

---

## 4. テストファイル対象と追加先

| テストファイル                                                                               | 追加するテストID                  |
| -------------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | FP-01〜07, RG-01〜05, A11Y-01〜05 |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`      | FP-08〜10, RG-06                  |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`            | FP-11〜12                         |

---

## 5. テスト構造の命名規則

Phase 6 で追加するテストブロックには、以下のプレフィックスを `describe` に付与して識別する。

```typescript
describe("フェイルパス: selectedOptions 境界ケース", () => { ... });
describe("フェイルパス: Q3 定期実行境界ケース", () => { ... });
describe("フェイルパス: ApplySummaryCard 境界ケース", () => { ... });
describe("回帰ガード: 単一選択ユースケース", () => { ... });
describe("アクセシビリティ: aria-pressed 複数ボタン独立制御", () => { ... });
```

---

## 6. 注意事項

### P39 準拠: `fireEvent` のみ使用

このプロジェクトでは happy-dom 環境のため `userEvent` は禁止。
すべての DOM 操作は `fireEvent.click` / `fireEvent.change` / `fireEvent.blur` を使用する。

### P9 準拠: `beforeEach` でのリセット

新規追加の `describe` ブロック内でも `vi.clearAllMocks()` を `beforeEach` に含めること。

### `defaultAnswers` の型

Phase 5 実装後は `selectedOption: null` から `selectedOptions: []` に変更済みのため、
Phase 6 のテストコードでは `selectedOptions: []` を使用する。

```typescript
// Phase 6 以降の defaultAnswers（Phase 5 実装後の型）
const defaultAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};
```

---

## 7. 完了基準

| 条件                                                           | 確認方法                                |
| -------------------------------------------------------------- | --------------------------------------- |
| FP-01〜FP-12 の全テストが Green になっている                   | `pnpm --filter @repo/desktop test`      |
| RG-01〜RG-06 の全テストが Green になっている                   | `pnpm --filter @repo/desktop test`      |
| A11Y-01〜A11Y-05 の全テストが Green になっている               | `pnpm --filter @repo/desktop test`      |
| 既存の Phase 4 テストが引き続き Green になっている（回帰なし） | `pnpm --filter @repo/desktop test`      |
| TypeScript コンパイルエラーが 0 件                             | `pnpm --filter @repo/desktop typecheck` |
| ESLint エラーが 0 件                                           | `pnpm --filter @repo/desktop lint`      |
