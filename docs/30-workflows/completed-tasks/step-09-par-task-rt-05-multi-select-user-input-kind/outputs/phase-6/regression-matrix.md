# Phase 6: Regression Matrix

## 追加 edge case

| ID   | ケース                                                                 | 期待値                     | テストファイル                              | ステータス          |
| ---- | ---------------------------------------------------------------------- | -------------------------- | ------------------------------------------- | ------------------- |
| T6-1 | `selectedOptionIds = []`                                               | fail                       | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T6-2 | `selectedOptionIds` に未知 id を含む                                   | fail                       | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T6-3 | `selectedOptionIds` が undefined                                       | fail                       | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T6-4 | kind が `multi_select` → `single_select` → `multi_select` と切り替わる | 配列 state が reset される | SkillLifecyclePanel.llm-generation.test.tsx | 実装済み / 未再実行 |
| T6-5 | `multi_select` 未選択で submit を押す                                  | UI 側で送信不可            | SkillLifecyclePanel.llm-generation.test.tsx | 実装済み / 未再実行 |
| T6-6 | `single_select`/`free_text`/`secret`/`confirm` 維持                    | 既存 payload が維持される  | 既存テスト群                                | 要再実行            |

## 回帰 guard 確認

- Engine: 既存 22 テスト + 新規 4 テスト = 26 テスト設計
- Renderer: 既存 30 テスト + 新規 5 テスト = 35 テスト設計
- 注記: `esbuild` platform mismatch により現環境で vitest 再実行は未完了
