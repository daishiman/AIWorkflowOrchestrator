# Coverage Report

## field coverage

- 必須 field: `schemaVersion`, `workflowId`, `phases`, `resources`, `entry`, `exit`
- 禁止 field: unknown top-level field 全般

## loader boundary coverage

| 境界      | 正常系                         | 異常系                                              |
| --------- | ------------------------------ | --------------------------------------------------- |
| read      | valid manifest load            | parse 前提の file read failure は Node runtime 依存 |
| validate  | valid manifest                 | unknown field / schemaVersion / hook / graph        |
| normalize | relative path -> absolute path | missing resource                                    |
| cache     | cache hit                      | cache drift                                         |

## 注記

- 実ケースは `ManifestLoader.test.ts` へ実装
- Vitest 実行は環境の esbuild 不整合でブロック
