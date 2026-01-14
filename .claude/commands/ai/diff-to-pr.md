---
description: |
  差分からPR作成までの完全なGitワークフローを実行するコマンド。
  リモート同期 → 品質検証 → コミット → PR作成 → CI確認まで自動化。

  🔄 ワークフロー:
  1. リモートmain同期・コンフリクト解消
  2. 品質検証（typecheck, lint, test）
  3. 差分分析・ブランチ作成・コミット
  4. PR本文生成・PR作成
  5. 補足コメント投稿
  6. CI/CD完了確認
  7. マージ可能報告

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
**PRコミット前にリモートmainを同期し、品質検証を完了させる。**

## 重要: マージは手動実行

PRマージはユーザーがGitHub UIで手動実行します。

### AIの役割

1. **リモートmainを同期**（fetch & merge）
2. **コンフリクト解消**（発生時）
3. **品質検証**（typecheck, lint, test）
4. 差分分析 → ブランチ作成・コミット
5. PR本文を生成してPR作成
6. PR作成後、追加の補足コメントを投稿
7. CI/CDステータス確認
8. CI完了後、ユーザーに「GitHub UIでマージ可能です」と報告

### ユーザーの役割

- GitHub Web UIで最終確認してマージ実行
- マージ後、必要に応じてワークツリー削除

---

## ワークフロー実行手順

### Phase 0: リモート同期【必須】

**コミット・PR作成前に必ず実行すること。**

```bash
# 1. リモートの最新を取得
git fetch origin main

# 2. 現在のブランチ確認
CURRENT_BRANCH=$(git branch --show-current)

# 3. mainブランチの最新をマージ
# ローカル変更がある場合は一時退避
git stash push -m "temp-stash-for-main-sync" 2>/dev/null || true

# 4. mainをマージ
git merge origin/main --no-edit

# 5. 退避した変更を復元
git stash pop 2>/dev/null || true
```

#### コンフリクト発生時の対応

```bash
# コンフリクトファイルを確認
git status --short | grep "^UU\|^AA\|^DD"

# コンフリクトを手動解消後
git add <解消したファイル>
git commit -m "merge: resolve conflicts with origin/main"
```

**コンフリクト解消の優先順位:**
1. 両方の変更を保持できる場合は両方を採用
2. 機能的に競合する場合はユーザーに確認
3. 自動生成ファイル（lock files等）は再生成

---

### Phase 1: 品質検証【必須】

**コミット前に全てのチェックをパスすること。**

```bash
# 1. 型チェック
pnpm typecheck
# 失敗時: 型エラーを修正してから続行

# 2. Lintチェック
pnpm lint
# 失敗時: pnpm lint --fix で自動修正、または手動修正

# 3. テスト実行
pnpm test
# 失敗時: テストを修正してから続行

# 4. ビルド確認（オプション、大規模変更時は推奨）
pnpm build
```

**全てパスするまでPhase 2に進まないこと。**

---

### Phase 2: 差分確認とブランチ作成

```bash
# 現在の差分を確認
git status
git diff

# ブランチ作成（Worktree使用時は省略）
# 引数がある場合: $ARGUMENTS を使用
# 引数がない場合: 変更内容から適切なブランチ名を生成
TASK_NAME="${ARGUMENTS:-feature/auto-generated-name}"
git checkout -b "${TASK_NAME}" 2>/dev/null || echo "Already on branch or worktree"
```

ブランチ命名規則:

- `feature/機能名` - 新機能
- `fix/バグ名` - バグ修正
- `refactor/対象` - リファクタリング
- `docs/対象` - ドキュメント
- `test/対象` - テスト追加

---

### Phase 3: コミット作成

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

---

### Phase 4: PR作成

**重要: PRタイトルは必ず日本語で作成すること**

変更内容を分析して、以下の形式で日本語のタイトルを作成：
- バグ修正: `バグ修正: <修正内容の要約>`
- 新機能: `機能追加: <機能の要約>`
- リファクタリング: `リファクタリング: <対象の要約>`
- ドキュメント: `ドキュメント: <更新内容>`
- テスト: `テスト: <テスト内容>`
- 設定変更: `設定変更: <変更内容>`
- CI/CD: `CI/CD: <変更内容>`

```bash
git push -u origin "${TASK_NAME}"

# PRタイトルは変更内容から日本語で生成する
# 例: "バグ修正: 型エクスポートパスの修正とスタブ実装の追加"
gh pr create --title "日本語のタイトル" --body "$(cat <<'EOF'
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

---

### Phase 5: PRコメント追加

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

---

### Phase 6: CI完了確認

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

---

### Phase 7: 完了報告

CI完了後、ユーザーに以下を報告:

- PR URL
- CIステータス（全て pass であること）
- 「GitHub UIでマージ可能です」

---

## トラブルシューティング

### CIが失敗した場合

Phase 1で事前検証しているため、CIが失敗することは稀です。
失敗した場合は以下を確認:

```bash
# ローカルで再検証
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# 修正後
git add .
git commit -m "fix: resolve CI errors"
git push
```

### Phase 0でマージ競合が発生した場合

```bash
# コンフリクトファイルを確認
git status

# 手動で競合を解消（エディタで<<<< ====  >>>>を編集）

# 解消後
git add <解消したファイル>
git commit -m "merge: resolve conflicts with origin/main"

# Phase 1の品質検証に進む
```

### ローカル変更を保持したままmainを同期したい場合

```bash
# 変更を一時退避
git stash push -m "work-in-progress"

# mainを同期
git fetch origin main
git merge origin/main --no-edit

# 変更を復元
git stash pop

# コンフリクトがあれば解消
```

---

## ワークフロー概要図

```
┌─────────────────────────────────────────────────────────┐
│ Phase 0: リモート同期【必須】                           │
│   git fetch origin main                                 │
│   git merge origin/main                                 │
│   (コンフリクト解消)                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 1: 品質検証【必須】                               │
│   pnpm typecheck → pnpm lint → pnpm test                │
│   ※全てパスするまで次に進まない                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 2-3: ブランチ作成・コミット                       │
│   git checkout -b <branch>                              │
│   git add . && git commit                               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 4-5: PR作成・コメント追加                         │
│   git push && gh pr create                              │
│   gh pr comment                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 6-7: CI確認・完了報告                             │
│   gh pr checks                                          │
│   ユーザーに報告                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 使用例

```bash
# ブランチ名を指定
/ai:diff-to-pr feature/add-new-feature

# 自動でブランチ名を生成
/ai:diff-to-pr
```

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-14 | Phase 0（リモート同期）、Phase 1（品質検証）を追加。コミット前にmain同期とテスト実行を必須化 |
