# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 8                                                              |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                      |
| 機能名     | SkillCreateWizard LLM生成フロー 削除済み前提のリファクタリング |
| 前提Phase  | Phase 7                                                        |
| 後続Phase  | Phase 9                                                        |
| 作成日     | 2026-04-16                                                     |
| ステータス | pending                                                        |

## 目的

current worktree では `SkillCreateWizard.llm-generation.test.tsx` が削除済み。
この Phase では削除済みファイルに対する TODO / `describe.skip` の直接確認は行わず、
現行の `SkillCreateWizard.test.tsx` と周辺 docs の整合だけを確認する。

## 実行タスク

- [ ] 対象ファイルが削除済みであることを再確認する
- [ ] 対象ファイルが存在する場合のみ `TODO(W2-seq-03a)` と `describe.skip` を確認する
- [ ] 存在しない場合は `SkillCreateWizard.test.tsx` の import 整理と整形だけ確認する
- [ ] `pnpm --filter @repo/desktop test:run` と `typecheck` を実行する
- [ ] リファクタリングログを N/A 含めて記録する

## 参照資料

| 資料名                 | パス                                                                                             | 用途                    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| 整理済みテストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済みのため N/A      |
| 参照テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | import / 整形確認       |
| Phase 5 成果物         | `outputs/phase-5/implementation-summary.md`                                                      | 削除済み前提の確認      |
| Phase 7 成果物         | `outputs/phase-7/coverage-report.md`                                                             | coverage 結果の引き継ぎ |

## 実行手順

### 1. 安全な存在確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  rg -n "TODO\(W2-seq-03a\)|describe\.skip|it\.skip|test\.skip" "$target_file"
else
  echo "N/A: $target_file は削除済み"
fi
```

### 2. companion test の import と整形確認

```bash
rg -n "^import" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

pnpm --filter @repo/desktop exec prettier --check \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### 3. 共通確認

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携【必須】

| 判定項目                                | 基準                           | 結果    |
| --------------------------------------- | ------------------------------ | ------- |
| 対象ファイルの削除済み確認              | 削除済みまたは存在時の安全確認 | pending |
| companion test の import / 整形確認     | 0 error / 0 diff               | pending |
| `pnpm --filter @repo/desktop test:run`  | PASS                           | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                           | pending |

## 多角的チェック観点

| 観点     | チェック内容                                                                           |
| -------- | -------------------------------------------------------------------------------------- |
| 矛盾     | 削除済みファイルを前提にした cleanup を再開していないか                                |
| 漏れ     | `TODO(W2-seq-03a)` と `describe.skip` を、対象ファイルが存在しない状態で追っていないか |
| 整合性   | companion test の import と整形が current worktree の実装と一致するか                  |
| 依存関係 | Phase 7 の coverage 結果を踏まえて、追加 cleanup が不要か                              |

## サブタスク管理

1. 対象ファイルの削除済み確認
2. 対象ファイルが存在する場合のみ追加確認
3. companion test の import / 整形確認
4. `pnpm --filter @repo/desktop test:run` 実行
5. `pnpm --filter @repo/desktop typecheck` 実行
6. リファクタリングログ作成

## 成果物

| 成果物               | パス                                 | 説明                                   |
| -------------------- | ------------------------------------ | -------------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | TODO削除・整形・削除済み確認結果の記録 |

## 完了条件

- [ ] 対象ファイルが削除済みであること、または存在時の安全確認を完了済み
- [ ] 対象ファイルが存在しない状態で `TODO(W2-seq-03a)` / `describe.skip` を追っていない
- [ ] `SkillCreateWizard.test.tsx` の import 整理と整形を確認済み
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] リファクタリングログ（`outputs/phase-8/refactoring-log.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 9: 品質保証
