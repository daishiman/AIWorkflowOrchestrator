# 登録チャンネル一覧

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 1                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 期待チャンネル一覧（19件・アルファベット順）

| #   | チャンネル名                            | 種別      | 実装行（creatorHandlers.ts） |
| --- | --------------------------------------- | --------- | ---------------------------- |
| 1   | skill-creator:apply-improvement         | public    | 489                          |
| 2   | skill-creator:cleanup-expired-sessions  | auxiliary | 748                          |
| 3   | skill-creator:configure-api             | auxiliary | 795                          |
| 4   | skill-creator:delete-session            | auxiliary | 726                          |
| 5   | skill-creator:execute-plan              | public    | 302                          |
| 6   | skill-creator:get-adapter-status        | public    | 267                          |
| 7   | skill-creator:get-governance-state      | public    | 764                          |
| 8   | skill-creator:get-session-detail        | auxiliary | 655                          |
| 9   | skill-creator:get-verify-detail         | public    | 533                          |
| 10  | skill-creator:get-workflow-state        | public    | 337                          |
| 11  | skill-creator:improve-skill             | public    | 443                          |
| 12  | skill-creator:list-sessions             | auxiliary | 640                          |
| 13  | skill-creator:normalize-sdk-messages    | public    | 602                          |
| 14  | skill-creator:output-overwrite-approved | auxiliary | 822                          |
| 15  | skill-creator:plan                      | public    | 224                          |
| 16  | skill-creator:resume-session            | auxiliary | 679                          |
| 17  | skill-creator:reverify-workflow         | public    | 568                          |
| 18  | skill-creator:submit-user-input         | public    | 367                          |
| 19  | skill-creator:verify                    | public    | 408                          |

## 集計

| 種別      | 件数                                              |
| --------- | ------------------------------------------------- |
| public    | 17                                                |
| auxiliary | 2 (`CONFIGURE_API` + `OUTPUT_OVERWRITE_APPROVED`) |
| **合計**  | **19**                                            |

## スナップショット確認

既存スナップショット（`__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap`）と一致確認済み:

- 19 チャンネル全て一致 ✅
- ソート順一致 ✅

## 既存テストとの関係

`ipcHandlerRegistrationSnapshot.test.ts` (TC-01〜TC-05) が同一チャンネル一覧を検証済み。
新規テスト `creatorHandlers.registrationSnapshot.test.ts` は Electron mock capture パターンで補完的に追加する。
