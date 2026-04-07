# フェーズ4: テスト仕様

## テストファイル

`apps/desktop/src/main/services/runtime/__tests__/buildHealthPolicy.test.ts`

## テストケース一覧

| ID      | 分類         | テスト内容                                         | 期待結果                                            |
| ------- | ------------ | -------------------------------------------------- | --------------------------------------------------- |
| TC-4-01 | 正常系       | connected → HealthPolicy 変換                      | healthStatus=healthy, isConnectionAvailable=true    |
| TC-4-02 | 正常系       | disconnected → HealthPolicy 変換                   | healthStatus=unhealthy, isConnectionAvailable=false |
| TC-4-03 | 正常系       | error → HealthPolicy 変換                          | healthStatus=unhealthy, isConnectionAvailable=false |
| TC-4-04 | プロバイダー | 選択中プロバイダーを優先使用                       | getAdapter("openai") が呼ばれる                     |
| TC-4-05 | プロバイダー | null 時デフォルト (anthropic)                      | getAdapter("anthropic") が呼ばれる                  |
| TC-4-06 | プロバイダー | fallbackProviderId 引数使用                        | 指定 providerId が使われる                          |
| TC-4-07 | 異常系       | getAdapter 例外 → unknown フォールバック           | healthStatus=unknown, lastCheckedAt=null            |
| TC-4-08 | 異常系       | checkHealth 例外 → unknown フォールバック          | healthStatus=unknown, lastCheckedAt=null            |
| TC-4-09 | 異常系       | getSelectedLLMConfig 例外 → unknown フォールバック | healthStatus=unknown, lastCheckedAt=null            |

## 初期状態（Red）

`buildHealthPolicy.ts` が存在しないため、テストは compile error でコケる状態から開始。
