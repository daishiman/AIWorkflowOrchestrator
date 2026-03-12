# Mode 差分表

| 観点               | general               | workspace                                                 | skill-lifecycle                                            |
| ------------------ | --------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| 起点               | ChatView              | WorkspaceView                                             | SkillCenterView                                            |
| 必須 context       | なし                  | `workspacePath`, `selectedFilePaths`, `selectedFileNames` | `lifecycleJob`, `handoffLabel`, 任意の `selectedSkillName` |
| 初期 welcome       | 通常会話案内          | ファイル文脈保持案内                                      | job 維持案内                                               |
| system prompt 差分 | 基本 prompt のみ      | file/context 優先                                         | job を崩さず内部都合を露出しない                           |
| session 再利用     | general slot を再利用 | workspace slot を再利用                                   | skill-lifecycle slot を再利用                              |
| downstream 依存    | 低                    | Workspace file selection                                  | Task03 lifecycle contract                                  |
| 失敗時重点         | model 未選択          | context 未注入                                            | forbidden boundary 漏れ                                    |

## 共有部分

- message list
- streaming placeholder / partial update
- abort / retry
- persist / revive
- recent session rail
