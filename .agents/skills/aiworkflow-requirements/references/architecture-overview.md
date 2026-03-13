# アーキテクチャ総論

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [architecture-overview-core.md](architecture-overview-core.md) | core specification | 概要 / 設計思想 / レイヤー構成 / デザインパターン |
| [architecture-overview-details.md](architecture-overview-details.md) | detail specification | 機能追加パターン / 技術スタック |
| [architecture-overview-history.md](architecture-overview-history.md) | history bundle | テンプレート / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
