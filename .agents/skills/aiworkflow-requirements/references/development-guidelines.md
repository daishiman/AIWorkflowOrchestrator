# 開発ガイドライン

## 概要
この親仕様書は rulebook family の入口であり、実践パターン・詳細例・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [development-guidelines-core.md](development-guidelines-core.md) | core specification | ロギング戦略 / キャッシング戦略 / データマイグレーション / コードレビューガイドライン |
| [development-guidelines-details.md](development-guidelines-details.md) | detail specification | 命名規則 / デバッグガイド / リリースプロセス / バックアップ・リカバリ |
| [development-guidelines-history.md](development-guidelines-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
