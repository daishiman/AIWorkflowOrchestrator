# IPC チャネル棚卸し（TASK-UI-03）

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| 作成日     | 2026-04-06                   |
| ステータス | complete                     |
| 対象       | Skill Creator IPC 全チャネル |

---

## Session IPC チャネル一覧

**公開元**: `apps/desktop/src/preload/skill-creator-session-api.ts`
**Renderer 公開名**: `window.skillCreatorSessionAPI` / `window.electronAPI.skillCreatorSession`
**定義元**: `packages/shared/src/ipc/channels.ts` → `SKILL_CREATOR_SESSION_CHANNELS`

| チャネル名                     | 文字列値                                     | 方向 | 通信パターン | 引数型                                    | 戻り値型                           | セキュリティ   |
| ------------------------------ | -------------------------------------------- | ---- | ------------ | ----------------------------------------- | ---------------------------------- | -------------- |
| `START_SESSION`                | `skill-creator:start-session`                | R→M  | invoke       | `{ request: string, sessionId?: string }` | `void`                             | ホワイトリスト |
| `ANSWER`                       | `skill-creator:answer`                       | R→M  | invoke       | `UserInputAnswer`                         | `void`                             | ホワイトリスト |
| `QUESTION_RECEIVED`            | `skill-creator:question-received`            | M→R  | on           | -                                         | `UserInputQuestion`                | ホワイトリスト |
| `SESSION_COMPLETE`             | `skill-creator:session-complete`             | M→R  | on           | -                                         | `SkillCreatorSessionCompleteEvent` | ホワイトリスト |
| `SESSION_ERROR`                | `skill-creator:session-error`                | M→R  | on           | -                                         | `SkillCreatorSessionErrorEvent`    | ホワイトリスト |
| `EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` | M→R  | on           | -                                         | `ExternalApiConfigRequiredEvent`   | ホワイトリスト |

**備考**: `CONFIGURE_API` (`skill-creator:configure-api`) は `SKILL_CREATOR_EXTERNAL_API_CHANNELS` 経由で Session IPC に関連する外部API設定チャネル。

---

## Runtime IPC チャネル一覧

**公開元**: `apps/desktop/src/preload/skill-creator-api.ts`
**Renderer 公開名**: `window.skillCreatorAPI` / `window.electronAPI.skillCreator`
**ハンドラー**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

### ワークフロー制御チャネル

| チャネル名                             | 文字列値                               | 方向 | 通信パターン             | 引数型                                      | 戻り値型                                                | セキュリティ                      |
| -------------------------------------- | -------------------------------------- | ---- | ------------------------ | ------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| `SKILL_CREATOR_PLAN`                   | `skill-creator:plan`                   | R→M  | invoke                   | `{ prompt, authMode?, apiKey? }`            | `IpcResult<RuntimeSkillCreatorPlanResponse>`            | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_EXECUTE_PLAN`           | `skill-creator:execute-plan`           | R→M  | invoke (fire-and-forget) | `{ planId, skillSpec, authMode?, apiKey? }` | `{ accepted: true, planId }`                            | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_GET_WORKFLOW_STATE`     | `skill-creator:get-workflow-state`     | R→M  | invoke                   | `{ planId }`                                | `IpcResult<SkillCreatorWorkflowUiSnapshot>`             | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_SUBMIT_USER_INPUT`      | `skill-creator:submit-user-input`      | R→M  | invoke                   | `SkillCreatorUserInputSubmission`           | `IpcResult<SkillCreatorWorkflowUiSnapshot>`             | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` | `skill-creator:workflow-state-changed` | M→R  | on (push)                | -                                           | `SkillCreatorWorkflowUiSnapshot \| null, errorMessage?` | ホワイトリスト                    |

### LLM Adapter 状態チャネル

