# スナップショット結果

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 5                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 生成されたスナップショット

ファイル: `apps/desktop/src/main/ipc/__tests__/__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap`

```
// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`registerRuntimeSkillCreatorHandlers - チャンネル登録スナップショット > REG-SNAP-01〜REG-COUNT-01: 正常系 > REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する 1`] = `
[
  "skill-creator:apply-improvement",
  "skill-creator:cleanup-expired-sessions",
  "skill-creator:configure-api",
  "skill-creator:delete-session",
  "skill-creator:execute-plan",
  "skill-creator:get-adapter-status",
  "skill-creator:get-governance-state",
  "skill-creator:get-session-detail",
  "skill-creator:get-verify-detail",
  "skill-creator:get-workflow-state",
  "skill-creator:improve-skill",
  "skill-creator:list-sessions",
  "skill-creator:normalize-sdk-messages",
  "skill-creator:output-overwrite-approved",
  "skill-creator:plan",
  "skill-creator:resume-session",
  "skill-creator:reverify-workflow",
  "skill-creator:submit-user-input",
  "skill-creator:verify",
]
`;
```

## 既存スナップショットとの比較

既存の `ipcHandlerRegistrationSnapshot.test.ts.snap` と**完全一致** ✅

- 19 チャンネル全て一致
- ソート順（アルファベット順）一致
- Phase 1 の `channel-list.md` に記載の期待チャンネル一覧と一致
