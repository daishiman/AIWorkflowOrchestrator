# Phase 2: テスト方針

> **タスク**: TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
> **日付**: 2026-03-03

---

## 1. テスト戦略の概要

本タスクは「未登録ハンドラの登録追加」と「P44 インターフェース不整合修正」の2点。テスト戦略は以下の3レベルで構成する。

## 2. Unit テスト

### 2.1 registerAllIpcHandlers が registerSkillChainHandlers を呼び出す検証

**ファイル**: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（既存ファイルに追加）

**テストケース**:

| #   | テスト名                                                                | 検証内容                                                                    |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| U1  | registerAllIpcHandlers 呼出で registerSkillChainHandlers が呼ばれる     | vi.mock 経由で registerSkillChainHandlers のモックが1回呼ばれることを検証   |
| U2  | registerSkillChainHandlers が mainWindow 引数を受け取る                 | モック呼び出しの第1引数が mainWindow インスタンスであることを検証           |
| U3  | registerSkillChainHandlers が SkillChainStore インスタンスを受け取る    | モック呼び出しの第2引数が SkillChainStore のインスタンスであることを検証    |
| U4  | registerSkillChainHandlers が SkillChainExecutor インスタンスを受け取る | モック呼び出しの第3引数が SkillChainExecutor のインスタンスであることを検証 |

**修正が必要な既存モック**:

```typescript
// ipc-double-registration.test.ts 行174-179
vi.mock("../skillHandlers", () => ({
  registerSkillHandlers: vi.fn(),
  registerSkillScheduleHandlers: vi.fn(),
  registerSkillDocsHandlers: vi.fn(),
  unregisterSkillScheduleHandlers: vi.fn(),
  registerSkillChainHandlers: vi.fn(), // ← 追加
  unregisterSkillChainHandlers: vi.fn(), // ← 追加
}));
```

**SkillChainStore / SkillChainExecutor のモック追加**:

```typescript
vi.mock("../../services/skill/SkillChainStore", () => ({
  SkillChainStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillChainExecutor", () => ({
  SkillChainExecutor: vi.fn().mockImplementation(() => ({})),
}));
```

### 2.2 P44 修正: chainGet / chainDelete ハンドラの引数形式テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillChainHandlers.test.ts`（新規作成）

**テストケース**:

| #   | テスト名                                                       | 検証内容                                              |
| --- | -------------------------------------------------------------- | ----------------------------------------------------- |
| U5  | skill:chain:get がオブジェクト { chainId } を正しく受け取る    | `{ chainId: "test-id" }` を渡して成功レスポンスを返す |
| U6  | skill:chain:get が不正な引数でバリデーションエラーを返す       | `{ chainId: "" }` で VALIDATION_ERROR                 |
| U7  | skill:chain:get が非オブジェクトでエラーを返す                 | `"test-id"` (文字列直接) でエラー                     |
| U8  | skill:chain:delete がオブジェクト { chainId } を正しく受け取る | `{ chainId: "test-id" }` を渡して成功                 |
| U9  | skill:chain:delete が不正な引数でバリデーションエラーを返す    | `{ chainId: "  " }` で VALIDATION_ERROR               |
| U10 | skill:chain:list が引数なしで成功する                          | sender 検証のみで成功                                 |
| U11 | skill:chain:save がオブジェクトを正しく受け取る                | chain 定義オブジェクトで成功                          |
| U12 | skill:chain:execute がオブジェクト { chainId } を受け取る      | `{ chainId: "test-id" }` で成功                       |

## 3. Integration テスト

### 3.1 registerAllIpcHandlers 後のチャンネル応答検証

**ファイル**: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（既存ファイルに追加）

| #   | テスト名                                                                               | 検証内容                                                               |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| I1  | registerAllIpcHandlers 後に ipcMain.handle が skill:chain:\* 5チャンネルに呼ばれている | mockIpcMainHandle の呼び出し引数に SKILL*CHAIN*\* が含まれることを検証 |

**検証方法**:

```typescript
it("全 skill:chain:* チャンネルが登録される", () => {
  registerAllIpcHandlers(mockWindow);

  const channels = mockIpcMainHandle.mock.calls.map((call) => call[0]);
  expect(channels).toContain("skill:chain:list");
  expect(channels).toContain("skill:chain:get");
  expect(channels).toContain("skill:chain:save");
  expect(channels).toContain("skill:chain:delete");
  expect(channels).toContain("skill:chain:execute");
});
```

