---
description: |
  GitHub Pull Requestを自動作成するコマンド。

  ブランチの変更内容を分析し、適切なPRタイトル・説明を自動生成します。
  テストケース、チェックリスト、関連Issueのリンクまで含む完全なPR説明を提供します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/spec-writer.md` - PR説明文作成（変更サマリー、テストプラン）

  📚 利用可能スキル（spec-writerエージェントが参照）:
  - `.claude/skills/structured-writing/SKILL.md` - PR説明文の構造化
  - `.claude/skills/markdown-advanced-syntax/SKILL.md` - Markdown、チェックリスト、テーブル
  - `.claude/skills/version-control-for-docs/SKILL.md` - Git履歴分析、変更サマリー

  ⚙️ このコマンドの設定:
  - argument-hint: "[base-branch]"（オプション、デフォルト: main）
  - allowed-tools: Git操作とエージェント起動用
    • Task: spec-writerエージェント起動用
    • Bash(git*|gh*): Git操作、GitHub CLI専用
    • Read: コード確認用（変更内容理解）
  - model: sonnet（標準的なPR作成タスク）

  📋 成果物:
  - GitHub Pull Request（タイトル、説明、ラベル）
  - PR説明文:
    - 変更サマリー（What, Why）
    - テストプラン（検証手順、チェックリスト）
    - 関連Issue（Closes #123）
    - スクリーンショット（UI変更の場合）
    - 破壊的変更（Breaking Changes、該当時）

  🎯 PR説明文形式:
  - What: 何を変更したか
  - Why: なぜ変更したか
  - How: どう実装したか（主要な設計判断）
  - Test Plan: テスト手順、検証項目
  - Checklist: レビュー観点、確認事項

  トリガーキーワード: pull request, pr, create pr, プルリクエスト作成, レビュー依頼
argument-hint: "[base-branch]"
allowed-tools:
  - Task
  - Bash(git*|gh*)
  - Read
model: sonnet
---

# Pull Request自動作成

このコマンドは、ブランチの変更内容を分析してGitHub Pull Requestを作成します。

## 📋 実行フロー

### Phase 1: ブランチと変更内容の確認

**ブランチ確認**:
```bash
# 現在のブランチ
current_branch=$(git branch --show-current)

# ベースブランチ（引数またはデフォルト）
base_branch="${ARGUMENTS:-main}"

# ブランチ差分確認
git log ${base_branch}..HEAD
git diff ${base_branch}...HEAD
```

**変更内容分析**:
```bash
# 変更ファイル一覧
git diff --name-status ${base_branch}...HEAD

# 統計情報
git diff --stat ${base_branch}...HEAD

# 詳細差分
git diff ${base_branch}...HEAD
```

### Phase 2: spec-writerエージェントを起動

**使用エージェント**: `.claude/agents/spec-writer.md`

**エージェントへの依頼内容**:
```markdown
ブランチ「${current_branch}」のPR説明文を作成してください。

**ベースブランチ**: ${base_branch}

**入力**:
- コミット履歴: ${git log ${base_branch}..HEAD}
- 変更差分: ${git diff ${base_branch}...HEAD}
- 変更ファイル: ${git diff --name-status}

**要件**:
1. PRタイトル生成:
   - 簡潔で明確（50文字以内推奨）
   - Conventional Commits形式（type(scope): subject）
   - 変更の核心を表現

2. PR説明文生成:
   ```markdown
   ## What（何を変更したか）
   [変更内容のサマリー、1-3文]

   ## Why（なぜ変更したか）
   [背景、課題、解決する問題]

   ## How（どう実装したか）
   [主要な設計判断、技術的な選択理由]

   ## Changes（主要な変更点）
   - [変更点1]
   - [変更点2]
   - [変更点3]

   ## Test Plan（テストプラン）
   - [ ] ユニットテスト合格
   - [ ] 型チェック合格
   - [ ] ESLint合格
   - [ ] ローカル動作確認
   - [ ] [機能固有の検証項目]

   ## Screenshots（該当する場合）
   [UIスクリーンショット]

   ## Breaking Changes（該当する場合）
   [破壊的変更の詳細、移行ガイド]

   ## Related Issues
   Closes #123
   ```

