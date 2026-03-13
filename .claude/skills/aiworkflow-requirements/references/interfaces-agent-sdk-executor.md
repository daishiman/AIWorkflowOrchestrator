# Agent SDK Executor 仕様

## 概要
この親仕様書は型定義と契約の入口であり、詳細ドメイン別定義と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [interfaces-agent-sdk-executor-core.md](interfaces-agent-sdk-executor-core.md) | core specification | 概要 / SkillService 統合（TASK-FIX-7-1） / SkillExecutor 型定義（TASK-3-1-A） / リトライ機構（TASK-SKILL-RETRY-001） |
| [interfaces-agent-sdk-executor-details.md](interfaces-agent-sdk-executor-details.md) | detail specification | PermissionResolver 型定義（TASK-3-2） / SkillExecutor IPC統合（TASK-3-2） |
| [interfaces-agent-sdk-executor-history.md](interfaces-agent-sdk-executor-history.md) | history bundle | 完了タスク / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
