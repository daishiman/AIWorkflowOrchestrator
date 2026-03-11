# Phase 4 手動試験草案

## 実施順

1. TC-11-01 初期タイムライン表示
2. TC-11-02 検索入力
3. TC-11-03 アコーディオン展開
4. TC-11-04 導線遷移
5. TC-11-11 エラー表示
6. TC-11-12 結果 0 件
7. TC-11-21 mobile sticky
8. TC-11-22 keyboard / aria

## 期待証跡

| TC-ID    | 期待証跡                                 |
| -------- | ---------------------------------------- |
| TC-11-01 | `TC-11-01-initial.png`                   |
| TC-11-02 | `TC-11-02-search.png`                    |
| TC-11-03 | `TC-11-03-accordion.png`                 |
| TC-11-04 | navigation 実施ログまたは非視覚証跡      |
| TC-11-11 | `TC-11-11-error.png`                     |
| TC-11-12 | `TC-11-12-empty.png`                     |
| TC-11-21 | `TC-11-21-mobile-sticky.png`             |
| TC-11-22 | keyboard / aria 確認ログまたは非視覚証跡 |

## 注意点

- Playwright 撮影は `/advanced/history-search` ルートを使う
- sticky header は mobile viewport でのみ撮る
- 導線遷移は renderer state 変化と URL / view 切替の両方を確認する
