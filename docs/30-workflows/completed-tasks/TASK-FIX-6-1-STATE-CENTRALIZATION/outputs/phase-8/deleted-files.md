# Phase 8: 削除ファイル一覧 - TASK-FIX-6-1-STATE-CENTRALIZATION

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 8                                 |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 削除日   | 2026-02-09                        |

## 削除ファイル

### 実装ファイル（1件）

| No  | ファイルパス                                           | 行数    | 説明                |
| --- | ------------------------------------------------------ | ------- | ------------------- |
| 1   | `apps/desktop/src/renderer/store/slices/skillSlice.ts` | 約370行 | スキル状態管理Slice |

### テストファイル（5件）

| No  | ファイルパス                                                                           | テスト数     | 説明                       |
| --- | -------------------------------------------------------------------------------------- | ------------ | -------------------------- |
| 1   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`                  | 基本テスト   | 初期状態・アクションテスト |
| 2   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.edge-cases.test.ts`       | エッジケース | 境界値・異常系テスト       |
| 3   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.integration.test.ts`      | 統合テスト   | IPC統合テスト              |
| 4   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.ipc.test.ts`              | IPCテスト    | IPC通信テスト              |
| 5   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.state-transition.test.ts` | 状態遷移     | 状態遷移テスト             |

## 削除理由

### 背景

TASK-FIX-6-1-STATE-CENTRALIZATION の目的は、スキル状態管理を `skillSlice` から `agentSlice` に統合することである。

### 根拠

1. **仕様書準拠**: `arch-state-management.md` に従い、スキル状態はagentSliceで一元管理
2. **重複排除**: skillSliceとagentSliceで状態が重複していた問題を解消
3. **race condition対策**: agentSlice側でexecutionId事前生成を実装済み

### 移行先

| 削除された機能              | 移行先                                 |
| --------------------------- | -------------------------------------- |
| availableSkillsMetadata     | agentSlice.availableSkillsMetadata     |
| importedSkills              | agentSlice.importedSkills              |
| selectedSkillName           | agentSlice.selectedSkillName           |
| skillExecutionStatus        | agentSlice.skillExecutionStatus        |
| streamingMessages           | agentSlice.streamingMessages           |
| pendingPermission           | agentSlice.pendingPermission           |
| skillError                  | agentSlice.skillError                  |
| fetchSkills()               | agentSlice.fetchSkills()               |
| rescanSkills()              | agentSlice.rescanSkills()              |
| importSkill()               | agentSlice.importSkill()               |
| removeSkill()               | agentSlice.removeSkill()               |
| selectSkillByName()         | agentSlice.selectSkillByName()         |
| executeSkill()              | agentSlice.executeSkill()              |
| abortExecution()            | agentSlice.abortExecution()            |
| respondToSkillPermission()  | agentSlice.respondToSkillPermission()  |
| \_handleStreamMessage()     | agentSlice.\_handleStreamMessage()     |
| \_handleComplete()          | agentSlice.\_handleComplete()          |
| \_handleError()             | agentSlice.\_handleError()             |
| \_handlePermissionRequest() | agentSlice.\_handlePermissionRequest() |

## テスト移行

削除されたテストは `agentSlice.skill-integration.test.ts` に移行済み：

| 元のテストファイル                  | 移行先テストケース   |
| ----------------------------------- | -------------------- |
| skillSlice.test.ts                  | TS-6-1-01〜TS-6-1-35 |
| skillSlice.edge-cases.test.ts       | TS-6-1-57〜TS-6-1-73 |
| skillSlice.integration.test.ts      | TS-6-1-74〜TS-6-1-80 |
| skillSlice.ipc.test.ts              | TS-6-1-40〜TS-6-1-56 |
| skillSlice.state-transition.test.ts | TS-6-1-28〜TS-6-1-39 |

追加で `setupSkillListeners.test.ts` にTS-6-1-81〜TS-6-1-88を実装。

## 削除後の検証

- [x] TypeScript型チェック成功
- [x] ESLint警告なし
- [x] 全テスト（70件）成功
- [x] 既存機能への影響なし
