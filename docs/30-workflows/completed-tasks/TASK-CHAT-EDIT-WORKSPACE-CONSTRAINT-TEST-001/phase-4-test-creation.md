# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 4                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

`chatEditHandlers.ts` の `chat-edit:send-with-context` IPCハンドラにおける `workspacePath` セキュリティ検証ガード（L159-173）に対して、TC-WS-01〜06 のテストケースを TDD 方式（Red フェーズ）で設計・作成する。

既存の `chatEditHandlers.security.test.ts` が sender 検証と入力バリデーションを担当するのに対し、本ファイルはworkspacePath制約に特化したテストを分離・集中させる。

## 実行タスク

- Task 4-1: テストファイルを新規作成し、workspacePath 制約テストを独立管理する
- Task 4-2: describe ブロック構成を設計し、TC-ID と 1:1 に対応させる
- Task 4-3: TC-WS-01〜06 のテストコードを記述し、期待結果を固定する
- Task 4-4: 追加テストを実行し、既存実装に対して Green を確認する

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 3

### 前Phaseの成果物

- なし（Phase 4 が起点タスク）

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                              | 確認ポイント                                              |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | workspacePath 境界検証と `PERMISSION_DENIED` 契約         |
| LLM インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | `SendWithContextRequest.workspacePath?` 型契約            |
| IPC 契約                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:send-with-context` request/response            |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | sender 検証・workspace 境界・contextBridge 契約           |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | payload ドリフト防止（handler/preload/renderer 同時更新） |

### 実装参照ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`（workspacePath セキュリティ検証）
- `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`（isAllowedPath 実装）
- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.security.test.ts`（既存テストパターン）

### テスト環境

- テストランナー: Vitest (happy-dom)
- P39: `userEvent` 禁止、`fireEvent` 使用（本テストは DOM 操作なしのため不要）
- P40: テスト実行は `apps/desktop` ディレクトリから実行必須

## 実行手順

### Step 1: describe ブロック構成設計

```
describe("chatEditHandlers - workspacePath セキュリティ検証", () => {
  describe("TC-WS-01: workspace 内ファイル（正常系）", ...)
  describe("TC-WS-02: workspace 外ファイル（PERMISSION_DENIED）", ...)
  describe("TC-WS-03: workspacePath 未指定（isAllowedPath 未呼び出し）", ...)
  describe("TC-WS-04: パストラバーサル攻撃（PERMISSION_DENIED）", ...)
  describe("TC-WS-05: 複数コンテキスト（1つ外）（PERMISSION_DENIED）", ...)
  describe("TC-WS-06: 空コンテキスト配列（isAllowedPath 未呼び出し）", ...)
})
```

### Step 2: モック戦略の詳細

| モック対象                          | 戦略                     | 理由                                     |
| ----------------------------------- | ------------------------ | ---------------------------------------- |
| `electron` (ipcMain.handle)         | `vi.mock`                | 登録されたハンドラを Map に格納するため  |
| `ipc-validator` (validateIpcSender) | `vi.mock` + `vi.hoisted` | valid: true を常時返却                   |
| `PathValidator` (isAllowedPath)     | `vi.spyOn` (実装保持)    | 呼び出し有無の検証と実際のパス判定を両立 |
| `RuntimeResolver`                   | `vi.mock`                | integrated adapter 返却                  |
| `ChatEditService`                   | `vi.mock`                | success 返却                             |

**重要**: `isAllowedPath` は `vi.spyOn` で実装を保持しつつ呼び出しをスパイする。`vi.mock` でモジュールごとモックしない。

### Step 3: テストファイル作成

作成ファイル: `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`

```typescript
/**
 * chatEditHandlers - workspacePath セキュリティ検証テスト
 *
 * TC-WS-01〜06: workspacePath 制約ガード（chatEditHandlers.ts L159-173）
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as PathValidatorModule from "../../services/chat-edit/utils/PathValidator";

// vi.hoisted でモック関数を先に定義
const { mockValidateIpcSender, mockToIPCValidationError } = vi.hoisted(() => ({
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

// Electron をモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
}));

// IPC Validator をモック（常時 valid: true）
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// RuntimeResolver をモック（integrated adapter を返却）
vi.mock("../../services/chat-edit/RuntimeResolver");

// ChatEditService をモック（success を返却）
vi.mock("../../services/chat-edit/ChatEditService");

import {
  registerChatEditHandlers,
  unregisterChatEditHandlers,
} from "../chatEditHandlers";
import { RuntimeResolver } from "../../services/chat-edit/RuntimeResolver";
import { ChatEditService } from "../../services/chat-edit/ChatEditService";

type IpcHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

describe("chatEditHandlers - workspacePath セキュリティ検証", () => {
  let mockMainWindow: any;
  let mockContextBuilder: any;
  let mockFileService: any;
  let mockRuntimeResolver: any;
  let registeredHandlers: Map<string, IpcHandler>;
  let isAllowedPathSpy: ReturnType<typeof vi.spyOn>;

  const WORKSPACE = "/Users/user/project";

  beforeEach(async () => {
    vi.clearAllMocks();
    registeredHandlers = new Map();

    // ipcMain.handle をモックしてハンドラを Map に保存
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      registeredHandlers.set(channel, handler as IpcHandler);
      return undefined as any;
    });

    // isAllowedPath を実装保持でスパイ
    isAllowedPathSpy = vi.spyOn(PathValidatorModule, "isAllowedPath");

    mockMainWindow = { id: 1, webContents: { id: 1 } };
    mockContextBuilder = { build: vi.fn().mockReturnValue("context") };
    mockFileService = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };

    // RuntimeResolver: integrated adapter を返却
    mockRuntimeResolver = {
      resolve: vi.fn().mockResolvedValue({
        type: "integrated",
        adapter: {},
      }),
    };

    // ChatEditService: success を返却
    vi.mocked(ChatEditService).mockImplementation(
      () =>
        ({
          sendWithContext: vi.fn().mockResolvedValue({ success: true }),
        }) as any,
    );

    // IPC sender 検証を常時通す
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockReturnValue({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });

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

  const getSendWithContextHandler = () =>
    registeredHandlers.get("chat-edit:send-with-context")!;

  const mockEvent = { sender: {} } as IpcMainInvokeEvent;

  // TC-WS-01: workspace 内ファイル → success: true
  it("TC-WS-01: workspacePath 内のファイルパスは success: true を返す", async () => {
    const handler = getSendWithContextHandler();
    const result = await handler(mockEvent, {
      contexts: [
        {
          filePath: `${WORKSPACE}/src/index.ts`,
          content: "code",
          language: "typescript",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      workspacePath: WORKSPACE,
    });

    expect(result.success).toBe(true);
    expect(isAllowedPathSpy).toHaveBeenCalledWith(`${WORKSPACE}/src/index.ts`, [
      WORKSPACE,
    ]);
  });

  // TC-WS-02: workspace 外ファイル → PERMISSION_DENIED
  it("TC-WS-02: workspacePath 外のファイルパスは PERMISSION_DENIED を返す", async () => {
    const handler = getSendWithContextHandler();
    const result = await handler(mockEvent, {
      contexts: [
        {
          filePath: "/etc/passwd",
          content: "sensitive",
          language: "text",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      workspacePath: WORKSPACE,
    });

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("PERMISSION_DENIED");
    expect(result.error.message).toBe("File path is outside the workspace");
    expect(result.error.retryable).toBe(false);
  });

  // TC-WS-03: workspacePath 未指定 → isAllowedPath 未呼び出し
  it("TC-WS-03: workspacePath が未指定の場合、isAllowedPath を呼び出さない", async () => {
    const handler = getSendWithContextHandler();
    const result = await handler(mockEvent, {
      contexts: [
        {
          filePath: "/etc/passwd",
          content: "sensitive",
          language: "text",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      // workspacePath を意図的に省略
    });

    expect(isAllowedPathSpy).not.toHaveBeenCalled();
    // workspacePath ガードをスキップするため RuntimeResolver が呼ばれる
    expect(mockRuntimeResolver.resolve).toHaveBeenCalledTimes(1);
  });

  // TC-WS-04: パストラバーサル攻撃 → PERMISSION_DENIED
  it("TC-WS-04: パストラバーサル攻撃パスは PERMISSION_DENIED を返す", async () => {
    const handler = getSendWithContextHandler();
    const result = await handler(mockEvent, {
      contexts: [
        {
          filePath: `${WORKSPACE}/../../../etc/passwd`,
          content: "sensitive",
          language: "text",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      workspacePath: WORKSPACE,
    });

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("PERMISSION_DENIED");
    expect(result.error.message).toBe("File path is outside the workspace");
  });

  // TC-WS-05: 複数コンテキスト（1つ外） → PERMISSION_DENIED
  it("TC-WS-05: 複数コンテキストのうち 1 つでも workspace 外なら PERMISSION_DENIED を返す", async () => {
    const handler = getSendWithContextHandler();
    const result = await handler(mockEvent, {
      contexts: [
        {
          filePath: `${WORKSPACE}/src/index.ts`,
          content: "ok",
          language: "typescript",
        },
        {
          filePath: "/etc/passwd",
          content: "bad",
          language: "text",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      workspacePath: WORKSPACE,
    });

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("PERMISSION_DENIED");
  });

  // TC-WS-06: 空コンテキスト配列 → isAllowedPath 未呼び出し
  it("TC-WS-06: contexts が空配列の場合、isAllowedPath を呼び出さない", async () => {
    const handler = getSendWithContextHandler();
    await handler(mockEvent, {
      contexts: [],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "",
      workspacePath: WORKSPACE,
    });

    expect(isAllowedPathSpy).not.toHaveBeenCalled();
  });
});
```

### Step 4: テスト実行（Red → Green 確認）

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

## 統合テスト連携【必須】

本テストは既存の以下テストファイルと同一ハンドラ `chat-edit:send-with-context` を検証する。テスト間での状態リークがないよう `beforeEach` で `vi.clearAllMocks()` + `registeredHandlers` リセットを実施。

- `chatEditHandlers.security.test.ts`: sender 検証 / 入力バリデーション担当
- `chatEditHandlers.selection.test.ts`: get-selection チャンネル担当
- `chatEditHandlers.test.ts`: 基本動作担当

## 多角的チェック観点（AIが判断）

| 観点                        | チェック内容                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| P5: 二重登録                | `afterEach` で `unregisterChatEditHandlers()` を呼び、ハンドラリークなし |
| P39: userEvent禁止          | DOM操作なしのため適用不要                                                |
| P40: 実行ディレクトリ       | `cd apps/desktop` 後に vitest 実行                                       |
| P42: .trim() バリデーション | 本テストの検証対象外（Phase 6 で追加）                                   |
| P41: v8カバレッジ           | `getAllowedWindows` コールバック呼び出しを明示的に検証済み               |

## 成果物

| 成果物         | パス                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` |

## 完了条件（チェックリスト形式）

- [ ] テストファイルが指定パスに作成されている
- [ ] TC-WS-01〜06 の6テストケースが全て実装されている
- [ ] `vi.hoisted` でモック関数が正しく定義されている
- [ ] `isAllowedPath` が `vi.spyOn` で実装保持スパイされている
- [ ] `vi.clearAllMocks()` が `beforeEach` で実行されている
- [ ] `unregisterChatEditHandlers()` が `afterEach` で実行されている
- [ ] テスト実行コマンドで全テストが PASS する
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| #   | タスク                    | 状態     |
| --- | ------------------------- | -------- |
| 4-1 | describe ブロック構成設計 | 完了     |
| 4-2 | モック戦略決定            | 完了     |
| 4-3 | テストファイル作成        | 実行予定 |
| 4-4 | テスト実行確認            | 実行予定 |

## タスク100%実行確認【必須】

Phase 4 完了の定義: 6テストケースが全て実装され、`vitest run` で全 PASS すること。

## 次のPhase

Phase 5: 実装（本タスクはテスト追加のみのため、実装変更は不要）
→ `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-5-implementation.md`
