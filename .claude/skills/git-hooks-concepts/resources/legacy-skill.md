---
name: .claude/skills/git-hooks-concepts/SKILL.md
description: |
  Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/git-hooks-concepts/resources/hook-types-reference.md`: フック種類の詳細リファレンス
  - `.claude/skills/git-hooks-concepts/resources/implementation-patterns.md`: 10種類の実装パターン（Prettier+ESLint、型チェック、テスト、Conventional Commits検証等）
  - `.claude/skills/git-hooks-concepts/templates/pre-commit-template.sh`: pre-commitテンプレート
  - `.claude/skills/git-hooks-concepts/templates/pre-push-template.sh`: pre-pushテンプレート
  - `.claude/skills/git-hooks-concepts/scripts/validate-git-hooks.mjs`: Git Hooks設定と動作検証スクリプト

  専門分野:
  - イベント駆動自動化: Git操作をトリガーとした自動スクリプト実行
  - フックの種類: クライアント側・サーバー側フック
  - 実行フロー: 終了コード仕様と操作継続/中断制御
  - 設計原則: Fail Fast、Progressive Validation、Transparent Feedback

  使用タイミング:
  - Git Hooks を実装する時
  - コミット前のコード品質チェックを自動化したい時
  - プッシュ前のテスト実行を強制したい時
  - コミットメッセージの検証を行う時

  Use proactively when implementing git hooks, automating pre-commit checks,
  or enforcing code quality gates.
version: 1.0.0
---

# Git Hooks 概念

## 概要

Git Hooks の基本概念、ライフサイクル、実装パターンを提供するスキル。

## 核心概念

### 1. イベント駆動自動化

Git 操作(commit、push 等)をトリガーとして自動的にスクリプトを実行する仕組み

### 2. フックの種類

- クライアント側: pre-commit, prepare-commit-msg, commit-msg, post-commit, pre-push 等
- サーバー側: pre-receive, update, post-receive

### 3. 実行フロー

Git 操作 → フック検出 → スクリプト実行 → 終了コード判定 → 操作継続/中断

### 4. 終了コード仕様

- exit 0: 成功（操作継続）
- exit 1: 失敗（操作中断）
- exit 2 以上: 非標準（避けるべき）

## 設計原則

### 1. 早期検出（Fail Fast）

- 問題は発生した瞬間に検出
- コミット前にフォーマット、Lint、テストを実行
- プッシュ前にビルド確認

### 2. 段階的検証（Progressive Validation）

- pre-commit: 軽量チェック（< 1 秒）
- commit-msg: メッセージ検証
- pre-push: 重量チェック（ビルド、テスト）

### 3. 透明性（Transparent Feedback）

- 何がトリガーされたか明示
- なぜブロックされたか説明
- どう修正すべきか提案

### 4. バイパス可能性（Escape Hatch）

- `--no-verify` で緊急時スキップ可能
- ただし使用は最小限に

## 実装パターン

### パターン 1: ゲートキーパー（Gatekeeper）

```bash
#!/bin/bash
# 条件チェック → ブロック/許可
if [ 条件 ]; then
  echo "Error message"
  exit 1
fi
exit 0
```

### パターン 2: 自動修正（Auto-fix）

```bash
#!/bin/bash
# 問題を検出 → 自動修正 → 継続
npx prettier --write "staged-files"
git add "modified-files"
exit 0
```

### パターン 3: 条件付き実行（Conditional）

```bash
#!/bin/bash
# 環境・ファイルタイプに応じて処理分岐
if [[ "$FILE" == *.ts ]]; then
  tsc --noEmit
fi
exit 0
```

## 一般的なフック用途

| フック      | 用途           | 例                            |
| ----------- | -------------- | ----------------------------- |
| pre-commit  | コード品質     | Prettier、ESLint、型チェック  |
| commit-msg  | メッセージ検証 | Conventional Commits 準拠確認 |
| pre-push    | 包括的検証     | テスト実行、ビルド確認        |
| post-commit | 通知・ログ     | Slack への通知、統計記録      |

## パフォーマンス最適化

### 1. 増分チェック

```bash
# 全ファイルではなく変更ファイルのみ
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep ".ts$")
```

### 2. 並列実行

```bash
# 独立チェックを並列化
prettier --check . &
eslint . &
wait
```

### 3. タイムアウト設定

```bash
timeout 30s pnpm test || exit 1
```

## トラブルシューティング

### 問題 1: フックが実行されない

**原因**: 実行権限がない
**解決**: `chmod +x .git/hooks/pre-commit`

### 問題 2: フックをスキップしたい

**解決**: `git commit --no-verify`（緊急時のみ）

### 問題 3: エラーメッセージが不明瞭

**解決**: `set -x` でデバッグモード有効化

## 関連スキル

- `.claude/skills/claude-code-hooks/SKILL.md`: Claude Code 固有のフック実装
- `.claude/skills/automation-scripting/SKILL.md`: 自動化スクリプトの作成
- `.claude/skills/approval-gates/SKILL.md`: 承認ゲートの設計

## 参照リソース

### 詳細リソース

- `.claude/skills/git-hooks-concepts/resources/hook-types-reference.md`: フック種類の詳細リファレンス
- `.claude/skills/git-hooks-concepts/resources/implementation-patterns.md`: 実装パターン集

### テンプレート

- `.claude/skills/git-hooks-concepts/templates/pre-commit-template.sh`: pre-commit テンプレート
- `.claude/skills/git-hooks-concepts/templates/pre-push-template.sh`: pre-push テンプレート

### スクリプト

- `.claude/skills/git-hooks-concepts/scripts/validate-git-hooks.mjs`: Git Hooks 設定と動作検証スクリプト

## 参考文献

- 『Pro Git』 Scott Chacon, Ben Straub 著, Apress, 2014
  - Chapter 8: Customizing Git - Git Hooks
- Git 公式ドキュメント: https://git-scm.com/docs/githooks
