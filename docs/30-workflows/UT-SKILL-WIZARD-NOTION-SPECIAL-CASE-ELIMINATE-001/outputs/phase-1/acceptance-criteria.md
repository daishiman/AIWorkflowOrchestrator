# Phase 1: 受け入れ基準

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 1                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 実行日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                        | 検証方法                                                                                        | 優先度 |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| AC-1 | `notion` 変換が `SEMANTIC_LABEL_MAP` 経由で動作すること             | テスト: `resolveLabelEntry("notion", "q5")` が `{ label: "その他", freeText: "Notion" }` を返す | HIGH   |
| AC-2 | `createQuestionAnswer()` 内の notion 特別ケースが削除されること     | `grep -n "notion" ConversationRoundStep.tsx` で特別ケースコードが存在しない                     | HIGH   |
| AC-3 | 既存の `resolveSemanticLabel()` テストが全て通過すること            | `pnpm --filter @repo/shared exec vitest run` が PASS                                            | HIGH   |
| AC-4 | TypeScript 型チェック（`pnpm typecheck`）がエラーなしで通過すること | `pnpm typecheck` が 0 error                                                                     | HIGH   |
