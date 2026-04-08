# Phase 7: カバレッジ計画

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 7

## 計測対象（変更ブロック限定）

### 対象1: `apps/desktop/src/preload/skill-creator-api.ts`

**対象ブロック**: `onApprovalRequest` 実装（行 692〜708）

```typescript
// TASK-SDK-07: approval:request push 購読
onApprovalRequest: (
  callback: (payload: { ... }) => void,
): (() => void) =>
  safeOn<{ ... }>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

**目標**: line 100% / branch 100%

### 対象2: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**対象ブロック**:

1. `useEffect` 購読ブロック（行 708〜719）
2. `handleApprove` / `handleReject`（行 1103〜1124）
3. `ApprovalSheet` 条件レンダリング（行 1757〜1770）

**目標**: line 90%以上 / branch 80%以上

## 実行コマンド

```bash
cd apps/desktop && CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm vitest run --coverage \
  --coverage.include="src/preload/skill-creator-api.ts" \
  --coverage.include="src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  src/preload/__tests__/skill-creator-api.approval.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx
```

## ツール実行結果（全体）

v8 カバレッジプロバイダによる計測結果（ファイル全体）:

```
File               | % Stmts | % Branch | % Funcs | % Lines
skill-creator-api.ts |  25.56  |   80.00  |   6.97  |  25.56
SkillLifecyclePanel.tsx | 34.57 |  21.21  |  16.27  |  34.57
```

※ 全体数値が低いのはファイル全体に含まれる他機能（plan/execute/improve など）が
　テスト対象外のため。変更ブロック限定の手動分析は `uncovered-analysis-plan.md` 参照。
