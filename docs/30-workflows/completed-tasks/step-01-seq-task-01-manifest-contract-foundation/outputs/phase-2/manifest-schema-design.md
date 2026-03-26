# Manifest Schema Design

## top-level field

| field           | 必須 | 型                                     | 説明                              |
| --------------- | ---- | -------------------------------------- | --------------------------------- |
| `schemaVersion` | 必須 | `1`                                    | foundation task の schema version |
| `workflowId`    | 必須 | `string`                               | workflow 識別子                   |
| `phases`        | 必須 | `WorkflowManifestPhase[]`              | phase topology                    |
| `resources`     | 必須 | `WorkflowManifestResourceDescriptor[]` | resource descriptor               |
| `entry`         | 必須 | `WorkflowManifestHook[]`               | entry hook 定義                   |
| `exit`          | 必須 | `WorkflowManifestHook[]`               | exit hook 定義                    |

## phase field

| field         | 必須 | 説明                      |
| ------------- | ---- | ------------------------- |
| `id`          | 必須 | phase 識別子              |
| `title`       | 必須 | 人間向け phase 名         |
| `dependsOn`   | 任意 | 先行 phase                |
| `resourceIds` | 任意 | phase が参照する resource |
| `entryHookId` | 必須 | entry hook 参照           |
| `exitHookId`  | 必須 | exit hook 参照            |

## 禁止 field

- `authMode`
- `permission`
- `session`
- `route`
- `verify`
- `ui`
- 上記以外の unknown top-level field 全て
