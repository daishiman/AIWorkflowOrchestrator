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

# 6. auto-generated インデックスを再生成（P44対策: stash pop 後は必ず実行）
if [ -f ".claude/skills/aiworkflow-requirements/scripts/generate-index.js" ]; then
  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
  git add .claude/skills/aiworkflow-requirements/indexes/ 2>/dev/null || true
fi
```

#### コンフリクト発生時の対応

```bash
# コンフリクトファイルを確認
git status --short | grep "^UU\|^AA\|^DD"

# auto-generated ファイルのコンフリクト解消（P44対策）
# keywords.json / topic-map.md はどちらか一方を採用後に再生成
git checkout --ours .claude/skills/aiworkflow-requirements/indexes/keywords.json 2>/dev/null || true
git checkout --ours .claude/skills/aiworkflow-requirements/indexes/topic-map.md 2>/dev/null || true
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
git add .claude/skills/aiworkflow-requirements/indexes/

# task-workflow-completed.md は両側の追記を保持（.gitattributes の merge=union で自動解消）
# 残っている場合は手動でコンフリクトマーカーを除去して git add する

# その他のコンフリクトを手動解消後
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

### Phase 3.6: PR本文連携対象workflowの特定【必須】

PR本文・PRコメントで参照する Phase 11/12 成果物は、**今回差分に含まれる workflow ディレクトリ**に限定する。
`find ... -print -quit` の先頭一致は使わない。

