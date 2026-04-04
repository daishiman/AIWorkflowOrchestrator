# Unassigned Task Detection

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| タスク | TASK-FIX-AUTH-IPC-001                      |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 記録日 | 2026-04-01                                 |
| Phase  | 12                                         |

---

## 件数

| 区分                           | 件数 |
| ------------------------------ | ---- |
| current gap (formalize 対象)   | 0    |
| baseline gap（今回スコープ外） | 2    |

---

## current gap（formalize 対象）

**0件。**

今回のタスクスコープ（`auth:login` の fire-and-forget 化）において、
実装・テスト・仕様同期に未着手のギャップは検出されなかった。

---

## baseline gap（今回スコープ外の候補）

以下の候補は検討したが、いずれも **formalize しない** と判定した。
今後 evidence が揃った段階で別タスクとして切り出すこと。

| 候補                                   | 判定             | 理由                                                                                                                                                                         |
| -------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IPC_TIMEOUT_MS` 定数の見直し          | formalize しない | `auth:login` は channel-specific の 500ms タイムアウト（`CHANNEL_TIMEOUTS["auth:login"]`）を使用しており、グローバルな `IPC_TIMEOUT_MS` の見直しはこのタスクの gap ではない  |
| 他の auth IPC handler の blocking 調査 | formalize しない | 他の auth チャンネル（`auth:logout`, `auth:getState` 等）の blocking 有無については、現時点で具体的な evidence がない。別タスクとして evidence が揃った時だけ formalize する |

---

## current / baseline の分離ルール

- **current**: 本タスク（TASK-FIX-AUTH-IPC-001）のスコープ内で発見・修正すべき gap
- **baseline**: 本タスクのスコープ外であり、今後別タスクとして管理する候補

今回の current gap は 0 件であるため、本 Phase 12 の残作業はない。
