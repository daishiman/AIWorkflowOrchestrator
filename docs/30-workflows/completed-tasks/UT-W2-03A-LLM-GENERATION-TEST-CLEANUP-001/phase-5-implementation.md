# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 5                                                      |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001              |
| 機能名     | SkillCreateWizard LLM生成フロー 削除済み前提の実装確認 |
| 前提Phase  | Phase 4                                                |
| 後続Phase  | Phase 6                                                |
| 作成日     | 2026-04-16                                             |
| ステータス | pending                                                |

## 目的

`SkillCreateWizard.llm-generation.test.tsx` は current worktree で削除済み。
この Phase では復元・書き直しは行わず、削除済み前提を固定して N/A を記録する。

## 実行タスク

- [ ] 対象ファイルが削除済みであることを確認する
- [ ] 対象ファイル単体の `grep` / `vitest` / `rm` を行わない
- [ ] 必要がある場合のみ `SkillCreateWizard.test.tsx` 側の補完要否を記録する
- [ ] `pnpm --filter @repo/desktop test:run` と `typecheck` を実行する
- [ ] Phase 6 へ渡す情報を N/A 含めて整理する

## 参照資料

| 資料名                 | パス                                                                                             | 用途                    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| Phase 4 削除済み確認   | `outputs/phase-4/deletion-record.md`                                                             | 削除済み前提の引き継ぎ  |
| 参照テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | companion test 確認     |
| 整理対象テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済みのため N/A      |
| Phase 4 実装サマリー   | `outputs/phase-4/implementation-summary.md`                                                      | companion test 確認要約 |

## 実行手順

### 0. 安全な存在確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  echo "想定外: $target_file が存在するため、復元は行わず N/A 扱いにする"
else
  echo "N/A: $target_file は削除済み"
fi
```

### 1. companion test の確認

```bash
rg -n "createSkill|isGenerating|handleGenerate" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### 2. 共通確認

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携【必須】

| 判定項目                                | 基準                         | 結果    |
| --------------------------------------- | ---------------------------- | ------- |
| 対象ファイルの削除済み確認              | 削除済みまたは想定外時の停止 | pending |
| companion test の参照確認               | 現行 API と整合              | pending |
| `pnpm --filter @repo/desktop test:run`  | PASS                         | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                         | pending |

## 多角的チェック観点

| 観点     | チェック内容                                                         |
| -------- | -------------------------------------------------------------------- |
| 矛盾     | 削除済みファイルを復元せず、current worktree の事実と一致しているか  |
| 漏れ     | 対象ファイルに対する直接コマンドを、存在しない状態で実行していないか |
| 整合性   | companion test の確認が Phase 4 の記録と一致しているか               |
| 依存関係 | Phase 6 以降が削除済み前提で N/A に切り替わる前提と整合しているか    |

## サブタスク管理

1. 対象ファイルが削除済みであることを確認
2. 想定外に存在する場合でも復元しない
3. companion test の確認
4. `pnpm --filter @repo/desktop test:run` 実行
5. `pnpm --filter @repo/desktop typecheck` 実行
6. Phase 6 へ N/A を引き継ぐ

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 削除済み前提の実装記録 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | N/A を含む変更対象一覧 |

## 完了条件

- [ ] 対象ファイルが削除済みであること、または想定外時に復元しない方針を確認済み
- [ ] 対象ファイル単体の `grep` / `vitest` / `rm` を実行していない
- [ ] `SkillCreateWizard.test.tsx` の補完要否を確認済み
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
