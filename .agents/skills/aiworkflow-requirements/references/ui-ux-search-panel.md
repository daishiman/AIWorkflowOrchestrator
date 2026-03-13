# 検索・置換パネルUI設計

## 概要
この親仕様書は UI/UX surface の入口であり、機能別詳細と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [ui-ux-search-panel-core.md](ui-ux-search-panel-core.md) | core specification | 概要 / キーボードショートカット / タブバー設計 / ファイル内検索パネル（FileSearchPanel） |
| [ui-ux-search-panel-details.md](ui-ux-search-panel-details.md) | detail specification | 実装詳細（TASK-SEARCH-INTEGRATE-001） / 未タスク（将来の改善候補） |
| [ui-ux-search-panel-history.md](ui-ux-search-panel-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
