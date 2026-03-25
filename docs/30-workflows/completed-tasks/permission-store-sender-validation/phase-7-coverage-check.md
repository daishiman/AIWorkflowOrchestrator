# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 7                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

カバレッジ基準の充足を確認し、未達の場合は Phase 6 に戻る。

## 参照資料

| 資料名         | パス                               | 説明                               |
| -------------- | ---------------------------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` | Line 80%, Branch 60%, Function 80% |

## 実行タスク

### Task 1: カバレッジ実行

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/permission-store-handlers.test.ts
```

### Task 2: カバレッジ基準の確認

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 3: 未達の場合

基準未達の場合は Phase 6 に戻り、不足箇所のテストを追加する。

## 実行手順

### ステップ1: カバレッジ計測

Vitest の v8 プロバイダでカバレッジを計測。

```bash
cd apps/desktop && pnpm vitest run --coverage --reporter=verbose \
  src/main/ipc/__tests__/permission-store-handlers.test.ts
```

### ステップ2: 結果分析

`permission-store-handlers.ts` のカバレッジを確認。特に以下の分岐がカバーされているかを確認する:

- sender 検証の成功分岐（`validation.valid === true`）
- sender 検証の失敗分岐（`validation.valid === false`）
- `getAllowedWindows` コールバック関数（P41対策 — インライン arrow function は独立カウントされる）

### ステップ3: 判定

```
基準充足 → Phase 8（リファクタリング）へ
未達     → Phase 6（テスト拡充）に戻る
```

## 統合テスト連携

- カバレッジ計測結果を以下に記録する

## カバレッジ結果記録欄

| 計測日                   | Line | Branch | Function | 判定 |
| ------------------------ | ---- | ------ | -------- | ---- |
| （Phase 7 実行時に記入） | -    | -      | -        | -    |

## 多角的チェック観点

- **品質**: カバレッジ基準の厳密な適用
- **P41**: `getAllowedWindows` コールバックが Function Coverage にカウントされていること
- **分岐網羅**: valid/invalid の両分岐がカバーされていること

## 成果物

| 成果物             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| カバレッジレポート | `docs/30-workflows/permission-store-sender-validation/outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%

## 次のPhase

Phase 8: リファクタリング — コード品質改善

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
