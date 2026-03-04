# Phase 12 未タスク検出レポート

## 実行結果

- 本タスク差分に対する新規未タスク検出: 4件
- `verify-unassigned-links`: `ALL_LINKS_EXIST`（existing=92, missing=0）
- `audit-unassigned-tasks --json --diff-from HEAD`: `currentViolations=0, baselineViolations=92`（baselineは既存負債）

## 判定根拠

- 実装差分（Main/Store/UI Hook）の追跡項目は既存仕様書へ反映済み。
- Phase 10/11 で検出された MINOR 指摘に加え、Phase 12 再確認で判明した運用課題を未タスク化した。
- 全体監査の baseline 違反は既存負債であり、今回差分の `current` には違反を作っていない。

## 検出した未タスク

| タスクID                                                     | 内容                                                                              | 配置先                                                                                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001               | 検証スクリプト実体探索を Phase 12 冒頭で必須化するガード                          | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-script-path-discovery-guard-001.md`               |
| UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001                     | Phase 12 テスト再確認の `vitest run` 固定（非watch）ガード                        | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-vitest-run-mode-guard-001.md`                     |
| UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001     | Phase 12 UI証跡再取得コマンドを `screenshot:*` で公開し実行経路を統一するガード   | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-screenshot-command-registration-guard-001.md`     |
| UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001 | capture script の遷移待機（`domcontentloaded` 基準 + 補助待機）を標準化するガード | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-capture-script-navigation-stability-guard-001.md` |
