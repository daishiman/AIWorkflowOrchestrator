# Phase 12: 未タスク検出 (Unassigned Task Detection)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 12                                     |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 検出結果

### 未タスク化された要件: 1 件

本タスクの current facts を再監査した結果、path-scoped governance を runtime 実効 enforcement まで閉じる follow-up が 1 件必要と判定した。

| ID              | 種別      | 概要                                                                                                                                  | 影響度 | 対応方針                                                                     |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `TASK-P0-09-U1` | follow-up | `execute` / 将来の `improve` で `targetPath` と `allowedSkillRoot` を SDK callback へ接続し、path-scoped deny を runtime で有効化する | 高     | 未タスクとして formalize し、close-out 文書と AC 表現を current facts へ同期 |

---

## 検出プロセス

### 1. スコープ内外の確認

| 項目                             | スコープ内 | 対応状況                                                     |
| -------------------------------- | ---------- | ------------------------------------------------------------ |
| phase 別 permissionMode 設計     | YES        | 完了                                                         |
| allowedTools / disallowedTools   | YES        | 完了                                                         |
| canUseTool 実装                  | YES        | tool-level は完了 / path-scoped runtime enforce は follow-up |
| Hook 経由の監査                  | YES        | plan / execute / verify / improve の session audit は完了    |
| audit payload 型定義             | YES        | 完了                                                         |
| UI 向け denial / governance 表示 | YES        | main/preload/shared まで完了。renderer 表示は未着手          |
| skill-creator 本文の固定化       | NO (除外)  | N/A                                                          |
| ManifestLoader コア変更          | NO (除外)  | N/A                                                          |
| session resume UI 本体           | NO (除外)  | N/A (TASK-P0-08)                                             |
| audit 永続化                     | NO (除外)  | N/A (将来スコープ)                                           |

### 2. 将来検討事項（タスク化は不要）

以下は本タスクのスコープ外であり、現時点でタスク化は不要だが、将来的に検討可能な事項:

| 事項                       | 理由                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| audit 永続化 (SQLite 等)   | 初回はインメモリで十分。運用実績後に検討                               |
| governance dashboard UI    | renderer 側の governance 表示。surface は準備済み、UI 実装は別波で検討 |
| policy 外部設定化          | 現状は 4 phase 固定で十分。phase 追加時に検討                          |
| real-time denial push 通知 | 型は定義済み。renderer の通知 UI 実装時に検討                          |

---

## 結論

未タスク化要件: **1 件**。tool-level governance と audit surface は完了したが、path-scoped enforcement の runtime 実効化は current gap として formalize が必要である。
