# Phase 13: PR作成

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 13                                  |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼（テスト実行確認）
- 変更サマリー提示: vitest.config.ts変更・修正テスト一覧を提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認
- タスク完了処理: タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12成果物 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

```
以下のコマンドを実行し、テストが全てPASSすることを確認してください:

cd apps/desktop && pnpm vitest run
```

**確認ポイント**:

- 全テストがPASSすること
- `dangerouslyIgnoreUnhandledErrors` 関連の警告が出ないこと
- テスト実行時間が大幅に増加していないこと

### ステップ2: 変更サマリーの提示と許可確認【必須】

以下の情報をユーザーに提示し、PRを作成してよいか確認する:

**変更サマリー**:

| カテゴリ             | 変更内容                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| 設定変更             | `apps/desktop/vitest.config.ts` から `dangerouslyIgnoreUnhandledErrors: true` を削除 |
| テスト修正           | 未処理Promise拒否を発生させていたテストの根本原因修正                                |
| プロダクションコード | 変更なし（テスト/設定のみ）                                                          |

**変更ファイル一覧の表示**:

```bash
git diff --stat main...HEAD
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR情報テンプレート**:

- **タイトル**: `fix(test): dangerouslyIgnoreUnhandledErrors設定の解消`
- **本文**: Summary（変更内容1-3箇条書き）+ Test Plan（テスト確認手順）
- **ブランチ**: `feature/task-fix-10-1-vitest-error-handling`

### ステップ4: 実行結果の確認

- PRが作成されていること
- CIが通過していること

```bash
# CI状態の確認
gh pr checks <PR_NUMBER>
```

### ステップ5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更をステージング
git add apps/desktop/vitest.config.ts
git add <修正したテストファイル>
git add docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/

# コミット
git commit -m "$(cat <<'EOF'
fix(test): dangerouslyIgnoreUnhandledErrors設定の解消

- vitest.config.tsからdangerouslyIgnoreUnhandledErrors: trueを削除
- 未処理Promise拒否を発生させていたテストの根本原因を修正
- テスト品質の向上: 非同期エラーが正しく検出される状態に回復

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# PRの作成
gh pr create \
  --title "fix(test): dangerouslyIgnoreUnhandledErrors設定の解消" \
  --body "$(cat <<'EOF'
## Summary
- `apps/desktop/vitest.config.ts` から `dangerouslyIgnoreUnhandledErrors: true` を削除
- 未処理Promise拒否を発生させていたテストの根本原因を修正
- 非同期エラーが正しく検出されるテスト環境に回復

## Test plan
- [ ] `cd apps/desktop && pnpm vitest run` で全テストPASS
- [ ] `--no-file-parallelism` でも全テストPASS
- [ ] `grep -rn "dangerouslyIgnoreUnhandledErrors" apps/desktop/` で0件ヒット

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ6: タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-FIX-10-1

# 変更をコミット
git add docs/30-workflows/
git commit -m "$(cat <<'EOF'
docs(workflows): TASK-FIX-10-1-VITEST-ERROR-HANDLINGをcompleted-tasksに移動

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
git push
```

## 成果物

| 成果物 | パス                          | 説明               |
| ------ | ----------------------------- | ------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI状態記録 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ステップ1: ユーザーにローカル動作確認を依頼
2. ステップ2: 変更サマリー提示と許可確認
3. ステップ3: PR作成
4. ステップ4: CI通過確認
5. ステップ6: タスクディレクトリ移動
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 13
```

## 次のPhase

なし（ワークフロー完了）
