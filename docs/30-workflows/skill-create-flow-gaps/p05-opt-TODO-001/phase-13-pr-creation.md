# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 13                                   |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 12                             |
| 後続Phase  | -（本タスクでは実行しない）          |
| 作成日     | 2026-04-15                           |
| ステータス | blocked                              |

## 目的

commit / push / PR 作成は本タスクのスコープ外とする。ユーザーが明示的に承認した場合のみ、別途実施する。

- 依存Phase参照: Phase 2 / Phase 5 / Phase 7 / Phase 8 / Phase 9 の成果物を前提にする（`outputs/phase-2/design.md`, `outputs/phase-5/implementation-summary.md`, `outputs/phase-7/coverage-report.md`, `outputs/phase-8/refactoring-log.md`, `outputs/phase-9/quality-report.md`）

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成ゲートのみ保持する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
chore/TASK-SW-TODO-001-todo-cleanup
```

### PR タイトル

```
chore(skill-wizard): ConversationRoundStep TODO コメント整理 [TASK-SW-TODO-001]
```

### PR 本文テンプレート（パターンA: TODOコメント削除の場合）

```markdown
## Summary

- `ConversationRoundStep.tsx:456` 付近の `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントを削除
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクが完了済みであることを確認し、参照 TODO を除去
- `MAIN_TOOL_BADGE_ENABLED` フラグを整理（Phase 2 設計書の方針に従う）
- `shouldShowMainToolBadge` 関数のロジックに変更なし（UIの動作は従来通り）

## Test plan

- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が 0 error であること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS すること
- [ ] `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` が 0件であること
- [ ] Q5 で複数ツール選択時に先頭オプションに主ツールバッジが表示されること（手動確認）

## Related

Task: TASK-SW-TODO-001
Parent: skill-create-flow-gaps
```

### PR 本文テンプレート（パターンB: TODOコメント更新の場合）

```markdown
## Summary

- `ConversationRoundStep.tsx:456` 付近の `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントを現状に即した NOTE コメントへ更新
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が未完了であることを確認し、削除条件を明記したコメントへ書き換え
- `shouldShowMainToolBadge` 関数のロジックに変更なし（UIの動作は従来通り）
- コメント更新により将来の変更者が削除タイミングを把握できるようにした

## Test plan

- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が 0 error であること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS すること
- [ ] 旧 TODO コメント（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`）が 0件であること
- [ ] Q5 で複数ツール選択時に先頭オプションに主ツールバッジが表示されること（手動確認）

## Related

Task: TASK-SW-TODO-001
Parent: skill-create-flow-gaps
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# 既存テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# TODOコメント除去確認
grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### 2. 変更内容の要約

`outputs/phase-13/pr-info.md` に以下を記録する:

- 変更ファイル一覧（`git diff --stat`）
- 採用パターン（A または B）
- 型チェック・lint・テストの実行結果
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
```

### 4. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成
git checkout -b chore/TASK-SW-TODO-001-todo-cleanup

# コミット（pre-commit フックを通す）
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git commit -m "chore(skill-wizard): ConversationRoundStep TODOコメント整理

- TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001) コメントを整理
- 完了済みの場合: コメントを削除 / 未完了の場合: 現状に即した NOTE へ更新

Task: TASK-SW-TODO-001"

# プッシュ
git push -u origin chore/TASK-SW-TODO-001-todo-cleanup

# PR 作成
gh pr create \
  --title "chore(skill-wizard): ConversationRoundStep TODO コメント整理 [TASK-SW-TODO-001]" \
  --body "$(cat <<'EOF'
## Summary

- `ConversationRoundStep.tsx` の TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001) コメントを整理
- `shouldShowMainToolBadge` 関数のロジックに変更なし（UIの動作は従来通り）

## Test plan

- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が 0 error であること
- [ ] 既存テストが全 PASS すること
- [ ] 旧 TODO コメントが 0件であること

## Related

Task: TASK-SW-TODO-001
EOF
)"
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名               | パス                                          | 説明            |
| -------------------- | --------------------------------------------- | --------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明                           |
| ------ | ----------------------------- | ------------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |

## 完了条件

- [ ] ローカル確認結果（typecheck / lint / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・PR 本文テンプレートが `pr-info.md` に記録されている
- [ ] CI 確認手順が記録されている
- [ ] commit / push / PR を実行していない
- [ ] blocked 状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
