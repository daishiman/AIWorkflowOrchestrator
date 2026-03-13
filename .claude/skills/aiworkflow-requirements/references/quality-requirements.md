# 非機能要件

## 概要
この親仕様書は rulebook family の入口であり、実践パターン・詳細例・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [quality-requirements-core.md](quality-requirements-core.md) | core specification | 概要 / パフォーマンス要件 |
| [quality-requirements-details.md](quality-requirements-details.md) | detail specification | テスト戦略（TDD実践ガイド） / セキュリティ / 可用性 |
| [quality-requirements-advanced.md](quality-requirements-advanced.md) | advanced specification | 保守性 / アクセシビリティ / テストカバレッジ目標 |
| [quality-requirements-history.md](quality-requirements-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
