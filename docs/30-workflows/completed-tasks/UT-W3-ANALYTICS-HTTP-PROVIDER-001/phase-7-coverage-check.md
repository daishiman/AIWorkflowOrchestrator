# Phase 7: テストカバレッジ確認 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 7                                                       |
| Phase名    | テストカバレッジ確認                                    |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル   | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| 前提Phase  | Phase 6: テスト拡充                                     |
| 次Phase    | Phase 8: リファクタリング                               |
| ステータス | pending                                                 |
| 作成日     | 2026-04-14                                              |

## 目的

Phase 5〜6 で実装・拡充したテスト群に対してカバレッジを計測し、
受入基準に定めた数値目標（85% 以上）を達成していることを定量的に確認する。
未達の場合はギャップ箇所を特定して補完計画を立案する。

## カバレッジ目標

| 対象ファイル                                                        | 目標         | 計測観点                         |
| ------------------------------------------------------------------- | ------------ | -------------------------------- |
| `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | **90% 以上** | 行・分岐・関数                   |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`（変更箇所）         | **85% 以上** | 行・分岐（追加実装部分のみ集計） |
| 全体統合（上記 2 ファイルの合算）                                   | **85% 以上** | ステートメントカバレッジ         |

> **注意**: カバレッジ数値だけでなく、受入基準 AC-1〜AC-6 への対応表（concern coverage）を併せて確認すること。

## 実行タスク

### Task 7-1: カバレッジレポート生成

以下のコマンドを実行してカバレッジレポートを生成する。

```bash
# desktopパッケージ限定でカバレッジ計測
pnpm --filter @repo/desktop test --coverage

# または vitest 直接実行
pnpm vitest run --coverage --reporter=verbose
```

生成されたレポートから以下の値を `outputs/phase-7/coverage-report.md` に転記する。

| 計測対象ファイル         | Statements | Branches | Functions | Lines |
| ------------------------ | ---------- | -------- | --------- | ----- |
| AnalyticsHttpProvider.ts | ?%         | ?%       | ?%        | ?%    |
| analyticsHandler.ts      | ?%         | ?%       | ?%        | ?%    |
| 合計（weighted avg）     | ?%         | ?%       | ?%        | ?%    |

### Task 7-2: 未カバー箇所の分析

カバレッジレポートで未カバー（赤表示）となった行・分岐を一覧化し、
各箇所について以下の観点で分析する。

| 未カバー箇所     | ファイル                 | 行番号 | 原因分類 | 対処方針 |
| ---------------- | ------------------------ | ------ | -------- | -------- |
| （計測後に記入） | AnalyticsHttpProvider.ts | -      | -        | -        |
| （計測後に記入） | analyticsHandler.ts      | -      | -        | -        |

**原因分類の定義**:

| 分類       | 説明                                                       |
| ---------- | ---------------------------------------------------------- |
| テスト漏れ | テストケースが存在しない経路。Phase 6 での追加を検討する   |
| 到達不能   | 実装上到達不能なデッドコード。リファクタ候補として記録する |
| 意図的除外 | ログ出力・デバッグコード等、テストで検証不要と判断した箇所 |

### Task 7-3: カバレッジ目標達成の確認

受入基準 AC-1〜AC-6 と各テストケース（TC-01〜TC-17）の対応表を作成し、
すべての受入基準がカバーされていることを確認する。

| 受入基準 | 内容                                                 | 対応テストケース                  | カバー状況 |
| -------- | ---------------------------------------------------- | --------------------------------- | ---------- |
| AC-1     | `ANALYTICS_ENDPOINT_URL` 設定時にHTTP送信される      | TC-01, TC-10, TC-11, TC-12, TC-13 | -          |
| AC-2     | 送信失敗時に `success: false` が返る                 | TC-04, TC-15                      | -          |
| AC-3     | リトライが最大 3 回実行される                        | TC-05, TC-13, TC-14, TC-15        | -          |
| AC-4     | `sentCount` / `failedCount` が正確に記録される       | TC-06, TC-16, TC-17               | -          |
| AC-5     | `ANALYTICS_ENDPOINT_URL` 未設定時は no-op で動作する | TC-07, TC-08                      | -          |
| AC-6     | `AnalyticsHttpProvider.test.ts` がテスト green       | 全 TC                             | -          |

