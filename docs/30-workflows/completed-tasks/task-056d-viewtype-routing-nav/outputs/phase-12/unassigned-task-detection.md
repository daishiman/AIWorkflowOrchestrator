# Phase 12 未タスク検出

## 検出結果

- 検出ソース（Phase 11/12成果物・再撮影実行ログ・system spec 同期差分）を精査し、運用ガード2件を未タスク化した
- 追加した未タスク:
  - `UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001`
  - `docs/30-workflows/completed-tasks/task-imp-task-056d-phase11-screenshot-capture-path-guard-001.md`
  - `UT-IMP-TASK-056D-SYSTEM-SPEC-SYNC-CARD-GUARD-001`
  - `docs/30-workflows/completed-tasks/task-imp-task-056d-system-spec-sync-card-guard-001.md`
- フォーマット/配置検証:
  - `audit --target-file`: `currentViolations=0`
  - 配置先: `docs/30-workflows/unassigned-task/`（要件準拠）
- 検証コマンド:
  - `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
  - `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/task-imp-task-056d-phase11-screenshot-capture-path-guard-001.md`
  - `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/task-imp-task-056d-system-spec-sync-card-guard-001.md`
  - `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`

## 検出した課題（要約）

1. スクリーンショット再撮影スクリプトが固定出力先（`task-056`）に依存し、`task-056d` へ手動コピーが必要になる。
2. `--strictPort` 起動時に `Port 5177 is already in use` が発生すると、preflight記録がないまま再検証が進みやすい。
3. system spec 4仕様書（task/lessons/ui-ux/state）で「実装内容 + 苦戦箇所 + 5分解決カード」の同値同期が手作業で、転記漏れが再発しやすい。
