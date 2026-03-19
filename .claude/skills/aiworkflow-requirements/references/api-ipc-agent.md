# Agent Dashboard・Workspace Chat Edit IPC

## 概要
この親仕様書は API / IPC 契約の入口であり、詳細チャネル定義と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [api-ipc-agent-core.md](api-ipc-agent-core.md) | core specification | Agent Dashboard IPC チャネル / Workspace Chat Edit IPC チャネル / Skill Creator IPC チャネル / `skill:execute` IPC 契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001） |
| [api-ipc-agent-details.md](api-ipc-agent-details.md) | detail specification | スキル共有 IPC チャネル（TASK-9F） / スキルフォーク IPC チャネル（TASK-9E） / スキルチェーン IPC チャネル（TASK-9D） / スキルスケジュール IPC チャネル（TASK-9G） |
| [api-ipc-agent-advanced.md](api-ipc-agent-advanced.md) | advanced specification | スキル分析・統計 IPC チャネル（TASK-9J） |
| [api-ipc-agent-history.md](api-ipc-agent-history.md) | history bundle | 完了タスク / 実装パターン参照 / 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 補助参照の境界

- `skill:get-detail` / `skill:update` の一次契約はこの family ではなく、`interfaces-agent-sdk-skill-details.md` と `security-skill-ipc-core.md` を正本とする。
- この family は `registerSkillHandlers` 周辺の topology、隣接する skill channel 群、`skill:execute` などの補助確認に使う。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
