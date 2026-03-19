# Phase 4 テストマトリクス

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 4 - テスト作成                          |
| 作成日   | 2026-03-19                              |

## 概要

Slide/Modifier/Legacy Agent 経路の runtime 整流タスクにおけるテストケース定義。
TC-04-01〜TC-04-11 の11ケースを定義する。

## IPC レスポンス形式の共通定義

テストアサーション全体で以下の統一形式を前提とする（P60対策）:

```typescript
// 成功レスポンス
{ success: true, data: T }

// エラーレスポンス
{ success: false, error: { code: string, message: string } }
```

## 環境設定の注意事項

### happy-dom 環境での fireEvent 使用（P39対策）

```typescript
// ❌ happy-dom 環境では userEvent が失敗する
const user = userEvent.setup();
await user.click(element);

// ✅ fireEvent を使用する
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合
await act(async () => {
  fireEvent.click(element);
});
```

### import 副作用チェック結果

以下のファイルはモジュールレベルで副作用を持つため、テストでは `vi.mock()` でモックする:

| ファイル          | 副作用                   | モック方法                                                   |
| ----------------- | ------------------------ | ------------------------------------------------------------ |
| `agent-client.ts` | Direct SDK 初期化        | `vi.mock("@anthropic-ai/claude-agent-sdk")`                  |
| `ipc-handlers.ts` | ipcMain.handle 登録      | `vi.mock("electron")` + `beforeEach/afterEach` で unregister |
| `sync-manager.ts` | ファイルシステム監視開始 | `vi.mock("chokidar")`                                        |

---

## テストケース一覧

### TC-04-01: Runtime 統合成功（integrated モード）

**テスト対象**: `skill-executor.ts` の RuntimeResolver 統合パス

**目的**: `RuntimeResolver` が integrated 判定をした場合、IAuthKeyService 経由でトークンを取得し、SDK に渡すことを検証

**前提条件**:

- `IAuthKeyService.getKey()` が有効なトークンを返す
- `RuntimeResolver.resolve()` が `{ mode: "integrated" }` を返す

**テスト手順**:

```typescript
it("RuntimeResolver integrated モードでSDKを呼び出す", async () => {
  mockRuntimeResolver.resolve.mockResolvedValue({ mode: "integrated" });
  mockAuthKeyService.getKey.mockResolvedValue("test-token");

  const result = await skillExecutor.execute(mockSkill, mockContext);

  expect(result.success).toBe(true);
  expect(mockAuthKeyService.getKey).toHaveBeenCalledOnce();
  // Direct SDK / electron-store / env fallback が呼ばれないことを確認
  expect(mockDirectSdk).not.toHaveBeenCalled();
});
```

**期待結果**: `{ success: true, data: { ... } }`

---

### TC-04-02: Handoff モード遷移

**テスト対象**: `skill-executor.ts` の handoff パス

**目的**: `RuntimeResolver` が handoff 判定をした場合、handoffGuidance を含む結果を返すことを検証

**前提条件**:

- `RuntimeResolver.resolve()` が `{ mode: "handoff", guidance: "..." }` を返す

**テスト手順**:

```typescript
it("handoff モードで handoffGuidance を含む結果を返す", async () => {
  mockRuntimeResolver.resolve.mockResolvedValue({
    mode: "handoff",
    guidance: "Claude.ai で続きの作業を行ってください",
  });

  const result = await skillExecutor.execute(mockSkill, mockContext);

  expect(result.success).toBe(true);
  expect(result.data?.isHandoff).toBe(true);
  expect(result.data?.handoffGuidance).toBe(
    "Claude.ai で続きの作業を行ってください",
  );
});
```

**期待結果**: `{ success: true, data: { isHandoff: true, handoffGuidance: "..." } }`

---

### TC-04-03: AUTHENTICATION_ERROR

**テスト対象**: `skill-executor.ts` の認証エラーパス

**目的**: `IAuthKeyService.getKey()` が null を返した場合、AUTHENTICATION_ERROR を返すことを検証

**前提条件**:

- `IAuthKeyService.getKey()` が `null` を返す
- `RuntimeResolver.resolve()` が `{ mode: "integrated" }` を返す

**テスト手順**:

```typescript
it("IAuthKeyService が null を返した場合 AUTHENTICATION_ERROR", async () => {
  mockRuntimeResolver.resolve.mockResolvedValue({ mode: "integrated" });
  mockAuthKeyService.getKey.mockResolvedValue(null);

  const result = await skillExecutor.execute(mockSkill, mockContext);

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("AUTHENTICATION_ERROR");
  expect(result.error?.message).toContain("認証");
});
```

**期待結果**: `{ success: false, error: { code: "AUTHENTICATION_ERROR", message: "..." } }`

