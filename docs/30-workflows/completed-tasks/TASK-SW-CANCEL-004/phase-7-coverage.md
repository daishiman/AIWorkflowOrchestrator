# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                                    |
| -------- | --------------------------------------------------------------------- |
| Phase    | 7                                                                     |
| タスクID | TASK-SW-CANCEL-004                                                    |
| 前Phase  | [phase-6-test-expansion.md](phase-6-test-expansion.md)                |
| 次Phase  | [phase-8-refactoring.md](phase-8-refactoring.md)                      |
| 目的     | `useCancelGeneration.ts` の line/branch カバレッジ 80% 以上を確認する |

## 目的

`useCancelGeneration.ts` の line/branch カバレッジ 80% 以上を確認する。

## 実行タスク

### タスク1: カバレッジ計測

**目的**: line / branch の基準達成可否を定量確認する。

**実行手順**:

1. coverage コマンドを実行する。
2. `useCancelGeneration.ts` の line / branch 値を抽出する。
3. 80% 未満の分岐がある場合は不足分を記録する。

**期待される成果物**:

- coverage 数値
- 不足分岐一覧

### タスク2: 不足時のフィードバック

**目的**: Phase 6 へ戻すべき不足観点を明確化する。

**実行手順**:

1. カバレッジ不足候補を Phase 6 テストケースと対応付ける。
2. 再追加すべきテストを記録する。

**期待される成果物**:

- 再追加テスト提案

## カバレッジ基準

| ファイル                 | line カバレッジ | branch カバレッジ | 達成基準 |
| ------------------------ | --------------- | ----------------- | -------- |
| `useCancelGeneration.ts` | 80% 以上        | 80% 以上          | 必須     |

## カバレッジ確認コマンド

```bash
pnpm vitest run --coverage -- useCancelGeneration
```

## カバレッジ不足時の対応

カバレッジが 80% を下回る場合は、Phase 6 のエッジケーステストを追加して対応する。

主なカバレッジ不足の候補：

- `skillCreatorAPI` が undefined/null の分岐
- `AbortController` が null の場合の分岐
- `cancelGeneration()` の二重呼び出し分岐

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-6-test-expansion.md`
- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

## 成果物

| 成果物         | パス                                 |
| -------------- | ------------------------------------ |
| カバレッジ報告 | `outputs/phase-7/coverage-report.md` |

## 統合テスト連携

- targeted test 群のうち coverage 不足に直結するケースを Phase 6 へ差し戻す。
- Phase 9 では本 Phase の coverage 結果を品質ゲート証跡として再利用する。

## 完了条件

- [ ] `useCancelGeneration.ts` の line カバレッジが 80% 以上
- [ ] `useCancelGeneration.ts` の branch カバレッジが 80% 以上
- [ ] カバレッジ結果が `coverage-report.md` に記録されている
