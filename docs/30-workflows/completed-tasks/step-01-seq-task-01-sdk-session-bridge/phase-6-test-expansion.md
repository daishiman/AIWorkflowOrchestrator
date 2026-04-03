# Phase 6: テスト拡充 -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase番号  | 6                  |
| 機能名     | sdk-session-bridge |
| タスクID   | TASK-SDK-SC-01     |
| 作成日     | 2026-04-02         |
| 依存 Phase | Phase 5（実装）    |

## 目的

Phase 4 の基本テストに加え、エッジケース・フォールバック処理・タイムアウト処理のテストを追加し、実装の堅牢性を高める。

## 実行タスク

### Task 6-1: セッション中断・再開のエッジケーステスト

```typescript
describe("T-07: セッション中断・再開のエッジケース", () => {
  it("should reject new startSession() while a session is already running", async () => {
    // すでにセッションが実行中の場合、新しい startSession() 呼び出しが
    // エラーを throw するか、既存セッションを終了させることを検証
  });

  it("should handle session abort gracefully when window is closed", async () => {
    // BrowserWindow が閉じられた場合にセッションが安全に終了することを検証
    // onError コールバックが呼ばれることを確認
  });

  it("should reset state correctly after session completion", async () => {
    // セッション完了後に currentSession が null にリセットされることを検証
    // 連続して新しいセッションを開始できることを確認
  });

  it("should reset state correctly after session error", async () => {
    // エラー終了後に currentSession が null にリセットされることを検証
  });
});
```

### Task 6-2: AskUserQuestion Deferred Tool 問題のフォールバックテスト

設計上の課題: SDK の `AskUserQuestion` ツールが Deferred Tool として扱われる場合、`tool_use` イベントではなく `tool_result` のみが返る可能性がある。

```typescript
describe("T-08: AskUserQuestion Deferred Tool フォールバック", () => {
  it("should fallback to text parsing when tool_use event is not emitted", async () => {
    // SDK が tool_use イベントを発行せず、テキストとして質問を返した場合に
    // テキストパースによるフォールバック処理が動作することを検証
    // フォールバックで free_text 種別の UserInputQuestion を生成することを確認
  });

  it("should detect UserInput pattern in SDK text output", async () => {
    // SDK のテキスト出力に "AskUserQuestion:" パターンが含まれる場合に
    // 正しく UserInputQuestion に変換することを検証
  });

  it("should continue session normally after fallback answer injection", async () => {
    // フォールバック経由の回答注入後にセッションが正常に継続することを検証
  });
});
```

### Task 6-3: タイムアウト処理テスト

```typescript
describe("T-09: タイムアウト処理（30秒）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call onError after 30 seconds of waiting for user input", async () => {
    // handleUserInputToolCall() が呼ばれた後、30秒経過で onError が呼ばれることを検証
    // vi.advanceTimersByTime(30_000) を使用
  });

  it("should cancel timeout when sendAnswer() is called before timeout", async () => {
    // sendAnswer() が呼ばれた場合にタイムアウトがキャンセルされることを検証
    // 30秒経過後に onError が呼ばれないことを確認
  });

  it('should include "timeout" in error message', async () => {
    // タイムアウトエラーのメッセージに "timeout" が含まれることを検証
  });
});
```

### Task 6-4: IPCブリッジの多重登録防止テスト

```typescript
describe("T-10: IpcBridge 多重登録防止", () => {
  it("should not register handlers twice when register() is called twice", () => {
    // register() を2回呼び出した場合に、ハンドラーが二重登録されないことを検証
    // 内部で unregister() が呼ばれることを確認
  });

  it("should work correctly after unregister() and register() cycle", () => {
    // unregister() → register() のサイクル後に正常動作することを検証
  });
});
```

### Task 6-5: 拡充テストの実行確認

```bash
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts --reporter=verbose
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts --reporter=verbose
```

期待する結果: 全テスト（T-01 から T-10）が PASS

## 参照資料

| 資料名               | パス                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| Phase 3 設計レビュー | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-3-design-review.md`  |
| Phase 5 実装         | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-5-implementation.md` |
| Vitest fake timers   | `https://vitest.dev/guide/mocking.html#timers`                                       |

## 成果物

| 成果物                | パス                                                                                      | 形式       |
| --------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| SdkSession 拡充テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts`（追記） | TypeScript |
| IpcBridge 拡充テスト  | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`（追記）  | TypeScript |

## 完了条件

- [ ] T-07（セッション中断・再開）: 4 テストケースを追加した
- [ ] T-08（Deferred Tool フォールバック）: 3 テストケースを追加した
- [ ] T-09（タイムアウト処理）: 3 テストケースを追加した
- [ ] T-10（多重登録防止）: 2 テストケースを追加した
- [ ] 全テスト（T-01 から T-10）が PASS した
- [ ] Deferred Tool フォールバック実装を `SkillCreatorSdkSession.ts` に追加した

## 次の Phase

Phase 7: カバレッジ（`phase-7-coverage.md`）
