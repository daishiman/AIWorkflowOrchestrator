# TASK-P0-04: テスト計画

| ID    | 観点                                                         | 期待結果                   |
| ----- | ------------------------------------------------------------ | -------------------------- |
| TC-10 | `SKILL_CREATOR_MANIFEST_PATH` で canonical manifest を読める | `workflowId=skill-creator` |
| TC-11 | `resolveDefaultManifestPath()` が絶対パスを返す              | 絶対パス                   |
| TC-12 | 解決済みパスから `ManifestLoader` で読める                   | parse 成功                 |
| TC-13 | 定数値が空でない                                             | `"workflow-manifest.json"` |
| TC-14 | `explicitRoot` 優先                                          | 引数パス配下を返す         |
| EC-10 | 存在しない root を与える                                     | join 結果を返す            |
| EC-11 | 候補に manifest がない                                       | 日本語エラー               |
| EC-12 | 破損 JSON                                                    | `ManifestLoader` が reject |

## Red/Green

- 本仕様改善ターンでは Red 段階を再実行していない
- current code 上の最終状態として、対象テストは Green であることを実測確認した