## カバレッジ計測コマンド

```bash
# 方法 1: pnpm filter 経由（推奨）
pnpm --filter @repo/desktop test --coverage

# 方法 2: vitest 直接実行
pnpm vitest run --coverage

# 方法 3: カバレッジHTMLレポート出力（ブラウザ確認用）
pnpm vitest run --coverage --reporter=html

# 方法 4: 特定ファイルのみカバレッジ計測
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts" \
  --coverage.include="apps/desktop/src/main/ipc/analyticsHandler.ts"
```

> カバレッジ設定は `apps/desktop/vitest.config.ts` の `coverage` セクションを参照すること。

## 参照資料

| 資料名                | パス                                                                | 説明                   |
| --------------------- | ------------------------------------------------------------------- | ---------------------- |
| メインタスク仕様      | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001.md`            | 受入基準・背景         |
| テスト仕様書          | `outputs/phase-4/test-specification.md`                             | Phase 4 成果物         |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                         | Phase 5 成果物         |
| 拡張テストケース一覧  | `outputs/phase-6/expanded-test-cases.md`                            | Phase 6 成果物         |
| テスト実行結果        | `outputs/phase-6/expanded-test-result.md`                           | Phase 6 成果物         |
| カバレッジ速報        | `outputs/phase-6/coverage-quick-report.md`                          | Phase 6 成果物（速報） |
| AnalyticsHttpProvider | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | 計測対象ファイル       |
| analyticsHandler      | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | 計測対象ファイル       |
| vitest 設定           | `apps/desktop/vitest.config.ts`                                     | カバレッジ設定         |

## 実行手順

1. Phase 6 の成果物（`outputs/phase-6/`）を確認し、全テストが PASS していることを前提とする
2. `pnpm --filter @repo/desktop test --coverage` を実行する
3. 生成されたカバレッジレポートから対象 2 ファイルの数値を読み取る
4. Task 7-1 のカバレッジ計測表を埋める
5. 未カバー箇所を Task 7-2 の表に記録し、原因分類と対処方針を記入する
6. Task 7-3 の受入基準対応表を完成させ、カバー状況を「済」/「未」で記入する
7. **目標未達の場合**: 補完テストケースを Phase 6 の追加タスクとして記録し、Phase 6 に差し戻す
8. **目標達成の場合**: 結果を `outputs/phase-7/coverage-report.md` に保存して Phase 8 へ進む

## 成果物

| 成果物                   | パス                                                  | 説明                           |
| ------------------------ | ----------------------------------------------------- | ------------------------------ |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`                  | 計測値・目標比較・判定結果     |
| 未カバー箇所分析         | `outputs/phase-7/uncovered-analysis.md`               | 未到達箇所の原因分類と対処方針 |
| 受入基準トレーサビリティ | `outputs/phase-7/acceptance-criteria-traceability.md` | AC-1〜AC-6 のカバー状況対応表  |

## 完了条件

- [ ] `AnalyticsHttpProvider.ts` のカバレッジが 90% 以上達成している
- [ ] `analyticsHandler.ts` の変更箇所カバレッジが 85% 以上達成している
- [ ] 全体統合カバレッジが 85% 以上達成している
- [ ] AC-1〜AC-6 の全受入基準がいずれかのテストケースでカバーされている
- [ ] 未カバー箇所の原因分類と対処方針が記録されている
- [ ] 目標未達の場合は Phase 6 への差し戻し計画が立案されている
- [ ] 成果物テーブル記載のファイルが全件生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 7-1 / 7-2 / 7-3）を 100% 実行完了
- [ ] カバレッジ計測コマンドを実行し、数値を記録した
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を `outputs/phase-7/` に残した

```bash
pnpm --filter @repo/desktop test --coverage
```

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
