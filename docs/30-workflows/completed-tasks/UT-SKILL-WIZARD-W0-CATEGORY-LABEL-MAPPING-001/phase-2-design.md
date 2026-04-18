# Phase 2: 設計

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| フェーズ   | Phase 2 - 設計                                |
| ステータス | completed                                     |
| タスク種別 | docs-only / NON_VISUAL                        |

## 目的

型安全なラベルマッピングと公開経路を、後続 UI がそのまま使える設計として記録する。

## 実行タスク

- `as const satisfies Record<SkillCategory, string>` を設計上の中核に固定する。
- `@repo/shared/types/skillCreator` からの利用を前提とした公開境界を定義する。

## 参照資料

- `outputs/phase-2/design.md`
- `packages/shared/src/types/skillCreator.ts`
- `phase-1-requirements.md`

## 統合テスト連携

Phase 6 で import 経路と型境界を再確認し、Phase 7 で設計要素ごとのカバレッジを追跡する。

## 成果物

- `outputs/phase-2/design.md`

## 完了条件

- [x] ラベル定数とヘルパー関数の責務境界が定義されている
- [x] サブパス公開の方針が定義されている
- [x] 型追加時の検出戦略が明記されている
