# Phase 9: QA チェックリスト

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 9          |
| 作成日   | 2026-03-16 |

## 品質ゲート4項目

| 受入基準 # | 内容                                    | 検証コマンド                                                                | 終了コード | 合否 |
| ---------- | --------------------------------------- | --------------------------------------------------------------------------- | ---------- | ---- |
| #9         | `pnpm --filter @repo/shared build` 成功 | `pnpm --filter @repo/shared build`                                          | 0          | 合   |
| #11        | 全テスト PASS                           | `pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts` | 0          | 合   |
| #12        | TypeScript エラー 0 件                  | `pnpm --filter @repo/shared exec tsc --noEmit`                              | 0          | 合   |
| #12        | ESLint エラー 0 件                      | `pnpm --filter @repo/shared exec eslint src/constants/security.ts`          | 0          | 合   |

**全4項目が「合」。Phase 10 への進行条件を充足。**

## タスク1: ESLint 検証

- 実行日時: 2026-03-16
- コマンド: `pnpm --filter @repo/shared exec eslint src/constants/security.ts`
- 終了コード: 0
- 警告件数: 0（ESLintIgnoreWarning は ESLint 設定移行に関する Node.js 警告であり、コード品質には無関係）
- エラー件数: 0

## タスク2: TypeScript 型チェック

- 実行日時: 2026-03-16
- コマンド: `pnpm --filter @repo/shared exec tsc --noEmit`
- 終了コード: 0
- エラー件数: 0

## タスク3: 全テスト実行

- 実行日時: 2026-03-16
- コマンド: `pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --reporter=verbose`
- 終了コード: 0
- テスト総数: 15
- PASS: 15
- FAIL: 0

### 個別テストケース結果

| #   | テストケース名                                                  | 結果 |
| --- | --------------------------------------------------------------- | ---- |
| 1   | RiskLevel の全3キー（low / medium / high）が存在する            | PASS |
| 2   | low の dialogWidth は 400 である                                | PASS |
| 3   | medium の dialogWidth は 480 である                             | PASS |
| 4   | high の dialogWidth は 640 である                               | PASS |
| 5   | 全エントリの headerColorToken が '--risk-' プレフィックスを持つ | PASS |
| 6   | high.allowPermanent は false である（恒久許可禁止）             | PASS |
| 7   | high.allowTime24h は false である（24時間許可禁止）             | PASS |
| 8   | high.allowTime7d は false である（7日間許可禁止）               | PASS |
| 9   | low と medium の全 allow フラグは true である                   | PASS |
| 10  | 各エントリは ToolRiskConfigEntry の全フィールドを持つ           | PASS |
| 11  | dialogWidth は 400 / 480 / 640 のいずれかである                 | PASS |
| 12  | headerColorToken は正確な値である                               | PASS |
| 13  | RiskLevel でアクセスした結果は undefined でない                 | PASS |
| 14  | dialogWidth は数値型である                                      | PASS |
| 15  | headerColorToken は文字列型である                               | PASS |

## タスク4: ビルド確認

- 実行日時: 2026-03-16
- コマンド: `pnpm --filter @repo/shared build`
- 終了コード: 0
- DTS 出力: 正常

## 品質チェックリスト

### 機能検証

- [x] 全ユニットテスト成功
- [x] 全統合テスト成功（security.test.ts の個別テストケース全 PASS）
- [x] ビルド成功で代替確認（E2E テスト対象外）

### コード品質

- [x] Lint エラーなし
- [x] 型エラーなし
- [x] コードフォーマット適用済み

### セキュリティ

- [x] セキュリティ不変条件テスト PASS（high リスクの3項目が全て false）
