# Phase 5: 差分確認・最小修正

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 5                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

Phase 1〜4 の結果に基づき、既存 branch 実装との差分だけを確認し、差分が確認されたときだけ最小修正を行う。

## 対象ファイル

| ファイル                                                                                          | 役割               | 修正条件                                    |
| ------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | runtime error 伝搬 | current facts に不一致があるときだけ        |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                            | state 型確認       | public/shared contract 変更が必須のときだけ |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                    | IPC relay          | relay gap があるときだけ                    |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | runtime テスト     | 事実との差分があるときだけ                  |

## 実行タスク

- Task 5-1: 差分確認
- Task 5-2: no-op または最小修正の判定
- Task 5-3: 実施内容の記録

## 参照資料

| 資料名         | パス                                                                  | 説明           |
| -------------- | --------------------------------------------------------------------- | -------------- |
| Phase 4 成果物 | `outputs/phase-4/test-design.md`                                      | 差分確認の観点 |
| runtime 実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 主対象         |
| IPC relay      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | relay 影響確認 |

## 実行手順

### Step 1: 差分確認

- current branch の実装が Phase 2 の契約判断と一致するかを確認する
- 一致している場合は no-op とし、`outputs/phase-5/implementation-notes.md` に理由を残す

### Step 2: 最小修正

- runtime / relay / test のいずれかに欠落がある場合のみ局所修正する
- snapshot 本体への `errorCode` 拡張は、Step 1 で必要と確認された場合に限定する

## 成果物

| 成果物       | 配置先                                    |
| ------------ | ----------------------------------------- |
| 差分確認メモ | `outputs/phase-5/implementation-notes.md` |

## 完了条件

- [ ] 新規実装前提ではなく差分確認前提で実行した
- [ ] 不要な型拡張を入れていない
- [ ] no-op または最小修正の根拠を記録した

## 次Phase

→ [Phase 6: テスト拡充](phase-6-test-expansion.md)
