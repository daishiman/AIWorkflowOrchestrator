# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 6                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 5                                                               |
| 後続Phase  | Phase 7                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

Phase 5 の実装に対して、fail path・回帰 guard・補助コマンドを追加し
テスト網羅性を高める。

## 追加テストケース

| TC番号 | テスト名                                            | 種別       | 期待結果 |
| ------ | --------------------------------------------------- | ---------- | -------- |
| TC-4   | ESLint フック実行後も @repo/shared インポートが解決 | 回帰 guard | PASS     |
| TC-5   | pool: forks 設定が resolve.alias と共存できる       | 統合       | PASS     |
| TC-6   | CI環境（process.env.CI=true）での設定が正常動作する | 環境依存   | PASS     |

## 補助コマンド

```bash
# 回帰ガード: 全テスト実行
pnpm --filter @repo/shared test

# CI シミュレーション
CI=true pnpm --filter @repo/shared test

# verbose での詳細確認
pnpm --filter @repo/shared test --reporter=verbose

# カバレッジ付き実行
pnpm --filter @repo/shared test --coverage
```

## 異常系テスト

| シナリオ                               | 期待される動作                                           |
| -------------------------------------- | -------------------------------------------------------- |
| resolve.alias が存在しない場合         | `Cannot find module '@repo/shared'` エラーが発生         |
| index.ts が存在しない場合              | vitest の module resolution エラーが発生                 |
| \_\_dirname が undefined の場合（ESM） | path.resolve がエラー（ESM では \_\_dirname 非サポート） |

**対策**: CJS モードで動作することを確認済み（tsup.config.ts で確認）

## 回帰テスト結果

```bash
# 実行コマンド
pnpm --filter @repo/shared test

# 期待結果: 全テスト PASS
```

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |

## 実行手順

1. Phase 5 の実装結果を確認する
2. 回帰 guard テストケース（TC-4〜TC-6）を設計する
3. 補助コマンドを実行して結果を記録する
4. 成果物を outputs/phase-6/ に出力する

## 統合テスト連携

```bash
# 全体回帰確認
pnpm --filter @repo/shared test

# CI環境での動作確認
CI=true pnpm --filter @repo/shared test --reporter=verbose
```

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | TC-4〜TC-6 の詳細    |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全テスト PASS の記録 |

## 完了条件

- [x] TC-4〜TC-6 の追加テストケースが定義済み
- [x] 回帰テストが全件 PASS している
- [x] 補助コマンドが定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 7: テストカバレッジ確認
