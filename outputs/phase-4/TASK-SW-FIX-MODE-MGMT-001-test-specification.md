# Phase 4 成果物: テスト仕様書（TC-01〜TC-06）

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## テストケース定義

| TC-ID | シナリオ                                                       | 期待結果                                            | 実装ファイル               |
| ----- | -------------------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| TC-01 | Step 0 にラジオボタン「テンプレートから作成」が表示されない    | `queryByText("テンプレートから作成")` が null       | SkillCreateWizard.test.tsx |
| TC-02 | `generation-mode-selector` testID が存在しない                 | `queryByTestId("generation-mode-selector")` が null | SkillCreateWizard.test.tsx |
| TC-03 | Step 0 の次へクリックで Step 1（ConversationRoundStep）に遷移  | `wizard-step-conversation-round` が表示される       | SkillCreateWizard.test.tsx |
| TC-04 | Step 0 次へ後に Step 2（GenerateStep）が直接表示されない       | `wizard-step-generate` が null                      | SkillCreateWizard.test.tsx |
| TC-05 | Step 0→Step 1 遷移後も generation-mode-selector が存在しない   | `queryByTestId("generation-mode-selector")` が null | SkillCreateWizard.test.tsx |
| TC-06 | 旧フラグ（generationMode/hasActivatedLlmMode）残骸が存在しない | `input[name="generationMode"]` が 0件               | SkillCreateWizard.test.tsx |

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run "src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx"
```

## 実装済みテストコード（TC-06）

```tsx
it("TC-06: 旧フラグ（generationMode/hasActivatedLlmMode）残骸が存在しないこと", () => {
  renderWizard(mockOnClose);
  expect(
    document.querySelectorAll('input[name="generationMode"]'),
  ).toHaveLength(0);
  expect(screen.queryByText("テンプレートから作成")).toBeNull();
  expect(screen.queryByText("LLMで生成")).toBeNull();
  expect(screen.queryByText("LLM で生成")).toBeNull();
  expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
  expect(screen.queryByTestId("llm-mode-activated")).toBeNull();
});
```
