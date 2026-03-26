# Downstream Handoff

| downstream task | 受け取る契約                           | 実装上の着地点                                     |
| --------------- | -------------------------------------- | -------------------------------------------------- |
| Task02          | `WorkflowManifestPhase[]`              | `phases`, `dependsOn`, `entryHookId`, `exitHookId` |
| Task03          | `WorkflowManifestResourceDescriptor[]` | `resources`, `kind`, `path`, `phaseIds`            |
| Task04          | `WorkflowManifestHook[]`               | `entry`, `exit`, hook id 参照                      |

## handoff の条件

- 追加解釈を要求しない plain contract であること
- authority owner を manifest に持ち込まないこと
- `ManifestLoader` は downstream の engine 実行を開始しないこと
