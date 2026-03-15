# Phase 2 成果物: テスト設計書

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日   | 2026-03-15                                 |

## 1. テストファイル配置

```
apps/desktop/src/main/ipc/__tests__/
  chatEditHandlers.test.ts                         # 既存: 基本テスト
  chatEditHandlers.security.test.ts                # 既存: セキュリティテスト
  chatEditHandlers.selection.test.ts               # 既存: セレクションテスト
  chatEditHandlers.workspace-constraint.test.ts    # 新規: workspacePath 制約テスト
```

**設計判断**: 新規ファイルとして分離する。

| 判断基準             | 根拠                                          |
| -------------------- | --------------------------------------------- |
| 単一責務原則         | workspacePath 制約ガードは独立した関心事      |
| テスト間状態隔離(P9) | 別ファイルにすることで状態リーク防止          |
| 既存テスト影響回避   | 既存ファイルを修正しないことで NFR-002 を保証 |

## 2. モック戦略

### 2.1 モック依存関係図

```
テスト対象: registerChatEditHandlers 内の chat-edit:send-with-context ハンドラ
                |
                +--- electron (ipcMain.handle) → vi.mock (既存パターン踏襲)
                +--- ipc-validator (validateIpcSender) → vi.mock via vi.hoisted()
                +--- PathValidator (isAllowedPath) → vi.spyOn (実装保持 + 呼び出し検証)
                +--- RuntimeResolver → vi.fn() モック (type: "handoff" 返却)
                +--- ContextBuilder → vi.fn() モック
                +--- FileService → vi.fn() モック
```

### 2.2 RuntimeResolver の type 選択

**設計判断**: `type: "handoff"` を使用する。

| 選択肢         | 評価   | 理由                                                           |
| -------------- | ------ | -------------------------------------------------------------- |
| `"handoff"`    | 採用   | ChatEditService のモック不要、既存テストと同一パターン         |
| `"integrated"` | 不採用 | ChatEditService コンストラクタのモックが追加で必要、複雑化する |

TC-WS-01 の「正常処理」は workspacePath 検証を通過後に RuntimeResolver に到達することの検証が目的であり、
`handoff` レスポンスで `success: true` + `handoff: true` が返れば AC を満たす。

### 2.3 isAllowedPath の検証方式

**設計判断**: `vi.spyOn` で実装を保持しつつ呼び出しを検証する。

| 方式       | 評価   | 理由                                                               |
| ---------- | ------ | ------------------------------------------------------------------ |
| `vi.spyOn` | 採用   | `path.resolve()` による正規化ロジックを実際に実行（TC-WS-04 必須） |
| `vi.mock`  | 不採用 | パストラバーサル検証で `path.resolve` が必要                       |

```typescript
import * as PathValidatorModule from "../../services/chat-edit/utils/PathValidator";
const isAllowedPathSpy = vi.spyOn(PathValidatorModule, "isAllowedPath");
```

### 2.4 各モックの定義パターン

#### electron モック（既存パターン完全踏襲）

```typescript
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
}));
```

#### IPC Validator モック（vi.hoisted パターン）

```typescript
const { mockValidateIpcSender, mockToIPCValidationError } = vi.hoisted(() => ({
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));
```

#### TerminalHandoffBuilder モック

```typescript
vi.mock("../../services/chat-edit/TerminalHandoffBuilder", () => ({
  TerminalHandoffBuilder: vi.fn().mockImplementation(() => ({
    build: vi.fn().mockReturnValue({
      terminalCommand: "claude --chat-edit",
      description: "test handoff",
    }),
  })),
}));
```

## 3. テストケース詳細設計

### TC-WS-01: workspace 内ファイルコンテキストの PASS

| 項目         | 内容                                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}]`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`, RuntimeResolver → `{type: "handoff", reason: "test"}`                                                                                 |
| 期待出力     | `{success: true, handoff: true}`                                                                                                                                           |
| 検証ポイント | 1. `isAllowedPath` が `("/home/user/project/src/index.ts", ["/home/user/project"])` で呼ばれる 2. `runtimeResolver.resolve()` が呼ばれる                                   |

