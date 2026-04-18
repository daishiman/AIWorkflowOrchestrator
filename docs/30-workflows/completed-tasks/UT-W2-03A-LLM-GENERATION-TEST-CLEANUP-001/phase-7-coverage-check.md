# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 7                                                            |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                    |
| 機能名     | SkillCreateWizard LLM生成フロー 削除済み前提のカバレッジ確認 |
| 前提Phase  | Phase 6                                                      |
| 後続Phase  | Phase 8                                                      |
| 作成日     | 2026-04-16                                                   |
| ステータス | pending                                                      |

## 目的

旧テスト本体が削除済みのため、固定の本数前提や `describe.skip` 前提は使わない。
カバレッジは現行の `SkillCreateWizard.tsx` と `SkillCreateWizard.test.tsx` を基準に実測し、
削除済みの suite は N/A として扱う。

## 実行タスク

- [ ] `SkillCreateWizard.tsx` の coverage を現行 suite で実測する
- [ ] 削除済み suite 由来の coverage は N/A として記録する
- [ ] `SkillCreateWizard.test.tsx` で補完が必要かだけ確認する
- [ ] 変更がある場合のみカバレッジ差分と未到達行を記録する
- [ ] Phase 8 へ実測結果を引き継ぐ

## 参照資料

| 資料名                 | パス                                                                                             | 用途               |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| 整理済みテストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済みのため N/A |
| 参照テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | coverage 補完確認  |
| Phase 5 成果物         | `outputs/phase-5/implementation-summary.md`                                                      | 削除済み前提の確認 |
| Phase 6 成果物         | `outputs/phase-6/test-expansion-log.md`                                                          | 補完の要否確認     |

## 実行手順

### 1. カバレッジ計測

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  src/renderer/components/skill/__tests__/
```

### 2. テキストレポート確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  src/renderer/components/skill/__tests__/ \
  2>&1 | rg -A 20 "SkillCreateWizard"
```

### 3. 削除済み suite の扱い確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  echo "想定外: $target_file が存在するため、coverage は N/A ではなく別途確認が必要"
else
  echo "N/A: $target_file は削除済み"
fi
```

### 4. 未到達コード分析

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=html \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  src/renderer/components/skill/__tests__/

ls apps/desktop/coverage/
```

## 統合テスト連携【必須】

| 判定項目                                  | 基準       | 結果    |
| ----------------------------------------- | ---------- | ------- |
| `SkillCreateWizard.tsx` Line カバレッジ   | 80%+       | pending |
| `SkillCreateWizard.tsx` Branch カバレッジ | 60%+       | pending |
| 削除済み suite 由来の coverage            | N/A        | pending |
| `SkillCreateWizard.test.tsx` の補完要否   | 必要時のみ | pending |

## 多角的チェック観点

| 観点     | チェック内容                                                                |
| -------- | --------------------------------------------------------------------------- |
| 矛盾     | 削除済み suite を前提にした固定本数の評価になっていないか                   |
| 漏れ     | 現行 `SkillCreateWizard.tsx` の branch / line coverage を見落としていないか |
| 整合性   | `SkillCreateWizard.test.tsx` との補完関係が current worktree と一致するか   |
| 依存関係 | Phase 8 の cleanup が、coverage 結果を前提に安全に進められるか              |

## サブタスク管理

1. coverage 計測
2. テキストレポート確認
3. 削除済み suite の N/A 記録
4. 未到達コードの確認
5. 補完要否の整理
6. coverage report 作成

## 成果物

| 成果物             | パス                                 | 説明                         |
| ------------------ | ------------------------------------ | ---------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・変化分析・N/A 記録 |

## 完了条件

- [ ] `SkillCreateWizard.tsx` を対象にカバレッジ計測済み
- [ ] Line カバレッジが 80%+ を達成
- [ ] Branch カバレッジが 60%+ を達成
- [ ] 削除済み suite 由来の coverage を N/A で整理済み
- [ ] `SkillCreateWizard.test.tsx` の補完要否を確認済み
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
