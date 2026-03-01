---
description: |
  差分からPR作成までの完全なGitワークフローを実行するコマンド。
  リモート同期 → 品質検証 → コミット → PR作成 → CI確認まで自動化。

  🔄 ワークフロー:
  複数のエージェントでチームを編成して実行
  1. リモートmain同期・コンフリクト解消
  2. 品質検証（typecheck, lint, test）
  3. 差分分析・ブランチ作成・コミット
  3.5. タスク仕様書 → Issue同期（未同期チェック）
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

0. 複数のエージェントでチームを編成して実行
1. **リモートmainを同期**（fetch & merge）
2. **コンフリクト解消**（発生時）
3. **品質検証**（typecheck, lint, test）
4. 差分分析 → ブランチ作成・コミット
5. **タスク仕様書 → Issue同期**（未同期仕様書をGitHub Issueに反映）
6. PR本文を生成してPR作成
7. PR作成後、追加の補足コメントを投稿
8. CI/CDステータス確認
9. CI完了後、ユーザーに「GitHub UIでマージ可能です」と報告

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

# 3. ビルド確認（オプション、大規模変更時は推奨）
pnpm build

# 4. テスト実行
pnpm test
# 失敗時: テストを修正してから続行

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
# 注: Phase 11のスクリーンショット（outputs/phase-11/screenshots/）と
# Phase 12の成果物（outputs/phase-12/）もコミットに含めること
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

### Phase 3.5: タスク仕様書 → Issue同期【推奨】

**PR作成前に、未同期のタスク仕様書に対してGitHub Issueを作成する。**

```bash
# 未同期タスク仕様書を検出してIssue作成
node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js

# 確認のみ（ドライラン）
# node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run
```

**目的**:
- `git merge`、`git stash pop`等でClaude Code Hookが発火しないケースに対応
- PR作成前にタスク仕様書とGitHub Issueの整合性を確保

**新規Issueが作成された場合**:
```bash
# Issue番号が仕様書に書き戻されるので、それもコミットに含める
git add docs/30-workflows/unassigned-task/
git commit --amend --no-edit
```

---

### Phase 4: PR作成

**重要: PRタイトルの形式**
- **プレフィックス**: Conventional Commits形式（アルファベット）
- **説明**: 日本語

変更内容を分析して、以下の形式でタイトルを作成：
- バグ修正: `fix: <修正内容の要約（日本語）>`
- 新機能: `feat: <機能の要約（日本語）>`
- リファクタリング: `refactor: <対象の要約（日本語）>`
- ドキュメント: `docs: <更新内容（日本語）>`
- テスト: `test: <テスト内容（日本語）>`
- 設定変更: `chore: <変更内容（日本語）>`
- CI/CD: `ci: <変更内容（日本語）>`

スコープがある場合: `<type>(<scope>): <日本語の説明>`

```bash
git push -u origin "${TASK_NAME}"

# PRタイトルはConventional Commits形式のプレフィックス + 日本語の説明
# 例: "fix: 型エクスポートパスの修正とスタブ実装の追加"
# 例: "docs: diff-to-prコマンドのPRタイトル形式を更新"
# 例: "feat(auth): ログイン機能の実装"
gh pr create --title "<type>: <日本語の説明>" --body "$(cat <<'EOF'
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

## タスク実行サマリー

<!-- Phase 1-13ワークフローで実行された場合に記入。該当しない場合はセクション削除 -->

| Phase    | 主な作業内容     | 成果物                    |
| -------- | ---------------- | ------------------------- |
| Phase 4  | テスト設計・作成 | テストファイルN個         |
| Phase 5  | 実装             | 機能コードN個             |
| Phase 9  | 品質検証         | lint/typecheck/test全PASS |
| Phase 10 | 最終レビュー     | PASS                      |
| Phase 11 | 手動テストN件    | 全PASS                    |
| Phase 12 | ドキュメント更新 | 実装ガイド・仕様更新      |

## スクリーンショット

<!-- UI/UX変更がある場合、Phase 11で撮影したスクリーンショットを掲載 -->
<!-- スクリーンショットはリポジトリにコミット済みの画像を相対パスで参照 -->
<!-- UI/UX変更がない場合はこのセクションを削除 -->

| 項目   | スクリーンショット                                                                          |
| ------ | ------------------------------------------------------------------------------------------- |
| 変更前 | ![before](docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-11/screenshots/TC-01-before.png) |
| 変更後 | ![after](docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-11/screenshots/TC-01-after.png)   |

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

### Phase 5.5: 実装ガイド全文コメント投稿（Phase 12成果物）

Phase 12で作成された implementation-guide.md の**全文**をPRコメントとして投稿する。
Part 1（中学生レベル概念説明）と Part 2（技術的詳細）の両方を含む完全なドキュメントを投稿する。

**重要**: サマリーではなく全文を投稿すること。65536文字を超える場合は複数コメントに分割する。

```bash
IMPL_GUIDE=$(find docs/30-workflows -path "*/outputs/phase-12/implementation-guide.md" -print -quit 2>/dev/null)

