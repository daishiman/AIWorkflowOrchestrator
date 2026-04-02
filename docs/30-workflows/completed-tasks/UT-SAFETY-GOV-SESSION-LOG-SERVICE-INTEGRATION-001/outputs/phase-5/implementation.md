# Phase 5 成果物: 実装サマリ

## 実装ファイル

### 1. `apps/desktop/src/main/claude-cli/ipc-handler.ts`

追加内容（`let manager` 宣言の直後）:

```typescript
export function getClaudeCliManager(): ClaudeCliManager | null {
  return manager;
}
```

### 2. `apps/desktop/src/main/ipc/index.ts`

追加 import:

```typescript
import { getClaudeCliManager } from "../claude-cli/ipc-handler";
```

追加ヘルパー（`safeRegister` 関数の前）:

```typescript
function sessionNotFoundError(sessionId: string): Error {
  const err = new Error(`Session not found: ${sessionId}`);
  (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
  return err;
}
```

placeholder を実実装に差し替え:

- `getTerminalLog`: `mgr.getSession()` → `result.data.output` を返す
- `getCopyCommand`: `mgr.getSession()` → `["node", scriptPath, ...args].join(" ")` を返す
- manager null 時は graceful fallback（`[]` / `null`）

## TDD Green 確認

- ADV-16〜ADV-19 + ADV-20〜ADV-24 全 PASS ✓
- 既存 ADV-12〜ADV-15 も引き続き PASS ✓
- 型チェック (`tsc --noEmit`) PASS ✓
