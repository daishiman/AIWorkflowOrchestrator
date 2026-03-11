# Phase 4 テスト仕様書

## 実装した test ファイル

| ファイル                        | 主対象                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `WorkspaceView.test.tsx`        | file selection, attach, open preview, read error, timeout/retry                  |
| `PreviewPanel.test.tsx`         | preview mode switch, HTML sanitize, structured fallback, image meta, wrap/editor |
| `PreviewErrorBoundary.test.tsx` | render crash + reset                                                             |
| `QuickFileSearch.test.tsx`      | dialog open, input change, highlight, submit, delegated keydown                  |
| `useQuickFileSearch.test.ts`    | top 10, exact/no match, stable sort, keyboard selection                          |
| `useFileWatcher.test.ts`        | watch guard, debounce, callback swap                                             |

## 実行コマンド

```bash
cd apps/desktop
pnpm vitest run \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts \
  src/renderer/views/WorkspaceView/hooks/useFileWatcher.test.ts
```

## Red → Green 方針

- 仕様拘束が弱かった timeout / false match / structured fallback を先にテストで固定した
- 04A 基盤に乗る挙動は `WorkspaceView.test.tsx` で integration として拘束した
