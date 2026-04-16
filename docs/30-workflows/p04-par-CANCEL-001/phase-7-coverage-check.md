# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-CANCEL-001        |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | 未実施                    |
| 作成日     | 2026-04-16                |

## 目的

Phase 6 で追加したテストを含め、`SKILL_CREATOR_CANCEL` チャンネル定数追加に対する
カバレッジが目標基準を満たしていることを確認する。
未カバー観点があれば Phase 6 に戻ってテストを追加する。

## 実行タスク

### Task 1: カバレッジ測定

```bash
pnpm --filter @repo/shared test -- --testPathPattern="channels" --coverage
```

### Task 2: AC 対応表確認

| AC   | 対応テスト     | カバレッジ状態 |
| ---- | -------------- | -------------- |
| AC-1 | TC-01, TC-03   | TBD            |
| AC-2 | TC-02, TC-05   | TBD            |
| AC-3 | typecheck      | TBD            |
| AC-4 | TC-R01, TC-R02 | TBD            |

### Task 3: 観点カバレッジ確認

チャンネル定数追加の検証観点:

| 観点                       | 対応テスト     | 状態 |
| -------------------------- | -------------- | ---- |
| チャンネル定数の存在確認   | TC-01          | TBD  |
| チャンネル値の正確性       | TC-01, TC-03   | TBD  |
| IPC_CHANNELS への包含確認  | TC-02          | TBD  |
| チャンネル数の正確性       | TC-04          | TBD  |
| チャンネル値のユニーク性   | TC-05          | TBD  |
| 既存チャンネルへの影響なし | TC-R01, TC-R02 | TBD  |

### Task 4: カバレッジ目標達成確認

| 指標              | 最低基準 | 推奨基準 | 実測値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD    |
| Branch Coverage   | 60%      | 70%      | TBD    |
| Function Coverage | 80%      | 90%      | TBD    |

目標未達の場合は Phase 6 に戻りテストを追加する。

## 参照資料

- `outputs/phase-6/TASK-SW-CANCEL-001-extended-test-record.md` — テストケース一覧

## 統合テスト連携

- ユニットテストのカバレッジを確認する
- 統合テストのカバレッジは TASK-SW-CANCEL-002 以降のスコープで確認する

## 成果物

| 成果物                                | パス                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| TASK-SW-CANCEL-001-coverage-report.md | `outputs/phase-7/TASK-SW-CANCEL-001-coverage-report.md` |

## 完了条件

- [ ] カバレッジ測定コマンドを実行した
- [ ] AC 対応表が全件埋まっている
- [ ] 観点カバレッジ確認が全件実施されている
- [ ] branch coverage が最低基準（60%）以上である
- [ ] 目標未達の場合は Phase 6 へ戻る判断を記録している

## タスク100%実行確認【必須】

- [ ] Task 1（カバレッジ測定）を100%実行した
- [ ] Task 2（AC 対応表確認）を100%実行した
- [ ] Task 3（観点カバレッジ確認）を100%実行した
- [ ] Task 4（カバレッジ目標達成確認）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-coverage-report.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
