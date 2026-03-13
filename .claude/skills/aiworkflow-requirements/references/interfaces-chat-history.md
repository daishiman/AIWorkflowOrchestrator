# チャット履歴永続化 インターフェース仕様

## 概要
この親仕様書は型定義と契約の入口であり、詳細ドメイン別定義と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [interfaces-chat-history-core.md](interfaces-chat-history-core.md) | core specification | 概要 / データベーススキーマ / ドメインエンティティ型定義 / Repositoryインターフェース |
| [interfaces-chat-history-details.md](interfaces-chat-history-details.md) | detail specification | React Hooks / UIコンポーネント構成（Atomic Design） / アクセシビリティ対応 |
| [interfaces-chat-history-history.md](interfaces-chat-history-history.md) | history bundle | 完了タスク / 残課題 / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
