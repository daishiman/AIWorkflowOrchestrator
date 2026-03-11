# Phase 1 受け入れ基準

| AC    | 受け入れ条件                                                  | 自動/手動   | 証跡                                                                                         |
| ----- | ------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| AC-01 | `.md` 選択で `コード表示` と `プレビュー` を切り替えられる    | 自動 + 手動 | `PreviewPanel.test.tsx`, `TC-11-02-markdown-preview.png`                                     |
| AC-02 | `.html` preview で script が実行されず CSP が含まれる         | 自動 + 手動 | `PreviewPanel.test.tsx`, `TC-11-03-html-preview.png`                                         |
| AC-03 | `.ts` では Preview タブが無効化される                         | 自動        | `PreviewPanel.test.tsx`                                                                      |
| AC-04 | JSON/YAML preview は整形表示し、失敗時に Source fallback する | 自動        | `PreviewPanel.test.tsx`                                                                      |
| AC-05 | 画像 preview は表示とメタ情報切替を持つ                       | 自動        | `PreviewPanel.test.tsx`                                                                      |
| AC-06 | Cmd/Ctrl+P でダイアログを開き、Enter でファイル選択できる     | 自動 + 手動 | `useQuickFileSearch.test.ts`, `QuickFileSearch.test.tsx`, `TC-11-05-quick-search-select.png` |
| AC-07 | Escape でダイアログを閉じる                                   | 自動 + 手動 | `useQuickFileSearch.test.ts`, `TC-11-06-quick-search-close.png`                              |
| AC-08 | 不一致 query で誤って全件表示しない                           | 自動        | `useQuickFileSearch.test.ts`                                                                 |
| AC-09 | `file:read` timeout 5 秒 + 3 retry 後に error を表示する      | 自動        | `WorkspaceView.test.tsx`                                                                     |
| AC-10 | watcher 通知で 300ms debounce 後に再読込する                  | 自動        | `useFileWatcher.test.ts`                                                                     |
| AC-11 | current build から 11 ケースの screenshot を再取得できる      | 手動        | `phase11-capture-metadata.json`, `screenshot-coverage.md`                                    |

## 判定

- 11/11 の AC を実装・検証対象へ落とし込んだ
- Phase 4 以降の test / manual / doc 各成果物に AC を配線済み
