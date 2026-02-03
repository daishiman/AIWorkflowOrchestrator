# Phase 13: PR作成

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 13                    |
| タスク | TASK-9B-G             |
| 機能名 | skill-creator-service |
| 作成日 | 2026-02-03            |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- Task 13-1: ローカル動作確認依頼
- Task 13-2: 変更サマリー提示と許可確認
- Task 13-3: PR作成
- Task 13-4: CI確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### Task 13-1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼項目**:

- [ ] `pnpm --filter @repo/desktop test` が成功する
- [ ] `pnpm --filter @repo/desktop typecheck` が成功する
- [ ] `pnpm --filter @repo/desktop lint` が成功する

### Task 13-2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー**:

| カテゴリ       | 変更内容                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| 新規ファイル   | skillCreator.ts, ScriptExecutor.ts, ResourceLoader.ts, SkillCreatorService.ts |
| テストファイル | ScriptExecutor.test.ts, ResourceLoader.test.ts, SkillCreatorService.test.ts   |
| ドキュメント   | implementation-guide.md, documentation-changelog.md                           |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 13-3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### Task 13-4: 実行結果の確認

- PRが作成されていること
- CIが通過していること

### フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更をステージング
git add packages/shared/src/types/skillCreator.ts
git add apps/desktop/src/main/services/skill/
git add docs/30-workflows/TASK-9B-G-skill-creator-service/

# コミット
git commit -m "feat(skill-creator): SkillCreatorService実装

- 型定義追加（skillCreator.ts）
- ScriptExecutor実装（Script First原則）
- ResourceLoader実装（Progressive Disclosure原則）
- SkillCreatorService実装

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin task/TASK-9B-G-skill-creator-service

# PR作成
gh pr create --title "feat(skill-creator): SkillCreatorService実装" --body "$(cat <<'EOF'
## Summary
- SkillCreatorServiceのバックエンドサービスを実装
- Script First原則に基づくScriptExecutor
- Progressive Disclosure原則に基づくResourceLoader
- 依存関係解決・並列実行対応のタスク実行機能

## Test plan
- [ ] ユニットテスト全PASS確認
- [ ] 統合テスト全PASS確認
- [ ] カバレッジ80%+確認
- [ ] 手動テスト完了

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-9B-G-skill-creator-service/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-9B-G

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-9B-Gをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 13-1: ローカル動作確認依頼
2. Task 13-2: 変更サマリー提示と許可確認
3. Task 13-3: PR作成（許可後）
4. Task 13-4: CI確認
5. タスクディレクトリ移動
6. 完了条件の検証

## 次のPhase

なし（ワークフロー完了）

---

## 次のタスク

TASK-10A: ライフサイクル管理
