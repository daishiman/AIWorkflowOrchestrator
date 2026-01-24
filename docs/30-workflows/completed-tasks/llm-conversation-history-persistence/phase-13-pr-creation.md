# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- **ローカル動作確認依頼**: ユーザーにローカルでの動作確認を依頼
- **変更サマリー提示**: 変更内容のサマリーを提示しPR作成の許可を確認
- **PR作成**: ユーザーの許可後に`/ai:diff-to-pr`を実行
- **CI確認**: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**ローカル確認チェックリスト（PR作成前に必須）:**

| #   | 確認項目                       | コマンド                            | 結果 |
| --- | ------------------------------ | ----------------------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build` |      |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`  |      |
| 3   | 型チェックがパスする           | `pnpm typecheck`                    |      |
| 4   | Lintエラーがない               | `pnpm lint`                         |      |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev`   |      |

**ユーザーへの依頼内容:**

```
以下のコマンドでローカル動作確認をお願いします:

1. pnpm --filter @repo/desktop build
2. pnpm --filter @repo/desktop test
3. pnpm typecheck
4. pnpm lint
5. pnpm --filter @repo/desktop dev（手動で会話履歴機能を確認）

すべて問題なければ、PR作成の許可をお願いします。
```

### ステップ2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

変更サマリーテンプレート:

```markdown
## 変更サマリー

### 追加ファイル

- `apps/desktop/src/main/repositories/conversationRepository.ts`
- `apps/desktop/src/main/handlers/conversation.ts`
- `apps/desktop/src/shared/types/conversation.ts`
- テストファイル（XX件）

### 変更ファイル

- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/main/index.ts`

### 機能

- 会話履歴のSQLite永続化
- 会話一覧・詳細のIPC API
- 会話検索機能

PR作成してよろしいですか？
```

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### ステップ4: 実行結果の確認

- [ ] PRが作成されていること
- [ ] CIが通過していること

### ステップ5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチの確認
git branch --show-current

# 変更の確認
git status
git diff

# コミット
git add .
git commit -m "feat: 会話履歴の永続化機能を実装

- ConversationRepositoryによるSQLite永続化
- IPC API（conversation:*）7チャンネル実装
- 会話一覧・詳細・検索機能
- ユニットテスト・統合テスト

Closes #463

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin task/llm-conversation-history-persistence

# PR作成
gh pr create --title "feat: 会話履歴の永続化機能を実装" --body "..."
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
mv docs/30-workflows/llm-conversation-history-persistence/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep llm-conversation-history-persistence

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): llm-conversation-history-persistenceをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
