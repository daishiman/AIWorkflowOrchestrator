# Phase 1: 受入基準一覧と検証方法

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 1          |
| 作成日   | 2026-03-16 |
| Issue    | #1251      |

## Issue #1251 受入基準12項目

| #   | 受入基準                                                                                            | 検証方法                               | 検証Phase            |
| --- | --------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------- |
| 1   | `TOOL_RISK_CONFIG` が `Record<RiskLevel, ToolRiskConfigEntry>` 型で定義されている                   | コードレビュー + TypeScript 型チェック | Phase 5, 9           |
| 2   | `RiskLevel` 型（`"low" \| "medium" \| "high"`）が export されている                                 | コードレビュー + TypeScript 型チェック | Phase 5, 9           |
| 3   | `ToolRiskConfigEntry` interface が export されている                                                | コードレビュー + TypeScript 型チェック | Phase 5, 9           |
| 4   | dialogWidth が low:400 / medium:480 / high:640 に設定されている                                     | 自動テスト（security.test.ts）         | Phase 4, 5           |
| 5   | headerColorToken が CSS変数名形式（`--risk-low` / `--risk-medium` / `--risk-high`）で設定されている | 自動テスト（security.test.ts）         | Phase 4, 5           |
| 6   | `allowPermanent` が high のみ `false` になっている                                                  | 自動テスト（security.test.ts）         | Phase 4, 5           |
| 7   | `allowTime24h` / `allowTime7d` が high のみ `false` になっている                                    | 自動テスト（security.test.ts）         | Phase 4, 5           |
| 8   | JSDoc コメントが各フィールドに付与されている                                                        | コードレビュー（目視確認）             | Phase 8, 10          |
| 9   | `pnpm --filter @repo/shared build` が通ること                                                       | ビルド確認（自動）                     | Phase 5, 9, 11       |
| 10  | `packages/shared/src/constants/security.test.ts` に単体テストが追加されていること                   | ファイル存在確認                       | Phase 4              |
| 11  | 全テストが PASS すること                                                                            | 自動テスト実行                         | Phase 5, 6, 7, 9, 11 |
| 12  | TypeScript 型エラー・ESLint エラーが 0 件                                                           | TypeCheck + ESLint                     | Phase 9, 11          |

## 検証方法の分類

| 検証方法              | 項目数 | 対象受入基準   |
| --------------------- | ------ | -------------- |
| 自動テスト            | 4件    | #4, #5, #6, #7 |
| TypeScript 型チェック | 3件    | #1, #2, #3     |
| ビルド確認            | 1件    | #9             |
| コードレビュー        | 1件    | #8             |
| ファイル存在確認      | 1件    | #10            |
| 自動テスト実行        | 1件    | #11            |
| TypeCheck + ESLint    | 1件    | #12            |

## 検証可能性の評価

全12項目は自動テスト・ビルドコマンド・コードレビューにより検証可能である。検証不可能な項目は存在しない。
