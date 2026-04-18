# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| フェーズ   | Phase 1 - 要件定義                            |
| ステータス | completed                                     |
| タスク種別 | docs-only / NON_VISUAL                        |

## 目的

実装済みの `SkillCategory` 表示ラベル機能について、要求・受け入れ条件・依存関係を canonical に固定する。

## 実行タスク

- 実装済みコードとテストを読み、対象機能を要求に引き戻す。
- `SkillCategory` の5値と日本語ラベルの対応を受け入れ条件へ落とす。

## 参照資料

- `outputs/phase-1/requirements.md`
- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

## 統合テスト連携

Phase 4 のテスト仕様と Phase 11 の結果が、ここで定義した受け入れ条件を直接検証する。

## 成果物

- `outputs/phase-1/requirements.md`

## 完了条件

- [x] `SkillCategory` の5値が要求として固定されている
- [x] `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel` の責務が分離されている
- [x] 依存タスク `UT-SKILL-WIZARD-W0-seq-01` が明記されている
