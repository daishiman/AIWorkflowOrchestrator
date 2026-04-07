# Phase 6: 回帰テスト結果

## タスクID: TASK-SDK-04-U1-F1

## 実行結果

```
Test Files  1 passed (1)
     Tests  47 passed (47)
  Start at  20:36:42
  Duration  3.45s (transform 538ms, setup 0ms, collect 939ms, tests 73ms)
```

## テスト件数内訳

| 種別        | 件数   | 結果     |
| ----------- | ------ | -------- |
| 既存テスト  | 39     | PASS     |
| TC-NEW-1〜3 | 3      | PASS     |
| TC-ADD-1〜5 | 5      | PASS     |
| **合計**    | **47** | **PASS** |

## 回帰確認項目

| 確認項目                                                       | 結果 |
| -------------------------------------------------------------- | ---- |
| TC-MOD-1: approve 遷移テスト（textValue 削除後）               | PASS |
| TC-MOD-2: improve 遷移テスト（textValue 削除後）               | PASS |
| TC-MOD-3: reject 遷移テスト（textValue 削除後）                | PASS |
| TC-MOD-4: no-op fallback テスト（textValue 削除後）            | PASS |
| TC-MOD-5: phase_transition artifact テスト（textValue 削除後） | PASS |
| recordExecutionFailure 既存テスト                              | PASS |
| recordVerifyFailure 既存テスト                                 | PASS |
| multi_select validation 既存テスト（4件）                      | PASS |
