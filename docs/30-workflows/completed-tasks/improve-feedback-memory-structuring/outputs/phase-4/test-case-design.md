# Phase 4: テストケース設計書

## Red 状態確認結果

| TC ID | テストケース名                                                 | Red 状態        | 失敗理由                               |
| ----- | -------------------------------------------------------------- | --------------- | -------------------------------------- |
| TC-01 | 初回 improve では過去の改善試行履歴セクションを含まない        | PASS (期待通り) | 初回は履歴なしなので現行コードでもPASS |
| TC-02 | 2回目の improve で1件の試行履歴が feedback に含まれる          | FAIL ✅         | 「過去の改善試行履歴」未実装           |
| TC-03 | 3回目の improve で試行1・2の履歴が feedback に含まれる         | FAIL ✅         | 「過去の改善試行履歴」未実装           |
| TC-04 | maxImproveRetry 到達時に全試行の履歴が蓄積されている           | FAIL ✅         | 「過去の改善試行履歴」未実装           |
| TC-05 | 初回呼び出し時は履歴セクションなしでチェック結果のみ返す       | PASS (期待通り) | 初回は履歴なしなので現行コードでもPASS |
| TC-06 | 複数試行後の feedback に「異なる戦略を提案」の指示文が含まれる | FAIL ✅         | 「過去の改善試行履歴」未実装           |

## テスト実行結果

- **4 failed | 34 passed (38)**
- 既存テスト（L838-973）は変更なし、全 PASS
- Red 状態の失敗はすべて `buildImproveFeedback` の新フォーマット未実装に起因

## テスト配置

- ファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- 追加ブロック: `describe("feedback history accumulation")` 内に TC-01〜TC-06
- ヘルパー関数: `createLoopMocks()`, `makeImproveResponse()`
