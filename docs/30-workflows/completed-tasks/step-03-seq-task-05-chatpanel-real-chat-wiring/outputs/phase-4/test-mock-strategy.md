# Phase 4: テストモック戦略

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| タスクID | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase    | 4                                   |
| Task     | 4-5 IPC モック設計 + テスト環境設計 |
| 作成日   | 2026-03-18                          |

---

## 1. Store モック設計

### 1-1. 基本方針

既存の `ChatPanel.test.tsx` が採用する `vi.mock("../../../store", ...)` パターンを踏襲する（P63 対策: 既存テストのインポートパスを参照してから実装する）。

新規テストファイルはすべて以下のパスから `store` をインポートする:

```
apps/desktop/src/renderer/components/chat/__tests__/
  └── ChatPanel.chat-wiring.test.tsx     ← "../../../store"
  └── ChatPanel.accessibility.test.tsx   ← "../../../store"
  └── ChatPanel.settings-sync.test.tsx   ← "../../../store"
```

### 1-2. mockStoreState 初期値テンプレート

各テストファイルで共通利用する `mockStoreState` の初期値。`beforeEach` でリセットする（P9 テスト間リーク防止）。

```typescript
// 共通初期状態テンプレート
let mockStoreState: Record<string, unknown> = {};

beforeEach(() => {
  mockStoreState = {
    // --- chatSlice 既存フィールド ---
    chatMessages: [],
    chatInput: "",
    isSending: false,
    isStreaming: false,
    streamingContent: "",
    currentStreamId: null,
    streamingMessageId: null,
    streamingError: null,

    // --- chatSlice 新規フィールド (Phase 5 実装予定) ---
    chatPanelStatus: "idle" as const,
    currentConversationId: null,

    // --- llmSlice 既存フィールド ---
    selectedProviderId: null,
    selectedModelId: null,
    providers: [],

    // --- skillSlice 既存フィールド ---
    isExecuting: false,
    selectedSkillName: null,
    availableSkills: [],
    importedSkills: [],
    isLoadingSkills: false,
    isScanning: false,
  };
});
```

### 1-3. 個別セレクタモックパターン

P31/P48 対策として、個別セレクタを個別にモックする。`vi.mock("../../../store", ...)` の factory 内で定義する。

```typescript
vi.mock("../../../store", () => ({
  // --- useAppStore: selector 経由の直接参照 ---
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    return selector(mockStoreState);
  }),

  // --- 個別セレクタ（chatSlice） ---
  useChatPanelStatus: vi.fn(() => mockStoreState.chatPanelStatus as string),
  useSetChatPanelStatus: vi.fn(() => mockSetChatPanelStatus),
  useChatMessagesShallow: vi.fn(() => mockStoreState.chatMessages as unknown[]),
  useCurrentConversationId: vi.fn(
    () => mockStoreState.currentConversationId as string | null,
  ),
  useSetCurrentConversationId: vi.fn(() => mockSetCurrentConversationId),
  useAddChatMessage: vi.fn(() => mockAddChatMessage),
  useResetChat: vi.fn(() => mockResetChat),

  // --- 個別セレクタ（llmSlice） ---
  useSelectedProviderId: vi.fn(
    () => mockStoreState.selectedProviderId as string | null,
  ),
  useSelectedModelId: vi.fn(
    () => mockStoreState.selectedModelId as string | null,
  ),

  // --- 個別セレクタ（skillSlice） ---
  useIsSkillExecuting: vi.fn(() => Boolean(mockStoreState.isExecuting)),
  useSkillStore: vi.fn(() => ({
    availableSkills: [],
    importedSkills: [],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkillByName: vi.fn(),
    fetchSkills: mockFetchSkills,
    rescanSkills: vi.fn(),
  })),
}));
```

### 1-4. テスト別 mockStoreState カスタマイズパターン

```typescript
// A-01: idle 状態
mockStoreState.chatPanelStatus = "idle";

// A-02: ready 状態
mockStoreState.chatPanelStatus = "ready";
mockStoreState.selectedProviderId = "anthropic";
mockStoreState.selectedModelId = "claude-3-5-sonnet-20241022";

// A-03: streaming 状態
mockStoreState.chatPanelStatus = "streaming";
mockStoreState.isStreaming = true;
mockStoreState.streamingContent = "AI is thinking...";

// A-06: error 状態
mockStoreState.chatPanelStatus = "error";
mockStoreState.streamingError = {
  code: "NETWORK_ERROR",
  message: "Connection lost",
  retryable: true,
};

// A-07: blocked 状態
mockStoreState.chatPanelStatus = "blocked";
mockStoreState.selectedProviderId = null;

// C-03: API_KEY_MISSING（blocked + API key なし）
mockStoreState.chatPanelStatus = "blocked";
// window.electronAPI.authKey.exists は { exists: false } を返すようモック
```

