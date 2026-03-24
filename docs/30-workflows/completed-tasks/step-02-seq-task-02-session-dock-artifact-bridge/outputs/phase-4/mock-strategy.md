# Mock Strategy - Session Dock Artifact Bridge

## 1. Session / Preload Mock

### 1.1 claudeCliAPI Mock

```typescript
const mockClaudeCliAPI = {
  checkInstallation: vi
    .fn()
    .mockResolvedValue({ success: true, data: { installed: true } }),
  executeScript: vi.fn().mockResolvedValue({
    success: true,
    data: { sessionId: "session-test-001" },
  }),
  terminateSession: vi.fn().mockResolvedValue({ success: true }),
  listSessions: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getSession: vi
    .fn()
    .mockResolvedValue({ success: true, data: { transcript: [] } }),
  onSessionOutput: vi.fn(),
  onSessionStatus: vi.fn(),
};
```

### 1.2 Store Mock (agentSlice SessionDock)

```typescript
const createMockSessionDockState = (
  overrides?: Partial<SessionDockState>,
): SessionDockState => ({
  dockState: "collapsed",
  sessionId: null,
  isDockOpen: false,
  transcriptEntries: [],
  artifactSummary: null,
  errorSummary: null,
  shareHistory: [],
  ...overrides,
});
```

### 1.3 Transcript Mock Data

```typescript
const mockTranscriptEntries: TranscriptEntry[] = [
  {
    index: 0,
    timestamp: "2026-03-24T10:00:00Z",
    type: "system",
    content: "Session started",
    isError: false,
  },
  {
    index: 1,
    timestamp: "2026-03-24T10:00:01Z",
    type: "stdout",
    content: "Running task...",
    isError: false,
  },
  {
    index: 2,
    timestamp: "2026-03-24T10:00:05Z",
    type: "stdout",
    content: "Task completed",
    isError: false,
  },
];
```

### 1.4 Artifact Mock Data

```typescript
const mockArtifactSummary: ArtifactSummaryData = {
  artifacts: [
    { type: "file_created", path: "src/components/NewComponent.tsx" },
    {
      type: "file_modified",
      path: "src/store/slices/agentSlice.ts",
      diffPreview: "+10 -3",
    },
  ],
  executionDuration: 5000,
  exitCode: 0,
  nextActions: [
    {
      label: "ファイルを開く",
      action: "open_file",
      target: "src/components/NewComponent.tsx",
    },
  ],
};
```

## 2. Mock 適用パターン

### 2.1 State Machine テスト用

- `beforeEach` で `createMockSessionDockState()` を設定
- 各テストで `transitionDock(event)` を呼び出し、state 遷移を検証
- P9 対策: テスト間で state をリセット

### 2.2 Persistence テスト用

- `mockClaudeCliAPI.getSession` の戻り値を操作して restore シナリオを制御
- restore 失敗: `.mockRejectedValue(new Error("Session not found"))`
- FIFO テスト: 10 件の mock session を事前登録

### 2.3 Share テスト用

- P39 対策: happy-dom 環境では `fireEvent` を使用（`userEvent` 不可）
- `onShare` callback を `vi.fn()` でモック化
- provenance chip の検証は `data-testid` ベース

## 3. テスト環境設定

| 設定項目         | 値                   | 根拠                                      |
| ---------------- | -------------------- | ----------------------------------------- |
| テスト環境       | happy-dom            | P39/P40 準拠                              |
| 実行ディレクトリ | `apps/desktop/`      | P40 準拠（vitest.config.ts の読み込み）   |
| タイマー         | `vi.useFakeTimers()` | persistence 期間テスト用                  |
| イベント         | `fireEvent`          | P39 準拠（happy-dom では userEvent 不可） |
