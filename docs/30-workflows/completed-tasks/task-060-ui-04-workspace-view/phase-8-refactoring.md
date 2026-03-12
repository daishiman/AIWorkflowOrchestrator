# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW                   |
| Phase      | 8                                           |
| Phase名    | リファクタリング                            |
| ステータス | completed                                   |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase  | Phase 9                                     |

## 目的

親参照仕様の用語、path 表記、重複説明を整理し、child workflow 参照の読みやすさを上げる。

## 実行タスク

- タスク1: 用語を正規化する
- タスク2: path 表記を正規化する
- タスク3: 重複説明を整理する

### タスク1: 用語正規化

| 用語             | 正本           |
| ---------------- | -------------- |
| parent task      | 親参照仕様     |
| child workflow   | child workflow |
| canonical path   | canonical path |
| spec_only status | spec_created   |

### タスク2: path 表記正規化

- completed-tasks path を正本にする。
- `task-060-ui-04-workspace-view.md` は parent pointer 原本として表記する。
- `phase-11-manual-test.md` への child 入口は completed workflow root を使う。

### タスク3: 重複説明整理

| 対象                       | 方針                  |
| -------------------------- | --------------------- |
| 04A / 04B / 04C の実装詳細 | child workflow へ送る |
| parent の同期ルール        | Phase 12 に集約する   |
| parent の evidence ルール  | Phase 11 に集約する   |

## 参照資料

| 参照資料                     | パス                                                                                               | 説明                |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                 | requirements        |
| Phase 2 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                 | design              |
| Phase 5 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                 | 実装内容            |
| Phase 6 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/`                 | expanded tests      |
| Phase 7 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/`                 | coverage result     |
| child linkage matrix         | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md` | canonical path 台帳 |
| implementation-summary       | `outputs/phase-5/implementation-summary.md`                                                        | Phase 5 成果物      |
| pointer-doc-update-plan      | `outputs/phase-5/pointer-doc-update-plan.md`                                                       | Phase 5 成果物      |
| canonical-path-normalization | `outputs/phase-5/canonical-path-normalization.md`                                                  | Phase 5 成果物      |
| coverage-report              | `outputs/phase-7/coverage-report.md`                                                               | Phase 7 成果物      |
| coverage-gap-analysis        | `outputs/phase-7/coverage-gap-analysis.md`                                                         | Phase 7 成果物      |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                   |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------- |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child 名称の正本       |
| navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | `workspace` 名称の正本 |

## 実行手順

### ステップ1: 文書構造の重複を整理する

parent / child で重複する説明や stale path を削り、親は参照仕様に寄せる。

### ステップ2: traceability と compliance の読みやすさを上げる

matrix、index、phase 本文の役割重複を減らし、監査導線を短くする。

### ステップ3: Phase 9 へ渡す QA 対象を固定する

refactor 後に validator / traceability / aiworkflow 抽出根拠が読める状態にする。

## 統合テスト連携

| 観点                      | 連携内容                                           |
| ------------------------- | -------------------------------------------------- |
| refactor to validator     | 用語整理後に Phase 4-7 の command set を再実行する |
| refactor to documentation | Phase 12 で同じ用語を system spec へ使う           |
| refactor to manual test   | Phase 11 の evidence log 名称と揃える              |

## 多角的チェック観点

| 観点          | 適用判断 | 確認内容                                        |
| ------------- | -------- | ----------------------------------------------- |
| 重複削減      | 適用     | 親が child 詳細を重ね書きしていないこと         |
| 可読性        | 適用     | index / matrix / phase の責務が分かれていること |
| path 正規化   | 適用     | completed path へ正規化され続けていること       |
| Phase 12 準備 | 適用     | sync 時に迷う表現ゆれを先に是正していること     |

## 成果物

| 成果物                    | パス                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| refactoring-report        | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/refactoring-report.md`        |
| terminology-normalization | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/terminology-normalization.md` |

## 完了条件

- [ ] 用語が正規化されている
- [ ] path 表記が正規化されている
- [ ] 重複説明が整理されている
- [ ] validator 再実行の方針が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- 重複説明の整理
- traceability / compliance 導線の整理
- path 表現ゆれの是正
- Phase 9 入力の固定

## タスク100%実行確認【必須】

- [ ] 親が child の実装詳細を再記述していない
- [ ] index / matrix / phase の役割が衝突していない
- [ ] canonical path の表記が completed path に揃っている
- [ ] Phase 9 に渡す QA 対象が明示されている

## 次Phase

Phase 9: 品質保証
