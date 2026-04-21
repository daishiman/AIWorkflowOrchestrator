# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 3                  |
| 後続Phase  | Phase 5                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

IPC層・Facade層・Renderer層それぞれのテストシナリオを設計し、TDD で実装を進める準備をする。

## テスト並列作成方針

Phase 4 内では IPC / Facade / Renderer の 3 層のテストを並列作成できる。

| 担当       | テスト対象                                            | テストファイル                                |
| ---------- | ----------------------------------------------------- | --------------------------------------------- |
| SubAgent-A | IPC ハンドラ（creatorHandlers.ts）                    | `__tests__/creatorHandlers.test.ts`           |
| SubAgent-B | Facade（RuntimeSkillCreatorFacade.ts）                | `__tests__/RuntimeSkillCreatorFacade.test.ts` |
| SubAgent-C | Renderer（ConversationalInterview.tsx の handleUndo） | `__tests__/ConversationalInterview.test.tsx`  |

## テストシナリオ

### IPC ハンドラ層

| シナリオ                                    | 期待結果                                   |
| ------------------------------------------- | ------------------------------------------ |
| planId が空の場合                           | validationError を返す                     |
| runtimeSkillCreatorService が未初期化の場合 | validationError を返す                     |
| rollbackLastInput 成功時                    | `{ success: true, data: snapshot }` を返す |
| rollbackLastInput が例外を投げた場合        | `{ success: false, error: ... }` を返す    |

### Facade 層

| シナリオ                                                              | 期待結果                                           |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| rollbackLastInput(planId) を呼ぶと awaitingUserInput が前の質問に戻る | snapshot.awaitingUserInput が前の requestId になる |
| 存在しない planId を指定した場合                                      | Error をスローする                                 |

### Renderer 層

| シナリオ                                             | 期待結果                                               |
| ---------------------------------------------------- | ------------------------------------------------------ |
| handleUndo が IPC undoUserInput を呼び出す           | api.undoUserInput が planId で呼ばれる                 |
| undoUserInput 成功時に workflowSnapshot が更新される | setWorkflowSnapshot が rollback 後 snapshot で呼ばれる |
| undoUserInput 失敗時にエラーが表示される             | setError が呼ばれる                                    |
| isSubmitting 中は handleUndo が何もしない            | api.undoUserInput が呼ばれない                         |

## 参照資料

| 資料名               | パス                                    | 用途             |
| -------------------- | --------------------------------------- | ---------------- |
| IPC4層設計書         | `outputs/phase-2/ipc-4layer-design.md`  | テスト対象の確認 |
| Facade設計書         | `outputs/phase-2/facade-design.md`      | テスト対象の確認 |
| handleUndo更新設計書 | `outputs/phase-2/handle-undo-design.md` | テスト対象の確認 |

## 成果物

| 成果物               | パス                                    | 説明                          |
| -------------------- | --------------------------------------- | ----------------------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | 全シナリオのテスト仕様        |
| IPC層テスト計画      | `outputs/phase-4/ipc-test-plan.md`      | IPC ハンドラのテスト計画      |
| Facade層テスト計画   | `outputs/phase-4/facade-test-plan.md`   | Facade のテスト計画           |
| Renderer層テスト計画 | `outputs/phase-4/renderer-test-plan.md` | Renderer のテスト計画         |
| Red テスト結果       | `outputs/phase-4/red-test-result.md`    | 実装前のテスト失敗確認（TDD） |

## 完了条件

- [ ] IPC / Facade / Renderer 各層のテストを作成した
- [ ] テストが RED 状態（実装前に失敗）であることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 5: 実装
