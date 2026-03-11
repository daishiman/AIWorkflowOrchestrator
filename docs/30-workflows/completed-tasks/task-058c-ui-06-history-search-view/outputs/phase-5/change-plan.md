# Phase 5 変更計画

## 変更のまとまり

| 変更群    | 主ファイル                                                  | 狙い                                              |
| --------- | ----------------------------------------------------------- | ------------------------------------------------- |
| 契約同期  | `preload/types.ts`, `historySearchHandlers.ts`              | query/filter/offset 契約を正本に寄せる            |
| 状態管理  | `historySearchSlice.ts`, `editorSlice.ts`                   | timeline 取得状態と file open intent を持つ       |
| UI 再設計 | `views/HistorySearchView/**`                                | timeline、accordion、sentinel、empty state を実装 |
| 導線統合  | `EditorView/index.tsx`, `App.tsx`                           | file open と screenshot route を成立させる        |
| 検証      | `*.test.ts(x)`, `capture-task-058c-phase11-screenshots.mjs` | 自動テストと Phase 11 証跡を作る                  |

## 非対象として維持したもの

- ChatHistoryView 本体の UI 再設計
- backend search service のインデックス戦略
- NotificationCenter や他ビューの navigation copy
