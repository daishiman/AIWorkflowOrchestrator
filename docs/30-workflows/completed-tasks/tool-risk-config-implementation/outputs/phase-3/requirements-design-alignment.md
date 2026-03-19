# Phase 3: 要件-設計整合性レビュー

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 3          |
| 作成日   | 2026-03-16 |

## 受入基準12項目と Phase 2 設計の対応確認

| #   | 受入基準                                                          | Phase 2 設計での対応                                                                            | 判定               |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| 1   | `TOOL_RISK_CONFIG` が `Record<RiskLevel, ToolRiskConfigEntry>` 型 | implementation-design.md で `Record<RiskLevel, ToolRiskConfigEntry>` 型アノテーションを設計済み | 整合               |
| 2   | `RiskLevel` 型が export されている                                | type-design.md で `export type RiskLevel` を設計済み                                            | 整合               |
| 3   | `ToolRiskConfigEntry` interface が export                         | type-design.md で `export interface ToolRiskConfigEntry` を設計済み                             | 整合               |
| 4   | dialogWidth: low=400 / medium=480 / high=640                      | implementation-design.md で確定値を設計済み                                                     | 整合               |
| 5   | headerColorToken: CSS変数名形式                                   | implementation-design.md で `--risk-low/medium/high` を設計済み                                 | 整合               |
| 6   | `allowPermanent`: high のみ false                                 | implementation-design.md で `high.allowPermanent: false` を設計済み                             | 整合               |
| 7   | `allowTime24h`/`allowTime7d`: high のみ false                     | implementation-design.md で `high.allowTime24h: false`, `high.allowTime7d: false` を設計済み    | 整合               |
| 8   | JSDoc コメント付与                                                | type-design.md で全フィールドに JSDoc を設計済み                                                | 整合               |
| 9   | `pnpm --filter @repo/shared build` 成功                           | 実装後に検証（Phase 5, 9）                                                                      | 該当なし（実装後） |
| 10  | テストファイル追加                                                | test-design.md で15件のテストケースを設計済み                                                   | 整合               |
| 11  | 全テスト PASS                                                     | 実装後に検証（Phase 5, 9）                                                                      | 該当なし（実装後） |
| 12  | TypeScript/ESLint エラー 0 件                                     | 実装後に検証（Phase 9）                                                                         | 該当なし（実装後） |

## 不整合項目

なし。設計段階で検証可能な全8項目（#1-8, #10）が整合している。
