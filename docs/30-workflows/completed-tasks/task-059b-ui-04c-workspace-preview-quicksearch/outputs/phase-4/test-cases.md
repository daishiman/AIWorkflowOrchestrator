# Phase 4 テストケース表

| ケースID | ケース                              | 実装先                                                   | 状態 |
| -------- | ----------------------------------- | -------------------------------------------------------- | ---- |
| TC-04-01 | 空状態表示                          | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-02 | Preview 対応拡張子で tab 有効       | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-03 | 非対応拡張子で tab 無効             | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-04 | Cmd/Ctrl+P でモーダル open          | `useQuickFileSearch.test.ts`                             | PASS |
| TC-04-05 | Arrow 移動                          | `useQuickFileSearch.test.ts`                             | PASS |
| TC-04-06 | Enter で選択確定                    | `useQuickFileSearch.test.ts`, `QuickFileSearch.test.tsx` | PASS |
| TC-04-07 | Escape で close                     | `useQuickFileSearch.test.ts`                             | PASS |
| TC-04-08 | HTML sanitize + CSP                 | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-09 | JSON/YAML structured preview        | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-10 | Refresh / Wrap / Editor 導線        | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-11 | watcher debounce 再読込             | `useFileWatcher.test.ts`                                 | PASS |
| TC-04-12 | timeout + retry surfacing           | `WorkspaceView.test.tsx`                                 | PASS |
| TC-04-13 | Task 5D 語彙の UI 表示              | `PreviewToolbar.tsx`, `QuickFileSearch.tsx`, Phase 11    | PASS |
| TC-04-14 | iframe sandbox / script 非実行      | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-15 | SourceView read-only / double click | `PreviewPanel.test.tsx`                                  | PASS |
| TC-04-16 | 行番号ガター 40px                   | `PreviewPanel.test.tsx`                                  | PASS |

## 追加ケース

- TC-04-17: 不一致 query で結果 0 件
- TC-04-18: 同 score 時の path 安定順
- TC-04-19: ImagePreview のメタ情報 toggle
- TC-04-20: PreviewErrorBoundary reset
