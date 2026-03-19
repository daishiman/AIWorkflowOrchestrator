# Phase 6 回帰計画

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 6 - テスト拡充                          |
| 作成日   | 2026-03-19                              |

## 概要

Phase 5 実装後のカバレッジ不足箇所を補完するための回帰テスト計画。
TC-06-01〜TC-06-06 の6ケースを定義する。

Phase 4 テストマトリクス（TC-04-xx）が正常系・単体テストを中心としているのに対し、
Phase 6 の回帰テストは **統合フロー・エッジケース・廃止後パス検証** に焦点を当てる。

---

## TC-06-01: Watch ライフサイクル全フロー

**分類**: 統合テスト（Integration）

**目的**: `watch-start` → HTML ファイル構造変更 → `status push` → `watch-stop` の完全なライフサイクルを一気通貫で検証

**依存コンポーネント**:

- `FileWatcher`
- `SyncManager`
- `ipc-handlers.ts` (SLIDE_WATCH_START, SLIDE_WATCH_STOP)
- `slideSlice` (IPC push 受信)

**テスト手順**:

```typescript
it("watch-start → 構造変更 → status push → watch-stop の全フロー", async () => {
  // 1. watch-start IPC 呼び出し
  const startResult = await ipcHandlers.handleWatchStart(mockEvent, {
    slidePath: "/path/to/slide",
  });
  expect(startResult.success).toBe(true);
  expect(mockChokidar.watch).toHaveBeenCalledOnce();

  // 2. HTML ファイル構造変更をエミュレート
  mockChokidar.emit("change", "/path/to/slide.html");
  await vi.runAllTimersAsync();

  // 3. SyncManager.reverseSync が呼ばれたことを確認
  expect(mockSyncManager.reverseSync).toHaveBeenCalledWith(
    "/path/to/slide.html",
  );

  // 4. IPC push で slideSlice が更新されたことを確認
  const state = useSlideStore.getState();
  expect(state.syncStatus).not.toBe("idle");

  // 5. watch-stop IPC 呼び出し
  const stopResult = await ipcHandlers.handleWatchStop(mockEvent, {});
  expect(stopResult.success).toBe(true);
  expect(mockChokidar.close).toHaveBeenCalledOnce();

  // 6. stop 後は onHtmlChange が undefined（P5対策確認）
  expect(mockFileWatcher.onHtmlChange).toBeUndefined();
});
```

**期待結果**: 全ステップが順に成功し、最終的に watcher が停止する

---

## TC-06-02: abort/cancelExecution 中の reverseSync

**分類**: エッジケーステスト

**目的**: スキル実行中止（`abort` / `cancelExecution`）が発生した際に、進行中の `reverseSync` が安全に中断されることを検証

**依存コンポーネント**:

- `SkillExecutor`
- `SyncManager.reverseSync()`

**テスト手順**:

```typescript
it("abort 中に reverseSync が呼ばれた場合は安全に中断する", async () => {
  // reverseSync を長時間実行するよう設定
  let resolveReverseSync!: () => void;
  mockSyncManager.reverseSync.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveReverseSync = resolve;
      }),
  );

  // reverseSync を開始
  const reverseSyncPromise = syncManager.reverseSync("/path/to/slide.html");

  // abort をエミュレート
  skillExecutor.abort();

  // resolveReverseSync を呼ばずに abort の効果を確認
  await vi.runAllTimersAsync();

  const result = await reverseSyncPromise.catch((e) => e);

  // abort によってエラーまたは中断結果が返る
  expect(result.success).toBe(false);
  expect(result.error?.code).toMatch(/ABORTED|CANCELLED/);

  // IPC push でエラー状態が通知される
  expect(mockIpcPush).toHaveBeenCalledWith(
    IPC_CHANNELS.SLIDE_SYNC_ERROR,
    expect.objectContaining({
      code: expect.stringMatching(/ABORTED|CANCELLED/),
    }),
  );
});
```

**期待結果**: `reverseSync` が安全に中断され、エラー状態が IPC push される

---

## TC-06-03: 30秒 timeout 発生時の error push + degraded UI

**分類**: タイムアウトテスト

**目的**: `reverseSync` が 30 秒以内に完了しない場合、timeout エラーが IPC push され、Renderer 側で degraded UI が表示されることを検証

