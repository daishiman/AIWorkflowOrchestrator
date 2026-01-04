---
description: |
  差分からPR作成までの完全なGitワークフローを実行するコマンド。
  ブランチ作成 → コミット → PR作成 → PRコメント追加 → CI確認まで自動化。

  🔄 ワークフロー:
  1. 差分分析・ブランチ作成・コミット
  2. PR本文生成・PR作成
  3. 補足コメント投稿
  4. CI/CD完了確認
  5. マージ可能報告

  ⚠️ マージはユーザーがGitHub UIで手動実行

  ⚙️ このコマンドの設定:
  - argument-hint: [branch-name]
  - allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Task
  - model: sonnet

  トリガーキーワード: diff to pr, 差分からpr, マージ準備, pr作成ワークフロー
argument-hint: "[branch-name]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Task
model: sonnet
---

# 差分からPRまでの完全ワークフロー

## 目的

現在の差分を最適な粒度でブランチ作成→コミット→プルリクエスト作成→PRコメント追加まで実施する。

## 重要: マージは手動実行

PRマージはユーザーがGitHub UIで手動実行します。

### AIの役割

1. 差分分析 → ブランチ作成・コミット
2. PR本文を生成してPR作成
3. PR作成後、追加の補足コメントを投稿（変更の詳細や注意点等）
4. CI/CDステータス確認（`gh pr checks <PR番号>`）
5. CI完了後、ユーザーに「GitHub UIでマージ可能です」と報告

### ユーザーの役割

- GitHub Web UIで最終確認してマージ実行
- マージ後、必要に応じてワークツリー削除

---

## ワークフロー実行手順

### Phase 1: 差分確認とブランチ作成

```bash
# 現在の差分を確認
git status
git diff

# ブランチ作成（Worktree使用時は省略）
# 引数がある場合: $ARGUMENTS を使用
# 引数がない場合: 変更内容から適切なブランチ名を生成
TASK_NAME="${ARGUMENTS:-feature/auto-generated-name}"
git checkout -b "${TASK_NAME}" main 2>/dev/null || echo "Already on branch or worktree"
```

ブランチ命名規則:

- `feature/機能名` - 新機能
- `fix/バグ名` - バグ修正
- `refactor/対象` - リファクタリング
- `docs/対象` - ドキュメント
- `test/対象` - テスト追加

### Phase 2: コミット作成

```bash
# ステージングと差分確認
git add .
git diff --cached

# Conventional Commits形式でコミット
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Conventional Commits タイプ:

- `feat` - 新機能
- `fix` - バグ修正
- `refactor` - リファクタリング
- `docs` - ドキュメント
- `test` - テスト
- `chore` - その他（依存関係更新等）
- `ci` - CI/CD

### Phase 3: PR作成

```bash
git push -u origin "${TASK_NAME}"

gh pr create --title "<type>(<scope>): <subject>" --body "$(cat <<'EOF'
## 概要

<!-- この PR の目的と背景 -->

## 変更内容

<!-- 主な変更点 -->
-
-
-

## 変更タイプ

- [ ] 🐛 バグ修正 (bug fix)
- [ ] ✨ 新機能 (new feature)
- [ ] 🔨 リファクタリング (refactoring)
- [ ] 📝 ドキュメント (documentation)
- [ ] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [ ] ユニットテスト実行 (`pnpm test`)
- [ ] 型チェック実行 (`pnpm typecheck`)
- [ ] ESLint チェック実行 (`pnpm lint`)
- [ ] ビルド確認 (`pnpm build`)

## チェックリスト

- [ ] コードが既存のスタイルに従っている
- [ ] 必要に応じてドキュメントを更新した
- [ ] 新規・変更機能にテストを追加した

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

### Phase 4: PRコメント追加

```bash
PR_NUMBER=$(gh pr view --json number -q .number)

gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
## 📝 実装の詳細

<!-- 変更の技術的詳細や設計判断の理由 -->

## ⚠️ レビュー時の注意点

<!-- レビュアーが確認すべき重要なポイント -->

## 🔍 テスト方法

<!-- 動作確認の手順や再現方法 -->

## 📚 参考資料

<!-- 関連ドキュメントやIssue、外部リンク等 -->

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Phase 5: CI完了確認

```bash
# CIステータス確認（完了まで待機）
for i in {1..10}; do
  gh pr checks "${PR_NUMBER}"
  if gh pr checks "${PR_NUMBER}" 2>&1 | grep -qE "(pending|in_progress)"; then
    echo "CI実行中... 30秒後に再確認"
    sleep 30
  else
    echo "CI完了"
    break
  fi
done
```

### Phase 6: 完了報告

CI完了後、ユーザーに以下を報告:

- PR URL
- CIステータス（全て pass であること）
- 「GitHub UIでマージ可能です」

---

## トラブルシューティング

### CIが失敗した場合

```bash
pnpm typecheck  # 型エラー
pnpm lint       # Lint
pnpm test       # テスト
pnpm build      # ビルド

# 修正後
git add .
git commit -m "fix: resolve CI errors"
git push
```

### マージ競合が発生した場合

```bash
git fetch origin main
git merge origin/main
# 競合解決後
git add .
git commit -m "merge: resolve conflicts with main branch"
git push
```

---

## 使用例

```bash
# ブランチ名を指定
/ai:diff-to-pr feature/add-new-feature

# 自動でブランチ名を生成
/ai:diff-to-pr
```
