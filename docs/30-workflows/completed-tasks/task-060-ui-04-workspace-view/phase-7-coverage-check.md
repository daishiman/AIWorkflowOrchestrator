# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 7                         |
| Phase名    | テストカバレッジ確認      |
| ステータス | completed                 |
| 前提Phase  | Phase 5, Phase 6          |
| 後続Phase  | Phase 8                   |

## 目的

親参照仕様が保持する requirement、child linkage、validator command が全件カバーされているかを確認する。

## 実行タスク

- タスク1: requirement coverage を確認する
- タスク2: child linkage coverage を確認する
- タスク3: validator coverage を確認する

### タスク1: requirement coverage

| 対象           | 目標 |
| -------------- | ---- |
| AC-1 から AC-6 | 100% |
| user policy    | 100% |
| Phase 1-3 gate | 100% |

### タスク2: child linkage coverage

| 対象                         | 目標 |
| ---------------------------- | ---- |
| 04A canonical path           | 100% |
| 04B canonical path           | 100% |
| 04C canonical path           | 100% |
| 04A block / 04B-04C parallel | 100% |

### タスク3: validator coverage

| command                    | 目標 |
| -------------------------- | ---- |
| `validate-phase-output.js` | PASS |
| `verify-all-specs.js`      | PASS |
| `rg` contract checks       | PASS |

## 参照資料

| 参照資料                  | パス                                                                                                  | 説明           |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 成果物            | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                    | 実装内容       |
| Phase 4 成果物            | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/`                    | test case      |
| Phase 6 成果物            | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/`                    | expanded tests |
| requirements traceability | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/requirements-traceability-matrix.md` | AC 対応表      |
| additional-test-cases     | `outputs/phase-6/additional-test-cases.md`                                                            | Phase 6 成果物 |
| cross-doc-audit-plan      | `outputs/phase-6/cross-doc-audit-plan.md`                                                             | Phase 6 成果物 |
| test-expansion-report     | `outputs/phase-6/test-expansion-report.md`                                                            | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                 | 内容             |
| --------------- | -------------------------------------------------------------------- | ---------------- |
| quick reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`  | 検索語の再確認   |
| task workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | child 状態の参照 |

## 実行手順

### ステップ1: requirement coverage を確認する

AC-1 から AC-6、user policy、Phase 1-3 gate が coverage 対象に入っているかを見る。

### ステップ2: child linkage coverage を確認する

04A / 04B / 04C の canonical path と block / parallel 契約が 100% 参照できるかを見る。

### ステップ3: validator coverage を確認する

`validate-phase-output.js`、`verify-all-specs.js`、grep contract check が gap なく再利用可能かを確認する。

## 統合テスト連携

| 観点                      | 連携内容                                        |
| ------------------------- | ----------------------------------------------- |
| coverage to refactor      | gap があれば Phase 6 か Phase 8 へ戻す          |
| coverage to QA            | PASS 結果を Phase 9 の入力にする                |
| coverage to documentation | Phase 12 で `spec_created` 同期の根拠として使う |

## 多角的チェック観点

| 観点                  | 適用判断 | 確認内容                                                      |
| --------------------- | -------- | ------------------------------------------------------------- |
| requirement coverage  | 適用     | AC と user policy の両方が欠落なく対応づくこと                |
| child linkage         | 適用     | 3 child と dependency 契約がすべてカバーされること            |
| validator coverage    | 適用     | 構造検証、全体整合、grep 監査の3系統が揃うこと                |
| documentation handoff | 適用     | Phase 12 へ渡す `spec_created` 根拠が coverage 側にも残ること |

## 成果物

| 成果物                | パス                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| coverage-report       | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/coverage-report.md`       |
| coverage-gap-analysis | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/coverage-gap-analysis.md` |

## 完了条件

- [ ] requirement coverage が確認されている
- [ ] child linkage coverage が確認されている
- [ ] validator coverage が確認されている
- [ ] gap の戻り先が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- requirement coverage 確認
- child linkage coverage 確認
- validator coverage 確認
- gap と戻り先の整理

## タスク100%実行確認【必須】

- [ ] AC-1 から AC-6 の coverage が 100% である
- [ ] 04A / 04B / 04C の path と依存順序が coverage 対象である
- [ ] validator 3系統が coverage 目標に入っている
- [ ] gap 発見時の戻り先が Phase 6 または Phase 8 として定義されている

## 次Phase

Phase 8: リファクタリング