```bash
# docs/30-workflows 配下の差分から対象workflow候補を抽出
TARGET_WORKFLOWS=$(git diff --name-only --cached | awk -F/ '
  $1 == "docs" && $2 == "30-workflows" {
    if ($3 == "completed-tasks" && $4 != "") {
      print $1 "/" $2 "/" $3 "/" $4
    } else if ($3 != "") {
      print $1 "/" $2 "/" $3
    }
  }
' | sort -u)

TARGET_COUNT=$(printf "%s\n" "$TARGET_WORKFLOWS" | sed '/^$/d' | wc -l | tr -d ' ')

if [ "$TARGET_COUNT" -eq 1 ]; then
  TARGET_WORKFLOW_DIR=$(printf "%s\n" "$TARGET_WORKFLOWS")
elif [ "$TARGET_COUNT" -gt 1 ]; then
  echo "複数workflow候補を検出: $TARGET_WORKFLOWS"
  echo "PR連携対象を1件に決めるためユーザー確認が必要"
  exit 1
else
  TARGET_WORKFLOW_DIR=""
fi

PHASE12_IMPL_GUIDE="${TARGET_WORKFLOW_DIR}/outputs/phase-12/implementation-guide.md"
PHASE12_SUMMARY="${TARGET_WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md"
PHASE11_SCREENSHOTS_DIR="${TARGET_WORKFLOW_DIR}/outputs/phase-11/screenshots"
PHASE11_COVERAGE="${TARGET_WORKFLOW_DIR}/outputs/phase-11/screenshot-coverage.md"
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

# PR本文生成に使う成果物を解決（Phase 11/12連携）
IMPL_GUIDE=""
if [ -n "$TARGET_WORKFLOW_DIR" ] && [ -f "$TARGET_WORKFLOW_DIR/outputs/phase-12/implementation-guide.md" ]; then
  IMPL_GUIDE="$TARGET_WORKFLOW_DIR/outputs/phase-12/implementation-guide.md"
fi
if [ -z "$IMPL_GUIDE" ]; then
  IMPL_GUIDE=$(git diff --name-only --cached | grep "/outputs/phase-12/implementation-guide.md$" | head -n 1)
fi

SCREENSHOTS_DIR=""
if [ -n "$TARGET_WORKFLOW_DIR" ] && [ -d "$TARGET_WORKFLOW_DIR/outputs/phase-11/screenshots" ]; then
  SCREENSHOTS_DIR="$TARGET_WORKFLOW_DIR/outputs/phase-11/screenshots"
fi
if [ -z "$SCREENSHOTS_DIR" ]; then
  SCREENSHOTS_DIR=$(git diff --name-only --cached \
    | grep "/outputs/phase-11/screenshots/.*\\.png$" \
    | head -n 1 \
    | xargs dirname 2>/dev/null)
fi

# PR本文/コメント用の画像URLベース（GitHubで確実に表示される絶対URL）
REPO_SLUG=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
if [ -z "$REPO_SLUG" ]; then
  REPO_SLUG=$(git remote get-url origin | sed -E 's#^git@github.com:##; s#^https://github.com/##; s#\.git$##')
fi
HEAD_COMMIT=$(git rev-parse HEAD)
RAW_BASE_URL=""
if [ -n "$REPO_SLUG" ] && [ -n "$HEAD_COMMIT" ]; then
  RAW_BASE_URL="https://raw.githubusercontent.com/${REPO_SLUG}/${HEAD_COMMIT}"
fi

HAS_UI_SCREENSHOTS=0
PHASE11_LIGHT_IMAGE_REL=""
PHASE11_DARK_IMAGE_REL=""
PHASE11_LIGHT_IMAGE_URL=""
PHASE11_DARK_IMAGE_URL=""
if [ -n "$SCREENSHOTS_DIR" ] && ls "$SCREENSHOTS_DIR"/*.png >/dev/null 2>&1; then
  HAS_UI_SCREENSHOTS=1

  PHASE11_LIGHT_IMAGE=$(ls "$SCREENSHOTS_DIR"/*.png | grep -E -- "-light\\.png$" | head -n 1 || true)
  PHASE11_DARK_IMAGE=$(ls "$SCREENSHOTS_DIR"/*.png | grep -E -- "-dark\\.png$" | head -n 1 || true)

  if [ -n "$PHASE11_LIGHT_IMAGE" ]; then
    PHASE11_LIGHT_IMAGE_REL="${PHASE11_LIGHT_IMAGE#$(git rev-parse --show-toplevel)/}"
    PHASE11_LIGHT_IMAGE_URL="$PHASE11_LIGHT_IMAGE_REL"
    if [ -n "$RAW_BASE_URL" ]; then
      PHASE11_LIGHT_IMAGE_URL="${RAW_BASE_URL}/${PHASE11_LIGHT_IMAGE_REL}"
    fi
  fi
  if [ -n "$PHASE11_DARK_IMAGE" ]; then
    PHASE11_DARK_IMAGE_REL="${PHASE11_DARK_IMAGE#$(git rev-parse --show-toplevel)/}"
    PHASE11_DARK_IMAGE_URL="$PHASE11_DARK_IMAGE_REL"
    if [ -n "$RAW_BASE_URL" ]; then
      PHASE11_DARK_IMAGE_URL="${RAW_BASE_URL}/${PHASE11_DARK_IMAGE_REL}"
    fi
  fi
fi

PR_BODY_FILE=$(mktemp)

# PRタイトルはConventional Commits形式のプレフィックス + 日本語の説明
# 例: "fix: 型エクスポートパスの修正とスタブ実装の追加"
# 例: "docs: diff-to-prコマンドのPRタイトル形式を更新"
# 例: "feat(auth): ログイン機能の実装"
{
cat <<'EOF'
## 概要

<!-- この PR の目的と背景を記述 -->

## 変更内容

## <!-- 主な変更点をリストアップ -->

-
-

## 変更タイプ

<!-- 該当するものにチェック -->

- [ ] 🐛 バグ修正 (bug fix)
- [ ] ✨ 新機能 (new feature)
- [ ] 🔨 リファクタリング (refactoring)
- [ ] 📝 ドキュメント (documentation)
- [ ] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

<!-- 実施したテストにチェック -->

- [ ] ユニットテスト実行 (`pnpm test`)
- [ ] 型チェック実行 (`pnpm typecheck`)
- [ ] ESLint チェック実行 (`pnpm lint`)
- [ ] ビルド確認 (`pnpm build`)
- [ ] 手動テスト実施

## 関連 Issue

<!-- 関連するIssue番号 -->

Closes #

## 破壊的変更

<!-- 破壊的変更がある場合は詳細を記述 -->

- [ ] この PR には破壊的変更が含まれます

<!-- 破壊的変更の詳細 -->
EOF

if [ "$HAS_UI_SCREENSHOTS" -eq 1 ]; then
cat <<EOF

## スクリーンショット

| 項目 | スクリーンショット |
| ---- | ------------------ |
EOF
  if [ -n "$PHASE11_LIGHT_IMAGE_REL" ]; then
    printf '| 変更後（Light） | ![after-light](%s) |\n' "$PHASE11_LIGHT_IMAGE_URL"
  fi
  if [ -n "$PHASE11_DARK_IMAGE_REL" ]; then
    printf '| 変更後（Dark） | ![after-dark](%s) |\n' "$PHASE11_DARK_IMAGE_URL"
  fi
  if [ -z "$PHASE11_LIGHT_IMAGE_REL" ] && [ -z "$PHASE11_DARK_IMAGE_REL" ]; then
    FIRST_IMAGE=$(ls "$SCREENSHOTS_DIR"/*.png | head -n 1)
    FIRST_IMAGE_REL="${FIRST_IMAGE#$(git rev-parse --show-toplevel)/}"
    FIRST_IMAGE_URL="$FIRST_IMAGE_REL"
    if [ -n "$RAW_BASE_URL" ]; then
      FIRST_IMAGE_URL="${RAW_BASE_URL}/${FIRST_IMAGE_REL}"
    fi
    printf '| 変更後 | ![after](%s) |\n' "$FIRST_IMAGE_URL"
  fi
fi

cat <<'EOF'

## チェックリスト

- [ ] コードが既存のスタイルに従っている
- [ ] 必要に応じてドキュメントを更新した
- [ ] 新規・変更機能にテストを追加した
- [ ] すべてのテストがローカルで成功する
- [ ] Pre-commit hooks が成功する

## その他

<!-- Phase 12 実装ガイド反映元と要点を記載 -->
EOF

if [ -n "$IMPL_GUIDE" ]; then
  printf -- '- Phase 12 実装ガイド反映元: `%s`\n' "$IMPL_GUIDE"
fi
printf -- '- 反映ポイント: Part 1 / Part 2 の要点を3点以内で記載\n'
if [ -f "$PHASE11_COVERAGE" ]; then
  printf -- '- UI/UX変更時: `%s` の必須カバレッジ結果を記載\n' "$PHASE11_COVERAGE"
fi

cat <<'EOF'

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
} > "$PR_BODY_FILE"

gh pr create --title "<type>: <日本語の説明>" --body-file "$PR_BODY_FILE" --base main
rm -f "$PR_BODY_FILE"
```

