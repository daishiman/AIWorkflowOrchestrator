# Agent Execution UI コンポーネント

## 概要
この親仕様書は UI/UX surface の入口であり、機能別詳細と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [ui-ux-agent-execution-core.md](ui-ux-agent-execution-core.md) | core specification | 概要 / コンポーネント階層 / コンポーネント仕様 / インタラクション設計 |
| [ui-ux-agent-execution-details.md](ui-ux-agent-execution-details.md) | detail specification | ChatPanel統合UIフロー（TASK-7D実装済） |
| [ui-ux-agent-execution-history.md](ui-ux-agent-execution-history.md) | history bundle | 変更履歴 / 完了タスク / 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
