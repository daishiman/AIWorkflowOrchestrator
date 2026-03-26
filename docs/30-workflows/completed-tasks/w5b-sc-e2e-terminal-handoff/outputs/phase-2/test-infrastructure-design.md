# テストインフラ設計書

## 概要

E2E テストの基盤となるインフラ設計。モックパターン、ヘルパー関数、テスト実行方法を定義する。

---

## モックパターン

### Electron モック

既存パターン（`skillCreatorIpc.integration.test.ts`）に準拠:

```typescript
const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));
```

### MockBrowserWindow

```typescript
interface MockBrowserWindow {
  id: number;
  webContents: {
    id: number;
    getType: () => string;
    isDevToolsOpened: () => boolean;
    send: ReturnType<typeof vi.fn>;
  };
  isDestroyed: () => boolean;
}
```

`webContents.send` のスパイにより、`skill-creator:progress` の push 通知を検証する。

### IpcMainInvokeEvent モック

```typescript
function createMockEvent(webContentsId: number = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}
```

### RuntimeSkillCreatorFacade モック

LLM を直接モックするのではなく、Facade 層をモックする。これにより:

- LLM API の詳細に依存しない
- TerminalHandoff 経路のテストが容易
- エラーパターンの注入が簡単

```typescript
const mockRuntimeFacade = {
  plan: vi.fn(),
  execute: vi.fn(),
  improve: vi.fn(),
  applyImprovement: vi.fn(),
  setLLMAdapter: vi.fn(),
};
```

**重要**: LLM アダプター（`ILLMAdapter`）を直接モックする必要はない。Facade 層で全ての LLM 呼び出しがラップされているため、Facade のメソッドをモックすれば十分である。

---

## テストヘルパー関数

`apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` に配置:

### createMockMainWindow()

MockBrowserWindow を生成し、`BrowserWindow.fromWebContents` のモックを設定する。

### createMockEvent()

IpcMainInvokeEvent のモックを生成する。

### getHandler(channel)

`handlerMap` からハンドラーを取得するユーティリティ。

### createMockRuntimeFacade()

RuntimeSkillCreatorFacade の全メソッドを `vi.fn()` でモックした擬似オブジェクトを返す。

### assertTerminalHandoff(result)

TerminalHandoff レスポンスの構造検証:

- `result.success === true`
- `result.data.type === "terminal_handoff"`
- `result.data.guidance.terminalCommand` が非空
- `result.data.guidance.contextSummary` が非空
- `result.data.guidance.reason` が非空

### assertIpcSuccess(result)

成功レスポンスの汎用検証:

- `result.success === true`
- `result.data` が定義されている

### assertIpcError(result)

エラーレスポンスの汎用検証:

- `result.success === false`
- `result.error` が `string` 型
- スタックトレース・ファイルパス・API Key が含まれない

---

## テスト実行方法

```bash
cd apps/desktop && pnpm vitest run src/test/e2e/
```

- P40 対策: 必ず `apps/desktop` ディレクトリから実行すること
- タイムアウト設定: テストファイルに `{ timeout: 150_000 }` を指定
- 環境変数: `CLAUDE_SKIP_HEAVY_HOOKS=1` でフック負荷を軽減可能
