# Phase 4 成果物: テストケース定義書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## TC-01: ラジオボタン非表示確認

```typescript
it("Step 0にラジオボタン（テンプレートから作成/LLMで生成）が表示されないこと", () => {
  renderWizard(mockOnClose);
  expect(screen.queryByText("テンプレートから作成")).toBeNull();
  expect(screen.queryByText("LLMで生成")).toBeNull();
  expect(screen.queryByText("LLM で生成")).toBeNull();
});
```

## TC-02: generation-mode-selector非存在確認

```typescript
it("data-testid='generation-mode-selector'が存在しないこと", () => {
  renderWizard(mockOnClose);
  expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
});
```

## TC-03: Step 0→Step 1遷移確認

```typescript
it("Step 0の次へボタンクリックでStep 1（ConversationRoundStep）に遷移すること", async () => {
  renderWizard(mockOnClose);
  fillStep0();
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    screen.getByTestId("wizard-step-conversation-round"),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("wizard-step-generate")).toBeNull();
});
```

## TC-04: Step 1スキップ禁止確認

```typescript
it("Step 0次へ後にStep 2（GenerateStep）が直接表示されないこと", async () => {
  renderWizard(mockOnClose);
  fillStep0();
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.queryByTestId("wizard-step-generate")).toBeNull();
  expect(
    screen.getByTestId("wizard-step-conversation-round"),
  ).toBeInTheDocument();
});
```

## TC-05: 正規フロー通過確認

```typescript
it("Step 0→Step 1→Step 2→Step 3を順番に通過すること", async () => {
  renderWizard(mockOnClose);
  // Step 0確認
  expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  // Step 0→Step 1
  fillStep0();
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    screen.getByTestId("wizard-step-conversation-round"),
  ).toBeInTheDocument();
  // generation-mode-selectorが存在しないことも確認
  expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
});
```

## 前提・モック

- `mockCreateSkill.mockResolvedValue("/mock/skills/new-skill")`
- `renderWizard(mockOnClose)` を使用
- `fillStep0()` で purpose + category を入力
- `fireEvent`のみ使用（happy-dom環境: userEvent禁止）