### TC-WS-02: workspace 外ファイルコンテキストの PERMISSION_DENIED

| 項目         | 内容                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/etc/passwd"}]`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`                                                                                                                    |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                                                                                                 |
| 検証ポイント | 1. `runtimeResolver.resolve()` が呼ばれていない 2. エラーの `retryable` が `false`                                                                     |

### TC-WS-03: workspacePath 未指定時の検証スキップ

| 項目         | 内容                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: undefined`, `contexts: [{filePath: "/etc/passwd"}]`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`, RuntimeResolver → `{type: "handoff", reason: "test"}`                                                  |
| 期待出力     | `{success: true, handoff: true}`                                                                                                            |
| 検証ポイント | `isAllowedPath` が呼ばれていない（`expect(isAllowedPathSpy).not.toHaveBeenCalled()`）                                                       |

### TC-WS-04: パストラバーサル攻撃パターンのガード

| 項目         | 内容                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/../../etc/passwd"}]`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`                                                                                                                                            |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                                                                                                                         |
| 検証ポイント | `isAllowedPath` 内の `path.resolve()` でパスが `/etc/passwd` に正規化され、拒否される                                                                                          |

### TC-WS-05: 複数コンテキストのうち 1 つが workspace 外

| 項目         | 内容                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}, {filePath: "/etc/passwd"}]`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`                                                                                                                                                                   |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                                                                                                                                                |
| 検証ポイント | `isAllowedPath` が 2 回呼ばれ、2 回目で `false` を返す                                                                                                                                                |

### TC-WS-06: 空コンテキスト配列の正常処理

| 項目         | 内容                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: []`, `command: {type: "refactor", targetContextId: "ctx-1"}`, `message: ""` |
| モック設定   | `validateIpcSender → {valid: true}`, RuntimeResolver → `{type: "handoff", reason: "test"}`                                    |
| 期待出力     | `{success: true, handoff: true}`                                                                                              |
| 検証ポイント | `isAllowedPath` が呼ばれていない（for-of ループが実行されない）                                                               |

## 4. ハンドラ取得パターン

既存 `chatEditHandlers.security.test.ts` と同一パターン:

```typescript
let registeredHandlers: Map<string, IpcHandler>;

beforeEach(() => {
  vi.clearAllMocks();
  registeredHandlers = new Map();

  vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
    registeredHandlers.set(channel, handler as IpcHandler);
    return undefined as any;
  });

  mockValidateIpcSender.mockReturnValue({ valid: true });

  registerChatEditHandlers(
    mockMainWindow,
    mockContextBuilder,
    mockFileService,
    mockRuntimeResolver,
  );
});

afterEach(() => {
  unregisterChatEditHandlers();
});
```

## 5. テスト構造

```typescript
describe("chatEditHandlers - workspacePath 制約テスト", () => {
  // setup: モック定義、ハンドラ登録

  describe("TC-WS-01: workspace 内ファイルの正常処理", () => { ... });
  describe("TC-WS-02: workspace 外ファイルの拒否", () => { ... });
  describe("TC-WS-03: workspacePath 未指定時の検証スキップ", () => { ... });
  describe("TC-WS-04: パストラバーサル攻撃のガード", () => { ... });
  describe("TC-WS-05: 複数コンテキストの部分拒否", () => { ... });
  describe("TC-WS-06: 空コンテキスト配列の正常処理", () => { ... });
});
```

## 6. テスト実行コマンド

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

## 完了条件チェック

- [x] テストファイルの配置先が決定されている
- [x] モック戦略が既存テストパターンと整合している
- [x] TC-WS-01〜06 の入力・期待出力・モック設定が詳細化されている
- [x] ハンドラ取得パターンが設計されている
- [x] P58 対策: テスト対象が `ipc/chatEditHandlers.ts` であることが明記されている
- [x] P61 対策: RuntimeResolver のモック戦略が設計されている（handoff 採用）
- [x] P9 対策: テスト間の状態隔離が設計されている（beforeEach + afterEach）
- [x] 本Phase内の全タスクを100%実行完了
