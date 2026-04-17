# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 13                                                           |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                    |
| 機能名     | SkillCreateWizard LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 12                                                     |
| 後続Phase  | -（本タスクでは実行しない）                                  |
| 作成日     | 2026-04-16                                                   |
| ステータス | blocked                                                      |

## 目的

commit / push / PR 作成は本タスクのスコープ外とする。current worktree で対象ファイルが削除済みであっても、この扱いは変えず、ユーザーが明示的に承認した場合のみ別途実施する。

依存 Phase 参照: Phase 4 / Phase 5 / Phase 6 / Phase 9 の成果物を前提にする（`outputs/phase-4/`, `outputs/phase-5/`, `outputs/phase-6/`, `outputs/phase-9/qa-results.md`）

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成ゲートのみ保持する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
test/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
```

### PR タイトル

```
test(desktop): UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 削除済み前提の残存参照整理
```

### PR 本文テンプレート

```markdown
## Summary

- `SkillCreateWizard.llm-generation.test.tsx` の削除済み確認と残存参照整理
- `TODO(W2-seq-03a)` コメントの残存有無を全件確認
- 選択肢B採用時は新フロー用エッジケーステストを追加（選択肢A時は N/A）
- `pnpm --filter @repo/desktop test:run` が全件 PASS することを確認済み

## Test plan

- [ ] `pnpm --filter @repo/desktop test:run` が全件 PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が PASS すること
- [ ] `describe.skip` が対象テストファイルに残存していないこと、または対象ファイル削除済みであることを確認
- [ ] `TODO(W2-seq-03a)` コメントが 0 件であることを確認

## Related Issue

Task: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# describe.skip 残存確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -r "describe\.skip" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo "N/A: target file deleted"
fi
# 期待: 出力なし、または N/A（対象ファイル削除済み）

# TODO コメント残存確認
grep -r "TODO(W2-seq-03a)" apps/desktop/src/
# 期待: 出力なし
```

### 2. 変更内容の要約

`outputs/phase-13/pr-info.md` に以下を記録する:

- 変更ファイル一覧（`git diff --stat`）
- テスト・lint・typecheck の実行結果
- PR タイトル・ブランチ名・PR 本文（上記テンプレート）
- blocked 状態の記録

### 3. CI 確認手順（PR 作成後、ユーザー承認時に実施）

PR 作成後は以下の CI チェックを確認する:

| CI チェック項目          | 確認コマンド                                          | 期待結果 |
| ------------------------ | ----------------------------------------------------- | -------- |
| TypeScript 型チェック    | `gh run view --repo daishiman/AIWorkflowOrchestrator` | PASS     |
| ESLint                   | CI ログを確認                                         | PASS     |
| Vitest（ユニットテスト） | CI ログを確認                                         | PASS     |

```bash
# PR 作成後の CI ステータス確認
gh pr checks <PR番号> --repo daishiman/AIWorkflowOrchestrator

# CI 実行履歴の確認
gh run list --repo daishiman/AIWorkflowOrchestrator --limit 5
```

### 4. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成
git checkout -b test/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001

# コミット（pre-commit フックを通す・--no-verify 禁止）
git add apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
git commit -m "test(desktop): UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 削除済み前提の残存参照整理

- SkillCreateWizard.llm-generation.test.tsx の削除済み確認と残存参照整理
- TODO(W2-seq-03a) コメントの残存有無を全件確認
- 選択肢B採用時は新フロー用エッジケーステストを追加（選択肢A時は N/A）

Task: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001"

# プッシュ
git push -u origin test/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001

# PR 作成
gh pr create \
  --title "test(desktop): UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 削除済み前提の残存参照整理" \
  --body "$(cat <<'EOF'
## Summary

- `SkillCreateWizard.llm-generation.test.tsx` の削除済み確認と残存参照整理
- `TODO(W2-seq-03a)` コメントの残存有無を全件確認
- 選択肢B採用時は新フロー用エッジケーステストを追加（選択肢A時は N/A）
- `pnpm --filter @repo/desktop test:run` が全件 PASS することを確認済み

## Test plan

- [ ] `pnpm --filter @repo/desktop test:run` が全件 PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が PASS すること
- [ ] `describe.skip` が対象テストファイルに残存していないこと、または対象ファイル削除済みであることを確認
- [ ] `TODO(W2-seq-03a)` コメントが 0 件であることを確認

## Related Issue

Task: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
EOF
)"
```

### 5. マージ後のクリーンアップ手順（ユーザー承認後のみ実行）

```bash
# マージ後のローカルブランチ削除
git branch -d test/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001

# リモートブランチ削除
git push origin --delete test/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001

# main ブランチへの切り替えと同期
git checkout main
git pull origin main
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）
- `--no-verify` オプションの使用（**絶対禁止**）

> **`--no-verify` は絶対に使用しないこと。**
> pre-commit フック（lint-staged）と pre-push フック（全テスト実行）をスキップすると、
> CI で初めてエラーが検出され、修正に余計な時間がかかる。
> テストが失敗する場合は `--no-verify` を使わず、テストを修正すること。

## 参照資料

| 資料名                       | パス                                                                                               | 説明            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| 最終レビュー                 | `outputs/phase-10/final-review.md`                                                                 | Phase 10 成果物 |
| 手動テスト                   | `outputs/phase-11/manual-test-result.md`                                                           | Phase 11 成果物 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                                      | Phase 12 成果物 |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                                         | Phase 12 成果物 |
| 実装ガイド                   | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー     | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-system-spec-update-summary.md`         | Phase 12 成果物 |
| ドキュメント更新履歴         | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-documentation-changelog.md`            | Phase 12 成果物 |
| 未タスク検出レポート         | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバックレポート | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-skill-feedback-report.md`              | Phase 12 成果物 |
| Phase 12 準拠チェック        | `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明                           |
| ------ | ----------------------------- | ------------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |

## 完了条件

- [ ] ローカル確認結果（typecheck / lint / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・PR 本文テンプレートが `pr-info.md` に記録されている
- [ ] CI 確認手順が記録されている
- [ ] マージ後クリーンアップ手順が記録されている
- [ ] commit / push / PR を実行していない
- [ ] `--no-verify` を使用していない
- [ ] blocked 状態を記録した
- [ ] 本 Phase 内の全タスクを 100% 実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] `--no-verify` を使用していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
