# Phase 4: Test Matrix

## ステータス遷移テスト (T-ST)

| ID      | シナリオ                                        | 期待結果                                        |
| ------- | ----------------------------------------------- | ----------------------------------------------- |
| T-ST-01 | Facade 生成直後                                 | `llmAdapterStatus === "initializing"`           |
| T-ST-02 | `setLLMAdapter()` 呼び出し後                    | `llmAdapterStatus === "ready"`                  |
| T-ST-03 | `setLLMAdapterFailed("API key not set")` 後     | `llmAdapterStatus === "failed"`                 |
| T-ST-04 | `setLLMAdapterFailed()` 後に failureReason 取得 | `llmAdapterFailureReason === "API key not set"` |
| T-ST-05 | `setLLMAdapter()` 後に failureReason 取得       | `llmAdapterFailureReason === null`              |
| T-ST-06 | `setLLMAdapterFailed()` → `setLLMAdapter()`     | `status === "ready"`, `failureReason === null`  |

## plan() エラーレスポンステスト (T-PL)

| ID      | シナリオ                                | 期待結果                                                  |
| ------- | --------------------------------------- | --------------------------------------------------------- |
| T-PL-01 | status `"failed"` で plan()             | `success: false`, `errorCode: "LLM_ADAPTER_FAILED"`       |
| T-PL-02 | status `"initializing"` で plan()       | `success: false`, `errorCode: "LLM_ADAPTER_INITIALIZING"` |
| T-PL-03 | status `"ready"` で plan()              | `success: true` (既存正常レスポンス)                      |
| T-PL-04 | API key エラーで failed 時の plan()     | error に "APIキーを設定してください" を含む               |
| T-PL-05 | ネットワークエラーで failed 時の plan() | error に具体的失敗理由を含む                              |
| T-PL-06 | エラーレスポンスの adapterStatus        | `adapterStatus` が現在のステータスと一致                  |

## IPC レスポンステスト (T-IPC)

| ID       | シナリオ                        | 期待結果                                       |
| -------- | ------------------------------- | ---------------------------------------------- |
| T-IPC-01 | plan IPC (adapter ready)        | `adapterStatus: "ready"` を含む                |
| T-IPC-02 | plan IPC (adapter failed)       | `adapterStatus: "failed"` + error を含む       |
| T-IPC-03 | plan IPC (adapter initializing) | `adapterStatus: "initializing"` + error を含む |

## 互換性テスト (T-COMPAT)

| ID          | シナリオ                                    | 期待結果                            |
| ----------- | ------------------------------------------- | ----------------------------------- |
| T-COMPAT-01 | 既存 `setLLMAdapter()` パターン             | ステータス自動遷移で既存テスト pass |
| T-COMPAT-02 | llmAdapter 未設定で plan 以外のメソッド呼出 | 既存動作と同等                      |

## Phase 6 Edge Cases (追加予定)

- ステータス再遷移: failed→ready, failed→failed 連続, ready→failed
- タイミング競合: initializing 中の plan(), setLLMAdapter 直後の plan()
- エラーメッセージ: 空文字, 長文, "ANTHROPIC_API_KEY" / "api_key" パターン
- IPC: 即座 throw, reject Promise, non-Error throw, undefined error
