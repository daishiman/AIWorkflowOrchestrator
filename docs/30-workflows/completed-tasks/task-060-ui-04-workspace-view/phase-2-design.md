# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 2                         |
| Phase名    | 設計                      |
| ステータス | completed                 |
| 前提Phase  | Phase 1                   |
| 後続Phase  | Phase 3                   |

## 目的

親参照仕様の構造、child workflow へのリンク契約、Atent Team lane、spec-only validator 戦略を設計する。

## 実行タスク

- タスク1: parent-child responsibility matrix を設計する
- タスク2: 依存順序と並列 lane を設計する
- タスク3: canonical path normalization と Phase 12 sync matrix を設計する
- タスク4: spec-only validator 戦略を設計する

### タスク1: parent-child responsibility matrix

| 領域 | parent が持つ内容                      | child が持つ内容                              |
| ---- | -------------------------------------- | --------------------------------------------- |
| 04A  | block 関係、canonical path、入口説明   | layout / file browser / watcher 実装          |
| 04B  | 並列開始条件、canonical path、入口説明 | chat / mention / stream / conversation 実装   |
| 04C  | 並列開始条件、canonical path、入口説明 | preview / quick search / timeout / retry 実装 |

### タスク2: 依存順序と並列 lane

| lane   | 内容                                  | 依存            |
| ------ | ------------------------------------- | --------------- |
| Lane A | parent scope と system spec 抽出      | なし            |
| Lane B | canonical path と child linkage       | Lane A          |
| Lane C | validator / traceability / compliance | Lane B と並列   |
| Lane D | future execution lane                 | Phase 3 PASS 後 |

### タスク3: canonical path normalization と Phase 12 sync matrix

| 同期対象                 | parent が保持する内容                                         |
| ------------------------ | ------------------------------------------------------------- |
| pointer doc              | parent は child の正式入口であること                          |
| master index             | 04A → 04B / 04C → 060 の順序説明                              |
| task-workflow            | parent spec_created、child canonical path、関連未タスクの入口 |
| ui-ux-feature-components | 04A / 04B / 04C の completed path を canonical とする方針     |
| lessons-learned          | path drift と evidence 継承の再発防止                         |

### タスク4: spec-only validator 戦略

- Phase 4 は link / dependency / path の contract test を作る。
- Phase 5 は pointer / index / ledger の文書更新を実装として扱う。
- Phase 11 は新規 UI 撮影を行わず、child screenshot evidence 継承の可否を確認する。
- Phase 12 は `spec_created` 親タスクとして system spec へ同期する。

## 参照資料

| 参照資料                | パス                                                                                               | 説明               |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                 | requirements 入力  |
| 04A workflow            | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md`         | layout child 実体  |
| 04B workflow            | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`                 | chat child 実体    |
| 04C workflow            | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md`        | preview child 実体 |
| child linkage matrix    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md` | parent-child 台帳  |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                                       | Phase 1 成果物     |
| scope-boundary          | `outputs/phase-1/scope-boundary.md`                                                                | Phase 1 成果物     |
| acceptance-criteria     | `outputs/phase-1/acceptance-criteria.md`                                                           | Phase 1 成果物     |
| system-spec-entrypoints | `outputs/phase-1/system-spec-entrypoints.md`                                                       | Phase 1 成果物     |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                                    |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child feature 正本                      |
| navigation            | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | `workspace` ViewType 契約               |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | 04A / 04B / 04C ownership               |
| api ipc system        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`           | watch / read 再利用契約                 |
| security electron ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | watch cleanup / preview / chat security |

## 実行手順

### ステップ1: 親子責務行列を設計する

04A / 04B / 04C の責務境界を parent reference / child implementation に分離する。

### ステップ2: 並列 lane と phase gate を設計する

Lane A-B-C の依存順序と、Phase 3 PASS 前に後続へ進まない条件を設計する。

### ステップ3: Phase 11 / 12 の運用設計を固める

evidence inheritance、`spec_created`、canonical path sync、validator 実行順を設計へ埋め込む。

## 統合テスト連携

| 観点                | 連携内容                                                                      |
| ------------------- | ----------------------------------------------------------------------------- |
| contract test input | Phase 4 で pointer doc、master index、child canonical path を検証対象にする   |
| path drift guard    | Phase 6-9 で current path と completed path の揺れを再確認する                |
| documentation sync  | Phase 12 で task-workflow と feature-components の両方へ parent policy を渡す |

## 多角的チェック観点

| 観点            | 適用判断 | 確認内容                                                                                     |
| --------------- | -------- | -------------------------------------------------------------------------------------------- |
| UI/UX           | 適用     | `workspace` ViewType と Quick Search 契約を parent で壊していないこと                        |
| アーキテクチャ  | 適用     | 親が pointer / dependency / sync policy に限定されていること                                 |
| 状態管理        | 適用     | `workspaceSlice` / `fileSelectionSlice` / local state の ownership を child へ残していること |
| 品質 / 再利用性 | 適用     | validator / traceability / child evidence 継承の再利用導線があること                         |

## 成果物

| 成果物                             | パス                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| parent-child-responsibility-matrix | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/parent-child-responsibility-matrix.md` |
| execution-lane-design              | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/execution-lane-design.md`              |
| sync-matrix                        | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/sync-matrix.md`                        |
| validator-strategy                 | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/validator-strategy.md`                 |

## 完了条件

- [ ] parent-child responsibility matrix が定義されている
- [ ] 依存順序と並列 lane が定義されている
- [ ] canonical path normalization と Phase 12 sync matrix が定義されている
- [ ] spec-only validator 戦略が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- responsibility matrix の確定
- lane / dependency / block 契約の確定
- Phase 11 / 12 sync matrix の確定
- validator strategy と戻り先の明記

## タスク100%実行確認【必須】

- [ ] タスク1-4 の設計結果が個別成果物へ割り当てられている
- [ ] 04A block、04B / 04C parallel の設計が一貫している
- [ ] child canonical path が completed path で固定されている
- [ ] Phase 3 へ渡すレビュー観点が揃っている

## 次Phase

Phase 3: 設計レビュー
