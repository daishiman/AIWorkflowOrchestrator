# TASK-UI-01-STORE-IPC-ARCHITECTURE: SubAgent統合インデックス

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-UI-01-STORE-IPC-ARCHITECTURE                       |
| 作成日     | 2026-03-06                                              |
| ステータス | A/C/Dは正本確定、Bはエントリ仕様維持、Eは仕様書作成済み |
| 目的       | 056系SubAgent仕様書の正本導線を1箇所に集約する          |

## 正本導線

| SubAgent | 担当                                   | 正本仕様                                                                                                | ステータス   |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| A        | Store棚卸し・状態境界設計              | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                           | completed    |
| B        | IPC契約・Preload・セキュリティ         | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md` | entry_spec   |
| C        | Notification/HistorySearchドメイン統合 | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                      | completed    |
| D        | ViewType拡張・ルーティング・ナビ整合   | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                             | completed    |
| E        | 統合ゲート・仕様同期監査               | `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`                   | spec_created |

## 依存関係

```text
A || B
  ↓
  C

A
  ↓
  D

C + D
  ↓
  E
```

## 運用ルール

1. 後続UIタスクは、まず本ファイルで正本導線を確認する。
2. 実装済みのA/C/Dは `completed-tasks/` 配下の `index.md` を参照する。
3. Bは実装正本が未移管のため、現時点ではエントリ仕様を参照する。
4. Eは `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/` を実行正本とする。
5. 参照先を変更した場合は、`task-056-ui-01-store-ipc-architecture.md` と `task-0560-index.md` を同一ターンで更新する。
