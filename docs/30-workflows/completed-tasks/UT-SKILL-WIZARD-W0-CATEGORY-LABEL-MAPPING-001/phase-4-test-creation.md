# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| フェーズ   | Phase 4 - テスト作成                          |
| ステータス | completed                                     |
| タスク種別 | docs-only / NON_VISUAL                        |

## 目的

全カテゴリ網羅、戻り値整合、型安全性を検証するテスト観点を明文化する。

## 実行タスク

- TC-01 から TC-13 までのテスト観点を定義する。
- 5カテゴリ全部と `getSkillCategoryLabel` の整合確認を定義する。

## 参照資料

- `outputs/phase-4/test-spec.md`
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

## 統合テスト連携

Phase 11 のテスト結果は本仕様の TC 番号をそのまま使い、仕様と証跡を1対1で対応させる。

## 成果物

- `outputs/phase-4/test-spec.md`

## 完了条件

- [x] 全カテゴリ値に対するテストケースが定義されている
- [x] 関数戻り値と直接参照の整合確認が定義されている
- [x] エッジケースが分離されている
