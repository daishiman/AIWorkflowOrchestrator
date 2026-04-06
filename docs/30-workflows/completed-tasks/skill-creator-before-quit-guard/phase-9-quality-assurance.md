# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 9                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.5h                                     |

## 目的

静的解析・型チェック・セキュリティ観点で品質を保証する。AC-8（TypeScript 型チェック PASS、ESLint エラーなし）を達成する。

## 実行タスク

1. TypeScript 型チェック実行
2. ESLint 実行
3. セキュリティ観点のレビュー
4. consumer 契約影響確認（既存コードへの影響なし確認）

## 参照資料

| 参照資料                 | パス                                                                  | 用途                 |
| ------------------------ | --------------------------------------------------------------------- | -------------------- |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                              | 変更なし方針の確認   |
| beforeQuitGuard 実装     | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                        | セキュリティ観点確認 |
| beforeQuitGuard テスト   | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`         | 振る舞い確認         |
| Facade 実装              | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 依存影響確認         |

## 実行手順

### ステップ 1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

エラーがないことを確認する。

### ステップ 2: ESLint

```bash
pnpm --filter @repo/desktop lint
```

エラー・警告がないことを確認する（警告は記録して判断）。

### ステップ 3: セキュリティ観点レビュー

| チェック項目                                                   | 判定基準                                             | 確認方法       |
| -------------------------------------------------------------- | ---------------------------------------------------- | -------------- |
| `app.exit(0)` が任意のコードから呼べないか                     | `registerBeforeQuitGuard` 内部にカプセル化されている | コードレビュー |
| `dialog.showMessageBox` の入力がサニタイズされているか         | 固定文字列のみ使用（ユーザー入力なし）               | コードレビュー |
| `facade` の型が `RuntimeSkillCreatorFacade` に限定されているか | `BeforeQuitGuardDeps` 型で制約                       | 型確認         |

### ステップ 4: consumer 契約影響確認

```bash
# before-quit ガードの使用箇所確認
rg -n "registerBeforeQuitGuard|hasRunningExecution" \
  apps/desktop/src/ -g "*.ts"

# 既存テストへの影響確認
pnpm --filter @repo/desktop test --run
```

`beforeQuitGuard.ts` と `hasRunningExecution()` の変更が他のコードに影響を与えていないことを確認する。

## 成果物

| 成果物         | パス                                | 説明                                         |
| -------------- | ----------------------------------- | -------------------------------------------- |
| quality-report | `outputs/phase-9/quality-report.md` | 型チェック / ESLint / セキュリティ確認の記録 |

## 統合テスト連携

- Phase 6 / 7 のテスト記録を前提に静的解析を実施する
- Phase 10 で AC-8 と品質指標の判定に接続する

## 品質チェックリスト

| 項目                                 | 判定  |
| ------------------------------------ | ----- |
| TypeScript 型チェック PASS           | ✅/❌ |
| ESLint エラーなし                    | ✅/❌ |
| ユーザー入力のサニタイズ（該当なし） | N/A   |
| `app.exit(0)` のカプセル化           | ✅/❌ |
| 既存テスト全件 PASS                  | ✅/❌ |

## 完了条件

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` エラーなし
- [ ] セキュリティ観点の3項目をチェック済み
- [ ] `outputs/phase-9/quality-report.md` に結果記録

## タスク 100% 実行確認【必須】

- [ ] 品質チェックリスト全項目を評価した
- [ ] 全チェックが PASS であることを確認した

## 次 Phase

Phase 9 完了後、Phase 10（最終レビューゲート）に進む。