---

### TC-04-04: Reverse-sync 実行

**テスト対象**: `sync-manager.ts` の `reverseSync()` メソッド

**目的**: HTML 変更を検知した際に逆方向同期が正常に実行されることを検証

**前提条件**:

- `SyncManager` が初期化済み
- ターゲット HTML ファイルが存在する

**テスト手順**:

```typescript
it("reverseSync が HTML を正しく変換してスライドに反映する", async () => {
  const htmlContent = "<div>テストコンテンツ</div>";
  vi.spyOn(fs, "readFile").mockResolvedValue(htmlContent);

  const result = await syncManager.reverseSync("/path/to/slide.html");

  expect(result.success).toBe(true);
  expect(mockIpcPush).toHaveBeenCalledWith(
    IPC_CHANNELS.SLIDE_SYNC_PROGRESS,
    expect.objectContaining({ progress: 100 }),
  );
});
```

**期待結果**: `{ success: true, data: { ... } }`

---

### TC-04-05: onHtmlChange 自動トリガー

**テスト対象**: `file-watcher.ts` と `sync-manager.ts` の連携

**目的**: ファイル変更イベントが `onHtmlChange` 経由で `SyncManager.reverseSync` を自動呼び出すことを検証

**前提条件**:

- `FileWatcher` が watch 開始済み
- `onHtmlChange` コールバックが `SyncManager.reverseSync` に接続済み（T-5-5）

**テスト手順**:

```typescript
it("HTMLファイル変更が onHtmlChange 経由で reverseSync をトリガーする", async () => {
  const reverseSyncSpy = vi.spyOn(syncManager, "reverseSync");
  await fileWatcher.start("/path/to/watch");

  // chokidar の change イベントをエミュレート
  mockChokidar.emit("change", "/path/to/slide.html");
  await vi.runAllTimersAsync();

  expect(reverseSyncSpy).toHaveBeenCalledWith("/path/to/slide.html");
});
```

**期待結果**: `reverseSync` が1回呼び出される

---

### TC-04-06: Watch ライフサイクル

**テスト対象**: `file-watcher.ts` の start/stop ライフサイクル

**目的**: watch 開始・停止の正常フローを検証（P5対策: register/unregister ペア）

**前提条件**:

- `FileWatcher` インスタンスが初期化済み

**テスト手順**:

```typescript
it("watch start/stop ライフサイクルが正常に動作する", async () => {
  await fileWatcher.start("/path/to/watch");
  expect(mockChokidar.watch).toHaveBeenCalledOnce();

  await fileWatcher.stop();
  expect(mockChokidar.close).toHaveBeenCalledOnce();

  // 2回目の start で重複登録しないことを確認（P5対策）
  await fileWatcher.start("/path/to/watch");
  expect(mockChokidar.watch).toHaveBeenCalledTimes(2);
  expect(mockChokidar.close).toHaveBeenCalledTimes(1);
});
```

**期待結果**: watch/close が各1回ずつ呼ばれる

---

### TC-04-07: validateIpcSender 未認可

**テスト対象**: `ipc-handlers.ts` の `validateIpcSender` セキュリティチェック

**目的**: 認可されていない送信元からの IPC 呼び出しが拒否されることを検証

**前提条件**:

- `validateIpcSender` が未認可の BrowserWindow を返すようモック設定

**テスト手順**:

```typescript
it("validateIpcSender が未認可の場合はエラーを返す", async () => {
  mockValidateIpcSender.mockReturnValue(false);

  const result = await ipcHandlers.handleWatchStart(mockEvent, {
    slidePath: "/path/to/slide",
  });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("UNAUTHORIZED");
  // コールバック関数が実際に呼ばれたことも確認（P41対策）
  expect(
    mockValidateIpcSender.mock.calls[0][2].getAllowedWindows(),
  ).toBeDefined();
});
```

**期待結果**: `{ success: false, error: { code: "UNAUTHORIZED", message: "..." } }`

---

### TC-04-08: P42 3段バリデーション

**テスト対象**: `ipc-handlers.ts` の全ハンドラの入力バリデーション

**目的**: 型チェック → 空文字列 → トリム空文字列 の3段バリデーションが機能することを検証

**テスト手順**:

```typescript
describe("P42 3段バリデーション", () => {
  it.each([
    { case: "undefined", input: undefined },
    { case: "null", input: null },
    { case: "数値", input: 123 },
    { case: "空文字列", input: "" },
    { case: "スペースのみ", input: "   " }, // P42 の核心ケース
    { case: "タブのみ", input: "\t" },
  ])("slidePath が '$case' の場合 VALIDATION_ERROR", async ({ input }) => {
    const result = await ipcHandlers.handleWatchStart(mockEvent, {
      slidePath: input as string,
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });
});
```