**注意**: タイマーテストは `vi.advanceTimersByTime` を使用（P13対策）

**テスト手順**:

```typescript
it("30秒 timeout で error push と degraded UI が表示される", async () => {
  vi.useFakeTimers();

  // reverseSync が完了しない（無限待機）
  mockSyncManager.reverseSync.mockImplementation(
    () => new Promise(() => {}) // 永遠に resolve しない
  );

  // watch 開始
  await ipcHandlers.handleWatchStart(mockEvent, { slidePath: "/path/to/slide" });
  mockChokidar.emit("change", "/path/to/slide.html");

  // ❌ runAllTimers は P13 のため使用禁止（無限ループの恐れ）
  // await vi.runAllTimers();

  // ✅ advanceTimersByTime で 30 秒を進める（P13対策）
  await vi.advanceTimersByTimeAsync(30_000);

  // SLIDE_SYNC_ERROR が push されたことを確認
  expect(mockIpcPush).toHaveBeenCalledWith(
    IPC_CHANNELS.SLIDE_SYNC_ERROR,
    expect.objectContaining({ code: "TIMEOUT" })
  );

  // slideSlice が error 状態に更新されたことを確認
  const state = useSlideStore.getState();
  expect(state.syncStatus).toBe("error");
  expect(state.syncError?.code).toBe("TIMEOUT");

  // SlideGuidanceBlock に degraded ガイダンスが表示されることを確認
  const { getByText } = render(<SlideWorkspace />);
  expect(getByText(/タイムアウト|接続を確認/)).toBeInTheDocument();

  vi.useRealTimers();
});
```

**期待結果**: 30 秒後に `SLIDE_SYNC_ERROR` が push され、`syncStatus` が `"error"` になる

---

## TC-06-04: progress 0→50→100 の push 系列

**分類**: 状態遷移テスト

**目的**: `reverseSync` 進行中に複数の progress 値が push された場合、Zustand ストアが正しい順序で更新されることを検証

**テスト手順**:

```typescript
it("progress 0→50→100 の push 系列で slideSlice が正しく更新される", async () => {
  // progress 0
  mockIpcRenderer.emit(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, null, {
    progress: 0,
    syncDirection: "reverse",
  });
  await vi.runAllTimersAsync();
  expect(useSlideStore.getState().syncProgress).toBe(0);
  expect(useSlideStore.getState().syncStatus).toBe("syncing");

  // progress 50
  mockIpcRenderer.emit(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, null, {
    progress: 50,
    syncDirection: "reverse",
  });
  await vi.runAllTimersAsync();
  expect(useSlideStore.getState().syncProgress).toBe(50);

  // progress 100
  mockIpcRenderer.emit(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, null, {
    progress: 100,
    syncDirection: "reverse",
  });
  await vi.runAllTimersAsync();
  expect(useSlideStore.getState().syncProgress).toBe(100);
  expect(useSlideStore.getState().syncStatus).toBe("synced");

  // syncDirection が正しく設定されていることを確認
  expect(useSlideStore.getState().syncDirection).toBe("reverse");
});
```

**期待結果**: progress が 0→50→100 の順に更新され、100 到達時に `syncStatus` が `"synced"` になる

---

## TC-06-05: concurrent reverseSync リクエスト制限

**分類**: 並行制御テスト

**目的**: `reverseSync` が既に実行中の場合、後続のリクエストが適切に制限（キューイングまたは拒否）されることを検証

**テスト手順**:

```typescript
it("reverseSync 実行中の concurrent リクエストは制限される", async () => {
  let firstSyncResolve!: () => void;
  let callCount = 0;

  mockSyncManager.reverseSync.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // 最初のリクエストは長時間実行
      return new Promise((resolve) => {
        firstSyncResolve = resolve;
      });
    }
    // 2回目以降の呼び出し（不正）
    return Promise.resolve({ success: true });
  });

  // 1回目の reverseSync 開始（完了待ち）
  const promise1 = syncManager.reverseSync("/path/to/slide.html");

  // 2回目の concurrent リクエスト
  const promise2 = syncManager.reverseSync("/path/to/slide.html");

  // 2回目は即座に制限結果を返す
  const result2 = await promise2;
  expect(result2.success).toBe(false);
  expect(result2.error?.code).toMatch(/CONCURRENT_LIMIT|IN_PROGRESS/);

  // 1回目が完了してからでないと次のリクエストは受け付けない
  firstSyncResolve();
  const result1 = await promise1;
  expect(result1.success).toBe(true);

  // callCount は2（エミュレート上）だが実際の SyncManager は
  // 同時実行を1に制限していることを確認
});
```

