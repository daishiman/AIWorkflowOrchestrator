# 要件定義書

## メタ情報

| 項目      | 内容                  |
| --------- | --------------------- |
| タスク ID | UT-IPC-HANDLER-CI-001 |
| 作成日    | 2026-04-18            |
| Phase     | 1                     |

## P50 チェック結果

| 確認項目                                  | 判定    | 根拠                                                                                                                    |
| ----------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| current branch に関連実装が存在する       | **Yes** | `ipcHandlerRegistrationSnapshot.test.ts` が TC-01〜TC-05 として REG-SNAP-01/REG-DEDUP-01 相当を実装済み                 |
| upstream に類似修正が既に取り込まれている | **Yes** | スナップショットファイルが `__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap` に存在し、19チャンネルが固定済み |
| 前提タスクが完了済みである                | **Yes** | `fix-creator-handler-duplicate-skill-name-validation` の修正が適用済み                                                  |

**判定**: 既存実装あり → 差分確認と回帰確認を Phase 5 の主作業とする。新規ファイル `creatorHandlers.registrationSnapshot.test.ts` は Electron mock capture パターンで補完的に追加する。

## 機能要件

### REQ-001: チャンネル登録スナップショット固定

`registerRuntimeSkillCreatorHandlers()` が登録する `ipcMain.handle()` チャンネル一覧を CI でスナップショット固定する。

- チャンネル数: 19（public runtime 17 + auxiliary 2）
- スナップショット更新は `--updateSnapshot` オプションを明示的に実行した場合のみ許可する
- CI では `--updateSnapshot` なしで実行し、差分が出た場合は CI を失敗させる

### REQ-002: 重複チャンネル登録の自動検出

同一チャンネル名が複数回 `ipcMain.handle()` で登録された場合に CI で自動検出する。

- `new Set(handles).size !== handles.length` で検出する
- 重複検出時はテストを失敗させ、CI を停止する

### REQ-003: 欠損チャンネルの自動検出

期待する19チャンネルのうち1つ以上が欠損した場合に CI で自動検出する。

- スナップショット差分として検出する
- 件数チェック（`toHaveLength(19)`）でも検出する

## 非機能要件

| ID      | 要件               | 値                                                              |
| ------- | ------------------ | --------------------------------------------------------------- |
| NFR-001 | テスト実行時間     | 全テストで 5 秒以内                                             |
| NFR-002 | 既存テストとの干渉 | `ipcHandlerRegistrationSnapshot.test.ts` と独立して動作すること |
| NFR-003 | CI 統合            | `.github/workflows/` の既存テストジョブで自動実行されること     |

## 登録チャンネル仕様

`registerRuntimeSkillCreatorHandlers()` が登録する 19 チャンネル（アルファベット順）:

| #   | チャンネル名                            | IPC_CHANNELS キー                                 |
| --- | --------------------------------------- | ------------------------------------------------- |
| 1   | skill-creator:apply-improvement         | SKILL_CREATOR_APPLY_IMPROVEMENT                   |
| 2   | skill-creator:cleanup-expired-sessions  | SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS            |
| 3   | skill-creator:configure-api             | SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API |
| 4   | skill-creator:delete-session            | SKILL_CREATOR_DELETE_SESSION                      |
| 5   | skill-creator:execute-plan              | SKILL_CREATOR_EXECUTE_PLAN                        |
| 6   | skill-creator:get-adapter-status        | SKILL_CREATOR_GET_ADAPTER_STATUS                  |
| 7   | skill-creator:get-governance-state      | SKILL_CREATOR_GET_GOVERNANCE_STATE                |
| 8   | skill-creator:get-session-detail        | SKILL_CREATOR_GET_SESSION_DETAIL                  |
| 9   | skill-creator:get-verify-detail         | SKILL_CREATOR_GET_VERIFY_DETAIL                   |
| 10  | skill-creator:get-workflow-state        | SKILL_CREATOR_GET_WORKFLOW_STATE                  |
| 11  | skill-creator:improve-skill             | SKILL_CREATOR_IMPROVE_SKILL                       |
| 12  | skill-creator:list-sessions             | SKILL_CREATOR_LIST_SESSIONS                       |
| 13  | skill-creator:normalize-sdk-messages    | SKILL_CREATOR_NORMALIZE_SDK_MESSAGES              |
| 14  | skill-creator:output-overwrite-approved | SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED           |
| 15  | skill-creator:plan                      | SKILL_CREATOR_PLAN                                |
| 16  | skill-creator:resume-session            | SKILL_CREATOR_RESUME_SESSION                      |
| 17  | skill-creator:reverify-workflow         | SKILL_CREATOR_REVERIFY_WORKFLOW                   |
| 18  | skill-creator:submit-user-input         | SKILL_CREATOR_SUBMIT_USER_INPUT                   |
| 19  | skill-creator:verify                    | SKILL_CREATOR_VERIFY                              |

## 実行記録

- `creatorHandlers.ts` の `ipcMain.handle()` 呼び出し数: 19 件（行 224, 267, 302, 337, 367, 408, 443, 489, 533, 568, 602, 640, 655, 679, 726, 748, 764, 795, 822）
- `unregisterRuntimeSkillCreatorHandlers()` の `removeHandler` 呼び出し数: 19 件（整合確認済み）
- 既存テストとの重複確認: `ipcHandlerRegistrationSnapshot.test.ts` が TC-01〜TC-05 として実装済み。新規ファイルは Electron mock capture パターンで補完的に追加する
