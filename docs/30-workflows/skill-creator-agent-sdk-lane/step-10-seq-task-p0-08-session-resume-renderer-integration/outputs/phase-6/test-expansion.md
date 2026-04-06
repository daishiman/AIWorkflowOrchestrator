# Phase 6: テスト拡充

## 拡充済みテスト

### creatorHandlers.sessionResume.test.ts（既存）

- SKILL_CREATOR_LIST_SESSIONS: 正常系・Facade未初期化
- SKILL_CREATOR_GET_SESSION_DETAIL: 正常系・checkpointId空・セッション未発見
- SKILL_CREATOR_RESUME_SESSION: 正常系・失敗・checkpointId空・workflowStateChanged emit確認
- SKILL_CREATOR_DELETE_SESSION: 正常系・checkpointId空
- ハンドラ登録確認 (4チャンネル)

### session-resume-ipc.test.ts（新規）

- TC-I-01〜TC-I-08: preload API → IPC チャンネルマッピング検証

### SessionResumePrompt.test.tsx（既存）

- 11テスト: セッション表示・ボタン操作・互換性バッジ・アクセシビリティ

### SessionIndicator.test.tsx（既存）

- 7テスト: planId表示・経過時間・フェーズ・pulseアニメーション

## カバレッジ評価

| 対象                | 状態                                   |
| ------------------- | -------------------------------------- |
| SessionResumePrompt | 11テスト: AC-1,2,3,4,7,8全ケースカバー |
| SessionIndicator    | 7テスト: AC-5全ケースカバー            |
| IPC handlers        | 12テスト: 4チャンネル全ケースカバー    |
| Preload API         | 8テスト: 4メソッド全ケースカバー       |
