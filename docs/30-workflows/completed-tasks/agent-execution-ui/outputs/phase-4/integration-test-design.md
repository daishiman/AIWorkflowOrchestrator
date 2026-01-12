# 統合テスト設計

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 4                  |
| 作成日   | 2026-01-12         |

---

## 統合テストシナリオ

### 1. IPC接続テスト

**ファイル**: `apps/desktop/src/renderer/__tests__/agent.ipc.test.ts`

| No  | シナリオ                           | 検証内容                            | 前提条件         | 期待結果                   |
| --- | ---------------------------------- | ----------------------------------- | ---------------- | -------------------------- |
| 1   | agent:startチャンネル疎通          | Renderer→Mainへのスタート要求が届く | IPC接続確立済み  | MainプロセスがIPCを受信    |
| 2   | agent:stopチャンネル疎通           | Renderer→Mainへのストップ要求が届く | 実行中状態       | 実行が中断される           |
| 3   | agent:streamチャンネル疎通         | Main→Rendererへのストリーム配信     | 実行中状態       | Rendererがストリームを受信 |
| 4   | agent:statusチャンネル疎通         | Main→Rendererへのステータス通知     | 接続確立済み     | ステータス変更がUIに反映   |
| 5   | agent:permissionチャンネル疎通     | Main→Rendererへの権限確認要求       | ツール実行時     | PermissionDialogが表示     |
| 6   | agent:permission:resチャンネル疎通 | Renderer→Mainへの権限確認応答       | Permission表示中 | 応答がMainプロセスに届く   |
| 7   | IPC接続エラー時のリカバリ          | 接続断時の再接続                    | 接続断発生       | 再接続が試行される         |
| 8   | 無効なチャンネルへのメッセージ     | 存在しないチャンネルへの送信        | 接続確立済み     | エラーが適切にハンドリング |

```typescript
// apps/desktop/src/renderer/__tests__/agent.ipc.test.ts
describe("Agent IPC Integration", () => {
  describe("agent:start channel", () => {
    it("should send start request to main process", async () => {
      // Arrange
      const skillId = "skill-1";
      const prompt = "Hello, agent!";

      // Act
      await window.agentAPI.start({ skillId, prompt });

      // Assert
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "agent:start",
        expect.objectContaining({ skillId, prompt }),
      );
    });
  });

  // ... 他のテスト
});
```

---

### 2. ストリーミングテスト

**ファイル**: `apps/desktop/src/renderer/__tests__/agent.streaming.test.ts`

| No  | シナリオ               | 検証内容                          | 前提条件       | 期待結果                       |
| --- | ---------------------- | --------------------------------- | -------------- | ------------------------------ |
| 1   | ストリームデータ受信   | Main→Rendererへのリアルタイム配信 | 実行中状態     | データがUIに表示               |
| 2   | 高速ストリーム処理     | 大量データの連続受信              | 実行中状態     | UIがフリーズしない             |
| 3   | ストリーム中断         | ユーザーキャンセル時              | ストリーミング | ストリームが適切に停止         |
| 4   | ストリーム完了         | 最後のチャンク受信                | ストリーミング | メッセージとして確定           |
| 5   | バッチ更新             | requestAnimationFrame処理         | 高速ストリーム | バッチ処理でUI更新             |
| 6   | ストリームエラー       | ストリーム中のエラー              | ストリーミング | エラー表示、リトライオプション |
| 7   | 空ストリーム           | 空データの受信                    | 実行中状態     | 無視される（クラッシュしない） |
| 8   | ストリームタイムアウト | 30秒以上応答なし                  | 実行中状態     | タイムアウトエラー表示         |

