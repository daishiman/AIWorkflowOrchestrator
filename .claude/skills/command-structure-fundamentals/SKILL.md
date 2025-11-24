---
name: command-structure-fundamentals
description: |
  Claude Codeスラッシュコマンドの基本構造を専門とするスキル。
  YAML Frontmatter（description、argument-hint、allowed-tools、model、disable-model-invocation）
  と本文パターン、ファイル構造の理解を提供します。

  使用タイミング:
  - 新しいコマンドの基本構造を設計する時
  - YAML Frontmatterの各フィールドの意味と使い方を理解する時
  - コマンドファイルの最小構成を知りたい時

  Use proactively when designing command structure, understanding YAML Frontmatter,
  or learning minimal command file configuration.
version: 1.0.0
---

# Command Structure Fundamentals

## 概要

このスキルは、Claude Codeスラッシュコマンドの基本構造を提供します。
YAML Frontmatterの各フィールドの意味と使い方、本文パターン、ファイル構造の理解により、
実運用レベルのコマンドファイルを作成するための基盤知識を習得できます。

**主要な価値**:
- YAML Frontmatterの完全理解
- 4つの本文パターンの使い分け
- ファイル構造の最適化
- 最小構成から完全版までの段階的理解

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- 新しいコマンドを設計する開発者
- コマンドファイルの構造を理解したいチーム

## リソース構造

```
command-structure-fundamentals/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── yaml-frontmatter-reference.md          # Frontmatter完全リファレンス
│   ├── body-pattern-examples.md               # 本文パターン実例集
│   └── file-structure-best-practices.md       # ファイル構造のベストプラクティス
└── templates/
    ├── minimal-command.md                     # 最小構成テンプレート
    └── complete-command.md                    # 完全版テンプレート
```

### リソース種別

- **Frontmatterリファレンス** (`resources/yaml-frontmatter-reference.md`): 各フィールドの詳細仕様
- **本文パターン** (`resources/body-pattern-examples.md`): 4パターンの実例
- **ファイル構造** (`resources/file-structure-best-practices.md`): 配置とディレクトリ設計
- **テンプレート** (`templates/`): 最小構成と完全版のテンプレート

## いつ使うか

### シナリオ1: 新規コマンド作成
**状況**: 初めてコマンドを作成する

**適用条件**:
- [ ] コマンドの基本構造を知らない
- [ ] YAML Frontmatterのフィールドを理解していない
- [ ] 最小構成がわからない

**期待される成果**: 実運用可能な最小構成コマンドの作成

### シナリオ2: Frontmatterフィールドの理解
**状況**: description、allowed-toolsなどの意味を知りたい

**適用条件**:
- [ ] 各フィールドの意味が不明
- [ ] どのフィールドが必須か知らない
- [ ] フィールドの組み合わせ方がわからない

**期待される成果**: Frontmatterの正確な理解と適切な設定

### シナリオ3: ファイル構造の最適化
**状況**: コマンドをどこに配置すべきか判断したい

**適用条件**:
- [ ] プロジェクトコマンドとユーザーコマンドの違いを知らない
- [ ] 名前空間の使い方がわからない
- [ ] ディレクトリ構造の設計方法を知りたい

**期待される成果**: 論理的で保守しやすいファイル構造

## 基本構造

### 最小構成

```markdown
---
description: Brief description of what this command does
---

# Command Title

Detailed instructions for Claude to execute this command.
```

**必須要素**:
- `description`: コマンドの説明（**必須**）
- 本文: Claudeへの指示

### 完全版構成

```markdown
---
description: |
  Detailed description (4-8 lines recommended)
  This is the PRIMARY signal for SlashCommand Tool to select this command.
  Include trigger keywords, use cases, and expected outcomes.
argument-hint: [arg1] [arg2] [--flag]
allowed-tools: Bash(git*), Read, Write(src/**)
model: claude-sonnet-4-5-20250929
disable-model-invocation: false
---

# Command Title

## Purpose
What this command does and why it exists

## Prerequisites
- Required environment
- Dependencies

## Execution Steps
1. Step 1
2. Step 2
3. Step 3

## Examples
Usage examples here

## Error Handling
How to handle failures
```

**推奨セクション**:
- Purpose: コマンドの目的
- Prerequisites: 前提条件
- Execution Steps: 実行手順
- Examples: 使用例
- Error Handling: エラーハンドリング

## YAML Frontmatter フィールド

### description（必須）

**役割**: SlashCommand Tool がコマンドを選択する際の**主要シグナル**