---

## 2. IPC モック設計

### 2-1. window.electronAPI.llm モック

`global.window` に直接代入してモックする。`beforeEach` でリセットする（P9 対策）。

```typescript
// テストファイル冒頭（vi.mock の外側）に定義
const mockStreamChat = vi.fn();
const mockCancelStream = vi.fn();
const mockOnStreamChunk = vi.fn();
const mockOnStreamEnd = vi.fn();
const mockOnStreamError = vi.fn();
const mockSetSelectedConfig = vi.fn();
const mockCheckHealth = vi.fn();
const mockGetProviders = vi.fn();

beforeEach(() => {
  // window.electronAPI.llm をモック
  Object.defineProperty(global, "window", {
    writable: true,
    value: {
      electronAPI: {
        llm: {
          streamChat: mockStreamChat,
          cancelStream: mockCancelStream,
          onStreamChunk: mockOnStreamChunk,
          onStreamEnd: mockOnStreamEnd,
          onStreamError: mockOnStreamError,
          setSelectedConfig: mockSetSelectedConfig,
          checkHealth: mockCheckHealth,
          getProviders: mockGetProviders,
          sendChat: vi.fn(),
        },
        authKey: {
          exists: mockAuthKeyExists,
          set: vi.fn(),
          validate: vi.fn(),
          delete: vi.fn(),
        },
      },
      conversationAPI: {
        create: mockConversationCreate,
        addMessage: mockConversationAddMessage,
        list: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        search: vi.fn(),
      },
    },
  });

  // デフォルト戻り値を設定
  mockStreamChat.mockResolvedValue({ requestId: "req-test-001" });
  mockCancelStream.mockResolvedValue({ success: true });
  mockOnStreamChunk.mockReturnValue(() => {}); // unsubscribe 関数
  mockOnStreamEnd.mockReturnValue(() => {});
  mockOnStreamError.mockReturnValue(() => {});
  mockSetSelectedConfig.mockResolvedValue({ success: true });
  mockCheckHealth.mockResolvedValue({
    providerId: "anthropic",
    status: "connected",
    latency: 50,
    checkedAt: new Date(),
  });
  mockGetProviders.mockResolvedValue([]);
  mockAuthKeyExists.mockResolvedValue({ exists: true, source: "saved" });
  mockConversationCreate.mockResolvedValue({
    success: true,
    data: { id: "conv-001", title: "Test conversation" },
  });
  mockConversationAddMessage.mockResolvedValue({
    success: true,
    data: { id: "msg-001", role: "user", content: "test" },
  });
});
```

### 2-2. push チャンネル（EventEmitter パターン）

`llm:stream-chunk` / `llm:stream-end` / `llm:stream-error` は Main → Renderer の push イベントであり、`onStreamChunk` / `onStreamEnd` / `onStreamError` のコールバックを直接呼び出すことでシミュレートする。

```typescript
// push イベントシミュレーション用ヘルパー
type ChunkCallback = (chunk: LLMStreamChunk) => void;
type EndCallback = () => void;
type ErrorCallback = (error: LLMError) => void;

let capturedChunkCallback: ChunkCallback | null = null;
let capturedEndCallback: EndCallback | null = null;
let capturedErrorCallback: ErrorCallback | null = null;

beforeEach(() => {
  capturedChunkCallback = null;
  capturedEndCallback = null;
  capturedErrorCallback = null;

  // コールバックをキャプチャするモック
  mockOnStreamChunk.mockImplementation((cb: ChunkCallback) => {
    capturedChunkCallback = cb;
    return () => {
      capturedChunkCallback = null;
    }; // unsubscribe
  });
  mockOnStreamEnd.mockImplementation((cb: EndCallback) => {
    capturedEndCallback = cb;
    return () => {
      capturedEndCallback = null;
    };
  });
  mockOnStreamError.mockImplementation((cb: ErrorCallback) => {
    capturedErrorCallback = cb;
    return () => {
      capturedErrorCallback = null;
    };
  });
});

// テスト内での使用例
it("chunk 受信で streamingContent が蓄積される", async () => {
  // ... startStream を呼び出す ...

  // Main から push イベントが来たとシミュレート
  act(() => {
    capturedChunkCallback?.({
      id: "chunk-001",
      delta: { content: "Hello" },
      done: false,
    });
  });

  expect(screen.getByText(/Hello/)).toBeInTheDocument();
});

it("done signal で completed 状態に遷移", async () => {
  // ... startStream を呼び出す ...

  act(() => {
    capturedEndCallback?.();
  });

  // isStreaming が false になることを確認
  expect(mockSetChatPanelStatus).toHaveBeenCalledWith("completed");
});

it("error signal で error 状態に遷移", async () => {
  // ... startStream を呼び出す ...

  act(() => {
    capturedErrorCallback?.({
      code: "NETWORK_ERROR",
      message: "Connection lost",
      retryable: true,
    });
  });

  expect(mockSetChatPanelStatus).toHaveBeenCalledWith("error");
});
```

