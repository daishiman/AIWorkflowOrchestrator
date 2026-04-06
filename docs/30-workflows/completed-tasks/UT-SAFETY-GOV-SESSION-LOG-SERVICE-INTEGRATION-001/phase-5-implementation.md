# Phase 5: 実装 (TDD Green)

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 5                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

Phase 2 の設計に従い、ADV-16〜ADV-19 の TDD Red テストをすべて Green にする最小限の実装を行う。

## 実装タスク

### T-5-1: `claude-cli/ipc-handler.ts` に `getClaudeCliManager()` を追加

**ファイル**: `apps/desktop/src/main/claude-cli/ipc-handler.ts`

既存の `let manager: ClaudeCliManager | null = null;` 行の直後、
または `registerClaudeCliHandlers` 関数の前に以下を追加する:

```typescript
/** Main プロセス内の他モジュールが ClaudeCliManager へアクセスするためのゲッター。
 *  registerClaudeCliHandlers() 呼び出し前は null を返す。
 */
export function getClaudeCliManager(): ClaudeCliManager | null {
  return manager;
}
```

また `unregisterClaudeCliHandlers()` 内で `manager = null` がすでに行われていることを確認する。

---

### T-5-2: `ipc/index.ts` の placeholder を実実装に差し替え

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

**Step 1**: ファイル先頭の import セクションに追加:

```typescript
import { getClaudeCliManager } from "../claude-cli/ipc-handler";
```

**Step 2**: `registerAdvancedConsoleHandlers` 呼び出し箇所（920〜929 行）を以下に差し替え:

```typescript
track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: async (sessionId: string) => {
      const mgr = getClaudeCliManager();
      if (!mgr) return [];
      const result = await mgr.getSession({ sessionId });
      if (!result.success || !result.data) {
        const err = new Error(`Session not found: ${sessionId}`);
        (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
        throw err;
      }
      return result.data.output;
    },
    getCopyCommand: async (sessionId: string) => {
      const mgr = getClaudeCliManager();
      if (!mgr) return null;
      const result = await mgr.getSession({ sessionId });
      if (!result.success || !result.data) {
        const err = new Error(`Session not found: ${sessionId}`);
        (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
        throw err;
      }
      const { scriptPath, args } = result.data;
      // TODO: スペースを含むパス/引数のエスケープは将来タスクで対応
      return ["node", scriptPath, ...args].join(" ");
    },
  }),
);
```

旧 `TODO(DI)` コメントは削除する。

---

## TDD Green 確認コマンド

```bash
# ADV-16〜ADV-19 が pass に変わることを確認
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts

# 全テスト（ADV-12〜ADV-19）が pass であることを確認
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/
```

## 完了条件チェックリスト

- [ ] `getClaudeCliManager()` が `claude-cli/ipc-handler.ts` にエクスポートされている
- [ ] `ipc/index.ts` の placeholder callback が実実装に差し替えられている
- [ ] `TODO(DI)` コメントが削除されている
- [ ] ADV-16〜ADV-19 の TDD Green（pass）を確認した
- [ ] ADV-12〜ADV-15（既存）も引き続き pass であることを確認した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- `getClaudeCliManager()` を追加する。
- `ipc/index.ts` の placeholder を callback 実装へ差し替える。

## 参照資料

- `phase-2-design.md`
- `phase-4-test-creation.md`
- `apps/desktop/src/main/claude-cli/ipc-handler.ts`
- `apps/desktop/src/main/ipc/index.ts`

## 成果物/実行手順

- 2 ファイルの最小差分を実装する。
- 変更後に Phase 4 のテストを再実行する。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`
