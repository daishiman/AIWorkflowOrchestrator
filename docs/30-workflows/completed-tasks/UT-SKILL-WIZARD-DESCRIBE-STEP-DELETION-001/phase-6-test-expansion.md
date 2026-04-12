# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 6                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 5                                           |
| 後続Phase  | Phase 7                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` / `DescribeStep.test.tsx` 削除後の回帰テストを確認し、
Phase 4 で新規作成した `wizard-exports.test.ts` の DescribeStep 非存在テストが維持されていることを検証する。
追加テストケースが必要かどうかを判断し、必要があれば追加する。

## 前提条件

Phase 5 で以下が完了済みであること：

- `DescribeStep.tsx` / `DescribeStep.test.tsx` が物理削除済み
- `pnpm typecheck` が PASS
- `pnpm --filter @repo/desktop test` が全件 PASS

## テスト拡充方針

本タスクは 1 ファイルの物理削除であり、新規ロジックの追加はない。
したがって新規テストケースの追加は原則不要だが、以下の観点から既存テストの充足度を確認する。

| 観点                             | 方針                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| DescribeStep 非存在テスト        | `wizard-exports.test.ts` に維持されていることを確認（追加不要）                           |
| wizard/index.ts エクスポート確認 | 現在のエクスポート一覧が期待値と一致しているかテストで確認                                |
| 追加テストの要否                 | DescribeStep 削除後に参照が紛れ込まないガードが `wizard-exports.test.ts` に存在するか確認 |

## 既存テストの確認手順

### Step 1: wizard-exports.test.ts の内容確認

```bash
# DescribeStep 関連テストが存在することを確認
grep -n "DescribeStep" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts

# テスト全体を確認
cat apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts
```

### Step 2: テスト実行（回帰確認）

```bash
# wizard-exports テストのみ実行（verbose モード）
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
# 期待: 全件 PASS（DescribeStep 非存在テストを含む）

# desktop パッケージのテスト全件実行
pnpm --filter @repo/desktop test
# 期待: 全件 PASS（wizard 関連テストを含む）
```

### Step 3: カバレッジ確認

```bash
pnpm --filter @repo/desktop test --coverage
# 期待: wizard 関連ファイルのカバレッジが維持されていること
```

## 追加テストケースの判断基準

| ケース                                                           | 判断           | 理由                                                                |
| ---------------------------------------------------------------- | -------------- | ------------------------------------------------------------------- |
| DescribeStep が存在しないことを確認するテストが既にある          | 追加不要       | `wizard-exports.test.ts` に新規作成済みのガードとして維持されている |
| DescribeStep が import できないことを確認するテストがない        | 要追加（検討） | import できない = 削除済みを間接的に保証するガードとして有効        |
| wizard/index.ts の現在のエクスポート一覧が正確にテストされている | 確認必要       | 削除後のエクスポート一覧が期待値と一致しているかを確認する          |

## wizard-exports.test.ts の確認項目

以下の項目が `wizard-exports.test.ts` に含まれていることを確認する：

- [ ] `DescribeStep` が `wizard/index.ts` からエクスポートされていないこと
- [ ] 削除後も有効な形でテストが記述されていること（DescribeStep.tsx の存在に依存していないこと）

## 実行タスク

実行確認手順を参照。

## 統合テスト連携（Phase 11 まで必須）

```bash
# wizard-exports テストをカバレッジ付きで実行
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose --coverage
```

## 多角的チェック観点

| 観点           | 確認内容                                                                    |
| -------------- | --------------------------------------------------------------------------- |
| テスト維持     | `wizard-exports.test.ts` の DescribeStep テストが削除・変更されていないこと |
| 回帰           | 削除前に PASS していたテストが削除後も引き続き PASS であること              |
| ガードの有効性 | DescribeStep が再追加された場合にテストが失敗（FAIL）することを確認         |
| カバレッジ     | wizard 関連ファイルのカバレッジが削除前と同等以上であること                 |
| 追加テスト要否 | 追加不要の場合でも判断の根拠を成果物に記録すること                          |

## 参照資料

| 資料名         | パス                                       | 用途           |
| -------------- | ------------------------------------------ | -------------- |
| テスト実行結果 | `outputs/phase-5/test-execution-result.md` | Phase 5 成果物 |

| wi
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| 作成完了記録 | `outputs/phase-4/test-creation-result.md` | Phase 4 成果物 |
| 前提条件確認 | `outputs/phase-4/precondition-check.md` | Phase 4 成果物 |
| 参照確認結果 | `outputs/phase-5/reference-check-result.md` | Phase 5 成果物 |
| 削除実行記録 | `outputs/phase-5/deletion-execution-log.md` | Phase 5 成果物 |
| typecheck結果 | `outputs/phase-5/typecheck-result.md` | Phase 5 成果物 |

zard-exports テスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts` | Phase 4 で新規作成済みの guard test 内容確認 |

## 成果物

| 成果物             | パス                                          | 説明                                  |
| ------------------ | --------------------------------------------- | ------------------------------------- |
| テスト拡充確認結果 | `outputs/phase-6/test-expansion-result.md`    | wizard-exports.test.ts の内容確認結果 |
| 回帰テスト実行結果 | `outputs/phase-6/regression-test-result.md`   | pnpm test の回帰確認結果              |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`          | pnpm test --coverage の出力サマリー   |
| 追加テスト判断記録 | `outputs/phase-6/additional-test-decision.md` | 追加テストの要否判断と根拠            |

## 完了条件

- [ ] `wizard-exports.test.ts` に DescribeStep 非存在テストが維持されていること
- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] カバレッジが wizard 関連ファイルで維持されていること
- [ ] 追加テストの要否判断が記録されていること
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

Phase 7: テストカバレッジ確認
