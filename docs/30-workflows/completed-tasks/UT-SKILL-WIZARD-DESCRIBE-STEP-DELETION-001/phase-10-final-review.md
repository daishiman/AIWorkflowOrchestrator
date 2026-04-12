# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 10                                                |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 9                                           |
| 後続Phase  | Phase 11                                          |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

acceptance criteria と blocker を最終判定し、
Phase 11（手動テスト）へ進めるかを判断する。

## Acceptance Criteria 最終確認

| AC番号 | 基準                                                                | 判定 | 証跡                                                                                |
| ------ | ------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| AC-1   | `DescribeStep.tsx` が存在しない                                     | -    | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`             |
| AC-2   | `DescribeStep.test.tsx` が存在しない                                | -    | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx`        |
| AC-3   | `pnpm typecheck` がエラーなく通過する                               | -    | `pnpm typecheck` 出力確認                                                           |
| AC-4   | `DescribeStep` を import している箇所がない                         | -    | `grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"` |
| AC-5   | `wizard-exports.test.ts` の DescribeStep 確認テストが維持・パスする | -    | `pnpm --filter @repo/desktop test -- wizard-exports`                                |

## AC確認コマンド

```bash
# AC-1確認: ファイルが存在しないことを確認（エラーが出れば削除済み）
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx

# AC-2確認: companion test が存在しないことを確認（エラーが出れば削除済み）
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx

# AC-3確認: TypeScript型チェックがエラーなく通過することを確認
pnpm typecheck

# AC-4確認: DescribeStep の import 残留がないことを確認（0件が正しい）
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"

# AC-5確認: wizard-exports テストが全件PASSすることを確認
pnpm --filter @repo/desktop test -- wizard-exports
```

## ブロッカー確認

| ID   | 内容                                                                            | 状態   |
| ---- | ------------------------------------------------------------------------------- | ------ |
| B-01 | `DescribeStep.tsx` / `DescribeStep.test.tsx` 削除後の import 残留による型エラー | 未確認 |
| B-02 | `wizard-exports.test.ts` テストの失敗                                           | 未確認 |
| B-03 | `pnpm typecheck` でのエラー検出                                                 | 未確認 |
| B-04 | `DescribeStep` 参照のある未発見ファイルの存在                                   | 未確認 |

## レビュー判定基準

| 判定     | 条件                                         | 対応                         |
| -------- | -------------------------------------------- | ---------------------------- |
| PASS     | AC-1〜AC-5 が全て満たされている              | Phase 11 へ進む              |
| MINOR    | 軽微な警告はあるが機能に影響なし             | コメントを残して Phase 11 へ |
| MAJOR    | AC のいずれかが未達                          | Phase 5（実装）へ戻る        |
| CRITICAL | TypeCheck エラーまたはテスト失敗が確認された | 即時停止・原因調査           |

## MINOR 指摘追跡テーブル最終確認

| MINOR ID | 指摘内容 | 解決Phase | 解決状態 |
| -------- | -------- | --------- | -------- |
| -        | なし     | -         | -        |

## 出荷準備チェックリスト

- [ ] AC-1: `DescribeStep.tsx` が存在しないことを確認
- [ ] AC-2: `DescribeStep.test.tsx` が存在しないことを確認
- [ ] AC-3: `pnpm typecheck` がエラーなく通過することを確認
- [ ] AC-4: `DescribeStep` を import している箇所がないことを確認
- [ ] AC-5: `wizard-exports.test.ts` の DescribeStep 確認テストが維持・PASS
- [ ] Phase 1〜9 の全成果物が揃っている
- [ ] ブロッカーが 0 件
- [ ] 品質レポートが確認済み
- [ ] リスク台帳が更新済み

## 最終判定

**Phase 11 開始条件**: 未判定（AC確認後に記録）

全 AC が満たされていることを確認後、Phase 11（手動テスト）へ進める。

## Phase 13 blocked条件

以下のいずれかに該当する場合、PR作成をブロックする:

- AC-1〜AC-5 のいずれかが未達
- `pnpm typecheck` でエラーが発生
- `wizard-exports.test.ts` のテストが FAIL
- CI/CD パイプラインで失敗

## 実行タスク

- AC-1〜AC-5 の最終判定を実施する
- ブロッカーを確認し 0 件であることを検証する
- Phase 11 開始条件を評価し PASS/FAIL を判定する
- 出荷準備チェックリストを完成させる

## 統合テスト連携

```bash
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
pnpm typecheck
```

## 参照資料

| 資料名               | パス                                             | 用途           |
| -------------------- | ------------------------------------------------ | -------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`              | Phase 9 成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |
| 参照確認結果         | `outputs/phase-1/import-search-result.md`        | Phase 1 成果物 |
| 設計書               | `outputs/phase-2/design-document.md`             | Phase 2 成果物 |
| 参照検索計画         | `outputs/phase-2/reference-search-plan.md`       | Phase 2 成果物 |
| Validation Matrix    | `outputs/phase-2/validation-matrix.md`           | Phase 2 成果物 |
| 参照確認結果         | `outputs/phase-5/reference-check-result.md`      | Phase 5 成果物 |
| 削除実行記録         | `outputs/phase-5/deletion-execution-log.md`      | Phase 5 成果物 |
| typecheck結果        | `outputs/phase-5/typecheck-result.md`            | Phase 5 成果物 |
| テスト実行結果       | `outputs/phase-5/test-execution-result.md`       | Phase 5 成果物 |
| カバレッジ確認       | `outputs/phase-7/coverage-check-report.md`       | Phase 7 成果物 |
| 除外確認             | `outputs/phase-7/describe-step-exclusion.md`     | Phase 7 成果物 |
| 比較サマリー         | `outputs/phase-7/coverage-comparison-summary.md` | Phase 7 成果物 |
| リファクタリング確認 | `outputs/phase-8/refactoring-check-result.md`    | Phase 8 成果物 |

| wi
| typecheck結果 | `outputs/phase-9/typecheck-result.md` | Phase 9 成果物 |
| 参照ゼロ確認 | `outputs/phase-9/zero-reference-check.md` | Phase 9 成果物 |
| AC充足確認 | `outputs/phase-9/ac-fulfillment-check.md` | Phase 9 成果物 |

zard/index.ts最終状態 | `outputs/phase-8/wizard-index-final-state.md` | Phase 8 成果物 |
| クリーンアップ判断 | `outputs/phase-8/cleanup-decision.md` | Phase 8 成果物 |

## 成果物

| 成果物           | パス                                              | 説明                       |
| ---------------- | ------------------------------------------------- | -------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC最終確認とブロッカー判定 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 出荷準備チェックリスト     |

## 完了条件

- [ ] AC-1〜AC-5 の最終判定が完了
- [ ] ブロッカーが 0 件（または全て解消）
- [ ] Phase 11 開始条件が PASS

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

Phase 11: 手動テスト検証