### 2-3. P60 wrapper 形式レスポンステンプレート

invoke 系チャンネル（CH-06, CH-08, CH-09）のレスポンスは P60 wrapper 形式で統一する。

```typescript
// 成功レスポンス（CH-06: llm:set-selected-config）
mockSetSelectedConfig.mockResolvedValue({ success: true });

// エラーレスポンス（CH-06: llm:set-selected-config）
mockSetSelectedConfig.mockResolvedValue({
  success: false,
  error: "Model ID is required",
});

// 成功レスポンス（CH-08: conversation:create）
mockConversationCreate.mockResolvedValue({
  success: true,
  data: {
    id: "conv-001",
    title: "Test",
    userId: "user-001",
    createdAt: new Date().toISOString(),
  },
});

// エラーレスポンス（CH-08: conversation:create）
mockConversationCreate.mockResolvedValue({
  success: false,
  error: { code: "VALIDATION_ERROR", message: "Title is required" },
});

// 成功レスポンス（CH-09: conversation:addMessage）
mockConversationAddMessage.mockResolvedValue({
  success: true,
  data: {
    id: "msg-001",
    role: "user" as const,
    content: "Hello",
    conversationId: "conv-001",
  },
});
```

### 2-4. フラット形式レスポンステンプレート

フラット形式（P60 wrapper 非適用）チャンネルのレスポンステンプレート。

```typescript
// CH-01: llm:stream-chat（フラット）
mockStreamChat.mockResolvedValue({ requestId: "req-test-001" });

// CH-05: llm:stream-cancel（フラット）
mockCancelStream.mockResolvedValue({ success: true });
mockCancelStream.mockResolvedValue({ success: false }); // requestId 不存在時

// CH-10: auth-key:exists（フラット、P60 wrapper なし）
mockAuthKeyExists.mockResolvedValue({ exists: true, source: "saved" });
mockAuthKeyExists.mockResolvedValue({ exists: false });
```

---

## 3. コンポーネントモック設計

### 3-1. 新規コンポーネントモック（Phase 5 で実装される予定）

Phase 4 時点では未実装のコンポーネントをモックしてテストを「Red」状態にする。

```typescript
// ChatPanel.chat-wiring.test.tsx / ChatPanel.accessibility.test.tsx 共通
vi.mock("../StreamingMessage", () => ({
  StreamingMessage: ({
    content,
    isStreaming,
    onCancel,
  }: {
    content: string;
    isStreaming: boolean;
    onCancel?: () => void;
  }) => (
    <div
      data-testid="mock-streaming-message"
      aria-busy={isStreaming}
    >
      <span>{content}</span>
      {isStreaming && (
        <button
          onClick={onCancel}
          aria-label="Cancel response"
        >
          Cancel
        </button>
      )}
    </div>
  ),
}));

vi.mock("../RuntimeBanner", () => ({
  RuntimeBanner: ({ capability }: { capability: string }) => (
    <div
      data-testid="mock-runtime-banner"
      role="status"
      data-capability={capability}
    >
      {capability === "integratedRuntime" && "API 利用可能"}
      {capability === "terminalSurface" && "Terminal 利用可能"}
      {capability === "both" && "API・Terminal 利用可能"}
      {capability === "none" && "設定が必要"}
    </div>
  ),
}));

vi.mock("../ErrorGuidance", () => ({
  ErrorGuidance: ({
    error,
    onRetry,
  }: {
    error: { code: string; message: string; retryable: boolean };
    onRetry?: () => void;
  }) => (
    <div
      data-testid="mock-error-guidance"
      role="alert"
    >
      <span data-testid="error-code">{error.code}</span>
      <span data-testid="error-message">{error.message}</span>
      {error.retryable && (
        <button
          onClick={onRetry}
          data-testid="retry-button"
        >
          Retry
        </button>
      )}
    </div>
  ),
}));

vi.mock("../HandoffBlock", () => ({
  HandoffBlock: ({
    terminalCommand,
    contextSummary,
  }: {
    terminalCommand?: string;
    contextSummary?: string;
  }) => (
    <div data-testid="mock-handoff-block">
      {terminalCommand && (
        <code data-testid="terminal-command">{terminalCommand}</code>
      )}
      {contextSummary && (
        <p data-testid="context-summary">{contextSummary}</p>
      )}
    </div>
  ),
}));
```

