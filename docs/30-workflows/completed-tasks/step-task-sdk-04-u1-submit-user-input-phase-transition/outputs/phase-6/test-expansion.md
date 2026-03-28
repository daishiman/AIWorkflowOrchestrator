# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 6                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

Phase 4（TDD-Red）/ Phase 5（TDD-Green）でカバーした主要パスに加え、fail path・edge case・IPC 層テストを追加して AC-6, AC-7 を含む全受け入れ基準をカバーする。

## 実行タスク

### T-6-1: IPC handler テスト — submitUserInput 後の state-changed event（AC-7）

IPC handler 経由で `submitUserInput` を呼び出した後、`skill-creator:workflow-state-changed` イベントが `webContents.send` で push され、遷移後の最新 snapshot が含まれることを検証する。

| テストケース                                             | 期待動作                                                       | AC   |
| -------------------------------------------------------- | -------------------------------------------------------------- | ---- |
| IPC handler 経由 plan_review → state-changed に snapshot | `webContents.send` の payload に currentPhase="execute" を含む | AC-7 |
| IPC handler 経由 verification_review → state-changed     | `webContents.send` の payload に verifyResult 更新値含む       | AC-7 |

### T-6-2: facade snapshot 整合テスト（AC-6）

`RuntimeSkillCreatorFacade.submitUserInput()` を呼び出し、返却される snapshot が engine 内部の state と一致することを検証する。

| テストケース                                        | 期待動作                                     | AC   |
| --------------------------------------------------- | -------------------------------------------- | ---- |
| facade.submitUserInput() の snapshot が engine 一致 | snapshot.currentPhase === engine state phase | AC-6 |
| facade snapshot に verifyResult 反映                | snapshot.verifyResult === engine state 値    | AC-6 |

### T-6-3: textValue 付き needs_changes テスト

`plan_review` + `needs_changes` で `textValue` が指定されている場合、`verifyResult.message` に保存される既存ロジックとの整合を検証する。

| テストケース                      | 入力                                                                  | 期待動作                                       | AC   |
| --------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| needs_changes + textValue="fix X" | reason=plan_review, selectedOptionId=needs_changes, textValue="fix X" | currentPhase="plan", message に "fix X" を含む | AC-2 |

### T-6-4: verifyResult が null 状態からの verification_review テスト

`state.verifyResult` が `null` の初期状態から `verification_review` が実行された場合、フォールバック base 値で正しく初期化されることを検証する。

| テストケース                | 前提条件                | 期待動作                                         |
| --------------------------- | ----------------------- | ------------------------------------------------ |
| verifyResult=null → approve | state.verifyResult=null | verifyResult.status="pass", nextAction="handoff" |
| verifyResult=null → reject  | state.verifyResult=null | verifyResult.status="fail", nextAction="review"  |

## テストファイル

| ファイル           | パス                                                                                  | 追加テスト          |
| ------------------ | ------------------------------------------------------------------------------------- | ------------------- |
| Engine テスト      | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | T-6-2, T-6-3, T-6-4 |
| IPC handler テスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`            | T-6-1               |

## 実行コマンド

```bash
# Engine テスト
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts

# IPC handler テスト
pnpm exec vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts

# 全テスト一括
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/ apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts
```

## 参照資料

| 参照資料             | パス                                | 内容                                |
| -------------------- | ----------------------------------- | ----------------------------------- |
| Phase 2 設計書       | `outputs/phase-2/design.md`         | Validation Matrix（全テストケース） |
| Phase 4 テスト計画書 | `outputs/phase-4/test-plan.md`      | Phase 4 テストケース一覧            |
| Phase 5 実装計画書   | `outputs/phase-5/implementation.md` | 実装コード例                        |

## 成果物

| 成果物         | パス                                    | 説明                                |
| -------------- | --------------------------------------- | ----------------------------------- |
| テスト拡充計画 | `outputs/phase-6/test-expansion.md`     | 本ドキュメント                      |
| テストコード   | engine test + IPC handler test 内の追加 | T-6-1〜T-6-4 に対応するテストケース |

## 完了条件

- [ ] T-6-1: IPC handler テスト — state-changed event に遷移後 snapshot が含まれるテストが追加されている（AC-7）
- [ ] T-6-2: facade snapshot 整合テストが追加されている（AC-6）
- [ ] T-6-3: textValue 付き needs_changes のテストが追加されている
- [ ] T-6-4: verifyResult=null からの verification_review テストが追加されている
- [ ] 全テスト（Phase 4 + Phase 6）が GREEN（パス）
- [ ] 既存テストが壊れていない
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: テストカバレッジ確認
