# 型安全クエリ・マイグレーション データベース設計

## 概要
この親仕様書は support / platform の入口であり、target 別詳細と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [database-implementation-core.md](database-implementation-core.md) | core specification | 型安全なクエリ実装 / Embedded Replicas とオフライン対応 / マイグレーション管理 / テスト戦略 |
| [database-implementation-details.md](database-implementation-details.md) | detail specification | Knowledge Graphテーブル群（GraphRAG基盤） / パフォーマンス最適化 |
| [database-implementation-history.md](database-implementation-history.md) | history bundle | 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
