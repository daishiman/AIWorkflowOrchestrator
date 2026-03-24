# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 7                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

カバレッジ基準の充足を確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

### Task 1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

### Task 2: 基準照合

| 指標              | 最低基準 | 推奨基準 | 計測結果 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | -        |
| Branch Coverage   | 60%      | 70%      | -        |
| Function Coverage | 80%      | 90%      | -        |

対象ファイル: `RuntimeSkillCreatorFacade.ts`

### Task 3: 判定

- 全指標が最低基準以上 → Phase 8 へ進む
- いずれかの指標が最低基準未満 → Phase 6 へ戻り、不足テストを追加する

## 参照資料

- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- Phase 6 テスト拡充（`phase-06-test-expansion.md`）

## 成果物

- カバレッジ計測結果（本仕様書に計測結果テーブルを記録）

## 完了条件

- [ ] カバレッジ計測を実施した
- [ ] 計測結果テーブルに数値を記録した
- [ ] 全指標が最低基準（Line 80%, Branch 60%, Function 80%）以上であることを確認した

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準充足時）
Phase 6: テスト拡充（カバレッジ基準未達時）
