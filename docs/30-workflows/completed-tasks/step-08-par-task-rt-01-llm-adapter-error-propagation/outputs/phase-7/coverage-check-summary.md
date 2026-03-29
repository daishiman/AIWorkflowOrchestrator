# Phase 7: Coverage Check Summary

## ステータス遷移 Coverage

| 遷移パターン                | テスト            | カバー |
| --------------------------- | ----------------- | ------ |
| 初期値 `"initializing"`     | T-ST-01           | OK     |
| initializing → ready        | T-ST-02           | OK     |
| initializing → failed       | T-ST-03           | OK     |
| failed → ready (リカバリー) | T-ST-06 + Phase 6 | OK     |
| failed → failed (連続)      | Phase 6           | OK     |
| ready → failed (異常)       | Phase 6           | OK     |
| failureReason 取得 (failed) | T-ST-04           | OK     |
| failureReason 取得 (ready)  | T-ST-05           | OK     |

## plan() エラーレスポンス Coverage

| パターン                    | テスト            | カバー |
| --------------------------- | ----------------- | ------ |
| failed → エラーレスポンス   | T-PL-01           | OK     |
| initializing → エラー       | T-PL-02 + Phase 6 | OK     |
| ready → 正常レスポンス      | T-PL-03           | OK     |
| API key → actionable msg    | T-PL-04 + Phase 6 | OK     |
| network エラー → 具体的理由 | T-PL-05 + Phase 6 | OK     |
| adapterStatus フィールド    | T-PL-06           | OK     |
| failureReason 空文字        | Phase 6           | OK     |

## メソッド Coverage

| メソッド                           | テスト                    |
| ---------------------------------- | ------------------------- |
| `llmAdapterStatus` (getter)        | T-ST-01〜06               |
| `llmAdapterFailureReason` (getter) | T-ST-04〜05               |
| `setLLMAdapter()`                  | T-ST-02, T-ST-06          |
| `setLLMAdapterFailed()`            | T-ST-03, T-ST-04, Phase 6 |
| `plan()` (エラー分岐)              | T-PL-01〜06               |
| ipc catch block                    | T-IPC-02, Phase 6         |

## 結論

AC-1〜AC-6 の全項目に対応するテストケースが存在し、coverage gap なし。