| チャネル名                             | 文字列値                               | 方向 | 通信パターン | 引数型 | 戻り値型                             | セキュリティ                      |
| -------------------------------------- | -------------------------------------- | ---- | ------------ | ------ | ------------------------------------ | --------------------------------- |
| `SKILL_CREATOR_GET_ADAPTER_STATUS`     | `skill-creator:get-adapter-status`     | R→M  | invoke       | なし   | `IpcResult<LLMAdapterStatusPayload>` | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` | `skill-creator:adapter-status-changed` | M→R  | on (push)    | -      | `LLMAdapterStatusPayload`            | ホワイトリスト                    |

### スキル改善チャネル

| チャネル名                        | 文字列値                          | 方向 | 通信パターン | 引数型                                        | 戻り値型                                             | セキュリティ                      |
| --------------------------------- | --------------------------------- | ---- | ------------ | --------------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| `SKILL_CREATOR_IMPROVE_SKILL`     | `skill-creator:improve-skill`     | R→M  | invoke       | `{ skillName, feedback, authMode?, apiKey? }` | `IpcResult<RuntimeSkillCreatorImproveResponse>`      | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_APPLY_IMPROVEMENT` | `skill-creator:apply-improvement` | R→M  | invoke       | `{ skillName, suggestions[] }`                | `IpcResult<ApplyImprovementResult>`                  | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_GET_VERIFY_DETAIL` | `skill-creator:get-verify-detail` | R→M  | invoke       | `{ planId }`                                  | `IpcResult<RuntimeSkillCreatorVerifyDetailResponse>` | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_REVERIFY_WORKFLOW` | `skill-creator:reverify-workflow` | R→M  | invoke       | `{ planId }`                                  | `IpcResult<RuntimeSkillCreatorReverifyResponse>`     | `validateSender` + ホワイトリスト |

### Session Resume チャネル（Runtime API 内に混在）

| チャネル名                               | 文字列値                                 | 方向 | 通信パターン | 引数型             | 戻り値型                                    | セキュリティ                      |
| ---------------------------------------- | ---------------------------------------- | ---- | ------------ | ------------------ | ------------------------------------------- | --------------------------------- |
| `SKILL_CREATOR_LIST_SESSIONS`            | `skill-creator:list-sessions`            | R→M  | invoke       | なし               | `IpcResult<SkillCreatorSessionListItem[]>`  | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_GET_SESSION_DETAIL`       | `skill-creator:get-session-detail`       | R→M  | invoke       | `{ checkpointId }` | `IpcResult<SkillCreatorWorkflowUiSnapshot>` | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_RESUME_SESSION`           | `skill-creator:resume-session`           | R→M  | invoke       | `{ checkpointId }` | `SkillCreatorSessionResumeResult`           | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_DELETE_SESSION`           | `skill-creator:delete-session`           | R→M  | invoke       | `{ checkpointId }` | `void`                                      | `validateSender` + ホワイトリスト |
| `SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` | `skill-creator:cleanup-expired-sessions` | R→M  | invoke       | なし               | `number`                                    | `validateSender` + ホワイトリスト |

### その他 Runtime API チャネル

| チャネル名                                | 文字列値                                  | 方向 | 用途                 |
| ----------------------------------------- | ----------------------------------------- | ---- | -------------------- |
| `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES`    | `skill-creator:normalize-sdk-messages`    | R→M  | SDK メッセージ正規化 |
| `SKILL_CREATOR_GET_GOVERNANCE_STATE`      | `skill-creator:get-governance-state`      | R→M  | Governance 状態取得  |
| `SKILL_CREATOR_OUTPUT_READY`              | `skill-creator:output-ready`              | M→R  | スキル出力完了通知   |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | `skill-creator:output-overwrite-approved` | R→M  | 上書き承認           |
| `SKILL_CREATOR_OPEN_SKILL`                | `skill-creator:open-skill`                | R→M  | スキルを開く         |

---

## Preload 公開 API 対応表

| Window オブジェクト                      | ソースファイル                              | 内容                           |
| ---------------------------------------- | ------------------------------------------- | ------------------------------ |
| `window.skillCreatorAPI`                 | `skill-creator-api.ts`                      | Runtime IPC（+Session Resume） |
| `window.skillCreatorSessionAPI`          | `skill-creator-session-api.ts`              | Session IPC（会話フロー）      |
| `window.electronAPI.skillCreator`        | `index.ts` + `skill-creator-api.ts`         | ← 上と同じ（二重露出）         |
| `window.electronAPI.skillCreatorSession` | `index.ts` + `skill-creator-session-api.ts` | ← 上と同じ（二重露出）         |

**重要発見**: 同一 API オブジェクトが `window.skillCreatorAPI` と `window.electronAPI.skillCreator` の両方から参照可能。API surface が 4 経路で公開されている。

---

## チャネル数サマリ

| 分類                             | チャネル数 |
| -------------------------------- | ---------- |
| Session IPC（会話フロー）        | 6          |
| Runtime IPC（ワークフロー制御）  | 5          |
| Runtime IPC（LLM Adapter 状態）  | 2          |
| Runtime IPC（スキル改善）        | 4          |
| Session Resume（Runtime API 内） | 5          |
| その他 Runtime                   | 5          |
| **合計**                         | **27**     |
