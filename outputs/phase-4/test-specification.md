# Phase 4: テスト仕様書 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## テストマトリクス

| TC番号 | テスト名                                                   | 対象要素                             | 期待結果                  |
| ------ | ---------------------------------------------------------- | ------------------------------------ | ------------------------- |
| TC-01  | `renders wizard transition button`                         | `skill-lifecycle-open-wizard-button` | Green（既存）             |
| TC-02  | `calls onOpenWizard when button is clicked`                | `onOpenSkillWizard` callback         | Green（既存）             |
| TC-03  | `does not render skill-lifecycle-request-input`            | textarea 削除確認                    | Green（既存）             |
| TC-04  | `does not render skill-lifecycle-execution-input`          | textarea 削除確認                    | **Red→Green（本タスク）** |
| TC-05  | `[回帰] テキストエリア（execution-input）が復活していない` | 回帰テスト                           | **Red→Green（本タスク）** |
| TC-06  | adapter-status テスト（2件）                               | 関連テスト                           | Green（影響なし）         |
| TC-07  | approval テスト（9件）                                     | 関連テスト                           | Green（影響なし）         |
| TC-08  | auth-regression テスト（9件/5件スキップ）                  | 関連テスト                           | Green（影響なし）         |
| TC-09  | error-persistence テスト（9件）                            | 関連テスト                           | Green（影響なし）         |
| TC-10  | llm-generation テスト（35件/13件スキップ）                 | 関連テスト                           | Green（影響なし）         |

## 更新対象テストファイル

### SkillLifecyclePanel.test.tsx（追加）

```tsx
// 削除要素の非存在確認 - 追加
it("テキストエリア（skill-lifecycle-execution-input）が存在しない", () => {
  renderPanel();
  expect(screen.queryByTestId("skill-lifecycle-execution-input")).toBeNull();
});

// 回帰テスト - 追加
it("[回帰] テキストエリア（execution-input）が復活していない", () => {
  renderPanel();
  expect(screen.queryByTestId("skill-lifecycle-execution-input")).toBeNull();
});
```

## baseline 確認

Phase 4 実施前の baseline 全テスト状態（実装前）:

- `SkillLifecyclePanel.test.tsx`: `skill-lifecycle-execution-input` テストが Red（テキストエリア残存のため）
