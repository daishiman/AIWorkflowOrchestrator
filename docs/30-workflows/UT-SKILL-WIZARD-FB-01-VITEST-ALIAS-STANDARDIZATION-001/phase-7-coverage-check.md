# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 7                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 6                                                               |
| 後続Phase  | Phase 8                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

concern と dependency edge のカバレッジを可視化し、
テスト網羅性が十分であることを確認する。

## カバレッジ対象

本タスクは設定ファイル（vitest.config.ts）の変更であり、実行コードの追加はない。
vitest.config.ts は coverage 除外対象（`"vitest.config.ts"` は exclude に含まれる）。

| Concern      | カバレッジ方法                          | 期待水準      |
| ------------ | --------------------------------------- | ------------- |
| C-01（設定） | 統合テスト実行（`pnpm test`）による検証 | 全テスト PASS |

## カバレッジコマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/shared test --coverage

# カバレッジレポート確認
# -> coverage/ ディレクトリに HTML レポートが生成される
```

## coverage 閾値（既存設定）

| 指標       | 閾値 |
| ---------- | ---- |
| lines      | 65%  |
| functions  | 80%  |
| branches   | 60%  |
| statements | 65%  |

**本タスクの影響**: vitest.config.ts 自体は除外対象のため、カバレッジ閾値への影響なし。

## トレーサビリティ網羅率

| AC番号 | テストケース | カバレッジ状態      |
| ------ | ------------ | ------------------- |
| AC-1   | TC-3         | ✅ 静的確認         |
| AC-2   | TC-1         | ✅ 統合テスト       |
| AC-3   | TC-2         | ✅ 全テスト実行     |
| AC-4   | 手動確認     | ✅ テンプレート確認 |

## 未到達分析

| 未到達シナリオ                   | 対応方針                             |
| -------------------------------- | ------------------------------------ |
| ESM環境での \_\_dirname 解決失敗 | CJS モードでの動作確認済みのため許容 |
| 他パッケージでの同様の問題       | Phase 12 の未タスクとして記録        |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |

## 実行手順

1. `pnpm --filter @repo/shared test --coverage` を実行する
2. AC-1〜AC-4 のトレーサビリティを確認する
3. カバレッジレポートを outputs/phase-7/ に出力する

## 統合テスト連携

```bash
pnpm --filter @repo/shared test --coverage --reporter=verbose
```

## 成果物

| 成果物             | パス                                 | 説明                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ結果とトレーサビリティ網羅率 |

## 完了条件

- [x] トレーサビリティ網羅率の確認完了（AC-1〜AC-4 全て対応）
- [x] カバレッジ閾値を下回っていないことを確認
- [x] 未到達分析が記録されている

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

Phase 8: リファクタリング
