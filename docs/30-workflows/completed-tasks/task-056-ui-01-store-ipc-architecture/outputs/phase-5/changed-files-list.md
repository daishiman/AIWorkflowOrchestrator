# Phase 5 成果物: 変更ファイル一覧

## Renderer

- `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
- `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/store/types.ts`
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`
- `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`
- `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`

## Preload

- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/preload/api/notification-api.ts`
- `apps/desktop/src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts`

## Main IPC

- `apps/desktop/src/main/ipc/notificationHandlers.ts`
- `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- `apps/desktop/src/main/ipc/sanitizeErrorMessage.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`
- `apps/desktop/src/main/ipc/__tests__/historySearchHandlers.test.ts`

## Shared

- `packages/shared/src/ipc/channels.ts`
- `packages/shared/src/types/history.ts`
- `packages/shared/src/types/index.ts`

## 備考

- 本一覧は `TASK-UI-01-STORE-IPC-ARCHITECTURE` に直接関係する変更のみを対象にしている。
