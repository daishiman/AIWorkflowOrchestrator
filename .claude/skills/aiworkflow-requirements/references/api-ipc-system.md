# システムIPC・AIプロバイダーAPI連携

## 概要
この親仕様書は API / IPC 契約の入口であり、詳細チャネル定義と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [api-ipc-system-core.md](api-ipc-system-core.md) | core specification | AI/チャット IPC チャネル / Slide IPC API（スライド同期） / Workspace File Watch IPC API（TASK-UI-04A） / Electron IPC API設計 |
| [api-ipc-system-details.md](api-ipc-system-details.md) | detail specification | エンティティ抽出サービス (NER) |
| [api-ipc-system-history.md](api-ipc-system-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
