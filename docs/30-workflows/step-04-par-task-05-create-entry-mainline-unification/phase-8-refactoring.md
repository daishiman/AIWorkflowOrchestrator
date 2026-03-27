# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 8                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 7                           |
| 後続Phase | Phase 9                           |

## 目的

mainline / secondary / advanced の命名と説明を整理し、
route の役割重複や UI copy drift を減らす。

## 実行タスク

- mainline / secondary / advanced の用語統一
- `skillCenter` / `skillCreate` / `SkillLifecyclePanel` の役割表現統一
- warning summary / diagnostics の用語統一
- close / back / handoff copy の統一

## 参照資料

| 資料名                 | パス                                                                    | 説明                        |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------- |
| Phase 1 requirements   | `phase-1-requirements.md`                                               | 用語の受入基準              |
| Phase 5 implementation | `phase-5-implementation.md`                                             | 実装対象と wording drift    |
| Phase 6 test expansion | `phase-6-test-expansion.md`                                             | edge case 由来の copy drift |
| Phase 2 matrix         | `outputs/phase-2/mainline-boundary-matrix.md`                           | 用語の正本                  |
| Phase 7 coverage       | `phase-7-coverage-check.md`                                             | coverage 抜け漏れ           |
| UI navigation spec     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | UI wording の正本           |

## 実行手順

- create 導線に対して「入口」「destination」「advanced route」の語彙を固定する。
- `skill-center` ではなく canonical `skillCenter` を使う。
- `SkillLifecyclePanel` を「主導線」ではなく「secondary/advanced route」と表現する。
- provenance 表示は `summary` / `diagnostics` の 2 層語彙で揃える。

## 統合テスト連携

- copy や `data-testid` が route 分類と一致することを Phase 9 review で確認する。
- skill lifecycle wording が `skillLifecycleJourney.ts` と一致することを test review 観点に含める。

## 成果物

| 成果物               | パス                     | 内容                           |
| -------------------- | ------------------------ | ------------------------------ |
| リファクタリング方針 | `phase-8-refactoring.md` | 命名整理と copy drift 防止方針 |

## 完了条件

- [ ] mainline / secondary / advanced の用語が統一されている
- [ ] `SkillCreateWizard` / `SkillLifecyclePanel` / `SkillManagementPanel` の役割表現が統一されている
- [ ] warning summary / diagnostics の語彙が統一されている
- [ ] **本Phase内の全タスクを100%実行完了**
