# Phase 2 成果物: テスト戦略

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## テストケース定義（TC-01〜TC-06）

| TC-ID | シナリオ                                                     | 期待結果                                            | 実装方法              |
| ----- | ------------------------------------------------------------ | --------------------------------------------------- | --------------------- |
| TC-01 | Step 0 にラジオボタンが表示されない                          | `queryByText("テンプレートから作成")` が null       | React Testing Library |
| TC-02 | generation-mode-selector テストIDが存在しない                | `queryByTestId("generation-mode-selector")` が null | React Testing Library |
| TC-03 | Step 0 の次へで Step 1 に遷移する                            | `wizard-step-conversation-round` が表示される       | fireEvent + act       |
| TC-04 | Step 0 次へ後に Step 2 が直接表示されない                    | `wizard-step-generate` が null                      | React Testing Library |
| TC-05 | Step 0→Step 1 遷移後も generation-mode-selector が存在しない | `queryByTestId("generation-mode-selector")` が null | React Testing Library |
| TC-06 | 旧フラグ残骸が存在しない                                     | radio input[name="generationMode"] が 0件           | DOM query             |

## モック設計

```typescript
vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  // ...
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({ stage: "idle", percent: 0, ... }),
}));
```

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop test -- --run SkillCreateWizard
```
