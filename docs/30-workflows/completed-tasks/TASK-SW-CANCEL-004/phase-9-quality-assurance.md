# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                                            |
| -------- | ------------------------------------------------------------- |
| Phase    | 9                                                             |
| タスクID | TASK-SW-CANCEL-004                                            |
| 前Phase  | [phase-8-refactoring.md](phase-8-refactoring.md)              |
| 次Phase  | [phase-10-final-review.md](phase-10-final-review.md)          |
| 目的     | typecheck / lint / targeted test を確認し品質ゲートを通過する |

## 目的

typecheck / lint / targeted test を確認し品質ゲートを通過する。

## 実行タスク

### タスク1: 品質ゲート実行

**目的**: 型、lint、targeted test、全体テストの pass/fail を確定する。

**実行手順**:

1. typecheck / lint を実行する。
2. cancel 関連 targeted test を実行する。
3. 全体テストを実行するか、対象外の場合は理由を記録する。

**期待される成果物**:

- 品質ゲート報告
- コマンド実行結果

### タスク2: 失敗時の再実行条件整理

**目的**: fail 時の戻り先を明確にし、Phase 10 へ不整合を持ち込まない。

**実行手順**:

1. エラー種別ごとに戻り先を特定する。
2. 修正内容と再実行結果を記録する。

**期待される成果物**:

- fail 対応履歴

## 品質チェックコマンド

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# targeted test（キャンセル関連）
pnpm --filter @repo/desktop test -- useCancelGeneration
pnpm --filter @repo/desktop test -- skillCreatorHandlers

# 全テスト
pnpm --filter @repo/desktop test
```

## 品質ゲート基準

| チェック項目          | 基準        | 失敗時対応                   |
| --------------------- | ----------- | ---------------------------- |
| TypeScript 型チェック | エラー 0 件 | 型定義を修正して再実行       |
| ESLint                | エラー 0 件 | lint エラーを修正して再実行  |
| targeted test         | 全 pass     | テストを修正して再実行       |
| 全テスト              | 全 pass     | リグレッションを特定して修正 |

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-5-implementation.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-8-refactoring.md`
- `apps/desktop/package.json`

## 成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 品質ゲート報告 | `outputs/phase-9/quality-gate-report.md` |

### quality-gate-report.md の必須記載

- 各コマンドの実行結果（pass/fail）
- エラーがあった場合の修正内容
- 最終的な全 pass の確認

## 統合テスト連携

- Phase 10 の AC-7 / AC-8 判定に本 Phase の結果を直接引き渡す。
- cancel chain の targeted test と全体テストを同時に確認し、局所 pass を全体 pass と誤認しない。

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件
- [ ] `pnpm --filter @repo/desktop test -- useCancelGeneration` が全 pass
- [ ] `pnpm --filter @repo/desktop test` が全 pass
- [ ] `quality-gate-report.md` に全項目の結果が記録されている
