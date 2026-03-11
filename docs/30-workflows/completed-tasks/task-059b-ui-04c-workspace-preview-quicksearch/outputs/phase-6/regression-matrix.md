# Phase 6 回帰マトリクス

| ケースID | 観点                                      | 証跡                               | 結果 |
| -------- | ----------------------------------------- | ---------------------------------- | ---- |
| TC-06-01 | 空 query で 0 件                          | `useQuickFileSearch.test.ts`       | PASS |
| TC-06-02 | 同 score 時の安定順                       | `useQuickFileSearch.test.ts`       | PASS |
| TC-06-03 | 非対応拡張子で Source 固定                | `PreviewPanel.test.tsx`            | PASS |
| TC-06-04 | 画像メタ情報 toggle                       | `PreviewPanel.test.tsx`            | PASS |
| TC-06-05 | `file:read` reject surfacing              | `WorkspaceView.test.tsx`           | PASS |
| TC-06-06 | timeout 後の復帰導線                      | `WorkspaceView.test.tsx`           | PASS |
| TC-06-07 | structured failure の Source fallback     | `PreviewPanel.test.tsx`            | PASS |
| TC-06-08 | watcher debounce refresh                  | `useFileWatcher.test.ts`           | PASS |
| TC-06-09 | panel 切替後も QuickSearch state 破綻なし | `WorkspaceView.test.tsx`, Phase 11 | PASS |
| TC-06-10 | mobile overlay で preview が崩れない      | `TC-11-08-mobile-overlay.png`      | PASS |
| TC-06-11 | watcher 再登録なし                        | `useFileWatcher.test.ts`           | PASS |
| TC-06-12 | timeout 3 retry                           | `WorkspaceView.test.tsx`           | PASS |
| TC-06-13 | Task 5D 語彙維持                          | `TC-11-09-ux-terminology.png`      | PASS |
| TC-06-14 | JSON/YAML 整形失敗の fallback             | `PreviewPanel.test.tsx`            | PASS |
| TC-06-15 | SourceView read-only / editor 導線        | `PreviewPanel.test.tsx`            | PASS |
| TC-06-16 | ErrorBoundary reset                       | `PreviewErrorBoundary.test.tsx`    | PASS |
