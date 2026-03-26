# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 4                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 3                           |
| 後続Phase | Phase 5                           |

## 目的

mainline entry、advanced route、warning summary、Task06 境界の観点を test matrix に落とし込む。

## 実行タスク

- create primary route の正常系テストを設計する
- advanced / secondary route の非主導線性テストを設計する
- provenance / degrade warning の表示粒度テストを設計する
- Task06 境界の回帰テストを設計する

## 参照資料

| 資料名                 | パス                                                                                                    | 説明                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件           | `phase-1-requirements.md`                                                                               | AC-1〜AC-7           |
| Phase 2 設計           | `phase-2-design.md`                                                                                     | route / warning 設計 |
| Phase 2 境界マトリクス | `outputs/phase-2/mainline-boundary-matrix.md`                                                           | surface matrix       |
| Phase 3 gate           | `outputs/phase-3/design-review-gate.md`                                                                 | review 結果          |
| Task03 budget matrix   | `../step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-2/budget-degrade-matrix.md` | warning trigger 種別 |

## 実行手順

### ステップ1: mainline 正常系を定義する

- `SkillCenter` の header CTA と journey CTA から `skillCreate` へ到達するケースを定義する。
- `SkillCreateWizard` close が `skillCenter` へ戻るケースを定義する。

### ステップ2: secondary route の回帰を定義する

- advanced route から `SkillManagementPanel` / `SkillLifecyclePanel` を開いても primary route の説明が揺れないことを定義する。
- `onOpenWizard` が advanced route 内の escape hatch であり、一次入口ではないことを定義する。

### ステップ3: warning summary を定義する

- `source_conflict` / `structure_mismatch` の summary 表示可否を設計する。
- raw root list を mainline に出さないことを negative case に含める。

### ステップ4: downstream boundary を定義する

- verify / improve CTA や結果 surface は Task06 管轄であり、Task05 テストに混在させない。
- `viewHistory` / `currentSkillName` は既存 store contract を再利用し、新規 owner を作らないことを確認する。

## 統合テスト連携

- `SkillCenterView.cta.test.tsx`
- `useSkillCenter.navigation.test.ts`
- `SkillCreateWizard.test.tsx`
- `SkillCreateWizard.store-integration.test.tsx`
- `SkillLifecyclePanel.test.tsx`
- `SkillManagementPanel.integration.test.tsx`
- `App.renderView.viewtype.test.tsx`
- `skillLifecycleJourney.test.ts`

## 成果物

| 成果物       | パス                             | 内容              |
| ------------ | -------------------------------- | ----------------- |
| テスト設計書 | `phase-4-test-creation.md`       | テスト設計本文    |
| test matrix  | `outputs/phase-4/test-matrix.md` | suite / case 一覧 |

## 完了条件

- [ ] create primary route の正常系が定義されている
- [ ] advanced route の非主導線性が定義されている
- [ ] warning summary の表示粒度が定義されている
- [ ] Task06 境界の回帰観点が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
