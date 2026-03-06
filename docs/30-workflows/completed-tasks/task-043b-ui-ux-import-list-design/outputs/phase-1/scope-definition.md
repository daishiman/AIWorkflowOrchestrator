# Phase 1 スコープ定義

## 対象

- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`
- `apps/desktop/scripts/capture-task-043b-ui-ux-import-list-design-screenshots.mjs`

## 非対象

- `skill:list` / `skill:getImported` / `skill:import` の IPC 契約変更
- Store slice の追加
- `SkillAnalysisView` / `SkillCreateWizard` / `SkillEditor` 自体の仕様変更
- Main / Preload / shared 型の公開 I/F 変更

## 依存境界

| 依存先       | 境界                                           |
| ------------ | ---------------------------------------------- |
| TASK-10A-E-A | 既存 `skill:*` 契約の再利用に限定              |
| TASK-10A-E-C | `agentSlice` の selector / action 契約を前提化 |
| TASK-10A-D   | `currentView` の統合済み導線を維持             |

## 完了定義

- 実装、テスト、スクリーンショット、Phase 1〜12 outputs が揃っている
- `artifacts.json` と `outputs/artifacts.json` が同期している
- 新規未タスクが 0 件、または 0 件である理由が記録されている
