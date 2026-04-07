# フェーズ6: テスト補充

## 補充対象の確認

既存テストカバレッジの分析：

| テスト観点                               | カバー済み                                     | 補充要否 |
| ---------------------------------------- | ---------------------------------------------- | -------- |
| connected → healthy                      | ✅ TC-4-01                                     | 不要     |
| disconnected → unhealthy                 | ✅ TC-4-02                                     | 不要     |
| error → unhealthy                        | ✅ TC-4-03                                     | 不要     |
| selectedProvider 優先                    | ✅ TC-4-04                                     | 不要     |
| null → anthropic fallback                | ✅ TC-4-05                                     | 不要     |
| fallbackProviderId 引数                  | ✅ TC-4-06                                     | 不要     |
| getAdapter 例外                          | ✅ TC-4-07                                     | 不要     |
| checkHealth 例外                         | ✅ TC-4-08                                     | 不要     |
| getSelectedLLMConfig 例外                | ✅ TC-4-09                                     | 不要     |
| isDegraded → terminal_handoff（E2E確認） | ✅ RuntimePolicyResolver.health-policy.test.ts | 不要     |

## 結論

全観点が9テストでカバー済み。補充テストは不要。
受入基準 AC-2「degraded 状態で terminal_handoff」は
`RuntimePolicyResolver.health-policy.test.ts` の TC-D-1〜D-4 で検証済み。
