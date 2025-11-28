---
description: |
  Gitワークフローとブランチ戦略（git-flow/github-flow/trunk-based）を確立するコマンド。

  Git Hooks設定、ブランチ戦略の実装、自動化スクリプトの構成を行います。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md`: Claude Code Hooks実装・Git Hooks設計専門エージェント

  📚 依存スキル（エージェントが必要時に参照）:
  - `.claude/skills/git-hooks-concepts/SKILL.md`: Git Hook基本概念、ライフサイクル、Husky設定
  - `.claude/skills/claude-code-hooks/SKILL.md`: UserPromptSubmit、PreToolUse、PostToolUse設計
  - `.claude/skills/automation-scripting/SKILL.md`: Bash/Node.js自動化スクリプト実装
  - `.claude/skills/linting-formatting-automation/SKILL.md`: ESLint/Prettier統合、lint-staged設定

  ⚙️ このコマンドの設定:
  - argument-hint: ブランチ戦略を指定（git-flow/github-flow/trunk-based）、未指定時は対話的に質問
  - allowed-tools: エージェント起動とGit操作、設定ファイル作成用
    • Task: hook-masterエージェント起動用
    • Bash(git*): Git設定、ブランチ確認、リポジトリ初期化用
    • Read: 既存Git設定、.gitignore、プロジェクト構造確認用
    • Write: .gitignore、Git Hooks、設定ファイル生成用（パス制限）
    • Grep: 既存Hook検索、パターン確認用
  - model: sonnet（標準的なGit設定タスク）

  トリガーキーワード: git workflow, branch strategy, git-flow, github-flow, hooks, automation
argument-hint: "[strategy]"
allowed-tools: [Task, Bash(git*), Read, Write, Grep]
model: sonnet
---

# Git Workflow 初期化コマンド

## 目的

プロジェクトのGitワークフローとブランチ戦略を確立し、自動化されたGit Hooksを構成します。

## Phase 1: 引数確認と準備

### ブランチ戦略の決定

引数で戦略を指定:
```bash
/ai:init-git-workflow git-flow
/ai:init-git-workflow github-flow
/ai:init-git-workflow trunk-based
```

引数未指定の場合、対話的に選択を質問:
- git-flow: develop/main分離、feature/release/hotfixブランチ
- github-flow: mainブランチ + featureブランチ、シンプルなフロー
- trunk-based: 短命featureブランチ、頻繁なmainマージ

### 現状確認

Git設定状態確認:
```bash
git status
git branch -a
git config --list
```

既存の.gitignoreと設定ファイルを確認。

## Phase 2: hook-master エージェント起動

Task ツールで `.claude/agents/hook-master.md` を起動:

```markdown
エージェント: .claude/agents/hook-master.md

ブランチ戦略: ${選択された戦略}

依頼内容:
1. 選択されたブランチ戦略に基づくGit Hooks設計・実装
2. .gitignoreファイルの最適化（未存在の場合は作成）
3. Claude Code Hooks統合（UserPromptSubmit、PreToolUse、PostToolUse）
4. 自動化スクリプト実装（Lint、Format、Commit検証）
5. settings.json へのHooks設定統合

必須要件:
- ブランチ戦略に応じた適切なHook設計
- システム強制ルールの実装（人間の意志に依存しない）
- Fail Fast原則に基づくエラー検出
- 透明なフィードバックとエラーメッセージ

参照スキル:
- `.claude/skills/git-hooks-concepts/SKILL.md`: Git Hook基本
- `.claude/skills/claude-code-hooks/SKILL.md`: Claude Code Hook設計
- `.claude/skills/automation-scripting/SKILL.md`: 自動化スクリプト実装
- `.claude/skills/linting-formatting-automation/SKILL.md`: Lint/Format統合

期待成果物:
- .gitignore（最適化済み）
- .claude/hooks/ ディレクトリとHookスクリプト
- .claude/settings.json（Hooks設定追加）
- ブランチ戦略ドキュメント
```

## Phase 3: 検証と報告

hook-master エージェント完了後:

1. 設定ファイルの確認
2. Git Hooks動作テスト
3. 完了報告とドキュメント提示

## 成果物

- `.gitignore`: プロジェクト固有の除外設定
- `.claude/hooks/`: Hook実装スクリプト
- `.claude/settings.json`: Hooks設定
- ブランチ戦略ドキュメント

## 使用例

### git-flow戦略

```bash
/ai:init-git-workflow git-flow
```

develop/mainブランチ分離、feature/release/hotfixブランチ構成を自動設定。

### github-flow戦略

```bash
/ai:init-git-workflow github-flow
```

mainブランチ + 短命featureブランチのシンプルなフロー設定。

### trunk-based戦略

```bash
/ai:init-git-workflow trunk-based
```

頻繁なmainマージ、短命featureブランチ構成。

### インタラクティブモード

```bash
/ai:init-git-workflow
```

ブランチ戦略を対話的に選択。

## 参照

- エージェント: `.claude/agents/hook-master.md`
- スキル: `.claude/skills/git-hooks-concepts/SKILL.md`
- スキル: `.claude/skills/claude-code-hooks/SKILL.md`
- スキル: `.claude/skills/automation-scripting/SKILL.md`
- スキル: `.claude/skills/linting-formatting-automation/SKILL.md`
