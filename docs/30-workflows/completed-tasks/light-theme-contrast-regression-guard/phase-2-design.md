# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 2                                                    |
| Phase名    | 設計                                                 |
| ステータス | completed                                            |
| 前提Phase  | Phase 1                                              |
| 後続Phase  | Phase 3                                              |

## 目的

screenshot matrix、hardcoded color audit、current/baseline evidence policy、future execution lane を実行可能な設計へ落とし込む。

> P50パターン該当: 検証・補完モード。既存 surface の drift を再現しやすい設計へ補正する。

## 実行タスク

- タスク1: screenshot matrix と capture contract を設計する
- タスク2: hardcoded color audit と baseline policy を設計する
- タスク3: future execution の lane 分離と phase handoff を設計する

### タスク1: screenshot matrix / capture contract

| TC-ID    | 画面                  | 取得方針                            | 重点観点                         |
| -------- | --------------------- | ----------------------------------- | -------------------------------- |
| TC-11-01 | Settings light        | selector-based capture + shell 補助 | card / selector / secondary text |
| TC-11-02 | Dashboard light       | representative panel capture        | surface hierarchy / border       |
| TC-11-03 | Auth light            | glass panel capture                 | primary CTA / helper text        |
| TC-11-04 | WorkspaceSearch light | panel / input / row capture         | hardcoded slate / zinc drift     |

### タスク2: audit / baseline policy

1. `rg` ベースの raw pattern と false positive 除外規則を定義する
2. current change と legacy baseline backlog を分離する
3. Phase 11 discovered-issues と Phase 12 unassigned-task-detection の接続条件を定義する

### タスク3: lane / handoff 設計

| Lane | 内容                                | 開始条件            |
| ---- | ----------------------------------- | ------------------- |
| A    | system spec / validator 整理        | 即時                |
| B    | screenshot matrix / checklist 設計  | Lane A 完了後       |
| C    | grep / audit / baseline policy 設計 | Lane B と並列可     |
| D    | future Codex implementation         | Phase 3 PASS 後のみ |

## 参照資料

| 参照資料                      | パス                                                                                       | 説明                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Phase 1 成果物                | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/` | requirements と screen 選定                  |
| token foundation design       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`         | token 契約の前提                             |
| shared color migration design | `docs/30-workflows/light-theme-shared-color-migration/phase-2-design.md`                   | file batch と screen 影響範囲                |
| Phase 11/12 guide             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                | screenshot / current build / evidence の正本 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| resource map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | UI実装 / テスト実装 / accessibility test の入口                       |
| quick reference            | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | selector capture / current build static serve / screenshot 昇格ルール |
| UI design system           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | token 契約との接点                                                    |
| UI design principles       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | light hierarchy / visual review 基準                                  |
| UI settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                       | Settings shell の確認軸                                               |
| UI forms                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                          | Auth 画面の確認軸                                                     |
| UI search panel            | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | WorkspaceSearchPanel の確認軸                                         |
| Accessibility testing      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | contrast / focus / helper text 観点                                   |
| Component testing patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | helper / validator / matrix 設計観点                                  |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | baseline/current 台帳連携                                             |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | current build capture / light contrast 教訓                           |
| testing-fixtures           | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                     | dedicated harness / fixture 設計                                      |
| State management           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | settings bypass / surface ownership 境界                              |
| Implementation patterns    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | review scope / dedicated harness パターン                             |

## 実行手順

### ステップ1: representative capture を設計する

1. Phase 1 の representative screens を TC-ID 化する
2. route 全景ではなく selector-based capture を正本にする
3. current build source pinning の preflight を Phase 11 入力として定義する

### ステップ2: audit policy を設計する

1. hardcoded color grep pattern を定義する
2. diff-from-current と baseline backlog の振り分け基準を定義する
3. false positive の除外条件と evidence 記録様式を決める

### ステップ3: lane と handoff を設計する

1. Lane B/C の並列条件を明文化する
2. Phase 3 review gate の確認項目を固める
3. Phase 4-13 へ引き継ぐ planned artifacts を登録する

## 並列化ポリシー

- Lane A は直列
- Lane B と Lane C は Phase 2 のみ並列可
- current/baseline 判定ルールは統合レビューで 1 つに収束させる

## 統合テスト連携

| 観点                   | 連携内容                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| Screenshot to testcase | Phase 4 と Phase 11 の TC-ID / evidence ID をここで固定する              |
| Audit to testcase      | grep pattern と expected failure / baseline fallback を test case 化する |
| Task bridge            | token foundation / shared migration を guard の入力契約として固定する    |

## 多角的チェック観点

| 観点             | 適用内容                                         | 仕様参照先                                                     |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| UI/UX            | representative screen が責務境界を表せるか       | `ui-ux-settings.md`, `ui-ux-forms.md`, `ui-ux-search-panel.md` |
| アクセシビリティ | contrast threshold、focus、helper text 可読性    | `testing-accessibility.md`, `ui-ux-design-principles.md`       |
| アーキテクチャ   | token task / migration task と guard task の分離 | dependency workflows, `arch-state-management.md`               |
| テスト戦略       | dedicated harness、fixture、coverage 拡張性      | `testing-fixtures.md`, `testing-component-patterns.md`         |

## 成果物

| 成果物            | パス                                                                                                           | 説明                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| screenshot-matrix | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/screenshot-matrix.md` | representative capture と TC-ID            |
| audit-spec        | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/audit-spec.md`        | grep pattern / exclusion / fail policy     |
| evidence-policy   | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/evidence-policy.md`   | current/baseline / discovered issue policy |
| subagent-plan     | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/subagent-plan.md`     | lane と handoff ルール                     |

## 完了条件

- [x] screenshot matrix が TC-ID と selector strategy 付きで定義されている
- [x] audit pattern / exclusion / baseline policy が定義されている
- [x] Lane B/C の並列条件と Phase 3 gate が明文化されている
- [x] future Codex implementation へ渡す入力が整理されている

## サブタスク管理

1. representative screen を TC-ID 化する
2. current build / selector / static serve ルールを取り込む
3. hardcoded color grep と baseline policy を設計する
4. lane / handoff / dependency を設計する
5. outputs / artifacts の planned path を登録する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase 3 が参照する設計成果物を確定
- [x] `artifacts.json` の Phase 2 登録を更新
- [x] Phase 4-13 が参照する current/baseline policy を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 2
```

## 次Phase

Phase 3: 設計レビュー
