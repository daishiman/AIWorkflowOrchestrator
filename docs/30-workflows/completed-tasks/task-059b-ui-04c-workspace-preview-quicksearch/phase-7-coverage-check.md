# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 7                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-C                                     |

## 目的

Phase 4/6 のテストが coverage gate を満たすかを判定し、未達部分を明示する。Phase 8 以降で品質低下を持ち込まない状態を作る。

## 実行タスク

- coverage計測: task scope の line/branch/function を計測する
- ギャップ抽出: 未達箇所をファイル単位で抽出する
- 改善計画策定: 未達箇所の追加テスト計画を策定する
- ゲート記録: PASS/FAIL 判定を記録する

## 参照資料

| 参照資料       | パス                                        | 説明         |
| -------------- | ------------------------------------------- | ------------ |
| Phase 5 成果物 | `outputs/phase-5/implementation-summary.md` | 実装対象範囲 |
| Phase 4        | `phase-4-test-creation.md`                  | 基本テスト   |
| Phase 6        | `phase-6-test-expansion.md`                 | 追加テスト   |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                              | 本Phaseで使う理由    |
| ---------- | --------------------------------------------------------------------------------- | -------------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 目標値参照  |
| テスト規約 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 測定対象の妥当性確認 |

## 実行手順

### ステップ1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage
```

### ステップ2: 目標値と比較

| 指標      | 目標 |
| --------- | ---- |
| Lines     | 80%  |
| Branches  | 60%  |
| Functions | 80%  |

### ステップ3: 未達時の処理

- 未達ファイルを `coverage-gap-list.md` へ記録する
- 追加テスト案を `coverage-improvement-plan.md` へ記録する
- Phase 6 へ戻す条件を `gate-result.md` へ記録する

## 統合テスト連携

| 観点          | Phase 8 へ引き継ぐ内容       |
| ------------- | ---------------------------- |
| coverage gate | 実測値と未達箇所             |
| regression    | 04A/04C 連携ケースの安定状況 |
| release準備   | Phase 10 の最終レビュー入力  |

## 成果物

| 成果物         | パス                                   | 説明      |
| -------------- | -------------------------------------- | --------- |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md`   | 実測値    |
| ギャップ一覧   | `outputs/phase-7/coverage-gap-list.md` | 未達箇所  |
| ゲート判定     | `outputs/phase-7/gate-result.md`       | PASS/FAIL |

## 完了条件

- [ ] coverage 計測コマンドを定義している
- [ ] 目標値を明記している
- [ ] 未達時の戻り条件を定義している
- [ ] ゲート判定成果物を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. coverage 計測
2. 目標比較
3. ギャップ抽出
4. ゲート判定記録
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-7/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)
