# Phase 12: System Spec Update Summary

## Step 1-A: 完了記録

- TASK-RT-02 は `spec_created` → 実装完了
- 全 AC (AC-1〜AC-7) 充足
- 全 Minor Notes (M-01〜M-03) 解決

## Step 1-B: 実装状況

- shared types: `RuntimeSkillCreatorDegradedReason`, `RuntimeSkillCreatorPlanErrorResponse` 追加済み
- Facade: `buildDegradedError()` による explicit error 返却実装済み
- renderer: type guard + error 表示実装済み
- テスト: 66/66 通過（RT-02 関連のみ）

## Step 1-C: 関連タスク status 同期

| タスク     | status | 備考                                          |
| ---------- | ------ | --------------------------------------------- |
| TASK-RT-01 | 未着手 | llmAdapter 初期化失敗通知（RT-02 と競合なし） |
| TASK-RT-03 | 未着手 | result panel 側 follow-up（RT-02 の後続）     |

## Step 2: system spec 更新要否

**判定: 追加更新不要（反映済み）**

shared types の error union 拡張（`RuntimeSkillCreatorPlanErrorResponse` / `RuntimeSkillCreatorDegradedReason`）は、system spec 側に同一 wave で記録済み。

- `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`
  - 「TASK-RT-06 claude-sdk-message-contract-normalization（2026-03-29）」節に `plan degraded error union` 反映を記録
- 新規 IPC チャネル追加や outer `IpcResult` 形状変更はないため、Step 2 の追加差分はなし
