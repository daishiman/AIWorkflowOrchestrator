# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-F |
| Phase    | 12         |
| 作成日   | 2026-03-07 |

## 検出結果

**検出件数: 5件**

### 検出した未タスク一覧

| #   | タスクID                                          | 概要                                            | 優先度 | 指示書パス                                                                                                                           |
| --- | ------------------------------------------------- | ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION         | SkillEditor 残存直接IPC呼び出し6箇所のStore移行 | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md`         |
| 2   | UT-10A-F-STORE-MOCK-PATTERN-STANDARDIZATION-GUARD | Store mockテストパターン標準化ガード            | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-store-mock-pattern-standardization-guard.md` |
| 3   | UT-10A-F-IMPROVEMENT-RESULT-STORE-INTEGRATION     | improvementResult Store統合（条件付き）         | 低     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-improvement-result-store-integration.md`     |
| 4   | UT-10A-F-SCREENSHOT-HARNESS-HARDENING             | Screenshot Harness の待機条件標準化             | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-screenshot-harness-hardening.md`             |
| 5   | UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION         | 2workflow baseline 正規化自動化                 | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-2workflow-baseline-normalization.md`         |

## 検出方法

1. コード変更差分の確認: `useSkillAnalysis.ts` と `SkillCreateWizard.test.tsx`, `SkillAnalysisView.test.tsx` の変更内容を精査
2. `grep -rn "window.electronAPI" apps/desktop/src/renderer/components/skill/` で残存直接IPC呼び出し6箇所を検出（SkillEditor.tsx）
3. TASK-10A-F 苦戦箇所から再発防止タスク4件を抽出（Store mock標準化、improvementResult Store統合、screenshot harness hardening、2workflow baseline 正規化）

## 備考

- `SkillCreateWizard.tsx` は TASK-10A-C で既にStore経由に移行済みだったため、TASK-10A-Fでの修正は不要
- `useSkillAnalysis.ts` の `improvementResult` はStore化されていない（ローカルstate維持）。これは設計判断によるもの（Case B方式）であり、将来の画面間共有ニーズ発生時に UT-10A-F-IMPROVEMENT-RESULT-STORE-INTEGRATION として対応予定
- 未タスク 5件は Phase 12 完了確認後に `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/` へ移管し、親 workflow 配下で継続管理する
