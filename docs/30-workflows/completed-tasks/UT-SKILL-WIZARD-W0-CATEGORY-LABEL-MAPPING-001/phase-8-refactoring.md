# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| フェーズ   | Phase 8 - リファクタリング                    |
| ステータス | completed                                     |
| タスク種別 | docs-only / NON_VISUAL                        |

## 目的

重複の少ないラベル定義と、後続 UI が読みやすい公開形に整理されていることを確認する。

## 実行タスク

- `Before / After / 理由` の観点で重複排除を整理する。
- 代表的な改善点を current facts として固定する。

## 参照資料

- `outputs/phase-8/refactoring.md`
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`
- `packages/shared/src/types/skillCreator.ts`

## 統合テスト連携

リファクタリング後も Phase 11 の結果が維持されることを確認する。

## 成果物

- `outputs/phase-8/refactoring.md`

## 完了条件

- [x] Before / After / 理由 が記録されている
- [x] 冗長な公開経路が削減されている
- [x] 仕様とのズレが増えていない