**期待結果**: 2回目の concurrent リクエストがエラーまたは制限結果を返す

---

## TC-06-06: agent-client 廃止後パス（Direct SDK 非呼出し検証）

**分類**: 廃止後の回帰テスト

**目的**: `agent-client.ts` 廃止後、Direct SDK が一切呼ばれないことを検証（T-5-3 の廃止確認）

**テスト手順**:

```typescript
it("agent-client 廃止後は Direct SDK が一切呼ばれない", async () => {
  // Direct SDK のモックスパイを設定
  const directSdkSpy = vi.fn();
  vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
    ClaudeAgentSDK: vi.fn(() => ({ execute: directSdkSpy })),
  }));

  // integrated モードでスキル実行
  mockRuntimeResolver.resolve.mockResolvedValue({ mode: "integrated" });
  mockAuthKeyService.getKey.mockResolvedValue("test-token");
  await skillExecutor.execute(mockSkill, mockContext);

  // Direct SDK は呼ばれないことを確認
  expect(directSdkSpy).not.toHaveBeenCalled();

  // electron-store からの直接取得も確認
  expect(mockElectronStore.get).not.toHaveBeenCalledWith("apiKey");
  expect(mockElectronStore.get).not.toHaveBeenCalledWith("anthropicApiKey");

  // env 参照も確認
  // process.env.ANTHROPIC_API_KEY への直接アクセスはモックで検出困難だが、
  // IAuthKeyService を経由していることをモック呼び出し記録で確認
  expect(mockAuthKeyService.getKey).toHaveBeenCalledOnce();
});

it("handoff モードでも Direct SDK が呼ばれない", async () => {
  const directSdkSpy = vi.fn();
  vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
    ClaudeAgentSDK: vi.fn(() => ({ execute: directSdkSpy })),
  }));

  mockRuntimeResolver.resolve.mockResolvedValue({
    mode: "handoff",
    guidance: "Claude.ai で続きの作業を行ってください",
  });

  await skillExecutor.execute(mockSkill, mockContext);

  expect(directSdkSpy).not.toHaveBeenCalled();
  // handoff モードでは IAuthKeyService.getKey すら呼ばれない
  expect(mockAuthKeyService.getKey).not.toHaveBeenCalled();
});
```

**期待結果**: Direct SDK・electron-store 直接アクセスが一切発生しない

---

## タイマーテスト注意事項（P13対策）

```typescript
// ❌ setTimeout + Promise + 再スケジュールパターンで使用禁止
await vi.runAllTimers(); // 無限ループの恐れ

// ✅ 1ステップずつ進める
await vi.advanceTimersByTimeAsync(1_000); // 1秒進める
await vi.advanceTimersByTimeAsync(30_000); // 30秒進める

// ✅ タイマー使用後のクリーンアップ
afterEach(() => {
  vi.useRealTimers();
});
```

---

## テストファイル配置

| テストケース       | テストファイルパス                                             |
| ------------------ | -------------------------------------------------------------- |
| TC-06-01           | `src/main/slide/__tests__/slide-lifecycle.integration.test.ts` |
| TC-06-02, TC-06-05 | `src/main/slide/__tests__/sync-manager-edge.test.ts`           |
| TC-06-03           | `src/main/slide/__tests__/sync-manager-timeout.test.ts`        |
| TC-06-04           | `src/renderer/slide/__tests__/slideSlice-progress.test.ts`     |
| TC-06-06           | `src/main/slide/__tests__/agent-client-removal.test.ts`        |

## Phase 6 完了条件

- [ ] TC-06-01〜TC-06-06 の全テストが PASS
- [ ] `vi.runAllTimers()` を使用していない（`vi.advanceTimersByTimeAsync` のみ）
- [ ] `@anthropic-ai/claude-agent-sdk` への直接呼び出しがゼロ件（`grep -rn "ClaudeAgentSDK" apps/desktop/src/main/slide/` でゼロ確認）
- [ ] TC-06-01〜TC-06-06 の結果が Phase 7 カバレッジ計画のターゲットファイルに反映される
