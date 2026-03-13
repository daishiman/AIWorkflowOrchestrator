# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 4                                                    |
| Phase名    | テスト作成                                           |
| ステータス | completed                                            |

## 目的

実装前に 4 concern を testcase 化し、後続 phase の受け入れ条件を固定する。

## 実行内容

- search resilience を pure utility と hook の二層へ分けて testcase 化した
- preview resilience と error taxonomy を unit / component / integration へ分配した
- Phase 12 validator 群を docs validation command として固定した

## 実行タスク

- タスク1: search resilience の testcase を定義する
- タスク2: preview resilience / taxonomy の testcase を定義する
- タスク3: docs validation command を固定する

## 参照資料

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-2/resilience-guard-design.md`
- `outputs/phase-3/design-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

## 統合テスト連携

- unit / hook / component / integration の 4 層へ testcase を配置した
- Phase 12 validator は後続 phase の docs validation 入力へ接続した

## 成果物

| 成果物             | パス                                    |
| ------------------ | --------------------------------------- |
| test-specification | `outputs/phase-4/test-specification.md` |
| test-case-matrix   | `outputs/phase-4/test-case-matrix.md`   |

## 完了条件

- [x] search / preview / taxonomy / docs sync の 4 concern に testcase を紐付けた
- [x] 実装着手前に赤緑対象を明確化した
