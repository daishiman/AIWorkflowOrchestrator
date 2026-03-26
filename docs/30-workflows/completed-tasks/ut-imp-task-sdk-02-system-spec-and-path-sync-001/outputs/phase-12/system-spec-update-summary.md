# System Spec Update Summary

## same-wave 対象

| 区分             | 対象                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| system spec      | `architecture-overview-core.md`, `arch-electron-services-details-part2.md`, `api-ipc-system-core.md`                            |
| ledger / lessons | `task-workflow.md`, `task-workflow-completed.md`, `lessons-learned-current.md`, `lessons-learned-phase12-workflow-lifecycle.md` |
| indexes          | `resource-map.md`, `quick-reference.md`, `topic-map.md`, `keywords.json`                                                        |
| workflow local   | parent workflow の `index.md`, `phase-*`, `artifacts.json`, `outputs/artifacts.json`, `outputs/phase-12/*`                      |

## Step 1-A: 完了タスク記録と関連導線

| 項目       | 対象                                                                                              | このworkflowで固定する記録                                    |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 完了記録   | `task-workflow-completed.md`                                                                      | `TASK-SDK-02` current fact と remediation wave の根拠を揃える |
| 補助台帳   | `task-workflow.md`, `lessons-learned-current.md`, `lessons-learned-phase12-workflow-lifecycle.md` | same-wave の理由、再監査理由、no-op 根拠を同一波で閉じる      |
| ログと履歴 | `LOGS.md x2`, `SKILL.md x2`                                                                       | skill更新が発生した場合のみ同ターンで mirror parity を閉じる  |
| index      | `topic-map.md`, `resource-map.md`, `quick-reference.md`, `keywords.json`                          | 参照導線を current path へ揃える                              |

## Step 1-B / 1-C: 実装状況と関連タスク

| 項目               | 対象                           | 判定軸                                              |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| 実装状況テーブル   | parent workflow と関連台帳     | `spec_created` / `complete` / `blocked` の整合      |
| 関連タスクテーブル | 親 workflow 本文、未タスク候補 | remediation 後の downstream 依存が stale でないこと |

## Step 2: system spec 更新判定

- 新規コード実装は不要
- 新規インターフェース追加がなければ Step 2 は no-op とし、その根拠を changelog と unassigned detection に残す
- follow-up 新設は重複確認後に不要なら `no follow-up` と明記する
