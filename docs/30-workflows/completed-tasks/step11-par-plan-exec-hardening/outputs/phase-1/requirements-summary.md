# Phase 1: 要件定義サマリー

## current facts 確認結果

### TASK-P0-07

| 確認項目                            | 結果                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `PLAN_PROMPT_CONSTANTS.AGENT_NAMES` | `["discover-problem", "design-workflow", "plan-structure"]` がハードコードされている         |
| `PLAN_RESOURCE_REQUESTS`            | 同じ3 agent が `kind: "agent"` として定義されている（id 一致）                               |
| fallback path                       | `RuntimeSkillCreatorFacade.ts` L823: `for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES)` |
| 重複状態                            | `AGENT_NAMES` と `PLAN_RESOURCE_REQUESTS` の agent id が二重管理されている                   |

### TASK-SDK-04-U2

| 確認項目            | 結果                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| `approvedSkillSpec` | `useState<string                                                                          | null>(null)` で定義 |
| セット箇所          | `handlePrepare` 内 `setApprovedSkillSpec(trimmedRequest)`                                 |
| execute 使用箇所    | `handleExecutePlan` 内 `approvedSkillSpec ?? undefined`                                   |
| cancel 箇所         | `handleCancelPlan` 内 `setApprovedSkillSpec(null)`                                        |
| drift 有無          | `handleExecutePlan` は `approvedSkillSpec` を使用しており live draft から切り離されている |

## Source of Truth 確定

- **P0-07**: `PLAN_RESOURCE_REQUESTS` を唯一の source of truth とする。`AGENT_NAMES` は削除する
- **U2**: `approvedSkillSpec` = plan 承認時点の request snapshot。`handleExecutePlan` は常に `approvedSkillSpec` のみを使用する

## 並列実行可能性

- P0-07 と U2 は独立ファイルを変更するため、Phase 2 設計確定後は並列で実装可能
- 共有ファイルなし（main-process 系 vs renderer 系）

## Phase 2 への受け渡し

- P0-07: `PLAN_RESOURCE_REQUESTS.filter(r => r.kind === "agent")` から agent 名を導出する設計へ
- U2: `approvedSkillSpec` semantics をコメントで明確化し、drift 防止テストを補強する

## タスク100%実行確認

- [x] P0-07 の source of truth が `PLAN_RESOURCE_REQUESTS` に固定されている
- [x] U2 の snapshot semantics が live draft と分離されている
- [x] 2 タスクの責務境界と並列可能性が明記されている
- [x] Phase 2 へ渡せる acceptance criteria が確定している
