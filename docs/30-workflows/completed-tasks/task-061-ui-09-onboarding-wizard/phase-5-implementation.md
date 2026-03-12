# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 5 |
| Phase名 | 実装 |
| ステータス | completed |
| 前提Phase | Phase 4 |
| 後続Phase | Phase 6 |

## 目的

overlay shell、wizard local state、store persistence、theme action、skill import handoff、settings rerun を実装する。

## 実行タスク

- タスク1: `App.tsx` に onboarding gate を組み込む
- タスク2: wizard local component 群を実装する
- タスク3: persistence、display name fallback、settings rerun を接続する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 要件 |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計 |
| Phase 4 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-4/` | test spec |
| App shell | `apps/desktop/src/renderer/App.tsx` | gate 組み込み先 |
| settings slice | `apps/desktop/src/renderer/store/slices/settingsSlice.ts` | name と theme |
| store handler | `apps/desktop/src/main/ipc/storeHandlers.ts` | completed flag |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| shared / view-local 境界 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | component の配置方針 |
| navigation contract | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | `dashboard` / `settings` 契約 |
| state management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | local state と selector 方針 |
| IPC security | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | preload 再利用 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| implementation to test | Phase 4 の testcase ID と file change を 1 対 1 で紐づける |
| dashboard handoff | complete / skip 後の `dashboard` 表示を Phase 6 と Phase 11 へ渡す |
| settings handoff | rerun action を Phase 6 と Phase 11 で再確認する |

## 成果物

| 成果物 | パス |
| --- | --- |
| implementation-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/implementation-plan.md` |
| file-change-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/file-change-plan.md` |
| implementation-summary | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/implementation-summary.md` |

## 完了条件

- [x] onboarding gate が shell に統合されている
- [x] wizard local component 群が実装されている
- [x] persistence、display name fallback、settings rerun が接続されている

## 次Phase

Phase 6: テスト拡充
