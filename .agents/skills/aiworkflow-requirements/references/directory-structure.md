# ディレクトリ構造（モノレポ）

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [directory-structure-core.md](directory-structure-core.md) | core specification | 設計方針 / ルート構造 / packages/shared/ 詳細構造 / apps/web/ 詳細構造（Next.js） |
| [directory-structure-details.md](directory-structure-details.md) | detail specification | ルートの設定ファイル群 / 機能追加の手順 / 構造の選択理由 / 依存関係ルール |
| [directory-structure-history.md](directory-structure-history.md) | history bundle | 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
