# Phase 11: 手動テスト

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 11                                |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 10                          |
| 後続Phase | Phase 12                          |

## 目的

仕様書とコードアンカーを人手で追い、
「どこから始めればよいか」が primary route として読めるかを確認する。

## 実行タスク

- create mainline の walkthrough を行う
- advanced route の位置づけ walkthrough を行う
- warning summary の読みやすさ walkthrough を行う
- Task06 境界の読みやすさ walkthrough を行う

## 参照資料

| 資料名                 | パス                                                                              | 説明                     |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Phase 2 matrix         | `outputs/phase-2/mainline-boundary-matrix.md`                                     | walkthrough の判定軸     |
| Phase 4 matrix         | `outputs/phase-4/test-matrix.md`                                                  | manual review 観点       |
| Phase 5 implementation | `phase-5-implementation.md`                                                       | 実装対象の読み合わせ     |
| Phase 6 test expansion | `phase-6-test-expansion.md`                                                       | edge case の読み合わせ   |
| Phase 7 coverage       | `phase-7-coverage-check.md`                                                       | coverage の読み合わせ    |
| Phase 8 refactoring    | `phase-8-refactoring.md`                                                          | wording 統一の読み合わせ |
| Phase 9 QA             | `phase-9-quality-assurance.md`                                                    | QA 判定の読み合わせ      |
| App shell              | `../../../../apps/desktop/src/renderer/App.tsx`                                   | shell route anchor       |
| SkillCenter            | `../../../../apps/desktop/src/renderer/views/SkillCenterView/index.tsx`           | primary entry anchor     |
| advanced panel         | `../../../../apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | secondary route anchor   |

## 実行手順

### ステップ1: primary route walkthrough

- `SkillCenter` の CTA から create が始まることを追う。
- `SkillCreateWizard` が destination surface であることを確認する。

### ステップ2: advanced route walkthrough

- `SkillManagementPanel` / `SkillLifecyclePanel` が advanced route として読めるか確認する。
- advanced route が通常入口の代替に見えないか確認する。

### ステップ3: warning walkthrough

- mainline に出す warning が summary であることを確認する。
- raw diagnostics を mainline へ持ち込まない方針が読めるか確認する。

### ステップ4: boundary walkthrough

- verify / improve / re-entry は Task06 側責務として分離されているか確認する。
- governance / handoff hardening は Task07 側責務として分離されているか確認する。

## 統合テスト連携

- Phase 11 は screenshot capture ではなく walkthrough 判定を主体にする。
- 実装 wave で UI capture が必要になった場合はこの checklist を screenshot case の親にする。

## 成果物

| 成果物          | パス                                        | 内容                 |
| --------------- | ------------------------------------------- | -------------------- |
| 手動テスト計画  | `phase-11-manual-test.md`                   | walkthrough 手順     |
| checklist       | `outputs/phase-11/manual-test-checklist.md` | 実施済み checklist   |
| result          | `outputs/phase-11/manual-test-result.md`    | walkthrough 実施記録 |
| screenshot plan | `outputs/phase-11/screenshot-plan.json`     | capture 要否         |

## 完了条件

- [ ] primary route walkthrough 項目が定義されている
- [ ] advanced route walkthrough 項目が定義されている
- [ ] warning summary walkthrough 項目が定義されている
- [ ] Task06 / Task07 境界 walkthrough 項目が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