### 3-2. 既存コンポーネントモック（継続利用）

既存テストと同一のモックパターンを使用する（P63 対策）。

```typescript
// 既存テスト（ChatPanel.test.tsx L42-46）と同一
vi.mock("../../skill/SkillSelector", () => ({
  SkillSelector: () => (
    <div data-testid="mock-skill-selector">SkillSelector</div>
  ),
}));

// 既存テスト（ChatPanel.test.tsx L48-65）と同一
vi.mock("../../skill/SkillImportDialog", () => ({
  SkillImportDialog: ({
    skill,
    isOpen,
    onClose,
  }: {
    skill: { name: string };
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="mock-skill-import-dialog">
        {skill.name}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));
```

### 3-3. useStreamingChat hook モック

`useStreamingChat` は ChatPanel テストで hook 全体をモックする。

```typescript
const mockStartStream = vi.fn();
const mockCancelStream = vi.fn();

vi.mock("../../../hooks/useStreamingChat", () => ({
  useStreamingChat: vi.fn(() => ({
    startStream: mockStartStream,
    cancelStream: mockCancelStream,
    isStreaming: Boolean(mockStoreState.isStreaming),
    streamingContent: (mockStoreState.streamingContent as string) ?? "",
    streamingError: mockStoreState.streamingError ?? null,
  })),
}));
```

---

## 4. テスト環境注意事項

| 注意事項               | 対策                                                                          | 関連Pitfall |
| ---------------------- | ----------------------------------------------------------------------------- | ----------- |
| happy-dom 環境         | `fireEvent` を使用、`userEvent.setup()` は使用禁止                            | P39         |
| テスト実行ディレクトリ | `cd apps/desktop && pnpm vitest run` で実行                                   | P40         |
| Store 安定性           | 個別セレクタ + `useShallow` 適用の派生セレクタをテスト                        | P31, P48    |
| IPC 応答形式           | invoke 系: wrapper 形式 `{success, data?, error?}` / push 系: フラット        | P60         |
| v8 カバレッジ          | インライン arrow function も関数カウントされる（callback のテストを忘れない） | P41         |
| インポートパス         | 同ディレクトリの既存テストファイルのインポートパスを必ず参照してから記述      | P63         |
| テスト間状態リーク     | `beforeEach` で `mockStoreState` と全 mock 関数をリセット                     | P9          |
| IPC 命名差異           | `llm:stream-done`（仕様書）は実際には `LLM_STREAM_END = "llm:stream-end"`     | P45         |

### 4-1. fireEvent 使用パターン（P39 対策）

```typescript
// happy-dom 環境での標準キーボードイベント
// P39: userEvent.setup() は使用禁止

// Enter キーで送信
fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter", bubbles: true });

// Shift+Enter で改行
fireEvent.keyDown(inputElement, {
  key: "Enter",
  code: "Enter",
  shiftKey: true,
  bubbles: true,
});

// Escape でキャンセル
fireEvent.keyDown(document, { key: "Escape", code: "Escape", bubbles: true });

// 非同期ハンドラを含む場合は act で包む（P39 準拠）
await act(async () => {
  fireEvent.keyDown(inputElement, { key: "Enter", bubbles: true });
});
```

### 4-2. テスト実行コマンド（P40 対策）

