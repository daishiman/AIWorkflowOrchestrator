---
description: |
  HuskyとLint-stagedを使用したPre-commit hooksの設定を行います。
  コミット前にLintとフォーマットを自動実行するGit hooksをセットアップします。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md` (メイン - Git hooks専門)
  - `.claude/agents/code-quality.md` (補助 - 品質チェック設定)

  📚 利用可能スキル (フェーズ別):
  - Phase 1 (準備): `.claude/skills/git-hooks-concepts/SKILL.md`
  - Phase 2 (実装): `.claude/skills/commit-hooks/SKILL.md`, `.claude/skills/linting-formatting-automation/SKILL.md`
  - Phase 3 (検証): `.claude/skills/git-hooks-concepts/SKILL.md`

  ⚙️ このコマンドの設定:
  - model: sonnet (セットアップタスク)
  - allowed-tools: Task, Write, Bash(npx husky*|pnpm*)

  トリガーキーワード: pre-commit, git hooks, husky, lint-staged, 品質自動化
argument-hint: ""
allowed-tools:
  - Task
  - Write
  - Bash
model: sonnet
---

# Pre-commit Hook セットアップ

## 目的

コミット前にコード品質基準を強制する自動化されたPre-commit hooksを設定します。

## Phase 1: 準備

1. `.claude/agents/hook-master.md` エージェントをPre-commitセットアップコンテキストで起動
2. `.claude/skills/git-hooks-concepts/SKILL.md` を参照してGit hooksの基礎を確認
3. 既存のセットアップを確認:
   - `.husky/` ディレクトリの存在確認
   - `package.json` のhusky/lint-staged設定確認
   - パッケージマネージャーの特定（pnpm/pnpm/yarn）

## Phase 2: 実装

1. `.claude/skills/commit-hooks/SKILL.md` を参照してHook実装パターンを確認
2. `.claude/skills/linting-formatting-automation/SKILL.md` を参照して自動化ワークフローを確認
3. `.claude/agents/hook-master.md` エージェントにHookセットアップを委譲:
   - 必要に応じてhuskyとlint-stagedをインストール: `pnpm add -D husky lint-staged`
   - huskyを初期化: `npx husky init`
   - Pre-commit hookファイルを作成: `.husky/pre-commit`
4. `.claude/agents/code-quality.md` エージェントに品質チェック設定を委譲:
   - `package.json` または `.lintstagedrc.json` にlint-stagedを設定
   - ファイルパターンとコマンドを定義（eslint --fix、prettier --write）
5. Writeツールを使用してHook設定を書き込み

## Phase 3: 検証

1. `.claude/skills/git-hooks-concepts/SKILL.md` を参照して検証アプローチを確認
2. `.claude/agents/hook-master.md` エージェントからHook実行をテスト:
   - テストコミットシナリオを作成
   - Hookが正しくトリガーされることを確認
   - LintとフォーマットがYes行されることを確認
3. セットアップサマリーを生成:
   - インストールされた依存関係
   - Hook設定の詳細
   - チーム向け使用方法
4. README.mdに使用方法を追記（オプション）

**期待される成果物**: ドキュメント付きの完全に設定されたPre-commit hooks
