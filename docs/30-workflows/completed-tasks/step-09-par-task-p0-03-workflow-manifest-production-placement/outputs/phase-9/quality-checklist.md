# Phase 9: 品質チェックリスト

| 基準           | 判定条件                                                            | 結果          |
| -------------- | ------------------------------------------------------------------- | ------------- |
| path integrity | 全 resource path が実在ファイルを指す                               | ✅ PASS (7/7) |
| ref integrity  | 全 id 参照が解決できる (phase→resource, phase→hook, resource→phase) | ✅ PASS       |
| schema compat  | schemaVersion === 1 (WORKFLOW_MANIFEST_SCHEMA_VERSION と一致)       | ✅ PASS       |
| json validity  | JSON.parse でエラーなし                                             | ✅ PASS       |
| mirror parity  | canonical と mirror が byte-equivalent                              | ✅ PASS       |
