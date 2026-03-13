# Phase 1 関心ごと分離レーン定義

## Lane A: Contract

- 担当: shared core、CLI 引数、JSON schema、exit code
- 対象: `phase11-current-build-preflight-core.mjs`, `phase11-current-build-preflight.mjs`
- 非対象: capture metadata、system spec 更新

## Lane B: Capture

- 担当: capture script 統合、metadata、package script、Phase 11 実行導線
- 対象: `capture-light-theme-contrast-regression-guard-phase11.mjs`, `apps/desktop/package.json`
- 非対象: UI remediation、未タスク監査ロジック本体

## Lane C: Docs

- 担当: workflow outputs、Phase 12 system spec sync、unassigned/current-baseline 監査
- 対象: `docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/outputs/*`, `.claude/skills/**`
- 非対象: preflight 判定の実コード

## 実行メモ

- 本タスクでは実 SubAgent ツールは無いため、上記 3 レーンを独立 concern として並列確認・順次統合する。
