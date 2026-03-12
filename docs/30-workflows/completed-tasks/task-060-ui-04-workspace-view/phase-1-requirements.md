# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 1                         |
| Phase名    | 要件定義                  |
| ステータス | completed                 |
| 前提Phase  | なし                      |
| 後続Phase  | Phase 2                   |

## 目的

親参照仕様としての `task-060` が何を持ち、何を child workflow へ委譲するかを requirements として固定する。

## 実行タスク

- タスク1: parent scope を固定する
- タスク2: child workflow canonical path を固定する
- タスク3: 受入基準と user policy を固定する
- タスク4: system spec 抽出入口を固定する

### タスク1: parent scope 固定

| 項目             | 内容                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| 親が持つ責務     | pointer、依存順序、canonical path、system spec sync policy、Phase 11 evidence 継承 |
| 親が持たない責務 | 04A / 04B / 04C の UI 実装、IPC 実装、テスト実装                                   |

### タスク2: child workflow canonical path 固定

| child task                    | canonical path                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| TASK-UI-04A-WORKSPACE-LAYOUT  | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`  |
| TASK-UI-04B-WORKSPACE-CHAT    | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/`          |
| TASK-UI-04C-WORKSPACE-PREVIEW | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` |

### タスク3: 受入基準と user policy 固定

- Phase 1-3 が完了するまで後続 Phase を開始しない。
- commit と PR はユーザー承認待ちにする。
- 並列実行は 04A 完了後の 04B / 04C だけに限定する。
- 親 task は spec-only として扱い、実装変更を scope 外に置く。

### タスク4: system spec 抽出入口 固定

| 種別              | 正本                                            |
| ----------------- | ----------------------------------------------- |
| 入口              | `resource-map.md`, `quick-reference.md`         |
| workspace feature | `ui-ux-feature-components.md`                   |
| navigation        | `ui-ux-navigation.md`                           |
| state             | `arch-state-management.md`                      |
| IPC / security    | `api-ipc-system.md`, `security-electron-ipc.md` |
| completion ledger | `task-workflow.md`, `lessons-learned.md`        |

## 参照資料

| 参照資料       | パス                                                                                                                         | 説明                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 親ポインタ原本 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md` | parent の現在役割          |
| 実行順序正本   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`         | 04A / 04B / 04C の依存順序 |
| 04A 原本       | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md`          | layout child scope         |
| 04B 原本       | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059a-ui-04b-workspace-chat-panel.md`                  | chat child scope           |
| 04C 原本       | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md`         | preview child scope        |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                       |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------- |
| resource map       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 読む順番の入口             |
| quick reference    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`             | Workspace 系検索語         |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 04A / 04B / 04C の責務記録 |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | child 完了台帳             |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | current build capture 教訓 |

## 実行手順

### ステップ1: 親責務と除外責務を固定する

parent が保持する責務と child へ委譲する責務を分け、scope drift を防ぐ。

### ステップ2: child canonical path と依存順序を固定する

04A / 04B / 04C の completed path を正本として列挙し、04A block と 04B / 04C 並列開始条件を明文化する。

### ステップ3: aiworkflow 抽出入口と user policy を固定する

`resource-map.md` / `quick-reference.md` を起点に必要仕様を特定し、Phase 1-3 先行・commit/PR 禁止を requirement として確定する。

## 統合テスト連携

| 観点                 | 連携内容                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| child dependency     | 04A を 04B / 04C の前提として固定し、Phase 4 の contract test に渡す      |
| evidence inheritance | Phase 11 で child workflow の screenshot evidence を継承確認する          |
| system spec sync     | Phase 12 で parent spec_created と canonical path を task-workflow へ渡す |

## 多角的チェック観点

| 観点                  | 適用判断     | 確認内容                                                                        |
| --------------------- | ------------ | ------------------------------------------------------------------------------- |
| UI/UX                 | 適用         | `workspace` 親仕様が 04A / 04B / 04C の UI責務を再定義していないこと            |
| アーキテクチャ        | 適用         | parent-child、Renderer / Main / Preload の責務境界が混線していないこと          |
| IPC / セキュリティ    | 条件付き適用 | child が既に持つ `file:watch-*` / `file:read` / stream 契約を参照のみで扱うこと |
| 品質 / フェーズゲート | 適用         | Phase 1-3 先行、review gate、Phase 11/12 方針が要件に入っていること             |

## 成果物

| 成果物                  | パス                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| requirements-definition | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/requirements-definition.md` |
| scope-boundary          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/scope-boundary.md`          |
| acceptance-criteria     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/acceptance-criteria.md`     |
| system-spec-entrypoints | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/system-spec-entrypoints.md` |

## 完了条件

- [ ] 親責務と child 責務が分離されている
- [ ] child workflow canonical path が確定している
- [ ] user policy と受入基準が列挙されている
- [ ] system spec 抽出入口が列挙されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- parent scope / child scope の切り分け確認
- child canonical path と block / parallel 契約の記録
- aiworkflow 参照入口の特定
- 完了条件の再確認と成果物配置

## タスク100%実行確認【必須】

- [ ] タスク1-4 の記述が本文へ反映されている
- [ ] `outputs/phase-1/` に出力すべき成果物が定義されている
- [ ] Phase 2 へ渡す dependency / path / policy 入力が揃っている
- [ ] 親仕様が実装責務を持たないことを確認した

## 次Phase

Phase 2: 設計
