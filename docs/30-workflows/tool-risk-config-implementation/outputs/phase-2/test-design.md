# Phase 2: テスト設計書

## メタ情報

| 項目                 | 内容                                             |
| -------------------- | ------------------------------------------------ |
| タスクID             | UT-06-001                                        |
| Phase                | 2                                                |
| 作成日               | 2026-03-16                                       |
| テストフレームワーク | Vitest                                           |
| テストファイル       | `packages/shared/src/constants/security.test.ts` |

## 1. テストケース一覧（Phase 4 Red状態: 9件）

| #   | describe ブロック         | テストケース名                                       | 検証内容                              | 対応受入基準 |
| --- | ------------------------- | ---------------------------------------------------- | ------------------------------------- | ------------ |
| 1   | キー網羅性                | RiskLevel の全3キー（low / medium / high）が存在する | `Object.keys` で3件、各キーの存在確認 | #1           |
| 2   | dialogWidth 値検証        | low の dialogWidth は 400 である                     | `toBe(400)`                           | #4           |
| 3   | dialogWidth 値検証        | medium の dialogWidth は 480 である                  | `toBe(480)`                           | #4           |
| 4   | dialogWidth 値検証        | high の dialogWidth は 640 である                    | `toBe(640)`                           | #4           |
| 5   | headerColorToken 形式検証 | 全エントリが `--risk-` プレフィックスを持つ          | `/^--risk-/` 正規表現マッチ           | #5           |
| 6   | セキュリティ不変条件      | high.allowPermanent は false である                  | `toBe(false)`                         | #6           |
| 7   | セキュリティ不変条件      | high.allowTime24h は false である                    | `toBe(false)`                         | #7           |
| 8   | セキュリティ不変条件      | high.allowTime7d は false である                     | `toBe(false)`                         | #7           |
| 9   | low/medium 許可フラグ     | low と medium の全 allow フラグは true である        | 6フラグ（2エントリ x 3フラグ）確認    | #6, #7       |

## 2. 補完テストケース（Phase 6: 6件追加、合計15件）

| #   | describe ブロック    | テストケース名                                  | 検証内容                            |
| --- | -------------------- | ----------------------------------------------- | ----------------------------------- |
| 10  | 定数の不変性         | 各エントリは全5フィールドを持つ                 | `toHaveProperty` で全フィールド確認 |
| 11  | 定数の不変性         | dialogWidth は 400/480/640 のいずれかである     | 許容値リストとの照合                |
| 12  | 定数の不変性         | headerColorToken は正確な値である               | 各レベルの値を個別確認              |
| 13  | インデックスアクセス | RiskLevel でアクセスした結果は undefined でない | `toBeDefined()`                     |
| 14  | インデックスアクセス | dialogWidth は数値型である                      | `typeof === "number"`               |
| 15  | インデックスアクセス | headerColorToken は文字列型である               | `typeof === "string"`               |

## 3. カバレッジ計画

| 指標              | 目標 | 根拠                                        |
| ----------------- | ---- | ------------------------------------------- |
| Line Coverage     | 80%+ | `.claude/rules/02-code-quality.md` 最低基準 |
| Branch Coverage   | 60%+ | `.claude/rules/02-code-quality.md` 最低基準 |
| Function Coverage | 80%+ | `.claude/rules/02-code-quality.md` 最低基準 |

注意: `security.ts` 全体のカバレッジには既存関数（`isDangerousCommand` 等）が含まれる。`TOOL_RISK_CONFIG` は定数であるため、テストからのアクセスで関連行は100%カバーされる。

## 4. テスト間の状態共有

- テスト間で状態を共有しない（P9 対策）
- `TOOL_RISK_CONFIG` は定数のため、`beforeEach` でのリセットは不要
- 各テストは独立して実行可能
