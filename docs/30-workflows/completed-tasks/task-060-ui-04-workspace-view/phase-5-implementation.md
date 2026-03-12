# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 5                         |
| Phase名    | 実装                      |
| ステータス | completed                 |
| 前提Phase  | Phase 4                   |
| 後続Phase  | Phase 6                   |

## 目的

親参照仕様に必要な文書群を更新し、pointer / index / canonical path / spec-only policy を workflow root に実装する。

## 実行タスク

- タスク1: workflow root 文書を更新する
- タスク2: parent pointer と master index の接続方針を実装する
- タスク3: canonical path normalization を実装する

### タスク1: workflow root 文書更新

| 対象             | 実装内容                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| `index.md`       | parent purpose、child canonical path、Phase 一覧を固定する                       |
| `phase-*.md`     | Phase 1-13 の spec-only 実行手順を固定する                                       |
| root ledger      | traceability、system spec extraction、skill compliance、child linkage を固定する |
| `artifacts.json` | docs task metadata と phase gate を固定する                                      |

### タスク2: parent pointer と master index 接続方針

- `task-060-ui-04-workspace-view.md` に parent workflow root の入口を追加する。
- `task-000-master-index.md` の Step 6-D で parent workflow root を参照できる状態にする。
- child workflow へのリンクは completed-tasks path を canonical とする。

### タスク3: canonical path normalization

| 対象             | 正規化内容                                                 |
| ---------------- | ---------------------------------------------------------- |
| parent spec      | completed-tasks path を正本にする                          |
| system spec 入口 | 04A / 04B / 04C の path drift を Phase 12 で同期対象にする |
| child linkage    | 3 child の status を parent が再実装せず参照だけにする     |

## 参照資料

| 参照資料               | パス                                                                                                                         | 説明               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 成果物         | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/`                                           | contract test 入力 |
| parent index           | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md`                                                   | 更新対象           |
| 親ポインタ原本         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md` | 接続先             |
| master index           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`         | 接続先             |
| test-case-matrix       | `outputs/phase-4/test-case-matrix.md`                                                                                        | Phase 4 成果物     |
| red-test-report        | `outputs/phase-4/red-test-report.md`                                                                                         | Phase 4 成果物     |
| validator-command-list | `outputs/phase-4/validator-command-list.md`                                                                                  | Phase 4 成果物     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                        |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------- |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child feature 記録先        |
| navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | `workspace` ViewType 参照先 |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | Phase 12 同期先             |

## 実行手順

### ステップ1: workflow root と phase 本文を更新する

`index.md`、`phase-*.md`、root ledger、`artifacts.json` を一貫した parent reference workflow として整える。

### ステップ2: pointer / master index / child canonical path の接続を固める

親ポインタと master index が child completed path を正本として辿れる設計に寄せる。

### ステップ3: 実装対象外を再確認する

Renderer / Main / Preload code を scope 外のまま維持し、docs-only 実装であることを記録する。

## 統合テスト連携

| 観点                          | 連携内容                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| implementation to test        | Phase 4 の command set を Phase 5 の更新後に即時実行する      |
| implementation to system spec | Phase 12 で同期する path と status を Phase 5 で確定する      |
| implementation to evidence    | Phase 11 で参照する child workflow path を Phase 5 で確定する |

## 多角的チェック観点

| 観点                | 適用判断 | 確認内容                                                                      |
| ------------------- | -------- | ----------------------------------------------------------------------------- |
| ドキュメント実装    | 適用     | workflow root / phase / matrix / artifacts が同じ責務境界で更新されていること |
| ナビ導線            | 適用     | 親ポインタが 04A / 04B / 04C へ送客できること                                 |
| aiworkflow 同期準備 | 適用     | Phase 12 で同期する path / status / lessons の素材がここで固定されていること  |
| 実装除外            | 適用     | コード変更を伴う child 実装へ踏み込んでいないこと                             |

## 成果物

| 成果物                       | パス                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| implementation-summary       | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/implementation-summary.md`       |
| pointer-doc-update-plan      | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/pointer-doc-update-plan.md`      |
| canonical-path-normalization | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/canonical-path-normalization.md` |

## 完了条件

- [ ] workflow root 文書が更新されている
- [ ] parent pointer と master index の接続方針が記録されている
- [ ] canonical path normalization が記録されている
- [ ] Renderer / Main / Preload code を scope 外に保っている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- workflow root 更新
- pointer / master index 接続整理
- child canonical path 正規化
- scope 外事項の明記

## タスク100%実行確認【必須】

- [ ] `index.md` / `phase-*.md` / ledger / `artifacts.json` の役割分担が明確である
- [ ] completed path を正本にする方針が本文へ反映されている
- [ ] 実装対象外の code change が混入していない
- [ ] Phase 6-12 に渡す path / evidence / sync 情報が揃っている

## 次Phase

Phase 6: テスト拡充
