# Phase 4: テスト仕様書

## 作成日: 2026-03-30

## テストファイル

`apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

## テストケース一覧

### describe: verify→improve→re-verify closed loop

| #   | テスト名                                                         | 対応AC | 種別     | 状態              |
| --- | ---------------------------------------------------------------- | ------ | -------- | ----------------- |
| 1   | recordVerifyPass() で verify→review に遷移し pass 状態を記録する | AC-1   | ユニット | fail-first        |
| 2   | recordVerifyPass() を verify phase 以外で呼ぶとエラーになる      | AC-1   | ユニット | fail-first        |
| 3   | requestReverify() で improve→verify 遷移が動作する               | AC-3   | ユニット | fail-first        |
| 4   | complete cycle: execute→verify(fail)→improve→verify(pass)        | AC-4   | 統合     | fail-first        |
| 5   | requestReverify() を improve 以外の phase で呼ぶと拒否される     | AC-6   | ユニット | fail-first        |
| 6   | verify pass 後に再度 recordVerifyPass を呼ぶとエラーになる       | edge   | ユニット | fail-first        |
| 7   | verify fail を経ずに improve に遷移しようとするとエラーになる    | edge   | ユニット | pass (既存ガード) |
| 8   | verify pass snapshot は verifyResult.status=pass を含む          | AC-5   | snapshot | fail-first        |
| 9   | recordVerifyPass() は verify_result artifact を追加する          | AC-1   | ユニット | fail-first        |

## AC-テスト対応表

| AC   | テスト#                             |
| ---- | ----------------------------------- |
| AC-1 | 1, 2, 9                             |
| AC-2 | 既存テスト（verify fail → improve） |
| AC-3 | 3                                   |
| AC-4 | 4                                   |
| AC-5 | 8                                   |
| AC-6 | 5                                   |

## fail-first 確認結果

- 7 failed | 29 passed (36 total)
- 全新規テストが `TypeError: engine.recordVerifyPass is not a function` で失敗
- 既存テストは全てpass維持
