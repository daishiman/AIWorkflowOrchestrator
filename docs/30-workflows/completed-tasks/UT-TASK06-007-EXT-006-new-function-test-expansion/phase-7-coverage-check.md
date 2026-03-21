# Phase 7: カバレッジ確認 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                     |
| ------- | ------------------------------------------------------ |
| Phase   | 7                                                      |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion      |
| 作成日  | 2026-03-21                                             |
| 前Phase | [phase-6-test-expansion.md](phase-6-test-expansion.md) |

## 目的

Phase 6 で実装した全テスト（69件以上）のカバレッジを計測し、Line Coverage 95%以上の基準を充足していることを確認する。未達の場合は Phase 6 に戻り追加テストを実装する。

## 実行タスク

- Task 7-1: カバレッジ計測コマンドを実行する
- Task 7-2: Line Coverage・Branch Coverage・Function Coverage を確認する
- Task 7-3: 基準未達なら未達箇所を特定して Phase 6 へ戻す
- Task 7-4: 基準充足なら `outputs/phase-7/coverage-report.md` を作成する

## 参照資料

| 資料名         | パス                                                         | 説明                             |
| -------------- | ------------------------------------------------------------ | -------------------------------- |
| Phase 5成果物  | `outputs/phase-5/green-confirmation.md`                      | export追加とGreen化の完了記録    |
| Phase 6成果物  | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 拡充済みテストファイル           |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                           | Line 95%以上（プロジェクト基準） |
| テストファイル | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | カバレッジ計測対象               |

## 実行手順

### ステップ1: カバレッジ計測コマンドの実行

```bash
pnpm --filter @repo/desktop exec vitest run \
  scripts/__tests__/check-ipc-contracts.test.ts \
  --coverage --coverage.include='scripts/check-ipc-contracts.ts'
```

出力例:

```
 % Coverage report from v8
 File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
 ---------------------------|---------|----------|---------|---------|-------------------
 scripts/check-ipc-contracts.ts |  96.2  |   88.5   |  100.0  |  96.2   | 123, 456
```

### ステップ2: カバレッジ基準の確認

以下の基準に対して計測値を評価する:

| 指標              | 最低基準 | 推奨基準 | 本タスク目標 |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | **95%以上**  |
| Branch Coverage   | 60%      | 70%      | 70%以上      |
| Function Coverage | 80%      | 90%      | 90%以上      |

**判定:**

- Line Coverage 95%以上 → ステップ3へ進む（基準充足）
- Line Coverage 95%未満 → ステップ4へ進む（Phase 6 へ戻る）

### ステップ3: 基準充足の場合（カバレッジレポート作成）

`outputs/phase-7/coverage-report.md` を作成し、以下の内容を記録する:

```markdown
# カバレッジレポート - UT-TASK06-007-EXT-006

## 計測結果

| 指標              | 計測値 | 基準 | 判定 |
| ----------------- | ------ | ---- | ---- |
| Line Coverage     | 95.79% | 95%  | PASS |
| Branch Coverage   | 91.55% | 70%  | PASS |
| Function Coverage | 100%   | 95%  | PASS |

## テスト件数

| 種別       | 件数 |
| ---------- | ---- |
| 既存テスト | 49   |
| 新規テスト | 20   |
| 合計       | 69   |

## 未カバー行

（なし または 行番号と対応するコード）

## 判定

PASS - Phase 8（リファクタリング）に進む
```

### ステップ4: 基準未達の場合（Phase 6 へ戻る）

未達が確認された場合、以下の情報を Phase 6 へフィードバックする:

1. 未カバー行番号を特定する:

   ```bash
   cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts --coverage --reporter=verbose 2>&1 | grep "Uncovered"
   ```

2. 未カバー行に対応するソースコードを確認する:

   ```bash
   sed -n '<行番号>p' apps/desktop/scripts/check-ipc-contracts.ts
   ```

3. 未カバー箇所のテストケースを Phase 6 のステップ2〜5の追加検討リストと照合し、対応するテストを実装する。

4. 追加実装後、本 Phase（Phase 7）に戻り再計測する。

### ステップ5: 計測結果のスナップショット確認

カバレッジ基準を充足した状態での最終テスト実行を確認する:

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts 2>&1 | tail -5
```

期待:

```
Test Files  1 passed (1)
Tests  69 passed (69)
Duration  2.05s
```

（Phase 6 で追加テストがあれば件数は増加する）

## 統合テスト連携

本 Phase 完了後、Phase 8（リファクタリング）に進む。カバレッジ基準が充足されていることが Phase 8 以降の前提条件となる。

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・判定・未カバー行の記録 |

## 完了条件

- [x] `pnpm vitest run --coverage` が正常に実行されている
- [x] Line Coverage が 95%以上であることが確認されている
- [x] Branch Coverage が 70%以上であることが確認されている
- [x] Function Coverage が 95%以上であることが確認されている
- [x] `outputs/phase-7/coverage-report.md` が作成されている
- [x] カバレッジ基準未達ではないため Phase 6 差し戻しは不要と確認している
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

**基準充足（PASS）** → Phase 8（リファクタリング）に進む。
**基準未達** → Phase 6（テスト拡充）に戻り、追加テストを実装してから本 Phase を再実行する。
