# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001      |
| 機能名     | SkillCreateWizard / LLM生成テスト 削除済み確認 |
| 前提Phase  | Phase 3（PASS または MINOR）                   |
| 後続Phase  | -                                              |
| 作成日     | 2026-04-16                                     |
| ステータス | pending                                        |

## 目的

current worktree では `SkillCreateWizard.llm-generation.test.tsx` が削除済み。
この Phase では復元・再生成を行わず、削除済み確認と残存参照の有無を N/A 前提で整理する。

## 実行タスク

- [ ] 対象ファイルの存在確認
- [ ] 対象ファイルが削除済みなら、単体 `grep` / `vitest` / `rm` は実行しない
- [ ] `SkillCreateWizard.test.tsx` の補完要否だけ確認する
- [ ] `TODO(W2-seq-03a)` と `describe.skip` の扱いは、対象ファイルが存在する場合のみ確認する
- [ ] Phase 5 以降へ引き継ぐ必要がある場合は N/A で記録する
- [ ] AC-1〜AC-5 を削除済み前提で整理する

## 参照資料

| 資料名                                    | パス                                                                                             | 用途                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 2 設計書                            | `outputs/phase-2/design.md`                                                                      | テスト設計・IPC モックパターン参照 |
| Phase 3 レビュー結果                      | `outputs/phase-3/gate-decision.md`                                                               | 選択肢 A/B の判断確認              |
| SkillCreateWizard.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | companion テスト確認               |
| SkillCreateWizard.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済みのため N/A                 |
| SkillCreateWizard.tsx                     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | 現行実装確認                       |
| aiworkflow-requirements refs              | `.claude/skills/aiworkflow-requirements/references/`                                             | プロジェクト共通仕様参照           |

依存 Phase 参照: Phase 3 の判断結果は参考情報とし、current worktree では削除済み事実を優先する。

## 実行手順

### 0. 安全な存在確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  rg -n "describe\.skip|TODO\(W2-seq-03a\)" "$target_file"
else
  echo "N/A: $target_file は削除済み"
fi
```

### 1. companion test の確認

```bash
rg -n "createSkill|isGenerating|handleGenerate" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### 2. 対象ファイルが存在する場合のみ単体確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  pnpm --filter @repo/desktop exec vitest run \
    src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx \
    --reporter=verbose
else
  echo "N/A: 削除済みのため単体 vitest は実行しない"
fi
```

### 3. 共通確認

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携【必須】

| 判定項目                                | 基準                                    | 結果    |
| --------------------------------------- | --------------------------------------- | ------- |
| 対象ファイルの削除済み確認              | 削除済みまたは存在時の安全確認が完了    | pending |
| companion test の参照確認               | `SkillCreateWizard.test.tsx` を確認済み | pending |
| `pnpm --filter @repo/desktop test:run`  | PASS                                    | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                                    | pending |

## 多角的チェック観点

| 観点     | チェック内容                                                              |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | 削除済みファイルを復元せず、current worktree の事実と一致しているか       |
| 漏れ     | 対象ファイルが無い状態で、単体 `grep` / `vitest` を誤って実行していないか |
| 整合性   | companion test の参照が現行 API と一致しているか                          |
| 依存関係 | Phase 5 以降が削除済み前提で N/A に切り替えられる記述になっているか       |

## サブタスク管理

1. 対象ファイルの存在確認
2. 削除済みなら N/A 記録へ切替
3. companion test の確認
4. 対象ファイルが存在する場合のみ単体確認
5. `pnpm --filter @repo/desktop test:run` 実行
6. `pnpm --filter @repo/desktop typecheck` 実行
7. AC-1〜AC-5 の整理

## 成果物

| 成果物           | パス                                        | 説明                      |
| ---------------- | ------------------------------------------- | ------------------------- |
| 削除済み確認記録 | `outputs/phase-4/deletion-record.md`        | 削除済み事実と N/A の記録 |
| 実装サマリー     | `outputs/phase-4/implementation-summary.md` | companion test の確認要約 |

## 完了条件

- [ ] 対象ファイルが削除済みであること、または存在時の安全確認を完了済み
- [ ] 対象ファイル単体の `grep` / `vitest` を、存在しない状態では実行していない
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

Phase 5: 実装