**スキル参照**:
- `.claude/skills/structured-writing/SKILL.md`
- `.claude/skills/markdown-advanced-syntax/SKILL.md`

**成果物**:
- PRタイトル
- PR説明文（Markdown）
```

### Phase 3: PR作成実行

**GitHub CLI使用**:
```bash
# PR作成
gh pr create \
  --base ${base_branch} \
  --head ${current_branch} \
  --title "${pr_title}" \
  --body "${pr_body}"

# PR URL取得
pr_url=$(gh pr view --json url -q .url)
```

### Phase 4: 完了報告

```markdown
## Pull Request作成完了

PR URL: ${pr_url}

### 内容
- Base Branch: ${base_branch}
- Head Branch: ${current_branch}
- Commits: ${commit_count}件
- Files Changed: ${files_changed}件

### Next Steps
1. PR URLを開いてレビュー依頼
2. CI/CDの実行を確認
3. レビューアからのフィードバック対応
4. 承認後にマージ
```

## 使用例

### 基本的な使用（main へのPR）

```bash
/ai:create-pr
```

自動実行:
1. main ブランチとの差分確認
2. 変更内容分析
3. PRタイトル・説明文自動生成
4. PR作成
5. URL表示

### 別ブランチへのPR

```bash
/ai:create-pr develop
```

develop ブランチへのPRを作成

## PRテンプレート例

```markdown
## What
YouTube動画要約機能を追加しました。

## Why
ユーザーからのリクエストにより、YouTube動画の内容を素早く把握できる機能が必要でした。

## How
- Vercel AI SDK（Anthropic Claude）を使用した要約生成
- IWorkflowExecutor インターフェースの実装
- Zod による入出力バリデーション

## Changes
- `src/features/youtube-summarize/` 追加
  - schema.ts: 入出力スキーマ定義
  - executor.ts: 要約ロジック実装
  - __tests__/executor.test.ts: ユニットテスト（カバレッジ85%）
- `src/features/registry.ts` 更新: YOUTUBE_SUMMARIZE を登録
- `docs/20-specifications/features/youtube-summarize.md` 追加

## Test Plan
- [x] ユニットテスト合格（`pnpm test`）
- [x] 型チェック合格（`pnpm typecheck`）
- [x] ESLint合格（`pnpm lint`）
- [x] ローカル動作確認（YouTube URL入力 → 要約生成）
- [ ] 統合テスト（Discord経由の実行確認）

## Related Issues
Closes #45
```

## トラブルシューティング

### gh コマンドが見つからない

**原因**: GitHub CLI未インストール

**解決策**:
```bash
# macOS
brew install gh

# 認証
gh auth login
```

### PR作成エラー（認証失敗）

**原因**: GitHub認証が切れている

**解決策**:
```bash
gh auth status
gh auth login
```

### 変更がない

**原因**: コミットされていない、またはベースブランチと同一

**解決策**:
```bash
# コミット確認
git log ${base_branch}..HEAD

# 変更がない場合
echo "変更をコミットしてから実行してください"
```

## ベストプラクティス

### PRサイズ

```bash
# ✅ 良い: 小さく焦点を絞った変更
- 1機能 = 1 PR
- 変更ファイル: 3-10件程度
- 差分: 300行以内推奨

# ❌ 悪い: 大きすぎるPR
- 複数機能を含む
- 変更ファイル: 50件超
- 差分: 1000行超
```

### ドラフトPR活用

```bash
# 作業中はドラフトPR
gh pr create --draft

# 準備完了後にReady for Review
gh pr ready
```

## 参照

- spec-writer: `.claude/agents/spec-writer.md`
- Conventional Commits: https://www.conventionalcommits.org/
- GitHub CLI: https://cli.github.com/