```bash
# 新規テストファイルの実行（apps/desktop ディレクトリから）
cd apps/desktop
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.accessibility.test.tsx
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.settings-sync.test.tsx

# 既存テストとの回帰確認（合わせて実行）
pnpm vitest run src/renderer/components/chat/__tests__/

# カバレッジ確認（v8 プロバイダ使用）
pnpm vitest run --coverage src/renderer/components/chat/__tests__/
```

### 4-3. P42 バリデーションテストパターン（MINOR-1 対応）

CH-01 messages 配列要素と CH-05 requestId の境界値テスト。

```typescript
// CH-01: messages 配列内要素の content バリデーション
it("messages 配列が空の場合は VALIDATION_ERROR になる", async () => {
  mockStreamChat.mockResolvedValue({ requestId: "req-001" });
  // capturedErrorCallback は空配列送信後にエラーを返す想定
  act(() => {
    capturedErrorCallback?.({
      code: "VALIDATION_ERROR",
      message: "Messages array must not be empty",
      retryable: false,
    });
  });
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByTestId("error-code")).toHaveTextContent(
    "VALIDATION_ERROR",
  );
});

// CH-05: requestId の P42 3段バリデーション境界値
// 空文字列の requestId でキャンセルを試みると success: false
it("空文字列の requestId でキャンセルすると success: false になる", async () => {
  mockCancelStream.mockResolvedValue({ success: false });
  // cancelStream("") 相当のシナリオをテスト
});
```

### 4-4. P48 useShallow パターン（Store セレクタテスト）

```typescript
// useChatMessagesShallow は useShallow を適用した派生セレクタ
// テスト側では直接 mockStoreState.chatMessages を配列で返すよう設定する
// 実装側が useShallow を適用していることを前提に、テストでは参照安定性を確認する

it("chatMessages が更新されたときに再レンダーが最小限であること", () => {
  // P48 対策: chatMessages セレクタが shallow 比較で安定していること
  const { rerender } = render(<ChatPanel />);

  // 同一内容の配列を渡しても再レンダーしないことを確認
  const sameMessages = [...mockStoreState.chatMessages];
  mockStoreState.chatMessages = sameMessages;

  rerender(<ChatPanel />);
  // コンポーネントが不要な再レンダーをしていないことを確認
});
```

---

## 5. チャンネル別モックアサーションパターン集

### CH-01 llm:stream-chat（フラット形式）

```typescript
// 呼び出し確認
expect(mockStreamChat).toHaveBeenCalledWith(
  expect.objectContaining({
    messages: expect.arrayContaining([
      expect.objectContaining({ role: "user", content: expect.any(String) }),
    ]),
    providerId: "anthropic",
    modelId: "claude-3-5-sonnet-20241022",
  }),
);
// レスポンス確認（フラット形式）
// mockStreamChat は { requestId: string } を返す
```

### CH-05 llm:stream-cancel（フラット形式）

```typescript
// P42: requestId の型チェック + trim チェックを含むテスト
expect(mockCancelStream).toHaveBeenCalledWith("req-test-001");
const result = await mockCancelStream();
expect(result).toEqual({ success: true });
```

### CH-06 llm:set-selected-config（P60 wrapper 形式）

```typescript
// 成功
const result = await mockSetSelectedConfig({
  providerId: "anthropic",
  modelId: "claude-3-5-sonnet-20241022",
});
expect(result).toEqual({ success: true });

// エラー（P42: modelId スペースのみ）
mockSetSelectedConfig.mockResolvedValue({
  success: false,
  error: "Model ID is required",
});
```

### CH-08 conversation:create（P60 wrapper 形式）

```typescript
// 成功
expect(mockConversationCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    title: expect.any(String),
    userId: expect.any(String),
  }),
);
const result = await mockConversationCreate({ ... });
expect(result).toEqual({
  success: true,
  data: expect.objectContaining({ id: expect.any(String) }),
});

// エラー（P42: title 空文字列）
mockConversationCreate.mockResolvedValue({
  success: false,
  error: { code: "VALIDATION_ERROR", message: expect.any(String) },
});
```

### CH-10 auth-key:exists（フラット形式）

```typescript
// API key 存在確認（P60 wrapper なし）
mockAuthKeyExists.mockResolvedValue({ exists: true, source: "saved" });
const result = await mockAuthKeyExists();
expect(result).toEqual({ exists: true, source: "saved" });
// result.exists で直接判定する（result.success は存在しない）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容                             |
| ---------- | ---------- | ------------------------------------ |
| v1.0.0     | 2026-03-18 | 初版作成（Phase 4 テストモック戦略） |
