# Phase 2: 設計メモ

> 作成日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## 設計方針

| 観点      | 方針                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| 第一原則  | 既存 branch 実装を再実装しない                                                   |
| 契約境界  | `executeAsync()` → `onWorkflowStateSnapshot` → `creatorHandlers` の3点で確認する |
| 型変更    | **不要**（callback 第3引数で要件充足）                                           |
| close-out | Phase 12 の6成果物と parity を設計に含める                                       |

---

## Task 2-1: 契約境界の設計

### 境界1: runtime（RuntimeSkillCreatorFacade.executeAsync）

| パス                       | 動作                                               | 状態    |
| -------------------------- | -------------------------------------------------- | ------- |
| structured error           | `extractExecuteErrorMessage(result)` を第3引数へ   | ✅ 成立 |
| catch                      | `error.message` または `String(error)` を第3引数へ | ✅ 成立 |
| success / terminal_handoff | 第3引数なし（undefined）                           | ✅ 成立 |
| snapshot 不在              | `snapshot ?? null` で null 正規化                  | ✅ 成立 |

### 境界2: state 型（SkillCreatorWorkflowStateSnapshot）

- `errorCode` / `errorMessage` フィールドは存在しない
- **追加不要**（callback 第3引数パターンが正本）
- shared/public contract 変更は不要

### 境界3: IPC relay（creatorHandlers.ts）

| 条件                                  | 動作                           | 状態    |
| ------------------------------------- | ------------------------------ | ------- |
| snapshot あり、errorMessage なし      | snapshot のみ送信              | ✅ 成立 |
| snapshot あり/なし、errorMessage あり | snapshot + errorMessage を送信 | ✅ 成立 |
| snapshot なし、errorMessage なし      | 送信なし                       | ✅ 成立 |

---

## Task 2-2: 型変更要否の判断

### 判断基準

| 理由                                         | 判定                         |
| -------------------------------------------- | ---------------------------- |
| `errorCode` を snapshot へ追加したい理由     | docs 上の仮説のみ → **却下** |
| callback 第3引数で consumer 要件を満たせるか | ✅ 満たせる                  |
| shared/public contract 変更が必要か          | **不要**                     |

**結論: 型変更なし。Phase 12 Step 2 の system spec sync 対象に昇格させない。**

---

## Task 2-3: Phase 5 実行モード確定

| 条件                                    | 判定                           |
| --------------------------------------- | ------------------------------ |
| current branch が既に AC を満たすか     | **YES**                        |
| docs と実装だけがずれているか           | Phase 12 docs close-out で対応 |
| runtime / test / relay の不整合が残るか | **なし**                       |

**Phase 5 方針: 差分確認 + no-op 記録**

---

## Phase 12 との接続

- system spec sync（Task 12-2）は「callback 第3引数の既存契約で要件充足」として update 不要を明記する
- `SkillCreatorWorkflowStateSnapshot` の型変更なしを changelog に記録する
- verification task と実装 task（近縁完了）の区別を task-workflow-completed.md に記録する
