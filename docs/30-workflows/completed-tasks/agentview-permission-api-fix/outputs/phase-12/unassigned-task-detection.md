# 未タスク検出レポート

## サマリー

| ソース              | 件数 |
| ------------------- | ---- |
| Phase 3/10 レビュー | 1    |
| Phase 11 手動テスト | 1    |
| TODO/FIXME/HACK/XXX | 0    |
| 合計                | 2    |

## 検出タスク

1. **TASK-AGENT-PERM-MODE**: `AgentPermissionMode` 永続化と preload / IPC 対応
   - 本タスクのスコープ外として分離済み
   - preload に `getMode`/`setMode` IPC ハンドラを追加し、main process で永続化する必要がある
   - 優先度: low（現状は画面内 local state で動作しており、ユーザー体験に影響なし）
   - 指示書: `docs/30-workflows/unassigned-task/task-agent-perm-mode.md`

2. **TASK-AGENTVIEW-PHASE11-SCREENSHOT-RECAPTURE-001**: Phase 11 実画面証跡の再取得
   - `apps/desktop/src/renderer/phase11-agent-view.tsx` が旧 `window.electronAPI.permissions` 前提だったため、現行 contract とずれていた
   - worktree 環境では `esbuild` platform mismatch により Vite / Vitest 起動も blocked
   - 実 screenshot を current contract で再取得し、`manual-test-result.md` / `implementation-guide.md` へ反映する必要がある
   - 優先度: medium
   - 指示書: `docs/30-workflows/unassigned-task/task-agentview-phase11-screenshot-recapture-001.md`
