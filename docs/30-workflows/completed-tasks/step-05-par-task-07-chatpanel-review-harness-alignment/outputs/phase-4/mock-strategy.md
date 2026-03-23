# Phase 4: モック戦略

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 4 — テスト作成                                  |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. モック設計方針

### 基本原則

- P31 対策: Store 全体を一括モックせず、個別セレクタ（`useSetActiveView()` 等）ごとにモック関数を注入する
- P39 対策: happy-dom 環境のため `userEvent` は使用禁止。`fireEvent` のみ使用する
- P40 対策: テスト実行は `cd apps/desktop && pnpm vitest run` で行う

---

## 2. Store モック（useAppStore）

### モック宣言

```typescript
// ファイル先頭でモジュールモックを宣言
vi.mock("../../store", () => ({
  useSetActiveView: vi.fn(),
  useSetSelectedProvider: vi.fn(),
  useSetSelectedModel: vi.fn(),
  useSelectedProvider: vi.fn(),
  useSelectedModel: vi.fn(),
}));
```

### beforeEach でのリセット・返却値設定

```typescript
import {
  useSetActiveView,
  useSetSelectedProvider,
  useSetSelectedModel,
  useSelectedProvider,
  useSelectedModel,
} from "../../store";

const mockSetActiveView = vi.fn();
const mockSetSelectedProvider = vi.fn();
const mockSetSelectedModel = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // 個別セレクタはアクション関数を返す
  (useSetActiveView as ReturnType<typeof vi.fn>).mockReturnValue(
    mockSetActiveView,
  );
  (useSetSelectedProvider as ReturnType<typeof vi.fn>).mockReturnValue(
    mockSetSelectedProvider,
  );
  (useSetSelectedModel as ReturnType<typeof vi.fn>).mockReturnValue(
    mockSetSelectedModel,
  );

  // 状態セレクタは初期値を返す
  (useSelectedProvider as ReturnType<typeof vi.fn>).mockReturnValue(null);
  (useSelectedModel as ReturnType<typeof vi.fn>).mockReturnValue(null);
});
```

### 注意事項

- `useAppStore()` の合成 Hook（全体取得）は使用しない（P31 再発防止）
- 各セレクタは個別に `mockReturnValue` で値を設定する
- P48 対応: `.filter()` / `.map()` を返すセレクタには `useShallow` が必要だが、モック側では `vi.fn().mockReturnValue([])` で代替できる

---

## 3. useStreamingChat モック

### モック宣言

```typescript
vi.mock("../../hooks/useStreamingChat", () => ({
  useStreamingChat: vi.fn(),
}));
```

### state・actions のモック設定

```typescript
import { useStreamingChat } from "../../hooks/useStreamingChat";

const mockStreamingChatState = {
  status: "idle" as const,
  messages: [],
  error: null,
};

const mockStreamingChatActions = {
  sendMessage: vi.fn(),
  cancelStreaming: vi.fn(),
  clearMessages: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  (useStreamingChat as ReturnType<typeof vi.fn>).mockReturnValue({
    ...mockStreamingChatState,
    ...mockStreamingChatActions,
  });
});
```

### 状態機械テスト用のヘルパー

```typescript
// 任意の state を注入するヘルパー関数
function setStreamingState(
  status: "idle" | "ready" | "streaming" | "completed" | "cancelled" | "error" | "blocked" | "handoff"
) {
  (useStreamingChat as ReturnType<typeof vi.fn>).mockReturnValue({
    status,
    messages: [],
    error: null,
    sendMessage: vi.fn(),
    cancelStreaming: vi.fn(),
    clearMessages: vi.fn(),
  });
}

// 使用例
test("blocked 状態では設定画面への遷移ボタンが表示される", () => {
  setStreamingState("blocked");
  render(<ChatPanel />);
  expect(screen.getByRole("button", { name: /設定/ })).toBeInTheDocument();
});
```

---

## 4. window.electronAPI モック（IPC モック）

### グローバルモック設定

```typescript
const mockElectronAPI = {
  openTerminal: vi.fn().mockResolvedValue({ success: true }),
  // 他の IPC メソッドが必要な場合はここに追加
};

beforeEach(() => {
  vi.clearAllMocks();

  // window.electronAPI をグローバルにモック
  Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  // テスト後にクリーンアップ（他テストへの leakage 防止）
  // @ts-expect-error テスト用クリーンアップ
  delete window.electronAPI;
});
```

### IPC 呼び出しアサーション例

```typescript
test("GAP-04: handleOpenTerminal が openTerminal IPC を呼ぶ", async () => {
  render(<ChatPanel />);
  const openTerminalButton = screen.getByRole("button", { name: /ターミナル/ });

  await act(async () => {
    fireEvent.click(openTerminalButton);
  });

  expect(mockElectronAPI.openTerminal).toHaveBeenCalledTimes(1);
});
```

---

## 5. モック間の依存関係と実行順序

```
beforeEach 実行順序:
  1. vi.clearAllMocks()           ← 全モックをリセット
  2. Store 個別セレクタの設定     ← useSetActiveView 等
  3. useStreamingChat の設定      ← status = "idle"
  4. window.electronAPI の設定    ← openTerminal モック
```

- **モック間の依存**: なし（それぞれ独立して設定できる）
- **状態リーク防止**: `afterEach` で `window.electronAPI` を削除する（P9 対策）

---

## 6. P40 対策: テスト実行コマンド

```bash
# 正しい実行方法（パッケージディレクトリから）
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# 特定ファイルのみ実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.test.tsx

# watch モード（開発中）
cd apps/desktop && pnpm vitest src/renderer/components/chat/
```

```bash
# 誤った実行方法（vitest.config.ts が読み込まれない）
# pnpm vitest run apps/desktop/src/renderer/components/chat/  ← 禁止
```
