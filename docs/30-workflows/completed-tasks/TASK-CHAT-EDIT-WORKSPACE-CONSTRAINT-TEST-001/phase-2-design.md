# Phase 2: 設計

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 2                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

TC-WS-01〜06 のテスト設計を行い、テストファイルの構成、モック戦略、テスト実行方法を確定する。

## 実行タスク

- テストアーキテクチャ設計: テストファイル構成とモック戦略の設計
- テストケース詳細設計: 各 TC の入力・期待出力・モック設定を詳細化
- 既存テストとの整合性確認: 既存テストパターンとの統一性を検証

## 参照資料

| 資料名                 | パス                                                                    | 説明                   |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                                       | Phase 1 成果物         |
| 既存セキュリティテスト | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.security.test.ts` | 既存テストパターン参照 |
| 既存テスト             | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts`          | 既存テストパターン参照 |

### システム仕様（aiworkflow-requirements）

> `indexes/resource-map.md` / `indexes/quick-reference.md` から抽出した設計時必須仕様。

| 参照資料                 | パス                                                                              | 内容                                    |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------- |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | workspacePath 境界条件                  |
| LLM インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | request/response 型制約                 |
| IPC 契約                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:*` 契約確認                  |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | sender 検証 / contextBridge 契約        |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | handler/preload/renderer 同時更新ルール |

## 実行手順

### ステップ1: テストアーキテクチャ設計

#### テストファイル配置

```
apps/desktop/src/main/ipc/__tests__/
  chatEditHandlers.test.ts                    # 既存: 基本テスト
  chatEditHandlers.security.test.ts           # 既存: セキュリティテスト
  chatEditHandlers.selection.test.ts          # 既存: セレクションテスト
  chatEditHandlers.workspace-constraint.test.ts  # 新規: workspacePath 制約テスト（TC-WS-01〜06）
```

**設計判断**: 既存の `chatEditHandlers.security.test.ts` に追加するのではなく、新規ファイル `chatEditHandlers.workspace-constraint.test.ts` として分離する。理由:

1. 単一責務原則: workspacePath 制約ガードは独立した関心事
2. テスト間の状態隔離: 別ファイルにすることで P9（状態リーク）リスクを低減
3. 既存テストへの影響回避: 既存ファイルを修正しないことで NFR-002 を保証

#### モック戦略

```
テスト対象: registerChatEditHandlers 内の chat-edit:send-with-context ハンドラ
                |
                +--- electron (ipcMain.handle) → vi.mock
                +--- ipc-validator (validateIpcSender) → vi.mock (PASS返却)
                +--- PathValidator (isAllowedPath) → vi.spyOn (実装を保持)
                +--- RuntimeResolver → vi.mock (モック adapter 返却)
                +--- ChatEditService → vi.mock (success 返却)
                +--- ContextBuilder → vi.mock (モック context 返却)
                +--- FileService → vi.mock (モック file service)
```

#### モックパターン詳細

**electron モック（既存パターン踏襲）**:

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

**IPC Validator モック（既存セキュリティテストのパターン踏襲）**:

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

**PathValidator スパイ（新規 - workspacePath 検証の核心）**:

```typescript
import * as PathValidator from "../../services/chat-edit/utils/PathValidator";

// isAllowedPath の実装は保持しつつ、呼び出しを検証
const isAllowedPathSpy = vi.spyOn(PathValidator, "isAllowedPath");
```

**RuntimeResolver モック（P61 対策）**:

```typescript
const mockRuntimeResolver = {
  resolve: vi.fn().mockResolvedValue({
    type: "integrated",
    adapter: {
      execute: vi.fn().mockResolvedValue({ success: true, content: "result" }),
    },
  }),
};
```

### ステップ2: テストケース詳細設計

#### TC-WS-01: workspace 内ファイルコンテキストの PASS

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}]` |
| モック設定   | validateIpcSender → `{valid: true}`, RuntimeResolver → integrated adapter                          |
| 期待出力     | `{success: true}`                                                                                  |
| 検証ポイント | `isAllowedPath` が `("/home/user/project/src/index.ts", ["/home/user/project"])` で呼ばれること    |

