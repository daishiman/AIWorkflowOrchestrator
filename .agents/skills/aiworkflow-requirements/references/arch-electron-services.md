# Electron Main Process サービス

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [arch-electron-services-core.md](arch-electron-services-core.md) | core specification | Environment Backend サービス |
| [arch-electron-services-details.md](arch-electron-services-details.md) | detail specification | スキル管理サービス |
| [arch-electron-services-advanced.md](arch-electron-services-advanced.md) | advanced specification | スキル管理サービス |
| [arch-electron-services-history.md](arch-electron-services-history.md) | history bundle | 変更履歴 / 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
