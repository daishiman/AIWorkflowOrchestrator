# Electron IPCセキュリティ

## 概要
この親仕様書はセキュリティ方針の入口であり、実装例・対策詳細・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [security-electron-ipc-core.md](security-electron-ipc-core.md) | core specification | セキュリティ設定 / Content Security Policy (CSP) / IPC通信のセキュリティ / 実装例: historyAPI |
| [security-electron-ipc-details.md](security-electron-ipc-details.md) | detail specification | 実装例: skillCreatorAPI / 実装例: skillFileAPI（TASK-9A-B） / 実装例: skillShareAPI（TASK-9F） / 実装例: skillChainAPI（TASK-9D） |
| [security-electron-ipc-advanced.md](security-electron-ipc-advanced.md) | advanced specification | 実装例: skillDebugAPI（TASK-9H） / 実装例: skillDocsAPI（TASK-9I） / 実装例: skillAnalyticsAPI（TASK-9J） / 実装例: `skill:execute` 認証 preflight ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001） |
| [security-electron-ipc-history.md](security-electron-ipc-history.md) | history bundle | 変更履歴 / 関連ドキュメント / 完了タスク |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`

## IPC契約ドリフト防止（UT-TASK06-007）

- sender validation や preload API 制限に加えて、Main / Preload 間の契約ドリフトは静的監査でも事前検出する。
- current branch の実装は `apps/desktop/scripts/check-ipc-contracts.ts` にあり、generic preload / multiline preload / 複数 const object 解決まで対応済み。
- 詳細な検出ルールは `ipc-contract-checklist.md`、完了記録と苦戦箇所は `task-workflow-completed-ipc-contract-preload-alignment.md`、履歴は `security-electron-ipc-history.md` を参照する。
