# Phase 4 テスト仕様書

- 作成日: 2026-03-04

## コンポーネント別テスト観点

| コンポーネント | ケース数 | 主要観点                                                                    |
| -------------- | -------: | --------------------------------------------------------------------------- |
| SearchBar      |       13 | 即時入力、デバウンス、クリア、Escape、shortcut、theme                       |
| CodeViewer     |       12 | 行番号、copy、Copy→Check、header、maxHeight、theme                          |
| TabSwitcher    |       14 | click/disabled、variant、Arrow/Home/End、Enter/Space、theme                 |
| SlideInPanel   |       12 | 開閉、左右、Escape、overlay、focus trap/restore、theme                      |
| ConfirmDialog  |       17 | destructive/loading、Escape/Enter、overlay、focus trap/restore、ARIA、theme |

## 追加方針

- Phase 6 で境界値・異常系を拡充
- Phase 7 で未カバー行を coverage から逆引き