if [ -n "$IMPL_GUIDE" ]; then
  TMPFILE=$(mktemp)
  {
    printf '## 📖 実装ガイド（全文）\n\n'
    printf '> Phase 12で作成された実装ガイドです。\n'
    printf '> Part 1: 中学生レベルの概念説明 / Part 2: 開発者向け技術的詳細\n\n'
    cat "$IMPL_GUIDE"
    printf '\n\n---\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n'
  } > "$TMPFILE"

  # GitHub API制限: コメント本文は65536文字以下
  # 超過時は分割投稿（切り詰めず全文を投稿する）
  FILESIZE=$(wc -c < "$TMPFILE")
  if [ "$FILESIZE" -gt 65000 ]; then
    PART=1
    TOTAL_PARTS=$(( (FILESIZE / 60000) + 1 ))
    while [ -s "$TMPFILE" ]; do
      PARTFILE=$(mktemp)
      head -c 60000 "$TMPFILE" > "$PARTFILE"
      # 行の途中で切れないよう、最後の改行位置で調整
      LAST_NL=$(grep -b -n '' "$PARTFILE" | tail -1 | cut -d: -f1)
      if [ "$LAST_NL" -lt "$(wc -c < "$PARTFILE")" ]; then
        head -c "$LAST_NL" "$PARTFILE" > "${PARTFILE}.adj"
        mv "${PARTFILE}.adj" "$PARTFILE"
      fi
      CUT_BYTES=$(wc -c < "$PARTFILE")

      # パートヘッダーを付与（2パート目以降）
      if [ "$PART" -gt 1 ]; then
        HEADERFILE=$(mktemp)
        printf '## 📖 実装ガイド（続き %d/%d）\n\n' "$PART" "$TOTAL_PARTS" > "$HEADERFILE"
        cat "$PARTFILE" >> "$HEADERFILE"
        mv "$HEADERFILE" "$PARTFILE"
      fi

      gh pr comment "${PR_NUMBER}" --body-file "$PARTFILE"
      rm -f "$PARTFILE"

      # 残りを取得
      tail -c +"$((CUT_BYTES + 1))" "$TMPFILE" > "${TMPFILE}.rest"
      mv "${TMPFILE}.rest" "$TMPFILE"
      PART=$((PART + 1))
    done
  else
    gh pr comment "${PR_NUMBER}" --body-file "$TMPFILE"
  fi
  rm -f "$TMPFILE"
fi
```

---

### Phase 5.6: スクリーンショットコメント投稿（Phase 11スクリーンショットがある場合）

Phase 11でスクリーンショットが撮影されている場合、PRコメントとしてスクリーンショットギャラリーを投稿する。

**前提**: スクリーンショットはPhase 3のコミット時にリポジトリに含まれていること。

```bash
SCREENSHOTS_DIR=$(find docs/30-workflows -path "*/outputs/phase-11/screenshots" -type d -print -quit 2>/dev/null)

if [ -n "$SCREENSHOTS_DIR" ] && ls "$SCREENSHOTS_DIR"/*.png >/dev/null 2>&1; then
  TMPFILE=$(mktemp)
  {
    printf '## 📸 Phase 11 手動テスト スクリーンショット\n\n'
    for img in "$SCREENSHOTS_DIR"/*.png; do
      FILENAME=$(basename "$img")
      REL_PATH="${img#$(git rev-parse --show-toplevel)/}"
      printf '### %s\n\n![%s](%s)\n\n' "$FILENAME" "$FILENAME" "$REL_PATH"
    done
    printf '---\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n'
  } > "$TMPFILE"
  gh pr comment "${PR_NUMBER}" --body-file "$TMPFILE"
  rm -f "$TMPFILE"
fi
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
│ Phase 3.5: タスク仕様書 → Issue同期【推奨】             │
│   node sync_new_issues.js                               │
│   ※未同期仕様書があればIssue作成                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 4-5: PR作成・コメント追加                         │
│   git push && gh pr create                              │
│   gh pr comment（実装詳細）                             │
│   gh pr comment（実装ガイド、該当時）                   │
│   gh pr comment（スクリーンショット、該当時）           │
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
| 2026-03-01 | PR本文にタスク実行サマリー・スクリーンショットセクション追加。Phase 5.5（実装ガイドコメント投稿）・Phase 5.6（スクリーンショットコメント投稿）を追加。Phase 3にスクリーンショット含有注記追加。Phase 5.5/5.6: `--body-file`+一時ファイル方式に統一（HEREDOC安全性・zsh互換性・GitHub API 65536文字制限対応） |
| 2026-01-21 | Phase 3.5（タスク仕様書→Issue同期）を追加。git merge/stash後の未同期仕様書に対応 |
| 2026-01-14 | Phase 0（リモート同期）、Phase 1（品質検証）を追加。コミット前にmain同期とテスト実行を必須化 |
