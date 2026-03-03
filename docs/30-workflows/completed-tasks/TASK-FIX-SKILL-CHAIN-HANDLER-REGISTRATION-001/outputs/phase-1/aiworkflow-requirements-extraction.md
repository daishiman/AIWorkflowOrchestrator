# aiworkflow-requirements extraction

## 抽出元（chain handler registration）

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`

## 必要情報の網羅チェック

| 観点         | 抽出内容                                                                  | 参照元                                                                                    |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| IPC契約      | `skill:chain:list` は引数なし、`IpcResult<SkillChainDefinition[]>` を返す | `api-ipc-agent.md`                                                                        |
| Preload契約  | `chainList` と `skill:chain:list` の対応                                  | `interfaces-agent-sdk-skill.md`                                                           |
| 登録配線     | `registerAllIpcHandlers` で一元登録し、配線漏れを防止                     | `architecture-overview.md`, `architecture-implementation-patterns.md`, `task-workflow.md` |
| セキュリティ | `validateIpcSender` を handler 先頭で実施                                 | `security-electron-ipc.md`, `arch-ipc-persistence.md`                                     |
| 契約監査     | P42/P44/P45 のチェック観点                                                | `ipc-contract-checklist.md`                                                               |
| エラー応答   | `IpcResult` のエラー整形と内部情報漏えい防止                              | `error-handling.md`                                                                       |

## 抽出漏れ監査

- 本実装で必須となる観点（契約、配線、セキュリティ、エラー、監査）は全て対応する正本仕様へマッピング済み。
- 認証キー管理（`environment-variables.md` / `api-ipc-system.md`）は本タスクの主目的外のため参照対象外。

## 判定

**抽出漏れ: なし（2026-03-03時点）**
