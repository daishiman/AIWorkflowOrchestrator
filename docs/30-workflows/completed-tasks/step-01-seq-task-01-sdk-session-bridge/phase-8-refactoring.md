# Phase 8: リファクタリング -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase番号  | 8                     |
| 機能名     | sdk-session-bridge    |
| タスクID   | TASK-SDK-SC-01        |
| 作成日     | 2026-04-02            |
| 依存 Phase | Phase 7（カバレッジ） |

## 目的

実装済みコードを品質向上の観点でレビューし、マジックストリング排除・責務境界整理・可読性改善を行う。テストは全て PASS を維持する。

## 実行タスク

### Task 8-1: マジックストリング排除の確認

`SkillCreatorSdkSession.ts` と `SkillCreatorIpcBridge.ts` 内に IPC チャネル名のマジックストリングが残っていないことを確認する。

チェック項目:

| 確認箇所                                                    | 期待する状態                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| `SkillCreatorIpcBridge.ts` の `ipcMain.handle()` 呼び出し   | `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION` 定数を使用している |
| `SkillCreatorIpcBridge.ts` の `ipcMain.on()` 呼び出し       | `SKILL_CREATOR_SESSION_CHANNELS.ANSWER` 定数を使用している        |
| `SkillCreatorIpcBridge.ts` の `webContents.send()` 呼び出し | `SKILL_CREATOR_SESSION_CHANNELS.*` 定数を使用している             |
| `SkillCreatorSdkSession.ts` 内                              | IPC チャネル名の直書きがない                                      |

マジックストリングが見つかった場合は `SKILL_CREATOR_SESSION_CHANNELS` 定数に置き換える。

### Task 8-2: `SkillCreatorSdkSession` と `SkillCreatorWorkflowEngine` の責務境界確認

以下の観点で両クラスの責務が重複していないことを確認する:

| 責務                                     | SkillCreatorSdkSession      | SkillCreatorWorkflowEngine |
| ---------------------------------------- | --------------------------- | -------------------------- |
| SDK `query()` API の呼び出し             | 担当                        | 担当しない                 |
| `UserInput` ツールコールの検出           | 担当                        | 担当しない                 |
| IPC イベントの送受信                     | 担当しない（Bridge に委譲） | 担当しない                 |
| ワークフロー実行エンジン（plan/execute） | 担当しない                  | 担当                       |
| セッション状態管理（running/awaiting等） | 担当                        | 担当しない                 |

重複や境界の曖昧さが見つかった場合は、コメント追記またはクラス分割で対処する。

### Task 8-3: エラーメッセージの一貫性確認

`SkillCreatorSdkSession.ts` 内のエラーメッセージが以下の形式に統一されているか確認する:

- タイムアウトエラー: `'[SkillCreatorSdkSession] UserInput timeout after 30 seconds'`
- 二重起動エラー: `'[SkillCreatorSdkSession] Session is already running'`
- 回答注入エラー: `'[SkillCreatorSdkSession] No pending question to answer'`

形式が統一されていない場合は修正する。

### Task 8-4: 型定義の整理

`packages/shared/src/types/skillCreatorSession.ts` の型エクスポートが `packages/shared/src/types/index.ts`（または同等の再エクスポートファイル）から適切にエクスポートされていることを確認する。

未追加の場合は追記する:

```typescript
// packages/shared/src/types/index.ts への追記
export type {
  SessionStatus,
  UserInputType,
  UserInputOption,
  UserInputQuestion,
  UserInputAnswer,
  ISkillCreatorSessionState,
} from "./skillCreatorSession";
```

### Task 8-5: リファクタリング後のテスト再確認

```bash
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts
```

期待する結果: 全テスト引き続き PASS

## 参照資料

| 資料名                          | パス                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 5 実装                    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-5-implementation.md` |
| 既存 SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`               |
| 共有型インデックス              | `packages/shared/src/types/index.ts`（存在する場合）                                 |

## 成果物

| 成果物                           | パス                                                                       | 形式       |
| -------------------------------- | -------------------------------------------------------------------------- | ---------- |
| リファクタリング済み SdkSession  | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`（更新） | TypeScript |
| リファクタリング済み IpcBridge   | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`（更新）  | TypeScript |
| 型エクスポート追加（必要な場合） | `packages/shared/src/types/index.ts`（更新）                               | TypeScript |

## 完了条件

- [ ] マジックストリングが全て `SKILL_CREATOR_SESSION_CHANNELS` 定数に置き換えられていることを確認した
- [ ] `SkillCreatorSdkSession` と `SkillCreatorWorkflowEngine` の責務境界が明確であることを確認した
- [ ] エラーメッセージが `[SkillCreatorSdkSession]` プレフィックスで統一されていることを確認した
- [ ] 型定義が共有パッケージから適切にエクスポートされていることを確認した
- [ ] リファクタリング後も全テストが PASS していることを確認した

## 次の Phase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
