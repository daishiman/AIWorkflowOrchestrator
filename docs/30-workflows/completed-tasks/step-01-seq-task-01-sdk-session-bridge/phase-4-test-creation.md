# Phase 4: テスト作成（TDD: Red）-- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 4                       |
| 機能名     | sdk-session-bridge      |
| タスクID   | TASK-SDK-SC-01          |
| 作成日     | 2026-04-02              |
| 依存 Phase | Phase 3（設計レビュー） |

## 目的

Phase 2 の設計に基づき、`SkillCreatorSdkSession` と `SkillCreatorIpcBridge` に対するテストコードを TDD: Red フェーズとして作成する。実装前にテストを書き、失敗することを確認する。

## 実行タスク

### Task 4-1: テストファイルの配置確認

テストファイルの配置先:

- 新規: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts`
- 新規: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`
- 既存テスト参照: `apps/desktop/src/main/services/runtime/__tests__/` 配下の既存ファイル（import パス確認用）

### Task 4-2: テストケース設計

#### T-01: `SkillCreatorSdkSession.startSession()` が SDK を呼び出すこと

```typescript
describe("SkillCreatorSdkSession", () => {
  describe("T-01: startSession() が SDK query() を呼び出すこと", () => {
    it("should call SDK query() with the skill-creator prompt", async () => {
      // SDK query() のモックを作成し、呼び出されたことを検証
      // 引数に skill-creator の呼び出しリクエストが含まれることを確認
    });

    it('should set state.status to "running" when started', async () => {
      // startSession() 呼び出し後に status が "running" になることを検証
    });

    it('should set state.status to "completed" when SDK stream ends', async () => {
      // SDK ストリームが終了した後に status が "completed" になることを検証
    });
  });
});
```

#### T-02: UserInput ツールコールを受け取ったとき IpcBridge に転送すること

```typescript
describe("T-02: UserInput ツールコールを IpcBridge に転送すること", () => {
  it("should call onQuestion callback when UserInput tool_use is detected", async () => {
    // SDK が tool_use イベント（UserInput）を発行したとき、
    // onQuestion コールバックが正しい UserInputQuestion を引数に呼ばれることを検証
  });

  it('should set state.status to "awaiting-input" when UserInput is received', async () => {
    // UserInput 受信後に status が "awaiting-input" になることを検証
  });

  it("should set state.currentQuestion when UserInput is received", async () => {
    // state.currentQuestion に受信した質問が格納されることを検証
  });

  it("should handle all 5 UserInput types correctly", async () => {
    // single_select / multi_select / free_text / secret / confirm の
    // 各種別が正しく UserInputQuestion に変換されることを検証
  });
});
```

#### T-03: `sendAnswer()` で SDK セッションに回答を注入すること

```typescript
describe("T-03: sendAnswer() で SDK セッションに回答を注入すること", () => {
  it("should resolve pendingResolve with the provided answer", () => {
    // sendAnswer() 呼び出しで pendingResolve が answer を引数に解決されることを検証
  });

  it('should set state.status to "running" after answer is sent', () => {
    // sendAnswer() 後に status が "running" に戻ることを検証
  });

  it("should log warning and do nothing when no pending question exists", () => {
    // pendingResolve が null の場合に安全ガードが動作することを検証
    // 警告ログが出力され、例外は発生しないことを確認
  });
});
```

#### T-04: セッション完了時に `session-complete` イベントを発行すること

```typescript
describe("T-04: セッション完了時に onComplete コールバックを呼ぶこと", () => {
  it("should call onComplete callback with result when session ends", async () => {
    // SDK ストリームが正常終了したとき、onComplete が result を引数に呼ばれることを検証
  });

  it('should set state.status to "completed" and state.result', async () => {
    // 完了後の state を検証
  });
});
```

#### T-05: エラー時に `session-error` イベントを発行すること

```typescript
describe("T-05: エラー時に onError コールバックを呼ぶこと", () => {
  it("should call onError callback when SDK throws", async () => {
    // SDK が例外を throw したとき、onError がエラーメッセージを引数に呼ばれることを検証
  });

  it("should call onError callback when timeout occurs after 30 seconds", async () => {
    // タイムアウト（30秒）後に onError が呼ばれることを検証
    // vitest の fake timers を使用
  });

  it('should set state.status to "error" on failure', async () => {
    // エラー後の state.status が "error" になることを検証
  });
});
```

#### T-06: IPC ハンドラーが正しく登録・解除されること

```typescript
describe("SkillCreatorIpcBridge", () => {
  describe("T-06: IPC ハンドラーの登録・解除", () => {
    it("should register start-session handler on register()", () => {
      // ipcMain.handle が SKILL_CREATOR_SESSION_CHANNELS.START_SESSION で呼ばれることを検証
    });

    it("should register answer handler on register()", () => {
      // ipcMain.on が SKILL_CREATOR_SESSION_CHANNELS.ANSWER で呼ばれることを検証
    });

    it("should remove all handlers on unregister()", () => {
      // unregister() 後に ipcMain.removeHandler / removeAllListeners が呼ばれることを検証
    });

    it("should emit question-received to renderer when onQuestion is called", () => {
      // IpcBridge の onQuestion コールバックが呼ばれたとき、
      // window.webContents.send(SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED, ...) が
      // 呼ばれることを検証
    });

    it("should emit session-complete to renderer when onComplete is called", () => {
      // onComplete コールバックが呼ばれたとき、
      // window.webContents.send(SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE, ...) が
      // 呼ばれることを検証
    });

    it("should emit session-error to renderer when onError is called", () => {
      // onError コールバックが呼ばれたとき、
      // window.webContents.send(SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR, ...) が
      // 呼ばれることを検証
    });
  });
});
```

### Task 4-3: テスト実行確認（Red フェーズ）

テストファイル作成後に以下を実行し、実装前のため失敗することを確認する:

```bash
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts
```

期待する結果: 全テストが `FAIL`（Red フェーズ確認）

## 参照資料

| 資料名              | パス                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Phase 2 設計        | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-2-design.md` |
| 既存テスト参照      | `apps/desktop/src/main/services/runtime/__tests__/`                          |
| Vitest ドキュメント | `https://vitest.dev/`（fake timers 使用方法）                                |

## 成果物

| 成果物                            | パス                                                                              | 形式       |
| --------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| SdkSession テストファイル（新規） | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts` | TypeScript |
| IpcBridge テストファイル（新規）  | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`  | TypeScript |

## 完了条件

- [ ] テストファイルの配置先を確認した
- [ ] 既存テストの import パスを参照した
- [ ] T-01（startSession / SDK 呼び出し）: 3 テストケースを作成した
- [ ] T-02（UserInput ツールコール転送）: 4 テストケースを作成した
- [ ] T-03（sendAnswer / 回答注入）: 3 テストケースを作成した
- [ ] T-04（セッション完了）: 2 テストケースを作成した
- [ ] T-05（エラー・タイムアウト）: 3 テストケースを作成した
- [ ] T-06（IPC ハンドラー登録・解除）: 6 テストケースを作成した
- [ ] テスト実行で Red フェーズを確認した

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）
