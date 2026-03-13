# Phase 11 Output: Screenshot Plan

## 画面カバレッジ

| テストケース | surface                      | state                     | theme | 取得方式                  | 証跡                                                   |
| ------------ | ---------------------------- | ------------------------- | ----- | ------------------------- | ------------------------------------------------------ |
| TC-11-01     | QuickFileSearch              | results                   | light | current source dev server | `screenshots/TC-11-01-quick-search-results.png`        |
| TC-11-02     | QuickFileSearch              | no-match                  | dark  | current source dev server | `screenshots/TC-11-02-quick-search-no-match-dark.png`  |
| TC-11-03     | WorkspaceView + PreviewPanel | selection success         | light | current source dev server | `screenshots/TC-11-03-quick-search-select-preview.png` |
| TC-11-04     | PreviewPanel                 | structured parse fallback | light | current source dev server | `screenshots/TC-11-04-structured-preview-fallback.png` |
| TC-11-05     | PreviewPanel                 | transport timeout alert   | light | current source dev server | `screenshots/TC-11-05-preview-timeout-alert.png`       |

## N/A

| 項目           | 理由                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| mobile overlay | 今回の変更は quick search / preview error surface であり、mobile layout には差分なし |
| hover 中間状態 | 主要契約ではなく validator 対象外                                                    |
