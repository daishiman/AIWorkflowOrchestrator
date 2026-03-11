# Phase 4 テスト仕様

## 層別方針

- Component/Integration: `WorkspaceView.test.tsx`
- Hook: `useWorkspaceMentionQuery.test.ts`
- Utility: `workspaceFileSelection.test.ts`

## 優先リスク

1. stream lifecycle（chunk/end/error/cancel）
2. mention 補完の境界条件
3. context file attach の失敗時表示
4. 04A layout 既存挙動の回帰
