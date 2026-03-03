# Phase 13: PR作成

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 13                           |
| 機能名     | skill-create-wizard          |
| タスクID   | TASK-10A-C                   |
| 作成日     | 2026-03-03                   |
| ステータス | pending                      |
| 依存Phase  | Phase 12（ドキュメント更新） |

## 目的

TASK-10A-Cの全成果物（実装コード・テスト・ドキュメント）をmainブランチにマージするためのPull Requestを作成し、コードレビューとCI/CDの通過を確認する。

## 実行タスク

- PR準備タスク: 品質最終確認、コミット/PR作成準備、CI確認を実施する。

1. **コミット前品質チェック** — lint・typecheck・テストの全PASS確認
2. **コミット作成** — 適切なコミットメッセージでステージング・コミット
3. **PR作成** — 70文字以内タイトル、Summary + Test Plan を含む本文
4. **CI確認** — GitHub ActionsのCI/CDが通過していることを確認
5. **artifacts.json 最終更新** — phase-13 ステータスを `completed` に更新

## 参照資料

| 資料                     | パス                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-8-refactoring.md`       |
| Phase 9 品質保証         | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-10-final-review.md`     |
| Phase 11 手動テスト      | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-11-manual-test.md`      |
| PR作成ルール             | `.claude/rules/07-git-and-tooling.md#PR作成ルール`                                   |
| コミット前チェックリスト | `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`                       |
| CLAUDE.md Git禁止事項    | `CLAUDE.md#Git操作の禁止事項`                                                        |
| Phase 12 成果物          | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-12/`            |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 |
| API 設計原則             | `.claude/skills/aiworkflow-requirements/references/api-core.md`                      |
| task-workflow ルール     | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`           |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                 |

## 実行手順

### ステップ 1: コミット前品質チェック

> ⚠️ **`--no-verify` は絶対禁止**（CLAUDE.md参照）

```bash
# プロジェクトルートで実行
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator

# 1. Lint チェック
pnpm lint

# 2. 型チェック
pnpm typecheck

# 3. 関連テストの実行
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/

# 全テスト実行（変更範囲に統合影響がある場合）
pnpm --filter @repo/desktop test
```

**失敗時の対処**:

- Lint エラー: `pnpm lint --fix` で自動修正を試みる
- 型エラー: 型定義を修正する（型アサーション `as` でバイパスしない）
- テスト失敗: テストコードまたは実装を修正する（`.skip` を使う場合はIssue/TODOを作成）

### ステップ 2: ブランチ確認

```bash
# 現在のブランチ確認
git status
git branch

# 正しいブランチにいることを確認
# ブランチ名: feature/task-10a-c-skill-create-wizard
# または作業中のworktreeブランチ
```

worktreeで作業している場合:

```bash
# worktreeの状態確認
git worktree list
```

### ステップ 3: 変更内容の確認

```bash
# 変更ファイル一覧の確認
git diff --stat

# 未追跡ファイルの確認
git status

# 具体的な変更内容の確認
git diff
```

**確認すべき成果物**:

| カテゴリ     | ファイル                                                                          | 状態 |
| ------------ | --------------------------------------------------------------------------------- | ---- |
| コード       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | 新規 |
| コード       | `apps/desktop/src/renderer/components/skill/wizard/`（サブコンポーネント）        | 新規 |
| テスト       | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 新規 |
| IPC          | `apps/desktop/src/preload/skill-api.ts`（`create()` メソッド追加）                | 修正 |
| IPC          | `apps/desktop/src/main/ipc/skillHandlers.ts`（`skill:create` ハンドラー追加）     | 修正 |
| 型定義       | `apps/desktop/src/preload/types.ts`（SkillAPI型に create 追加）                   | 修正 |
| ドキュメント | `docs/30-workflows/completed-tasks/skill-create-wizard/`（Phase仕様書・成果物）   | 新規 |

### ステップ 4: コミット作成

```bash
# 関連ファイルをステージング
git add apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
git add apps/desktop/src/renderer/components/skill/wizard/
git add apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
git add apps/desktop/src/preload/skill-api.ts
git add apps/desktop/src/main/ipc/skillHandlers.ts
git add apps/desktop/src/preload/types.ts
git add docs/30-workflows/completed-tasks/skill-create-wizard/

# 仕様更新は差分対象ファイルのみを明示的にステージング（過剰取り込み防止）
git add .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/aiworkflow-requirements/SKILL.md
git add .claude/skills/aiworkflow-requirements/references/ui-ux-components.md
git add .claude/skills/aiworkflow-requirements/indexes/topic-map.md
git add .claude/skills/task-specification-creator/LOGS.md

# コミットメッセージ形式（Conventional Commits）
git commit -m "$(cat <<'EOF'
feat(skill): TASK-10A-C SkillCreateWizard 4ステップウィザードUI実装

- 新規スキル作成用4ステップウィザードUI（describe/configure/generate/complete）
- IPC skill:create ハンドラー追加とPreload APIへのcreate()メソッド追加
- SkillCreatorService連携によるAI駆動スキル自動生成フロー実装

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

> **注意**: コミットメッセージは70文字以内（タイトル行）を目指すこと。詳細は本文に記載する。

### ステップ 5: ブランチのPush

```bash
# リモートにpush（初回はトラッキングブランチを設定）
git push -u origin feature/task-10a-c-skill-create-wizard
```

> ⚠️ **`git push --force` は禁止**。`--force` が必要な場合は原因を調査すること。

### ステップ 6: PR作成

```bash
gh pr create \
  --title "feat(skill): SkillCreateWizard 4ステップウィザードUI実装 [TASK-10A-C]" \
  --body "$(cat <<'EOF'
