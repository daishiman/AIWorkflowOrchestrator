# Phase 4: テスト作成 (TDD Red)

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 4                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

TDD Red フェーズとして、実セッションログ取得を検証する統合テストを追加する。
新規テストは fail（Red）、既存 ADV-12〜ADV-15 は引き続き pass（Green）であることを確認する。

## テスト追加先ファイル

`apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts` に追記する。

## テストケース一覧

### ADV-16: `getTerminalLog` が実セッションの output を返す

```typescript
it("ADV-16: getTerminalLog が実 SessionManager output を返す", async () => {
  const mockOutput = ["line 1", "line 2", "sk-ant-SECRET should be redacted"];
  const mockManager = {
    getSession: vi.fn().mockResolvedValue({
      success: true,
      data: { output: mockOutput, scriptPath: "/path/to/skill.js", args: [] },
    }),
  };

  const deps: AdvancedConsoleHandlerDependencies = {
    mainWindow: mockMainWindow,
    getTerminalLog: async (sessionId) => {
      const result = await mockManager.getSession({ sessionId });
      if (!result.success || !result.data) throw new Error("SESSION_NOT_FOUND");
      return result.data.output;
    },
    getCopyCommand: async (_sessionId) => null,
  };

  registerAdvancedConsoleHandlers(deps);
  const result = await invokeHandler(EXECUTION_GET_TERMINAL_LOG, "session-123");

  expect(result.success).toBe(true);
  // sanitizeForApiKeys が適用され API キーが REDACTED になること
  expect(result.data).not.toContain("sk-ant-SECRET");
  expect(result.data.some((l: string) => l.includes("[REDACTED]"))).toBe(true);
});
```

### ADV-17: `getCopyCommand` が実 launch command（`node` + scriptPath + args）を返す

```typescript
it("ADV-17: getCopyCommand が実 launch command を返す", async () => {
  const deps: AdvancedConsoleHandlerDependencies = {
    mainWindow: mockMainWindow,
    getTerminalLog: async (_sessionId) => [],
    getCopyCommand: async (sessionId) => {
      if (sessionId !== "session-abc") throw new Error("SESSION_NOT_FOUND");
      return "node /path/to/skill.js --flag value";
    },
  };

  registerAdvancedConsoleHandlers(deps);
  const result = await invokeHandler(EXECUTION_GET_COPY_COMMAND, "session-abc");

  expect(result.success).toBe(true);
  expect(result.data).toBe("node /path/to/skill.js --flag value");
});
```

### ADV-18: セッション未存在時に内部 `SESSION_NOT_FOUND` を handler error code へ変換する

```typescript
it("ADV-18: セッション未存在時に TERMINAL_LOG_ERROR エラーコードを返す", async () => {
  const deps: AdvancedConsoleHandlerDependencies = {
    mainWindow: mockMainWindow,
    getTerminalLog: async (_sessionId) => {
      const err = new Error("SESSION_NOT_FOUND");
      (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
      throw err;
    },
    getCopyCommand: async (_sessionId) => null,
  };

  registerAdvancedConsoleHandlers(deps);
  const result = await invokeHandler(
    EXECUTION_GET_TERMINAL_LOG,
    "nonexistent-session",
  );

  expect(result.success).toBe(false);
  expect(result.error.code).toBe("TERMINAL_LOG_ERROR");
});
```

### ADV-19: `getClaudeCliManager()` が登録後に非 null を返す

```typescript
// claude-cli/ipc-handler.ts の getClaudeCliManager() 単体テスト
// ファイル: apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts に追加
it("ADV-19: registerClaudeCliHandlers 後に getClaudeCliManager() が非 null を返す", () => {
  const mockWindow = {
    webContents: { send: vi.fn() },
  } as unknown as BrowserWindow;
  registerClaudeCliHandlers(mockWindow);
  expect(getClaudeCliManager()).not.toBeNull();
  unregisterClaudeCliHandlers();
  expect(getClaudeCliManager()).toBeNull();
});
```

## 実行確認コマンド

```bash
# TDD Red 確認（新規テストが fail であること）
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts

# 既存テストが引き続き pass であること
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/
```

## 期待する TDD Red 結果

| テスト                   | 期待状態                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| ADV-12 〜 ADV-15（既存） | PASS（影響なし）                                                                |
| ADV-16                   | FAIL（getTerminalLog が [] を返すため）                                         |
| ADV-17                   | FAIL（getCopyCommand が null を返すため）                                       |
| ADV-18                   | FAIL（内部 `SESSION_NOT_FOUND` から外向き handler error code への変換が未実装） |
| ADV-19                   | FAIL（getClaudeCliManager がエクスポートされていないため）                      |

## 完了条件チェックリスト

- [ ] ADV-16 のテストが作成されている
- [ ] ADV-17 のテストが作成されている
- [ ] ADV-18 のテストが作成されている
- [ ] ADV-19 のテストが作成されている
- [ ] 新規テスト 4 件が TDD Red（fail）であることを確認した
- [ ] 既存 ADV-12〜ADV-15 テストが引き続き pass であることを確認した
- [ ] `outputs/phase-4/test-plan.md` に成果物が出力されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- ADV-16 〜 ADV-19 の Red ケースを固定する。
- `advancedConsoleIpc.test.ts` の期待値を `getTerminalLog` / `getCopyCommand` に合わせる。

## 参照資料

- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `outputs/phase-4/test-plan.md`

## 成果物/実行手順

- `outputs/phase-4/test-plan.md`
- `pnpm --filter @repo/desktop test -- --reporter=verbose apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `pnpm --filter @repo/desktop test -- --reporter=verbose apps/desktop/src/main/ipc/__tests__/`

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`
