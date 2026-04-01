# Lessons Learned（教訓集） / skill domain lessons (plan exec hardening)

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons (plan execution hardening / Lane分割並列実装)

## TASK-P0-07: Lane分割による並列実装の効果確認 (step-11)

### タスク概要

| 項目       | 値                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-07                                                                                                      |
| 目的       | plan execution hardening — `planPromptConstants.ts` の `AGENT_NAMES` 定数削除と fallback path の単一ソース化    |
| 完了日     | 2026-04-01                                                                                                      |
| ステータス | 完了                                                                                                            |
| 背景       | step-11-par-task-plan-execution-hardening で Lane A（main-process）と Lane B（renderer）の並列実装を実施         |

### 知見

| #   | 知見                                           | 詳細                                                                                                                                                                                                                                                                    | 適用条件                                                                 |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | **単一ソース化でdrift防止**                     | `AGENT_NAMES` と `PLAN_RESOURCE_REQUESTS` の重複定義を解消し、`PLAN_RESOURCE_REQUESTS` を唯一の正本とすることで、将来の agent 追加が自動的に fallback path に反映される設計を実現                                                                                        | 同一情報が複数定義として存在するとき                                       |
| 2   | **Lane分割の前提**                              | Lane A（`planPromptConstants.ts` / `RuntimeSkillCreatorFacade.ts`）と Lane B（`SkillLifecyclePanel.tsx`）は依存関係がなく、並列実装に適していた。依存関係ゼロが並列化の必要条件                                                                                           | main-process / renderer のように依存関係がないコンポーネント間の実装      |
| 3   | **コメントによるsemantics明確化**               | `approvedSkillSpec` の frozen snapshot semantics をコード変更なしでコメントで明示するアプローチは、IPC contract を変えずに意図を伝える最小変更として有効                                                                                                                  | public surface を変えずに設計意図を記録したいとき                         |
