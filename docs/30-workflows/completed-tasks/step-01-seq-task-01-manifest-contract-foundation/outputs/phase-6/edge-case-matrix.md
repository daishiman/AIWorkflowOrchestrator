# Edge Case Matrix

| 分類       | ケース               | 実装状況                |
| ---------- | -------------------- | ----------------------- |
| graph      | dependsOn 未定義     | validation 実装済み     |
| graph      | phase 順序不正       | validation 実装済み     |
| entry-exit | `entryHookId` 不正   | validation 実装済み     |
| entry-exit | `exitHookId` 不正    | validation 実装済み     |
| path       | 必須 resource 欠落   | `fs.access` で検出      |
| path       | relative path 正規化 | `path.resolve` で正規化 |