## Summary

- SkillCreateWizard コンポーネントを実装（describe → configure → generate → complete の4ステップウィザード）
- `skill:create` IPCハンドラーと Preload API `create()` メソッドを追加
- SkillCreatorService との連携によりAI駆動でスキルを自動生成するフローを実現

## 変更ファイル

### コード
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/wizard/`（新規）

### IPC/Preload
- `apps/desktop/src/preload/skill-api.ts`（`create()` メソッド追加）
- `apps/desktop/src/main/ipc/skillHandlers.ts`（`skill:create` ハンドラー追加）
- `apps/desktop/src/preload/types.ts`（型定義追加）

## スコープ境界

- **本PR**: SkillCreateWizard コンポーネント単体（TASK-10A-C）
- **次PR**: SkillManagementPanel との統合（TASK-10A-D）

## Test Plan

- [ ] `pnpm lint` が PASS することを確認
- [ ] `pnpm typecheck` が PASS することを確認
- [ ] SkillCreateWizard のユニットテストが全 PASS することを確認
- [ ] Phase 11 手動テストシナリオ 1〜9 が PASS していることを確認
- [ ] ライトモード/ダークモードの表示を目視確認
- [ ] キーボード操作（Tab/Enter/Escape）が正しく動作することを確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**PRタイトルの文字数確認**（70文字以内の制約）:

```bash
echo -n "feat(skill): SkillCreateWizard 4ステップウィザードUI実装 [TASK-10A-C]" | wc -c
```

### ステップ 7: CI確認

```bash
# PR番号を確認
gh pr view --json number

# CIステータスを確認
gh pr checks <PR番号>

# CIが完了するまで定期的に確認
gh run list --limit 5
```

**CI失敗時の対応**:

1. `gh run view <run-id>` でエラー詳細を確認
2. ローカルで同じコマンドを実行して再現確認
3. 修正後に追加コミットを作成（`--no-verify` は使わない）

### ステップ 8: artifacts.json 最終更新

```bash
# artifacts.json を更新
# phase-13 のステータスを completed に変更し、PR URLを記録
```

`artifacts.json` 更新内容:

```json
{
  "phases": {
    "phase-13": {
      "status": "completed",
      "prUrl": "https://github.com/[owner]/[repo]/pull/[number]",
      "completedAt": "2026-03-03"
    }
  },
  "status": "completed"
}
```

## 多角的チェック観点

### PR品質

- [ ] タイトルが70文字以内である
- [ ] Summary に1〜3の箇条書きで変更内容が記載されている
- [ ] Test Plan がチェックリスト形式で記載されている
- [ ] スコープ境界（TASK-10A-Dとの分担）が明記されている

### コード品質（コミット前確認）

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 全テストが PASS している
- [ ] `--no-verify` を一切使用していない

### セキュリティ

- [ ] `.env` や APIキー等の機密情報がコミットに含まれていない
- [ ] `git diff` で機密情報の混入がないことを目視確認済み

### TASK-10A-D との境界

- [ ] SkillManagementPanel との統合コードが含まれていない
- [ ] SkillCreateWizard が `onComplete` コールバックで疎結合になっている

## 成果物

| 成果物       | 内容                                         |
| ------------ | -------------------------------------------- |
| PR URL       | `https://github.com/[owner]/[repo]/pull/[N]` |
| コミットSHA  | コミット完了後に記録                         |
| CIステータス | All checks passed / 失敗の場合は修正対応     |

## 完了条件

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 全テストが PASS している（`--no-verify` を使用していない）
- [ ] PRが作成されている（タイトル70文字以内）
- [ ] PR本文にSummary（1-3箇条書き）とTest Planが含まれている
- [ ] CIが全て PASS している（または PASS するまで修正済み）
- [ ] artifacts.json の phase-13 ステータスが completed に更新されている
- [ ] PRのURLが記録されている

## サブタスク管理

| サブタスク                     | 担当   | ステータス |
| ------------------------------ | ------ | ---------- |
| lint / typecheck / test 全PASS | 実行者 | pending    |
| 変更内容の確認とステージング   | 実行者 | pending    |
| コミット作成                   | 実行者 | pending    |
| リモートPush                   | 実行者 | pending    |
| PR作成                         | 実行者 | pending    |
| CI確認                         | 実行者 | pending    |
| artifacts.json 最終更新        | 実行者 | pending    |

## タスク100%実行確認【必須】

以下を全て確認してからTASK-10A-Cを完了とすること:

- [ ] lint PASS（`--no-verify` 未使用）
- [ ] typecheck PASS
- [ ] テスト全PASS
- [ ] PR URL が記録されている
- [ ] CI 全チェック PASS
- [ ] artifacts.json の status が `completed` になっている
- [ ] TASK-10A-D（SkillManagementPanel統合）の担当者にPR作成を通知済み

## 次のPhase

**TASK-10A-C 完了**

後続タスク:

- **TASK-10A-D**: SkillManagementPanel ライフサイクル管理統合（TASK-10A-A/B/C完了後に開始可能）

通知事項:

- TASK-10A-D担当者に本PRのマージ（またはレビュー待ち）を連絡する
- `SkillCreateWizard` の `onComplete` Props仕様をTASK-10A-D担当者に共有する