**PR本文セクション連携ルール（必須）**:
- `.github/pull_request_template.md` の見出し順を維持する
- `## その他` に Phase 12 実装ガイドの反映元パスと要点を必ず記載する
- `implementation-guide.md` の**全文**をPRコメントへ投稿する（Part 1/Part 2 両方を含む）
- 投稿後に `gh api .../issues/<PR_NUMBER>/comments` で全文コメントの存在を検証し、見つからない場合は失敗扱いにする
- UI/UX変更時は `outputs/phase-11/screenshots/*.png` からPR本文へ画像リンクを自動挿入する
- PR本文/コメントの画像リンクは `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLで出力する（相対パス直貼りを禁止）
- UI/UX変更がない場合は `## スクリーンショット` セクション自体を出力しない
- PR本文で参照する画像・成果物パスは `TARGET_WORKFLOW_DIR` 配下のみを使う

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
IMPL_GUIDE=""

# 1) 差分から特定した対象workflowを最優先
if [ -n "$TARGET_WORKFLOW_DIR" ] && [ -f "$TARGET_WORKFLOW_DIR/outputs/phase-12/implementation-guide.md" ]; then
  IMPL_GUIDE="$TARGET_WORKFLOW_DIR/outputs/phase-12/implementation-guide.md"
fi

# 2) フォールバック: staged差分に含まれるimplementation-guideを利用
if [ -z "$IMPL_GUIDE" ]; then
  IMPL_GUIDE=$(git diff --name-only --cached | grep "/outputs/phase-12/implementation-guide.md$" | head -n 1)
fi

if [ -z "$IMPL_GUIDE" ] || [ ! -f "$IMPL_GUIDE" ]; then
  echo "ERROR: Phase 12 implementation-guide.md が見つかりません。PR作成を中断します。"
  exit 1
fi

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

# 投稿検証: 実装ガイド全文コメントがPR上に存在することを必須化
REPO_SLUG=$(gh repo view --json nameWithOwner -q .nameWithOwner)
IMPL_COMMENT_COUNT=$(gh api "repos/${REPO_SLUG}/issues/${PR_NUMBER}/comments" --paginate \
  --jq '[.[] | select((.body | startswith("## 📖 実装ガイド（全文）")) and (.body | contains("Part 1")) and (.body | contains("Part 2"))) ] | length')
if [ "${IMPL_COMMENT_COUNT:-0}" -eq 0 ]; then
  echo "ERROR: implementation-guide.md 全文コメントの投稿確認に失敗しました。PR作成を中断します。"
  exit 1
