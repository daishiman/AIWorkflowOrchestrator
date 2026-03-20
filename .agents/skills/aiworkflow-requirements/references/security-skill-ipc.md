# スキル実行IPCセキュリティ

## 概要
この親仕様書はセキュリティ方針の入口であり、実装例・対策詳細・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [security-skill-ipc-core.md](security-skill-ipc-core.md) | core specification | 概要 / スキル管理IPCセキュリティ / スキルインポートIPCチャネル（TASK-4-1） / Claude Code CLI連携セキュリティ |
| [security-skill-ipc-history.md](security-skill-ipc-history.md) | history bundle | 完了タスク / 残課題 / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 の読み分け

- `skill:get-detail` / `skill:update` の現行契約は [security-skill-ipc-core.md](security-skill-ipc-core.md) の `Skill API current canonical contract` を正本とする。
- Preload payload / `safeInvokeUnwrap` / shared-preload-main sync は [interfaces-agent-sdk-skill-details.md](interfaces-agent-sdk-skill-details.md) と [ipc-contract-checklist.md](ipc-contract-checklist.md) を併読する。
- `TASK-4-1` 時点のチャネル一覧や履歴セクションは補助情報であり、現行契約の一次根拠には使わない。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
