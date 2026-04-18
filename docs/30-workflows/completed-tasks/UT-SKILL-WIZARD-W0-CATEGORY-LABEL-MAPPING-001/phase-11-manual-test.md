# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| フェーズ   | Phase 11 - 手動テスト                         |
| ステータス | completed                                     |
| タスク種別 | docs-only / NON_VISUAL                        |

## 目的

NON_VISUAL の docs-only タスクとして、既存テスト結果と仕様整合で手動確認相当の証跡を残す。

## 実行タスク

- `manual-test-checklist.md` を作成し、確認観点を固定する。
- `manual-test-result.md` と `discovered-issues.md` を作成し、NON_VISUAL の根拠を残す。

## 参照資料

- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`
- `phase-8-refactoring.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `outputs/phase-11/test-report.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

## 統合テスト連携

TC-01 から TC-13 の自動テスト結果と current facts 確認を束ね、手動確認相当の証跡として扱う。

## 成果物

- `outputs/phase-11/test-report.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

## 完了条件

- [x] NON_VISUAL 判定が `index.md` と `artifacts.json` で一致している
- [x] manual test 補助成果物3件が存在する
- [x] discovered issues が0件で記録されている
