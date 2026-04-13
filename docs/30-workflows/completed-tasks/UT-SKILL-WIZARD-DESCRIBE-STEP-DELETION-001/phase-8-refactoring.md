# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 8                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 7                                           |
| 後続Phase  | Phase 9                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` / `DescribeStep.test.tsx` 削除後のコードベースを走査し、
余分なコメント・dead code・残存参照が残っていないかを確認する。
本タスクは 1 ファイル削除のみのため、リファクタリング範囲はほぼ N/A だが、
削除後の副産物クリーンアップを確実に実施する。

## 前提条件

Phase 7 で以下が確認済みであること：

- `pnpm --filter @repo/desktop test --coverage` が閾値エラーなく PASS
- `DescribeStep.tsx` がカバレッジレポートに現れないことを確認済み

## リファクタリング判断

| 対象                                                  | 対応要否 | 理由                                                             |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `DescribeStep.tsx` / `DescribeStep.test.tsx` 本体     | 実施済み | Phase 5 で物理削除完了                                           |
| `wizard/index.ts` からのエクスポート削除              | 実施済み | W2-seq-03b で完了済み（本タスクの前提）                          |
| `@deprecated` JSDoc の付与                            | 実施済み | W2-seq-03b で完了済み（本タスクの前提）                          |
| `GenerationMode` の import 先変更                     | 実施済み | W2-seq-03b で `GenerateStep` に変更済み                          |
| `DescribeStep` に関連するコメントの残存確認           | 要確認   | 削除後に関連コメントが残っていないかを確認する                   |
| `wizard/index.ts` の最終状態確認                      | 要確認   | エクスポート一覧が整合していることを確認する                     |
| `DescribeStep` に関連する型定義・interface の残存確認 | 要確認   | 他ファイルで `DescribeStep` 由来の型が参照されていないか確認する |

## リファクタリング確認手順

### Step 1: wizard/index.ts の最終状態確認

```bash
cat apps/desktop/src/renderer/components/skill/wizard/index.ts
# 確認項目: DescribeStep に関する記述が一切ないこと
```

### Step 2: DescribeStep に関連するコメント残存確認

```bash
# コメント内の DescribeStep 参照を確認
grep -r "DescribeStep" apps/ packages/ \
  --include="*.ts" --include="*.tsx" --include="*.md" \
  --include="*.json" --include="*.js"
# 期待: テストファイル内の非存在確認テストのみが残っている
#       それ以外のファイルに DescribeStep の記述がないこと
```

### Step 3: dead code の確認（wizard 配下）

```bash
# wizard ディレクトリの現在のファイル一覧を確認
ls -la apps/desktop/src/renderer/components/skill/wizard/
# 確認項目: DescribeStep 系ファイルが存在しないこと
#           不要なファイルが残っていないこと
```

### Step 4: wizard/index.ts のエクスポート一覧確認

```bash
# 現在のエクスポート一覧
grep "^export" apps/desktop/src/renderer/components/skill/wizard/index.ts
# 確認項目: DescribeStep が含まれていないこと
#           必要なコンポーネント（GenerateStep 等）がエクスポートされていること
```

## Phase 5 で実施済みの確認

以下は Phase 5 の実装で完了済みのため、本 Phase では確認のみを行う：

| 項目                          | 実施フェーズ | 状態     |
| ----------------------------- | ------------ | -------- |
| `DescribeStep.tsx` の物理削除 | Phase 5      | 実施済み |
| 削除前の参照残留ゼロ確認      | Phase 5      | 実施済み |
| `pnpm typecheck` PASS         | Phase 5      | 実施済み |
| `pnpm test` PASS              | Phase 5      | 実施済み |

## 実行タスク

実行確認手順を参照。

## 統合テスト連携（Phase 11 まで必須）

```bash
# リファクタリング後の最終確認
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
pnpm typecheck
```

## 多角的チェック観点

| 観点                 | 確認内容                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| コメント残存         | `DescribeStep` 関連のコメントが wizard 配下以外のファイルに残っていないこと |
| wizard/index.ts 整合 | エクスポート一覧に `DescribeStep` が含まれていないこと                      |
| dead code            | `DescribeStep` 由来の未使用型・定数・変数が残っていないこと                 |
| テスト整合           | `wizard-exports.test.ts` が現在のエクスポート一覧と整合していること         |
| 副作用なし           | リファクタリング確認の過程で意図せずファイルを変更していないこと            |

## 参照資料

| 資料名                 | パス                                             | 用途           |
| ---------------------- | ------------------------------------------------ | -------------- |
| カバレッジ確認レポート | `outputs/phase-7/coverage-check-report.md`       | Phase 7 成果物 |
| 削除実行記録           | `outputs/phase-5/deletion-execution-log.md`      | Phase 5 成果物 |
| 参照確認結果           | `outputs/phase-5/reference-check-result.md`      | Phase 5 成果物 |
| typecheck結果          | `outputs/phase-5/typecheck-result.md`            | Phase 5 成果物 |
| テスト実行結果         | `outputs/phase-5/test-execution-result.md`       | Phase 5 成果物 |
| 除外確認               | `outputs/phase-7/describe-step-exclusion.md`     | Phase 7 成果物 |
| 比較サマリー           | `outputs/phase-7/coverage-comparison-summary.md` | Phase 7 成果物 |

## 成果物

| 成果物                   | パス                                          | 説明                                       |
| ------------------------ | --------------------------------------------- | ------------------------------------------ |
| リファクタリング確認記録 | `outputs/phase-8/refactoring-check-result.md` | コメント残存・dead code 確認の記録         |
| wizard/index.ts 最終状態 | `outputs/phase-8/wizard-index-final-state.md` | エクスポート一覧の確認結果                 |
| クリーンアップ要否判断   | `outputs/phase-8/cleanup-decision.md`         | 追加クリーンアップが必要かどうかの判断記録 |

## 完了条件

- [ ] `wizard/index.ts` に `DescribeStep` 関連の記述がないことを確認
- [ ] `DescribeStep` 関連のコメント残存が 0 件であること（テストファイルの非存在確認テストを除く）
- [ ] dead code が残存していないことを確認
- [ ] 追加クリーンアップが不要な場合、その判断根拠を記録
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

Phase 9: 品質保証
