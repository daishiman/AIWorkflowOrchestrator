# Phase 1 受入基準

- 作成日: 2026-03-04

## 受入基準マトリクス

| REQ-ID    | 受入条件                                   | 検証手段                 |
| --------- | ------------------------------------------ | ------------------------ |
| SB-REQ-01 | 入力時に `onChange` が即時発火             | `SearchBar.test.tsx`     |
| SB-REQ-02 | `debounceMs` 後に `onDebouncedChange` 発火 | `SearchBar.test.tsx`     |
| SB-REQ-03 | クリアボタンの表示/非表示が値に連動        | `SearchBar.test.tsx`     |
| SB-REQ-04 | Escapeで値クリア                           | `SearchBar.test.tsx`     |
| SB-REQ-05 | `role="searchbox"`                         | `SearchBar.test.tsx`     |
| CV-REQ-01 | 行番号表示切替                             | `CodeViewer.test.tsx`    |
| CV-REQ-02 | コピーで `clipboard.writeText` 呼び出し    | `CodeViewer.test.tsx`    |
| CV-REQ-03 | Copy→Check→Copy 遷移                       | `CodeViewer.test.tsx`    |
| CV-REQ-04 | filePathヘッダー表示                       | `CodeViewer.test.tsx`    |
| CV-REQ-05 | ARIAラベル保持                             | `CodeViewer.test.tsx`    |
| TS-REQ-01 | underline/pill 表示                        | `TabSwitcher.test.tsx`   |
| TS-REQ-02 | Arrow移動でdisabledスキップ                | `TabSwitcher.test.tsx`   |
| TS-REQ-03 | Home/End移動                               | `TabSwitcher.test.tsx`   |
| TS-REQ-04 | tablist/tab role                           | `TabSwitcher.test.tsx`   |
| TS-REQ-05 | mobile横スクロールクラス                   | `TabSwitcher.test.tsx`   |
| SP-REQ-01 | isOpenで開閉                               | `SlideInPanel.test.tsx`  |
| SP-REQ-02 | sideで左右切替                             | `SlideInPanel.test.tsx`  |
| SP-REQ-03 | フォーカストラップ                         | `SlideInPanel.test.tsx`  |
| SP-REQ-04 | フォーカス復元                             | `SlideInPanel.test.tsx`  |
| SP-REQ-05 | Escape close                               | `SlideInPanel.test.tsx`  |
| CD-REQ-01 | destructive見た目切替                      | `ConfirmDialog.test.tsx` |
| CD-REQ-02 | loadingで操作ロック                        | `ConfirmDialog.test.tsx` |
| CD-REQ-03 | 初期フォーカス=キャンセル                  | `ConfirmDialog.test.tsx` |
| CD-REQ-04 | `role="alertdialog"`                       | `ConfirmDialog.test.tsx` |
| CD-REQ-05 | Enter/Escape挙動                           | `ConfirmDialog.test.tsx` |
