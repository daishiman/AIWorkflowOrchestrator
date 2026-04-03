# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 8                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.25h                                    |

## 目的

TDD Refactor フェーズ。テストが Green の状態を維持しながら、コードの可読性・保守性を改善する。本タスクは実装変更が最小限のため、リファクタリング対象がない場合は「変更なし」として記録する。

## リファクタリング候補確認

```bash
# 型定義の確認
rg -n "BeforeQuitGuardDeps|registerBeforeQuitGuard" \
  apps/desktop/src/main/ipc/beforeQuitGuard.ts

# export の確認（テストからインポートできるか）
rg -n "export" \
  apps/desktop/src/main/ipc/beforeQuitGuard.ts

# 型の export 確認（他ファイルで使う場合）
rg -n "BeforeQuitGuardDeps" apps/desktop/src/ -g "*.ts"
```

## リファクタリング方針

本タスクで対象となりうる軽微な改善:

| 項目                                                                   | 優先度 | 判断                   |
| ---------------------------------------------------------------------- | ------ | ---------------------- |
| `BeforeQuitGuardDeps` 型の export（外部利用がある場合）                | LOW    | 現状確認後に判断       |
| テストの `createMockApp` / `createMockDialog` をヘルパーファイルに移動 | LOW    | 不要（テスト内で完結） |
| `console.warn` のメッセージ定数化                                      | LOW    | 不要（1箇所のみ）      |

**想定結論**: リファクタリング対象なし（変更なし）

## 実行タスク

1. `BeforeQuitGuardDeps` と `registerBeforeQuitGuard` の責務境界を確認する
2. `beforeQuitGuard.test.ts` のモック構成を見直す
3. 必要な変更がなければ「変更なし」で記録する

## 参照資料

| 参照資料               | パス                                                          | 用途               |
| ---------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 5 実装記録       | `phase-5-implementation.md`                                   | 変更不要方針の確認 |
| beforeQuitGuard 実装   | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                | export / 型確認    |
| beforeQuitGuard テスト | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts` | モック確認         |

## 実行手順

1. 上記コマンドで現状を確認する
2. リファクタリング対象があれば実施する（なければスキップ）
3. リファクタリング後も全テストが Green であることを確認する

```bash
pnpm --filter @repo/desktop test --run
```

## 成果物

| 成果物          | パス                                 | 説明                      |
| --------------- | ------------------------------------ | ------------------------- |
| refactoring-log | `outputs/phase-8/refactoring-log.md` | 変更なし / 変更ありの記録 |

## 統合テスト連携

- リファクタリング後は Phase 6 / 7 のテスト結果を再確認する
- 変更なしの場合でも Phase 10 の総合レビューに結果を引き継ぐ

## 完了条件

- [ ] リファクタリング候補を確認した
- [ ] 変更した場合は全テスト Green を確認
- [ ] `outputs/phase-8/refactoring-log.md` に「変更なし」または変更内容を記録

## タスク 100% 実行確認【必須】

- [ ] リファクタリング方針を決定した（変更あり/なし）
- [ ] 変更した場合は全テスト Green を確認した

## 次 Phase

Phase 8 完了後、Phase 9（品質保証）に進む。
