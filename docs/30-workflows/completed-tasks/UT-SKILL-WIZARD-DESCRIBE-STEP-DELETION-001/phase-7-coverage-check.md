# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 7                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 6                                           |
| 後続Phase  | Phase 8                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` / `DescribeStep.test.tsx` 削除後のテストカバレッジを計測し、
wizard 関連テストのカバレッジが維持されていることを確認する。
本タスクは 1 ファイル削除のみであるため、カバレッジへの影響は最小限である。

## 前提条件

Phase 6 で以下が確認済みであること：

- `wizard-exports.test.ts` の DescribeStep 非存在テストが維持されていること
- `pnpm --filter @repo/desktop test` が全件 PASS

## カバレッジ確認の考え方

ファイル削除タスクにおけるカバレッジ変化の解釈：

| 変化                                        | 解釈                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| カバレッジが微増または変化なし              | 正常（削除したファイルが Dead Code だったため）                          |
| カバレッジが微減                            | 許容範囲（削除ファイルがテスト対象だった場合、テスト自体が不要になった） |
| wizard 関連ファイルのカバレッジが大幅に低下 | 要確認（他の wizard ファイルへの影響を調査する）                         |

## カバレッジ確認手順

### Step 1: カバレッジ付きテスト実行

```bash
pnpm --filter @repo/desktop test --coverage
```

### Step 2: wizard 関連ファイルのカバレッジを確認

カバレッジ出力から以下のディレクトリに属するファイルのカバレッジ行を抽出する：

```
apps/desktop/src/renderer/components/skill/wizard/
```

対象ファイル例：

- `wizard/index.ts`
- `wizard/GenerateStep.tsx`（`GenerationMode` の移行先）
- `wizard/__tests__/wizard-exports.test.ts`

### Step 3: DescribeStep 系ファイルがカバレッジ対象から除外されていることを確認

```bash
# DescribeStep 系ファイルがカバレッジ対象に現れていないことを確認
# （削除済みのためカバレッジレポートに表示されないことが正しい状態）
grep "DescribeStep" coverage/lcov-report/index.html 2>/dev/null || echo "DescribeStep はカバレッジ対象外（正常）"
```

## カバレッジ閾値

本タスクではカバレッジ閾値の変更は行わない。
既存の閾値設定（`vitest.config.ts` または `jest.config.ts`）をそのまま維持する。

```bash
# カバレッジ閾値の確認
grep -r "coverage" apps/desktop/vitest.config.ts 2>/dev/null || \
grep -r "coverageThreshold" apps/desktop/jest.config.ts 2>/dev/null
```

## カバレッジ確認コマンド一覧

```bash
# 1. カバレッジ付きテスト実行
pnpm --filter @repo/desktop test --coverage

# 2. wizard 関連のカバレッジサマリー確認（出力から grep）
pnpm --filter @repo/desktop test --coverage 2>&1 | grep -A 5 "wizard"

# 3. wizard-exports テストのみカバレッジ付きで実行
pnpm --filter @repo/desktop test -- wizard-exports --coverage --reporter=verbose
```

## 実行タスク

実行確認手順を参照。

## 統合テスト連携（Phase 11 まで必須）

```bash
pnpm --filter @repo/desktop test --coverage --reporter=verbose 2>&1 | \
  grep -E "wizard|DescribeStep|PASS|FAIL|Coverage"
```

## 多角的チェック観点

| 観点                              | 確認内容                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------- |
| カバレッジ変化の妥当性            | 削除による微増・変化なしが正常であることを確認する                               |
| DescribeStep 系ファイルの除外確認 | カバレッジレポートに `DescribeStep.tsx` / `DescribeStep.test.tsx` が現れないこと |
| wizard 全体への影響               | `wizard/` 配下の他ファイルのカバレッジが低下していないこと                       |
| 閾値超過チェック                  | `pnpm test --coverage` が閾値エラーなく完了すること                              |
| テスト件数                        | カバレッジ実行時のテスト件数が Phase 6 と同数であること                          |

## 参照資料

| 資料名             | パス                                          | 用途                     |
| ------------------ | --------------------------------------------- | ------------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`          | Phase 6 成果物（比較用） |
| テスト拡充確認結果 | `outputs/phase-6/test-expansion-result.md`    | Phase 6 成果物           |
| 回帰テスト結果     | `outputs/phase-6/regression-test-result.md`   | Phase 6 成果物           |
| 追加テスト判断     | `outputs/phase-6/additional-test-decision.md` | Phase 6 成果物           |

## 成果物

| 成果物                 | パス                                             | 説明                                            |
| ---------------------- | ------------------------------------------------ | ----------------------------------------------- |
| カバレッジ確認レポート | `outputs/phase-7/coverage-check-report.md`       | pnpm test --coverage の出力と wizard 部分の抜粋 |
| DescribeStep 除外確認  | `outputs/phase-7/describe-step-exclusion.md`     | カバレッジ対象から除外されていることの確認記録  |
| カバレッジ比較サマリー | `outputs/phase-7/coverage-comparison-summary.md` | Phase 6 との比較（変化量の記録）                |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test --coverage` が閾値エラーなく PASS
- [ ] `DescribeStep.tsx` / `DescribeStep.test.tsx` がカバレッジレポートに現れないことを確認
- [ ] wizard 関連ファイルのカバレッジが Phase 6 比で大幅に低下していないこと
- [ ] 成果物テーブル記載のファイルを全件生成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
```

## 次のPhase

Phase 8: リファクタリング
