# Negative Case Catalog

| ケース           | 入力                                  | owner             |
| ---------------- | ------------------------------------- | ----------------- |
| authority drift  | `authMode` top-level field            | loader validation |
| version mismatch | `schemaVersion = 2`                   | loader validation |
| entry 欠落       | `entryHookId` が未定義 hook を参照    | loader validation |
| exit 欠落        | `exitHookId` が未定義 hook を参照     | loader validation |
| resource 欠落    | 必須 resource file 不在               | fs access         |
| phase 順序不正   | `dependsOn` より前に phase を置かない | loader validation |
