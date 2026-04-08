# Phase 1 成果物: 要件定義書

## 実行日時: 2026-04-07

---

## 対象関数一覧

### `registerRuntimeSkillCreatorHandlers(mainWindow, runtimeSkillCreatorService?, outputHandler?)`

**ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

この関数が登録する IPC チャネル一覧（18 件 = public runtime 16 + auxiliary 2）:

| #   | チャネル名                                | 定数名                                                | 分類           |
| --- | ----------------------------------------- | ----------------------------------------------------- | -------------- |
| 1   | `skill-creator:plan`                      | `IPC_CHANNELS.SKILL_CREATOR_PLAN`                     | public runtime |
| 2   | `skill-creator:get-adapter-status`        | `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS`       | public runtime |
| 3   | `skill-creator:execute-plan`              | `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN`             | public runtime |
| 4   | `skill-creator:get-workflow-state`        | `IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE`       | public runtime |
| 5   | `skill-creator:submit-user-input`         | `IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT`        | public runtime |
| 6   | `skill-creator:improve-skill`             | `IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL`            | public runtime |
| 7   | `skill-creator:apply-improvement`         | `IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT`        | public runtime |
| 8   | `skill-creator:get-verify-detail`         | `IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL`        | public runtime |
| 9   | `skill-creator:reverify-workflow`         | `IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW`        | public runtime |
| 10  | `skill-creator:normalize-sdk-messages`    | `IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES`   | public runtime |
| 11  | `skill-creator:list-sessions`             | `IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS`            | public runtime |
| 12  | `skill-creator:get-session-detail`        | `IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL`       | public runtime |
| 13  | `skill-creator:resume-session`            | `IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION`           | public runtime |
| 14  | `skill-creator:delete-session`            | `IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION`           | public runtime |
| 15  | `skill-creator:cleanup-expired-sessions`  | `IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` | public runtime |
| 16  | `skill-creator:get-governance-state`      | `IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE`     | public runtime |
| 17  | `skill-creator:configure-api`             | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`   | auxiliary      |
| 18  | `skill-creator:output-overwrite-approved` | `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`             | auxiliary      |

**期待登録総数**: 18 チャネル（public runtime 16 + auxiliary 2）

---

## 受け入れ基準

1. `registerRuntimeSkillCreatorHandlers()` 呼び出し後に `ipcMain.handle` が 18 回呼ばれること
2. 全 18 チャネル名の一覧がスナップショットと一致すること
3. 重複チャネルが 1 件も存在しないこと（Set サイズ == 配列長）
4. 重複登録が発生した場合は CI で FAIL すること
5. チャネルの追加・削除・リネームがあった場合は CI でスナップショット不一致 FAIL すること

---

## FR（機能要件）

- FR-01: `registerRuntimeSkillCreatorHandlers()` の登録チャネル一覧をスナップショットで固定できること
- FR-02: 重複登録が発生した場合にスナップショット差分または件数差分で FAIL すること
- FR-03: 18 件（public runtime 16 + auxiliary 2）の登録総数を検証できること

---

## NFR（非機能要件）

- NFR-01: スナップショット比較が決定論的であること（チャネル名をソートして固定）
- NFR-02: 追加・削除・リネームが CI で再現性よく検出できること
- NFR-03: runtime-only のスコープが維持されること（他の handler 関数は scope 外）

---

## エッジケース一覧

| ケース                             | 期待動作                                |
| ---------------------------------- | --------------------------------------- |
| 重複 `handle()` 登録               | テスト FAIL（重複チャネルが検出される） |
| チャネル数が変わった場合           | スナップショット不一致で FAIL           |
| チャネル名がリネームされた場合     | スナップショット不一致で FAIL           |
| チャネルが削除された場合           | スナップショット不一致で FAIL           |
| チャネルが追加された場合（誤追加） | スナップショット不一致で FAIL           |

---

## 完了判定

- [x] `registerRuntimeSkillCreatorHandlers()` の登録チャネルが一覧化されている
- [x] 期待登録チャネル数（18 = public runtime 16 + auxiliary 2）が文書化されている
- [x] 受け入れ基準と FR/NFR が文書化されている
- [x] `outputs/phase-1/requirements.md` が成果物として定義されている
- [x] `outputs/phase-1/` 配下に成果物が配置されている
