# アーキテクチャ設計書

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 2                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## テスト設計パターン

### パターン選択: Electron mock capture パターン

新規テストファイル `creatorHandlers.registrationSnapshot.test.ts` では `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` を使用する。

**理由**:

- 既存の `ipcHandlerRegistrationSnapshot.test.ts` が `vi.hoisted` + `vi.mock("electron")` パターンを使用しているため、重複を避けながら補完的なアプローチを提供する
- Electron mock capture は既存 `vi.mock("electron")` と整合しやすく、モック関数呼び出しを直接収集できる

### テストファイル構成

```
apps/desktop/src/main/ipc/__tests__/
├── creatorHandlers.registrationSnapshot.test.ts  ← 新規作成（Electron mock capture パターン）
├── ipcHandlerRegistrationSnapshot.test.ts        ← 既存（vi.mock パターン）
└── __snapshots__/
    ├── creatorHandlers.registrationSnapshot.test.ts.snap  ← 新規生成
    └── ipcHandlerRegistrationSnapshot.test.ts.snap       ← 既存
```

### spy セットアップ設計

```typescript
// beforeEach でキャプチャ配列を初期化し、spy をセットアップ
let handles: string[] = [];

beforeEach(() => {
  handles = [];
  mockIpcMainHandle.mockImplementation((channel: string) => {
    handles.push(channel);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

**初期化タイミング**:

- `beforeEach`: `handles = []` でリセット + `mockImplementation` をセットアップ
- `afterEach`: `vi.restoreAllMocks()` で spy をリストア（元の `ipcMain.handle` に戻す）

### Electron モック設計

Electron mock capture を使用するため、`ipcMain` オブジェクト自体のモックが必要:

```typescript
// electron モック（vi.mock）
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));
```

`mockIpcMainHandle.mockImplementation(...)` により、`vi.mock` で定義されたモック関数呼び出しをそのまま捕捉する。

### BrowserWindow モック設計

```typescript
const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;
```

## テストケース設計

| テスト ID    | describe 階層 | 検証内容                               |
| ------------ | ------------- | -------------------------------------- |
| REG-SNAP-01  | 正常系        | チャンネル一覧がスナップショットと一致 |
| REG-DEDUP-01 | 正常系        | 重複チャンネルなし                     |
| REG-COUNT-01 | 正常系        | 総数 19 件                             |
| REG-EDGE-01  | 異常系        | 重複チャンネル追加で検出される         |
| REG-EDGE-02  | 境界値        | `ipcMain.on()` は spy 範囲外           |
| REG-EDGE-03  | 境界値        | `beforeEach` リセットで独立性確認      |