**期待結果**: 全ケースで `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

---

### TC-04-09: degraded guidance 表示

**テスト対象**: `SlideGuidanceBlock` コンポーネント

**目的**: handoff/degraded 状態で `handoffGuidance` テキストが表示されることを検証

**前提条件**:

- Zustand `slideSlice` が `{ isHandoff: true, handoffGuidance: "..." }` の状態

**テスト手順**:

```typescript
it("isHandoff=true のとき SlideGuidanceBlock が guidance を表示する", () => {
  // happy-dom 環境: fireEvent 使用（P39対策）
  const { getByText } = render(
    <SlideGuidanceBlock
      isHandoff={true}
      handoffGuidance="Claude.ai で続きの作業を行ってください"
    />
  );

  expect(getByText("Claude.ai で続きの作業を行ってください")).toBeInTheDocument();
});
```

**期待結果**: guidance テキストが DOM に存在する

---

### TC-04-10: 4状態遷移

**テスト対象**: `SlideWatchStatus` コンポーネントおよび `SlideSyncCard`

**目的**: idle → syncing → synced → error の4状態が正しく表示されることを検証

**前提条件**:

- Zustand `slideSlice` の `syncStatus` を各値に設定

**テスト手順**:

```typescript
describe("SlideWatchStatus 4状態遷移", () => {
  it.each([
    { status: "idle", expectedLabel: "待機中" },
    { status: "syncing", expectedLabel: "同期中" },
    { status: "synced", expectedLabel: "同期済み" },
    { status: "error", expectedLabel: "エラー" },
  ])("syncStatus='$status' のとき '$expectedLabel' を表示する", ({ status, expectedLabel }) => {
    // SyncStatus 型: "out-of-sync" ではなく "idle" を使用（統一後）
    const { getByText } = render(<SlideWatchStatus syncStatus={status as SyncStatus} />);
    expect(getByText(expectedLabel)).toBeInTheDocument();
  });
});
```

**期待結果**: 各状態で対応するラベルが表示される

---

### TC-04-11: slideSlice IPC push 受信

**テスト対象**: `store.ts` の `slideSlice` IPC リスナー

**目的**: Main Process から IPC push を受信した際に Zustand ストアが正しく更新されることを検証

**前提条件**:

- `slideSlice` が初期化済み
- IPC リスナーが登録済み

**テスト手順**:

```typescript
it("SLIDE_SYNC_PROGRESS の IPC push で syncProgress が更新される", async () => {
  const store = useSlideStore.getState();

  // IPC push イベントをエミュレート
  mockIpcRenderer.emit(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, null, {
    progress: 75,
    syncDirection: "forward",
  });

  await vi.runAllTimersAsync();

  const updatedState = useSlideStore.getState();
  expect(updatedState.syncProgress).toBe(75);
  expect(updatedState.syncDirection).toBe("forward");
});

it("SLIDE_SYNC_ERROR の IPC push で syncError が更新される", async () => {
  mockIpcRenderer.emit(IPC_CHANNELS.SLIDE_SYNC_ERROR, null, {
    code: "TIMEOUT",
    message: "同期がタイムアウトしました",
  });

  await vi.runAllTimersAsync();

  const updatedState = useSlideStore.getState();
  expect(updatedState.syncError).toEqual({
    code: "TIMEOUT",
    message: "同期がタイムアウトしました",
  });
  expect(updatedState.syncStatus).toBe("error");
});
```

**期待結果**: Zustand ストアが IPC push の内容で更新される

---

## テストファイル配置

| テストケース | 対象ファイル                          | テストファイルパス                                     |
| ------------ | ------------------------------------- | ------------------------------------------------------ |
| TC-04-01〜03 | `skill-executor.ts`                   | `src/main/slide/__tests__/skill-executor.test.ts`      |
| TC-04-04〜06 | `sync-manager.ts`, `file-watcher.ts`  | `src/main/slide/__tests__/sync-manager.test.ts`        |
| TC-04-07〜08 | `ipc-handlers.ts`                     | `src/main/slide/__tests__/ipc-handlers.test.ts`        |
| TC-04-09〜10 | `SlideWorkspace.tsx` コンポーネント群 | `src/renderer/slide/__tests__/SlideWorkspace.test.tsx` |
| TC-04-11     | `store.ts` (slideSlice)               | `src/renderer/slide/__tests__/slideSlice.test.ts`      |

## インポートパス参照ガイド（P63対策）

テスト作成時は必ず既存テストのインポートパスを参照してから記述すること:

```bash
# 既存テストのインポートパスを確認
grep -n "^import" apps/desktop/src/main/slide/__tests__/existing.test.ts
```