#### TC-WS-02: workspace 外ファイルコンテキストの PERMISSION_DENIED

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/etc/passwd"}]` |
| モック設定   | validateIpcSender → `{valid: true}`                                            |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                         |
| 検証ポイント | RuntimeResolver.resolve() が呼ばれていないこと                                 |

#### TC-WS-03: workspacePath 未指定時の検証スキップ

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| 入力         | `workspacePath: undefined`, `contexts: [{filePath: "/etc/passwd"}]`       |
| モック設定   | validateIpcSender → `{valid: true}`, RuntimeResolver → integrated adapter |
| 期待出力     | `{success: true}`（RuntimeResolver 以降の処理に進む）                     |
| 検証ポイント | `isAllowedPath` が呼ばれていないこと                                      |

#### TC-WS-04: パストラバーサル攻撃パターンのガード

| 項目         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/../../etc/passwd"}]` |
| モック設定   | validateIpcSender → `{valid: true}`                                                                    |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                                                 |
| 検証ポイント | `isAllowedPath` が `path.resolve` でパスを正規化してから比較すること                                   |

#### TC-WS-05: 複数コンテキストのうち 1 つが workspace 外

| 項目         | 内容                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}, {filePath: "/etc/passwd"}]` |
| モック設定   | validateIpcSender → `{valid: true}`                                                                                           |
| 期待出力     | `{success: false, error: {code: "PERMISSION_DENIED"}}`                                                                        |
| 検証ポイント | 2 番目のコンテキストで `isAllowedPath` が `false` を返すこと                                                                  |

#### TC-WS-06: 空コンテキスト配列の正常処理

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| 入力         | `workspacePath: "/home/user/project"`, `contexts: []`                     |
| モック設定   | validateIpcSender → `{valid: true}`, RuntimeResolver → integrated adapter |
| 期待出力     | `{success: true}`（RuntimeResolver 以降の処理に進む）                     |
| 検証ポイント | `isAllowedPath` が呼ばれていないこと（for-of ループが実行されない）       |

### ステップ3: ハンドラ取得パターンの設計

既存の `chatEditHandlers.security.test.ts` と同じパターンで IPC ハンドラを取得する:

```typescript
let registeredHandlers: Map<string, IpcHandler>;

beforeEach(() => {
  vi.clearAllMocks();
  registeredHandlers = new Map();

  vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
    registeredHandlers.set(channel, handler as IpcHandler);
    return undefined as any;
  });

  // validateIpcSender を常に valid に設定（workspace 制約テストに集中）
  mockValidateIpcSender.mockReturnValue({ valid: true });

  // ハンドラ登録
  registerChatEditHandlers(
    mockMainWindow,
    mockContextBuilder,
    mockFileService,
    mockRuntimeResolver,
  );
});
```

**ハンドラ呼び出し方法**:

```typescript
const handler = registeredHandlers.get(
  IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
);
const result = await handler!(mockEvent, {
  workspacePath: "/home/user/project",
  contexts: [{ filePath: "/home/user/project/src/index.ts" }],
  command: "edit",
});
```

## 統合テスト連携（Phase 2）

- テストアーキテクチャが既存テストパターン（`chatEditHandlers.security.test.ts`）と整合していることを確認
- モック戦略が既存のモックパターンと競合しないことを検証

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                         | 仕様参照先                                          |
| ------------ | -------------------------------- | --------------------------------------------------- |
| セキュリティ | パストラバーサル攻撃のテスト設計 | `aiworkflow-requirements: security-electron-ipc.md` |
| IPC通信      | IPC ハンドラのモック設計         | `aiworkflow-requirements: api-ipc-agent.md`         |

## 成果物

| 成果物 | パス                        | 説明                           |
| ------ | --------------------------- | ------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | テスト設計書（モック戦略含む） |

## 完了条件

- [ ] テストファイルの配置先が決定されている
- [ ] モック戦略が既存テストパターンと整合している
- [ ] TC-WS-01〜06 の入力・期待出力・モック設定が詳細化されている
- [ ] ハンドラ取得パターンが設計されている
- [ ] P58 対策: テスト対象が `ipc/chatEditHandlers.ts` であることが明記されている
- [ ] P61 対策: RuntimeResolver のモック戦略が設計されている
- [ ] P9 対策: テスト間の状態隔離が設計されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
