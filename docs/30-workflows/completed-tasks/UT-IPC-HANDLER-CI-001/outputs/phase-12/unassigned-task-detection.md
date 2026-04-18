# 未タスク検出

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 12                    |
| タスク | UT-IPC-HANDLER-CI-001 |

## 検出結果

未タスク候補を以下の観点で検索した。

### 検出対象 1: 他の register\*Handlers() へのスナップショットテスト拡張

| 対象関数                      | 現状                       | 判断                                                        |
| ----------------------------- | -------------------------- | ----------------------------------------------------------- |
| `registerSkillHandlers()`     | スナップショットテストなし | **未タスク化** — 対象が広く、今回の task に含めると範囲超過 |
| `registerLLMHandlers()`       | スナップショットテストなし | **未タスク化** — 影響範囲が広く、独立 task として扱うべき   |
| その他の register\*Handlers() | スナップショットテストなし | **未タスク化** — 一括設計と優先順位付けが必要               |

### 検出対象 2: ipcMain.handle() 以外の IPC 登録方式

現状、`ipcMain.on()` の登録一覧テストは存在しない。ただし、`on()` はイベントリスナーであり `handle()` と性質が異なる。影響軽微のため今回の未タスク件数には含めず、上記の大粒度 task で検討する。

### 検出対象 3: Phase 10/11 の Note または Blocker

発見事項なし（`discovered-issues.md` 参照）。

## 未タスク件数

**1 件**（register\*Handlers() 系のスナップショット拡張を 1 件の大粒度 task として formalize）

## 未タスク配置方針

今回の workflow ではスコープ超過となるため、`docs/30-workflows/unassigned-task/task-ipc-handler-registration-snapshot-coverage.md` として formalize した。