```typescript
// apps/desktop/src/renderer/__tests__/agent.streaming.test.ts
describe("Agent Streaming Integration", () => {
  describe("stream data reception", () => {
    it("should display streamed content in real-time", async () => {
      // Arrange
      const streamCallback = vi.fn();
      window.agentAPI.onStream(streamCallback);

      // Act - シミュレートされたストリームデータ
      mockIpcRenderer.emit("agent:stream", {
        executionId: "exec-123",
        chunk: "Hello ",
        isComplete: false,
      });

      // Assert
      expect(streamCallback).toHaveBeenCalledWith(
        expect.objectContaining({ chunk: "Hello " }),
      );
    });
  });

  // ... 他のテスト
});
```

---

### 3. Permission連携テスト

**ファイル**: `apps/desktop/src/renderer/__tests__/agent.permission.test.ts`

| No  | シナリオ                     | 検証内容                 | 前提条件                   | 期待結果                     |
| --- | ---------------------------- | ------------------------ | -------------------------- | ---------------------------- |
| 1   | Permission Request受信       | ダイアログ表示フロー     | ツール実行時               | PermissionDialog表示         |
| 2   | Permission Approve           | 許可応答フロー           | ダイアログ表示中           | 実行継続                     |
| 3   | Permission Deny              | 拒否応答フロー           | ダイアログ表示中           | 実行中断                     |
| 4   | Remember Choice (許可)       | 選択記憶フロー（許可）   | チェックボックスオン       | 次回自動許可                 |
| 5   | Remember Choice (拒否)       | 選択記憶フロー（拒否）   | チェックボックスオン       | 次回自動拒否                 |
| 6   | 記憶済み選択の自動適用       | 記憶された選択の自動適用 | 同ツール再実行時           | ダイアログスキップ           |
| 7   | 複数Permission連続処理       | 連続権限確認             | 複数ツール実行時           | 順番に処理                   |
| 8   | Permission タイムアウト      | 応答なし時のタイムアウト | ダイアログ表示中（無応答） | タイムアウト後デフォルト拒否 |
| 9   | セッション終了時の記憶クリア | セッション終了時         | 記憶済み選択あり           | 記憶がクリア                 |

```typescript
// apps/desktop/src/renderer/__tests__/agent.permission.test.ts
describe("Agent Permission Integration", () => {
  describe("permission request flow", () => {
    it("should show permission dialog when request received", async () => {
      // Arrange
      render(<AgentExecutionView />);

      // Act - Permission Request をシミュレート
      mockIpcRenderer.emit("agent:permission", {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "npm test" },
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
    });
  });

  // ... 他のテスト
});
```

---

### 4. 状態同期テスト

**ファイル**: `apps/desktop/src/renderer/__tests__/agent.sync.test.ts`

| No  | シナリオ               | 検証内容                   | 前提条件         | 期待結果                         |
| --- | ---------------------- | -------------------------- | ---------------- | -------------------------------- |
| 1   | 実行開始時の状態同期   | idle → executing 遷移      | idle状態         | UIが実行中表示に変更             |
| 2   | ストリーミング状態同期 | executing → streaming 遷移 | executing状態    | ストリーミングインジケーター表示 |
| 3   | 権限確認状態同期       | → awaiting_permission 遷移 | 任意の実行状態   | 入力無効化、ダイアログ表示       |
| 4   | 完了状態同期           | → completed 遷移           | streaming状態    | 完了表示、入力有効化             |
| 5   | キャンセル状態同期     | → cancelled 遷移           | 実行中任意の状態 | キャンセル表示                   |
| 6   | エラー状態同期         | → error 遷移               | 任意の状態       | エラー表示                       |
| 7   | メッセージ追加同期     | メッセージリスト更新       | 任意の状態       | 新メッセージがリストに追加       |
| 8   | 複数コンポーネント同期 | 状態変更の全体反映         | 状態変更発生     | 全関連コンポーネントが更新       |

