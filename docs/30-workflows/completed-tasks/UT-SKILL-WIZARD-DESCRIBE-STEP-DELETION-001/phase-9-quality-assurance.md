# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 9                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 8                                           |
| 後続Phase  | Phase 10                                          |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`typecheck`・`lint`・`test` の三点確認を実施し、
`DescribeStep` 系ファイルへの参照がゼロであることを最終確認したうえで品質レポートを作成する。
本 Phase の完了により Phase 10（最終レビューゲート）への進行が可能となる。

## 前提条件

Phase 8 で以下が確認済みであること：

- `wizard/index.ts` に `DescribeStep` 関連の記述がないこと
- dead code・コメント残存が 0 件であること
- リファクタリング確認が完了していること

## 品質保証チェックリスト

### QA-01: TypeScript 型チェック

```bash
pnpm typecheck
```

| 確認項目   | 期待値       | 判定 |
| ---------- | ------------ | ---- |
| exit code  | 0            | -    |
| エラー件数 | 0            | -    |
| 警告件数   | 任意（記録） | -    |

### QA-02: Lint チェック

```bash
pnpm lint
```

| 確認項目   | 期待値       | 判定 |
| ---------- | ------------ | ---- |
| exit code  | 0            | -    |
| エラー件数 | 0            | -    |
| 警告件数   | 任意（記録） | -    |

### QA-03: テスト実行（全件）

```bash
pnpm --filter @repo/desktop test
```

| 確認項目                         | 期待値 | 判定 |
| -------------------------------- | ------ | ---- |
| テスト全件 PASS                  | PASS   | -    |
| `wizard-exports.test.ts` が PASS | PASS   | -    |
| DescribeStep 非存在テストが PASS | PASS   | -    |

### QA-04: DescribeStep 参照ゼロの最終確認

```bash
# import 文での参照
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# export 文での参照
grep -r "export.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# JSX 要素としての参照
grep -r "<DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# wizard/index.ts での参照
grep "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts
# 期待: 出力なし（0件）
```

### QA-05: DescribeStep 系ファイルの不在確認

```bash
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
# 期待: No such file or directory（コマンドが非ゼロで終了）
```

## 受入基準との対応

| AC番号 | 基準                                                                | 確認コマンド | 期待結果     |
| ------ | ------------------------------------------------------------------- | ------------ | ------------ |
| AC-1   | `DescribeStep.tsx` が存在しない                                     | QA-05        | ファイルなし |
| AC-2   | `DescribeStep.test.tsx` が存在しない                                | QA-05        | ファイルなし |
| AC-3   | `pnpm typecheck` がエラーなく通過する                               | QA-01        | exit code 0  |
| AC-4   | `DescribeStep` を import している箇所がない                         | QA-04        | 0件          |
| AC-5   | `wizard-exports.test.ts` の DescribeStep 確認テストが維持・パスする | QA-03        | PASS         |

## 品質確認コマンド一覧（一括実行）

```bash
# 一括確認スクリプト
echo "=== QA-01: typecheck ===" && pnpm typecheck && echo "PASS" || echo "FAIL"
echo "=== QA-02: lint ===" && pnpm lint && echo "PASS" || echo "FAIL"
echo "=== QA-03: test ===" && pnpm --filter @repo/desktop test && echo "PASS" || echo "FAIL"
echo "=== QA-04: DescribeStep 参照確認 ==="
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx" && echo "FAIL（参照あり）" || echo "PASS（参照なし）"
echo "=== QA-05: DescribeStep 系ファイル不在確認 ==="
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx 2>/dev/null && echo "FAIL（ファイルあり）" || echo "PASS（ファイルなし）"
echo "=== QA-06: DescribeStep.test.tsx 不在確認 ==="
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx 2>/dev/null && echo "FAIL（ファイルあり）" || echo "PASS（ファイルなし）"
```

## 実行タスク

実行確認手順を参照。

## 統合テスト連携（Phase 11 まで必須）

```bash
# wizard-exports テストを verbose モードで実行
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
```

## 多角的チェック観点

| 観点         | 確認内容                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| typecheck    | `pnpm typecheck` の exit code が 0 であること                                                   |
| lint         | `pnpm lint` の exit code が 0 であること                                                        |
| test         | `pnpm --filter @repo/desktop test` が全件 PASS であること                                       |
| 参照ゼロ     | QA-04 の全コマンドで出力が 0 件であること                                                       |
| ファイル不在 | QA-05 / QA-06 で `DescribeStep.tsx` と `DescribeStep.test.tsx` が存在しないことが確認できること |
| AC 充足      | AC-1〜AC-5 が全て満たされていること                                                             |
| 副作用なし   | 品質確認の過程で意図せず他のファイルを変更していないこと                                        |

## 参照資料

| 資料名                   | パス                                          | 用途           |
| ------------------------ | --------------------------------------------- | -------------- |
| リファクタリング確認記録 | `outputs/phase-8/refactoring-check-result.md` | Phase 8 成果物 |

| wi
| 参照確認結果 | `outputs/phase-5/reference-check-result.md` | Phase 5 成果物 |
| 削除実行記録 | `outputs/phase-5/deletion-execution-log.md` | Phase 5 成果物 |
| typecheck結果 | `outputs/phase-5/typecheck-result.md` | Phase 5 成果物 |
| テスト実行結果 | `outputs/phase-5/test-execution-result.md` | Phase 5 成果物 |
| wizard/index.ts最終状態 | `outputs/phase-8/wizard-index-final-state.md` | Phase 8 成果物 |
| クリーンアップ判断 | `outputs/phase-8/cleanup-decision.md` | Phase 8 成果物 |

zard/index.ts 最終状態 | `outputs/phase-8/wizard-index-final-state.md` | Phase 8 成果物 |

## 成果物

| 成果物           | パス                                      | 説明                          |
| ---------------- | ----------------------------------------- | ----------------------------- |
| 品質レポート     | `outputs/phase-9/quality-report.md`       | QA-01〜QA-06 の実行結果まとめ |
| typecheck 結果   | `outputs/phase-9/typecheck-result.md`     | pnpm typecheck の出力         |
| lint 結果        | `outputs/phase-9/lint-result.md`          | pnpm lint の出力              |
| テスト実行結果   | `outputs/phase-9/test-result.md`          | pnpm test の出力              |
| 参照ゼロ確認記録 | `outputs/phase-9/zero-reference-check.md` | QA-04 の grep 実行結果        |
| AC 充足確認記録  | `outputs/phase-9/ac-fulfillment-check.md` | AC-1〜AC-5 の充足確認一覧     |

## 完了条件

- [ ] QA-01: `pnpm typecheck` が exit code 0 で PASS
- [ ] QA-02: `pnpm lint` が exit code 0 で PASS
- [ ] QA-03: `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] QA-04: `DescribeStep` への全参照が 0 件
- [ ] QA-05: `DescribeStep.tsx` がファイルシステムに存在しない
- [ ] QA-06: `DescribeStep.test.tsx` がファイルシステムに存在しない
- [ ] AC-1〜AC-5 が全て満たされていること
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

Phase 10: 最終レビューゲート