```yaml
# 最小版（避けるべき）
description: Commit code

# 推奨版（4-8行）
description: |
  Create a git commit following Conventional Commits specification.
  Automatically stages changes, analyzes diff, generates descriptive message,
  and pushes to current branch. Use when you want to commit and push changes
  in one command. Ideal for rapid development cycles.
```

**ベストプラクティス**:
- 4-8行の詳細な説明
- トリガーキーワードを含める
- 使用タイミングを明記
- 期待される結果を記述

### argument-hint（オプション）

**役割**: 引数のヒントを提供（`/help` で表示）

```yaml
# 単一引数
argument-hint: [filename]

# 複数引数
argument-hint: [source] [destination]

# オプション引数
argument-hint: [--env] [--verbose]

# 位置引数
argument-hint: [issue-number] [priority]
```

### allowed-tools（オプション）

**役割**: 使用可能なツールを制限（セキュリティ）

```yaml
# 基本形式
allowed-tools: ToolName, ToolName, ...

# パターンマッチング
allowed-tools: Bash(git*), Bash(npm*)

# パス制限
allowed-tools: Write(src/**/*.js), Read(*.md)

# 複数組み合わせ
allowed-tools: |
  Bash(git add:*),
  Bash(git commit:*),
  Read,
  Write(src/**)
```

**セキュリティ利用例**:
```yaml
# 読み取り専用コマンド
allowed-tools: Read, Grep

# 特定ディレクトリのみ書き込み可能
allowed-tools: Read, Write(tests/**), Bash(npm test)
```

### model（オプション）

**役割**: 使用するClaudeモデルを指定

```yaml
# 複雑な判断が必要
model: claude-opus-4-20250514
例: アーキテクチャ設計、複雑なリファクタリング

# 一般的なタスク（デフォルト推奨）
model: claude-sonnet-4-5-20250929
例: コード生成、レビュー、テスト作成

# シンプルなタスク（コスト最適化）
model: claude-3-5-haiku-20241022
例: フォーマット、シンプルな変換、定型作業
```

### disable-model-invocation（オプション）

**役割**: SlashCommand Tool による自動起動を禁止

```yaml
# 破壊的な操作や危険なコマンドに使用
disable-model-invocation: true

例:
- データベース削除
- 本番デプロイ
- ファイル一括削除
- 機密情報操作
```

## ファイル構造

### プロジェクトコマンド（最高優先度）

```bash
.claude/commands/
├── review.md
├── test.md
└── deploy/
    ├── staging.md
    └── production.md
```

- **スコープ**: プロジェクトメンバー全員
- **共有**: Gitでバージョン管理
- **識別子**: `/project:command` または `/project:namespace:command`
- **表示**: `/help` で "(project)" 表示

### ユーザーコマンド（中優先度）

```bash
~/.claude/commands/
├── personal-review.md
├── quick-commit.md
└── utils/
    └── cleanup.md
```

- **スコープ**: ユーザー個人
- **共有**: 個人のみ
- **識別子**: `/user:command` または `/user:namespace:command`
- **表示**: `/help` で "(user)" 表示

### 名前空間の活用

```bash
# フラットな構造（避けるべき）
.claude/commands/
├── test.md
├── test-unit.md
├── test-integration.md
└── test-e2e.md

# 名前空間構造（推奨）
.claude/commands/
└── test/
    ├── unit.md            # /project:test:unit
    ├── integration.md     # /project:test:integration
    └── e2e.md            # /project:test:e2e
```

**利点**:
- 組織化が容易
- コマンドの発見性向上
- 命名の衝突回避
- 論理的なグループ化

## 詳細リソースの参照

### YAML Frontmatter 完全リファレンス
詳細な仕様は `resources/yaml-frontmatter-reference.md` を参照

### 本文パターン実例集
4つのパターンの実例は `resources/body-pattern-examples.md` を参照

### ファイル構造ベストプラクティス
配置とディレクトリ設計は `resources/file-structure-best-practices.md` を参照

### テンプレート
- 最小構成: `templates/minimal-command.md`
- 完全版: `templates/complete-command.md`

## 関連スキル

- `.claude/skills/command-arguments-system/SKILL.md` - 引数システムの詳細
- `.claude/skills/command-security-design/SKILL.md` - セキュリティ設計
- `.claude/skills/command-basic-patterns/SKILL.md` - 4つの基本実装パターン
- `.claude/skills/command-naming-conventions/SKILL.md` - 命名規則
- `.claude/skills/command-placement-priority/SKILL.md` - 配置と優先順位

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
