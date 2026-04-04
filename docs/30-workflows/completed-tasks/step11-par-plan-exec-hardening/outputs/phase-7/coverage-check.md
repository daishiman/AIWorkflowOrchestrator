# Phase 7: カバレッジ確認

## P0-07 受入基準達成状況

| ID      | 基準                                                         | 確認方法       | 結果                   |
| ------- | ------------------------------------------------------------ | -------------- | ---------------------- |
| P7-AC-1 | `AGENT_NAMES` が削除されている                               | grep           | ✓ 機能コードに残留なし |
| P7-AC-2 | `plan()` が `PLAN_RESOURCE_REQUESTS` の agent エントリを読む | T-P7-01/04     | ✓ GREEN                |
| P7-AC-3 | `PLAN_RESOURCE_REQUESTS` の内容が変われば fallback も追随    | コードレビュー | ✓ filter で動的に参照  |
| P7-AC-4 | system prompt の agent 仕様が current facts と一致           | T-P7-03        | ✓ GREEN                |
| P7-AC-5 | 既存テストが pass する                                       | 23/23          | ✓ PASS                 |
| P7-AC-6 | agent 名導出と fallback path のテストがある                  | T-P7-02/04     | ✓ GREEN                |

## U2 受入基準達成状況

| ID      | 基準                                                                          | 確認方法       | 結果                                     |
| ------- | ----------------------------------------------------------------------------- | -------------- | ---------------------------------------- |
| S4-AC-1 | `handleGeneratePlan`（`handlePrepare`）が plan 承認時点の snapshot を保持する | コードレビュー | ✓ `setApprovedSkillSpec(trimmedRequest)` |
| S4-AC-2 | textarea 編集しても execute 先が変わらない                                    | U-8b, U-19b    | ✓ GREEN                                  |
| S4-AC-3 | cancel で `approvedSkillSpec` が null に戻る                                  | U-20b          | ✓ GREEN                                  |
| S4-AC-4 | generate → edit → execute の drift 再現テストがある                           | U-8b           | ✓ GREEN                                  |

## 型チェック

```
pnpm --filter @repo/desktop typecheck → エラーなし
```