fi
```

---

### Phase 5.6: スクリーンショットコメント投稿（Phase 11スクリーンショットがある場合）

Phase 11でスクリーンショットが撮影されている場合、PRコメントとしてスクリーンショットギャラリーを投稿する。
既存の「実装ガイド（全文）」コメントを編集・上書きしないこと（別コメントとして投稿する）。

**前提**: スクリーンショットはPhase 3のコミット時にリポジトリに含まれていること。

```bash
SCREENSHOTS_DIR=""

# 1) 差分から特定した対象workflowを最優先
if [ -n "$TARGET_WORKFLOW_DIR" ] && [ -d "$TARGET_WORKFLOW_DIR/outputs/phase-11/screenshots" ]; then
  SCREENSHOTS_DIR="$TARGET_WORKFLOW_DIR/outputs/phase-11/screenshots"
fi

# 2) フォールバック: staged差分に含まれるスクリーンショットからディレクトリを復元
if [ -z "$SCREENSHOTS_DIR" ]; then
  SCREENSHOTS_DIR=$(git diff --name-only --cached \
    | grep "/outputs/phase-11/screenshots/.*\\.png$" \
    | head -n 1 \
    | xargs dirname 2>/dev/null)
fi

if [ -n "$SCREENSHOTS_DIR" ] && ls "$SCREENSHOTS_DIR"/*.png >/dev/null 2>&1; then
  REPO_SLUG=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
  if [ -z "$REPO_SLUG" ]; then
    REPO_SLUG=$(git remote get-url origin | sed -E 's#^git@github.com:##; s#^https://github.com/##; s#\.git$##')
  fi
  HEAD_COMMIT=$(git rev-parse HEAD)
  RAW_BASE_URL=""
  if [ -n "$REPO_SLUG" ] && [ -n "$HEAD_COMMIT" ]; then
    RAW_BASE_URL="https://raw.githubusercontent.com/${REPO_SLUG}/${HEAD_COMMIT}"
  fi

  TMPFILE=$(mktemp)
  {
    printf '## 📸 Phase 11 手動テスト スクリーンショット\n\n'
    for img in "$SCREENSHOTS_DIR"/*.png; do
      FILENAME=$(basename "$img")
      REL_PATH="${img#$(git rev-parse --show-toplevel)/}"
      IMG_URL="$REL_PATH"
      if [ -n "$RAW_BASE_URL" ]; then
        IMG_URL="${RAW_BASE_URL}/${REL_PATH}"
      fi
      printf '### %s\n\n![%s](%s)\n\n' "$FILENAME" "$FILENAME" "$IMG_URL"
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
| 2026-03-03 | Phase 5.5 を強化し、`implementation-guide.md` 全文コメント投稿を必須化。投稿後に `gh api .../issues/<PR_NUMBER>/comments` で見出し（`## 📖 実装ガイド（全文）`）と Part 1/Part 2 を検証し、未投稿時はPR作成を失敗扱いに変更 |
| 2026-03-03 | PR本文/コメントのスクリーンショットURL解決を改善。`raw.githubusercontent.com/<repo>/<commit>/<path>` 形式の絶対URL生成を追加し、GitHub PR画面で画像が表示されない問題を防止 |
| 2026-03-02 | PR本文セクション連携を強化。Phase 3.6 で差分から `TARGET_WORKFLOW_DIR` を特定し、PR本文/implementation-guideコメント/スクリーンショットコメントを同一workflow成果物に統一。PR本文を `.github/pull_request_template.md` 準拠見出しへ更新し、`その他` に Phase 12 実装ガイド反映を必須化。UI/UX変更時は `outputs/phase-11/screenshots/*.png` を検出してPR本文 `## スクリーンショット` に画像リンクを自動挿入 |
| 2026-03-01 | PR本文にタスク実行サマリー・スクリーンショットセクション追加。Phase 5.5（実装ガイドコメント投稿）・Phase 5.6（スクリーンショットコメント投稿）を追加。Phase 3にスクリーンショット含有注記追加。Phase 5.5/5.6: `--body-file`+一時ファイル方式に統一（HEREDOC安全性・zsh互換性・GitHub API 65536文字制限対応） |
| 2026-01-21 | Phase 3.5（タスク仕様書→Issue同期）を追加。git merge/stash後の未同期仕様書に対応 |
| 2026-01-14 | Phase 0（リモート同期）、Phase 1（品質検証）を追加。コミット前にmain同期とテスト実行を必須化 |