> Note: このテストは mockIpcMainHandle が `ipc-double-registration.test.ts` で既にモックされているため、IPC*CHANNELS モックに SKILL_CHAIN*\* を追加する必要がある。

**IPC_CHANNELS モック修正**:

```typescript
vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    // ... 既存チャンネル ...
    SKILL_CHAIN_LIST: "skill:chain:list",
    SKILL_CHAIN_GET: "skill:chain:get",
    SKILL_CHAIN_SAVE: "skill:chain:save",
    SKILL_CHAIN_DELETE: "skill:chain:delete",
    SKILL_CHAIN_EXECUTE: "skill:chain:execute",
  },
}));
```

## 4. Regression テスト

### 4.1 二重登録防止の回帰テスト

既存の `ipc-double-registration.test.ts` の以下テストが引き続きパスすることを確認:

| テスト                                  | 期待結果 |
| --------------------------------------- | -------- |
| register → unregister → register フロー | 例外なし |
| 複数サイクル安定動作                    | 例外なし |
| setupThemeWatcher unsubscribe           | 呼出確認 |

### 4.2 回帰防止: 登録チャンネル数の静的チェック

**方針**: `registerAllIpcHandlers` が呼び出す `register*Handlers` 関数の数を静的にカウントする回帰テストを追加。将来のハンドラ追加漏れを防止する。

| #   | テスト名                                                        | 検証内容                                     |
| --- | --------------------------------------------------------------- | -------------------------------------------- |
| R1  | registerAllIpcHandlers が期待される register 関数を全て呼び出す | 既知の register 関数リストと実際の呼出を照合 |

**実装案**:

```typescript
it("全 register 関数が呼び出される", () => {
  registerAllIpcHandlers(mockWindow);

  // 期待される register 関数のリスト
  const expectedRegistrations = [
    registerFileHandlers,
    registerStoreHandlers,
    registerDashboardHandlers,
    registerGraphHandlers,
    registerAIHandlers,
    registerThemeHandlers,
    registerWorkspaceHandlers,
    registerSearchHandlers,
    registerFileSelectionHandlers,
    registerLLMHandlers,
    registerCommunityHandlers,
    registerWindowHandlers,
    registerDialogHandlers,
    registerAgentExecutionHandlers,
    registerSkillHandlers,
    registerSkillFileHandlers,
    registerSkillShareHandlers,
    registerSkillDebugHandlers,
    registerSkillScheduleHandlers,
    registerSkillDocsHandlers,
    registerSkillAnalyticsHandlers,
    registerPermissionStoreHandlers,
    registerAuthModeHandlers,
    registerSkillCreatorHandlers,
    registerClaudeCliHandlers,
    registerChatEditHandlers,
    registerSkillChainHandlers, // ← 新規追加
    registerHistoryHandlers,
    registerApiKeyHandlers,
  ];

  for (const fn of expectedRegistrations) {
    expect(fn).toHaveBeenCalled();
  }
});
```

## 5. テスト実行方法

```bash
# 対象パッケージディレクトリから実行（P40 準拠）
cd apps/desktop

# Unit テスト
pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
pnpm vitest run src/main/ipc/__tests__/skillChainHandlers.test.ts

# カバレッジ付き
pnpm vitest run --coverage src/main/ipc/__tests__/skillChainHandlers.test.ts
```

## 6. カバレッジ目標

| ファイル                                        | Line | Branch | Function |
| ----------------------------------------------- | ---- | ------ | -------- |
| `ipc/index.ts` (registerAllIpcHandlers)         | 90%+ | 70%+   | 90%+     |
| `skillHandlers.ts` (registerSkillChainHandlers) | 90%+ | 70%+   | 90%+     |

## 7. テストファイル一覧

| ファイル                                    | 種別                            | 新規/既存    |
| ------------------------------------------- | ------------------------------- | ------------ |
| `__tests__/ipc-double-registration.test.ts` | Unit + Integration + Regression | 既存（修正） |
| `__tests__/skillChainHandlers.test.ts`      | Unit（P44 修正検証）            | 新規         |

## 8. テスト環境の注意事項

- happy-dom 環境で実行（P39: userEvent 使用禁止、fireEvent を使用）
- テスト間で状態共有しない（P9: beforeEach でリセット）
- モノレポ環境ではパッケージディレクトリから実行（P40 準拠）
