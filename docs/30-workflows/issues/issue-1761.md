# [#1761] [TASK-AGENTVIEW-PHASE11-SCREENSHOT-RECAPTURE-001] AgentView Phase 11 実画面証跡の再取得

## メタ情報

```yaml
issue_number: 1761
title: [TASK-AGENTVIEW-PHASE11-SCREENSHOT-RECAPTURE-001] AgentView Phase 11 実画面証跡の再取得
state: OPEN
priority: 中
scale: 小規模
category: testing
status: 未実施
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1761
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

AgentView の Phase 11 手動テスト証跡（スクリーンショット）を現行 preload 契約で再取得する。

## 背景

`apps/desktop/src/renderer/phase11-agent-view.tsx` が旧 `window.electronAPI.permissions` 前提だったため、
現行 contract（`window.permissionAPI`）とずれていた。
worktree 環境では esbuild platform mismatch により Vite / Vitest 起動も blocked していた。
agentview-permission-api-fix 完了後の現行 contract で実 screenshot を再取得する必要がある。

## 実装方針

- 現行 `window.permissionAPI` 対応の状態で AgentView を起動
- Phase 11 の手動テストチェックリストを再実行
- `manual-test-result.md` / `implementation-guide.md` へスクリーンショット証跡を反映

## 優先度

中

発見元: `docs/30-workflows/agentview-permission-api-fix` Phase 12 unassigned-task-detection（2026-03-30）
