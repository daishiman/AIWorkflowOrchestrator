# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 10                                          |
| 後続Phase  | Phase 12                                          |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` / `DescribeStep.test.tsx` 物理削除後の状態を手動で検証し、
削除による影響がないことを CLI 出力の証跡として記録する。

## タスク種別判定

| 項目                   | 判定               |
| ---------------------- | ------------------ |
| UI変更                 | なし（NON_VISUAL） |
| ファイル削除           | あり               |
| スクリーンショット要否 | 不要（NON_VISUAL） |

## 手動テスト計画

| TC番号 | シナリオ                                | 手順                                                                                                                                                   | 期待結果     |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| MT-01  | DescribeStep 系ファイルが存在しないこと | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` / `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` | ファイルなし |
| MT-02  | TypeCheck が PASS すること              | `pnpm typecheck`                                                                                                                                       | エラーなし   |
| MT-03  | DescribeStep の参照が残留していないこと | `grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"`                                                                    | 0件          |
| MT-04  | テストが全件 PASS すること              | `pnpm --filter @repo/desktop test -- wizard-exports`                                                                                                   | 全件 PASS    |

## 手動テスト実行手順

```bash
# MT-01: DescribeStep 系ファイルの不在確認（ls がエラーを返せば削除済み）
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx
# 期待: No such file or directory

# MT-02: TypeScript 型チェック
pnpm typecheck
# 期待: エラーなし・0 errors

# MT-03: import 残留確認（0件が正しい状態）
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# MT-04: wizard-exports テスト実行
pnpm --filter @repo/desktop test -- wizard-exports
# 期待: 全件 PASS（DescribeStep が存在しないことを確認するテストが PASS すること）
```

## Semantic / Visual / AI UX 評価

| 評価種別 | 対象                   | 結果                                             |
| -------- | ---------------------- | ------------------------------------------------ |
| Semantic | ファイル削除・参照整合 | wizard/index.ts からのエクスポート削除済みと整合 |
| Visual   | N/A（ファイル削除）    | NON_VISUAL                                       |
| AI UX    | N/A（ファイル削除）    | NON_VISUAL                                       |

## スクリーンショット

NON_VISUAL タスクのためスクリーンショットは不要。
代わりに CLI 出力をテキスト証跡として記録する。

```
# MT-01 期待される CLI 出力（例）
ls: apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx: No such file or directory
ls: apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx: No such file or directory

# MT-02 期待される CLI 出力（例）
✓ type-check passed (0 errors)

# MT-03 期待される CLI 出力（例）
（出力なし = 0件）

# MT-04 期待される CLI 出力（例）
PASS  src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts
...
Test Files  1 passed (1)
Tests       X passed (X)
```

## フィードバックループ

Phase 11 で発見された HIGH 問題: **未確認（実施後に記録）**

## 参照資料

| 資料名           | パス                                              | 用途            |
| ---------------- | ------------------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 実行タスク

実行手順を参照。

## 実行手順

1. MT-01〜MT-04 の手動テストを実行する
2. 全テストが PASS することを確認する
3. 手動テスト結果を `outputs/phase-11/` に出力する

## 統合テスト連携

```bash
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
```

## 成果物

| 成果物         | パス                                     | 説明                    |
| -------------- | ---------------------------------------- | ----------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | MT-01〜MT-04 の実行結果 |

## 完了条件

- [ ] MT-01〜MT-04 が全て PASS
- [ ] NON_VISUAL の理由が記録されている
- [ ] HIGH 問題なし（または全て unassigned-task として記録済み）

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

Phase 12: ドキュメント更新
