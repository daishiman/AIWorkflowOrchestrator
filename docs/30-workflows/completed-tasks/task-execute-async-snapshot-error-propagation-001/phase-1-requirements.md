# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 1                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

current branch の runtime / IPC / type 契約を確認し、本 task が「新規実装」ではなく「差分確認と close-out 整備」で成立するかを確定する。

## 事前分類【必須】

| 項目         | 判定       | 根拠                                                    |
| ------------ | ---------- | ------------------------------------------------------- |
| タスク種別   | NON_VISUAL | Main Process / IPC relay の確認が主で UI 変更を含まない |
| 実装状態     | 調査必須   | current branch に候補実装が既に存在する可能性が高い     |
| Phase 5 方針 | 条件付き   | 実装済みなら差分確認、未充足なら最小修正                |
| Phase 13     | blocked    | commit / PR はスコープ外                                |

## 真の論点【必須】

1. `executeAsync()` の error パスは現在どの値を `onWorkflowStateSnapshot` に渡しているか。
2. `SkillCreatorWorkflowStateSnapshot` の型変更は本当に必要か。
3. `creatorHandlers.ts` 側 relay まで含めた契約は既に成立しているか。
4. 既存 completed ledger と重複しない verification task としてどう閉じるか。

## 実行タスク

- Task 1-1: current facts 調査
- Task 1-2: 要件整理と受入基準の再定義
- Task 1-3: 4条件評価とリスク整理

## 参照資料

| 資料名              | パス                                                                                              | 説明                                     |
| ------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| runtime 実装        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | `executeAsync()` / callback 契約確認     |
| state 型            | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                            | `SkillCreatorWorkflowStateSnapshot` 確認 |
| IPC relay           | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                    | error relay の consumer 契約確認         |
| runtime テスト      | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | current facts の証跡                     |
| 近縁 completed task | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001.md`     | carry-over 事実確認                      |

## 実行手順

### Step 0: P50チェック

```bash
rg -n "executeAsync|onWorkflowStateSnapshot|extractExecuteErrorMessage" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
rg -n "SkillCreatorWorkflowStateSnapshot" \
  apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts
rg -n "emitWorkflowStateChanged|onWorkflowStateSnapshot" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
rg -n "T-01|T-02|T-03|T-04|T-05|T-06" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

### Step 1: Task 1-1 current facts 調査

| 調査項目           | 記録内容                                           |
| ------------------ | -------------------------------------------------- |
| runtime error パス | `executeAsync()` error 分岐の callback 引数        |
| catch パス         | `snapshot ?? null` 正規化の有無                    |
| state 型           | `SkillCreatorWorkflowStateSnapshot` の公開境界     |
| IPC relay          | snapshot 不在でも `errorMessage` を relay できるか |
| carry-over         | 近縁 completed task の対象ファイルと証跡           |

### Step 2: Task 1-2 要件整理

| ID   | 要件                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| FR-1 | Phase 1 は current facts を基準に調査結果を固定する                          |
| FR-2 | `errorCode` の snapshot 拡張は必要性が確認できた場合に限る                   |
| FR-3 | Phase 5 は「差分確認・最小修正」を原則とし、既存 branch 実装の再実装を避ける |
| FR-4 | Phase 11 は NON_VISUAL 証跡、Phase 12 は必須6成果物と parity を要求する      |

| ID   | 基準                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `RuntimeSkillCreatorFacade.ts` / `SkillCreatorWorkflowEngine.ts` / `creatorHandlers.ts` の current facts が `outputs/phase-1/code-investigation.md` に記録される |
| AC-2 | `errorCode` 拡張の要否が Phase 2 に渡せる粒度で整理される                                                                                                        |
| AC-3 | 完了済み近縁タスクとの差分が明記される                                                                                                                           |
| AC-4 | NON_VISUAL / blocked / parity の運用前提が固まる                                                                                                                 |

### Step 3: Task 1-3 リスク・4条件評価

| ケース | 内容                                                     | 方針                                               |
| ------ | -------------------------------------------------------- | -------------------------------------------------- |
| E-1    | 実装は既に充足済みで docs だけが古い                     | Phase 5 を no-op 記録へ切り替える                  |
| E-2    | callback 第3引数で十分なのに snapshot 拡張を要求している | 設計で不要判定し、型変更を禁止する                 |
| E-3    | state 型が shared/public contract に露出している         | Phase 12 Step 2 で system spec sync 対象に昇格する |
| E-4    | completed ledger と重複した完了記録を書いてしまう        | verification task と実装 task を分離して記録する   |

## 成果物

| 成果物                 | 配置先                                   |
| ---------------------- | ---------------------------------------- |
| current facts 調査メモ | `outputs/phase-1/code-investigation.md`  |
| タスク分類             | `outputs/phase-1/task-classification.md` |

## 完了条件

- [ ] P50チェックを実行した
- [ ] current facts を runtime / state / IPC relay まで確認した
- [ ] `errorCode` 拡張の要否を論点として切り出した
- [ ] NON_VISUAL / blocked / parity 前提を確定した
- [ ] Phase 2 に引き継ぐ論点を固定した

## タスク100%実行確認【必須】

- [ ] Task 1-1 を完全に実行した
- [ ] Task 1-2 を完全に実行した
- [ ] Task 1-3 を完全に実行した

## 次Phase

→ [Phase 2: 設計](phase-2-design.md)
