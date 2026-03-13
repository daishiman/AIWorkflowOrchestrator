# Phase 4 Output: Test Specification

## 実行結果

- ステータス: completed
- 方針: pure utility を先に赤緑化し、その後 UI surface と統合 state を追従させる
- 対象 concern: search resilience / preview resilience / error taxonomy / workflow sync evidence

## テスト対象

| concern               | テストファイル                                                                              | 検証内容                                                |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| search resilience     | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/quickFileSearchResilience.test.ts` | `score=0` 除外、stable sort、view state 分岐            |
| hook integration      | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts`  | `Cmd/Ctrl+P`、Arrow/Enter/Escape、top 10 制御           |
| search UI             | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx`          | dialog 表示、empty state、hover/click、keydown 委譲     |
| preview resilience    | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/previewResilience.test.ts`         | timeout 3回 retry、read failure detail、taxonomy helper |
| preview UI            | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx`             | structured fallback、transport alert、HTML sanitize     |
| crash recovery        | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx`     | render crash 捕捉と reset 復帰                          |
| workspace integration | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`                      | file read error / timeout の status bar 反映            |

## 実行コマンド

```bash
cd apps/desktop
pnpm exec vitest run \
  src/renderer/views/WorkspaceView/__tests__/quickFileSearchResilience.test.ts \
  src/renderer/views/WorkspaceView/__tests__/previewResilience.test.ts \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts \
  src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  --config vitest.config.ts \
  --maxWorkers 1
```

## 判定

- pure utility に寄せたため、search match gate と preview retry policy を UI から切り離して検証できる
- timeout / parse / crash / no-match の 4分類は unit と UI の両面でカバーした
- docs sync は Phase 12 の validator 群で別途実行し、Phase 4 では必要コマンドを固定した
