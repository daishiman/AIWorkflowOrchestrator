# Phase 2: 設計

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 2                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

current facts を前提に、必要な差分だけを設計対象へ残し、不要な型拡張や重複実装を排除する。

## 設計方針

| 観点      | 方針                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| 第一原則  | 既存 branch 実装を再実装しない                                                   |
| 契約境界  | `executeAsync()` → `onWorkflowStateSnapshot` → `creatorHandlers` の3点で確認する |
| 型変更    | shared/public contract 変更が必要な場合のみ許可する                              |
| close-out | Phase 12 の6成果物と parity を初期設計に含める                                   |

## 実行タスク

- Task 2-1: 契約境界の設計
- Task 2-2: 型変更要否の判断
- Task 2-3: Phase 5 の実行モード確定

## 参照資料

| 資料名         | パス                                                                   | 説明                   |
| -------------- | ---------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物 | `outputs/phase-1/code-investigation.md`                                | current facts の引継ぎ |
| runtime 実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 契約境界確認           |
| state 型       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 型変更要否確認         |
| IPC relay      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | relay 契約確認         |

## 設計判断マトリクス

| 選択肢 | 内容                                                    | 採用条件                                                | 既定判断 |
| ------ | ------------------------------------------------------- | ------------------------------------------------------- | -------- |
| A      | callback 第3引数 `errorMessage` を正本とする            | runtime / IPC relay / consumer が既に成立               | 第一候補 |
| B      | snapshot 本体へ `errorCode` / `errorMessage` を追加する | shared/public contract 変更が必須と確認できた場合のみ   | 条件付き |
| C      | runtime / IPC / tests を追加修正する                    | Phase 1 で current branch mismatch が確認された場合のみ | 条件付き |

## 実行手順

### Step 1: Task 2-1 契約境界の設計

| 境界      | 確認内容                                                                             |
| --------- | ------------------------------------------------------------------------------------ |
| runtime   | `executeAsync()` が error パスで `snapshot ?? null` と `errorMessage` を渡しているか |
| state 型  | `SkillCreatorWorkflowStateSnapshot` に追加フィールドが必要か                         |
| IPC relay | snapshot 不在でも `emitWorkflowStateChanged()` が成立するか                          |

### Step 2: Task 2-2 型変更要否の判断

- `errorCode` / `errorMessage` を snapshot へ追加したい理由が「docs 上の仮説」だけなら却下する
- callback 第3引数で consumer 要件を満たせるなら、型変更は行わない
- shared/public contract 変更が必要と判定した場合だけ、Phase 12 Step 2 の更新対象へ昇格させる

### Step 3: Task 2-3 Phase 5 実行モード確定

| 条件                                  | Phase 5 方針          |
| ------------------------------------- | --------------------- |
| current branch が既に AC を満たす     | 差分確認 + no-op 記録 |
| docs と実装だけがずれている           | docs close-out 中心   |
| runtime / test / relay の不整合が残る | 最小修正を許可        |

## 成果物

| 成果物     | 配置先                                        |
| ---------- | --------------------------------------------- |
| 設計メモ   | `outputs/phase-2/design-notes.md`             |
| 契約判断表 | `outputs/phase-2/contract-decision-matrix.md` |

## 完了条件

- [ ] 契約境界が runtime / state / IPC relay で整理されている
- [ ] 型変更要否の判断基準が明記されている
- [ ] Phase 5 実行モードを確定した
- [ ] Phase 12 Step 2 の要否判断に接続できる

## タスク100%実行確認【必須】

- [ ] Task 2-1 を完全に実行した
- [ ] Task 2-2 を完全に実行した
- [ ] Task 2-3 を完全に実行した

## 次Phase

→ [Phase 3: 設計レビューゲート](phase-3-design-review.md)
