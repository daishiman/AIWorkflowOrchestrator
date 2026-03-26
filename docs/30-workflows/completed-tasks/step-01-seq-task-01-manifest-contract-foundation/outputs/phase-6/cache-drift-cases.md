# Cache Drift Cases

| 条件                          | 期待結果                              |
| ----------------------------- | ------------------------------------- |
| manifest `mtime` 変化         | 再読込                                |
| resource descriptor path 変化 | `resourceDescriptorHash` 変化で再読込 |
| `schemaVersion` 変化          | reject または再読込                   |