```typescript
// apps/desktop/src/renderer/__tests__/agent.sync.test.ts
describe("Agent State Sync Integration", () => {
  describe("status transitions", () => {
    it("should sync UI when status changes from idle to executing", async () => {
      // Arrange
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // 初期状態確認
      expect(input).not.toBeDisabled();

      // Act - 実行開始
      mockStore.executionState.status = "executing";
      // 状態更新をトリガー

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("executing-indicator")).toBeInTheDocument();
      });
    });
  });

  // ... 他のテスト
});
```

---

### 5. エラーハンドリングテスト

**ファイル**: `apps/desktop/src/renderer/__tests__/agent.error.test.ts`

| No  | シナリオ             | 検証内容             | 前提条件       | 期待結果                       |
| --- | -------------------- | -------------------- | -------------- | ------------------------------ |
| 1   | IPC通信エラー        | IPC障害時のUI表示    | IPC障害発生    | エラーメッセージ表示           |
| 2   | SDK接続エラー        | Agent SDK接続失敗時  | SDK接続失敗    | 接続エラー表示、リトライボタン |
| 3   | バリデーションエラー | 入力値不正時         | 不正入力       | 入力欄下にエラーメッセージ     |
| 4   | タイムアウトエラー   | 30秒タイムアウト発生 | 応答待ち30秒超 | タイムアウトメッセージ         |
| 5   | リトライ処理         | リトライボタン押下   | エラー表示中   | 再試行が実行                   |
| 6   | 複数エラー連続発生   | 連続エラー時         | エラー発生中   | 最新エラーのみ表示             |
| 7   | エラー回復           | エラーからの回復     | エラー状態     | 正常状態に復帰                 |
| 8   | ネットワーク切断     | ネットワーク断時     | 実行中         | オフラインエラー表示           |
| 9   | Error Boundary 発動  | 予期しないエラー     | 任意の状態     | フォールバックUI表示           |

```typescript
// apps/desktop/src/renderer/__tests__/agent.error.test.ts
describe("Agent Error Handling Integration", () => {
  describe("IPC communication error", () => {
    it("should display error message when IPC fails", async () => {
      // Arrange
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC Error"));
      render(<AgentExecutionView />);

      // Act
      await userEvent.type(screen.getByRole("textbox"), "Test message");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });
  });

  // ... 他のテスト
});
```

---

## モック戦略

### IPCモック

```typescript
// テストセットアップ
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
}));

// agentAPIモック
vi.stubGlobal("agentAPI", {
  start: vi.fn(),
  stop: vi.fn(),
  respondPermission: vi.fn(),
  onStream: vi.fn((callback) => {
    // コールバック登録
  }),
  onStatus: vi.fn((callback) => {
    // コールバック登録
  }),
  onPermission: vi.fn((callback) => {
    // コールバック登録
  }),
});
```

### Zustand Storeモック

```typescript
const createMockStore = (overrides = {}) => ({
  executionState: {
    status: "idle",
    currentSkill: null,
    messages: [],
    currentStreamingContent: "",
    pendingPermission: null,
    error: null,
    startedAt: null,
    completedAt: null,
    rememberedChoices: {},
  },
  startExecution: vi.fn(),
  stopExecution: vi.fn(),
  addUserMessage: vi.fn(),
  addAssistantMessage: vi.fn(),
  appendStreamingContent: vi.fn(),
  finalizeStreamingMessage: vi.fn(),
  setExecutionError: vi.fn(),
  clearMessages: vi.fn(),
  resetExecutionState: vi.fn(),
  setPermissionRequest: vi.fn(),
  respondToPermission: vi.fn(),
  rememberPermissionChoice: vi.fn(),
  getRememberedChoice: vi.fn(),
  clearRememberedChoices: vi.fn(),
  ...overrides,
});
```

---

## テスト環境構成

### 必要なセットアップ

```typescript
// vitest.setup.ts に追加
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Electron IPCのモック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
}));

// requestAnimationFrameのモック
vi.stubGlobal("requestAnimationFrame", (cb: () => void) => setTimeout(cb, 0));
vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
```

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
