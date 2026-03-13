# Atoms コンポーネント実装パターンガイド

## 概要
この親仕様書は UI/UX surface の入口であり、機能別詳細と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [ui-ux-atoms-patterns-core.md](ui-ux-atoms-patterns-core.md) | core specification | 概要 / 1. コンポーネント設計パターン / 2. デザイントークン連携パターン / 3. 苦戦箇所と解決策 |
| [ui-ux-atoms-patterns-details.md](ui-ux-atoms-patterns-details.md) | detail specification | 5. 後方互換性パターン / 6. テスト戦略 / 7. Molecules/Organisms実装への推奨事項 |
| [ui-ux-atoms-patterns-history.md](ui-ux-atoms-patterns-history.md) | history bundle | 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
