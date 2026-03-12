# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 4                                                    |
| Phase名    | テスト作成                                           |
| ステータス | completed                                            |
| 前提Phase  | Phase 3 PASS / MINOR                                 |
| 後続Phase  | Phase 5                                              |

## 目的

guard を future execution で安全に実装するため、screenshot / audit / evidence policy を Red フェーズとして検証可能なテスト仕様へ落とし込む。

## 実行タスク

- タスク1: screenshot matrix validator のテストを設計する
- タスク2: hardcoded color audit と baseline policy のテストを設計する
- タスク3: Phase 11 checklist / Phase 12 evidence sync の検証ケースを設計する

## 参照資料

| 参照資料          | パス                                                                                        | 説明                                             |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Phase 2 設計      | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/phase-2-design.md` | screenshot / audit / evidence policy             |
| Phase 3 成果物    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-3/`  | review gate 結果                                 |
| Phase 11/12 guide | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | screenshot / coverage / discovered issues の正本 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                   |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | validator / helper のテスト基準        |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG 観点のテストケース                |
| testing-fixtures           | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`           | dedicated harness / fixture の設計基準 |
| testing-playwright-e2e     | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`     | screenshot と E2E の接点               |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage / TDD / quality gate          |

## 実行手順

### ステップ1: screenshot 系テストを設計する

1. Phase 2 の TC-ID をテストケースへ写す
2. selector-based capture、current build preflight、coverage validator の期待挙動を定義する
3. `manual-test-result.md` と `screenshot-coverage.md` の対応をテスト化する

### ステップ2: audit / baseline 系テストを設計する

1. hardcoded color pattern の hit / ignore を定義する
2. current fail と baseline backlog の振り分け条件を定義する
3. false positive / false negative の代表ケースを追加する

### ステップ3: documentation bridge のテストを設計する

1. discovered issues から unassigned-task-detection への handoff を確認する
2. Phase 12 で `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` / `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` を同期する条件を確認する
3. future execution の Red 完了条件を固める

## 統合テスト連携

| 観点                   | 連携内容                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| Screenshot to testcase | representative 4 画面と TC-ID を固定する                         |
| Audit to testcase      | grep pattern、baseline policy、false positive を testcase 化する |
| Documentation bridge   | Phase 11 / 12 に渡す evidence ID と update target を固定する     |

## 多角的チェック観点

| 観点             | 適用内容                                       | 仕様参照先                                                                                                                                   |
| ---------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | 画面責務が読める capture になっているか        | `ui-ux-design-principles.md`                                                                                                                 |
| アクセシビリティ | contrast / keyboard / helper text のテスト有無 | `testing-accessibility.md`                                                                                                                   |
| テスト戦略       | fixture / harness / validator 境界が明確か     | `testing-fixtures.md`, `testing-component-patterns.md`                                                                                       |
| 運用証跡         | discovered issues と Phase 12 の接続があるか   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物               | パス                                                                                                              | 説明                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| test-specification   | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-4/test-specification.md`   | Red フェーズの仕様           |
| guard-test-matrix    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-4/guard-test-matrix.md`    | TC-ID と drift coverage 一覧 |
| manual-review-checks | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-4/manual-review-checks.md` | Phase 11 / 12 bridge case    |

## 完了条件

- [x] screenshot / audit / checklist のテスト観点が定義されている
- [x] current/baseline 判定の検証観点がある
- [x] WCAG / evidence sync のケースが含まれている
- [x] Phase 5 が最小実装で着手できる

## サブタスク管理

1. Phase 2 / 3 の成果物を確認する
2. screenshot 系テストを設計する
3. audit / baseline 系テストを設計する
4. Phase 11 / 12 bridge を設計する
5. planned artifacts を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 4 登録を更新
- [x] future execution の Red 完了条件を記録

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 4
```

## 次Phase

Phase 5: 実装
