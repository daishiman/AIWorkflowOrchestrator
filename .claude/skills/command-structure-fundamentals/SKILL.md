---
name: command-structure-fundamentals
description: |
  Claude Codeスラッシュコマンドの基本構造を専門とするスキル。
  YAML Frontmatter（description、argument-hint、allowed-tools、model、disable-model-invocation）
  と本文パターン、ファイル構造の理解を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-structure-fundamentals/resources/yaml-frontmatter-reference.md`: YAMLフロントマター完全リファレンス
  - `.claude/skills/command-structure-fundamentals/templates/minimal-command.md`: 最小構成コマンドテンプレート
  - `.claude/skills/command-structure-fundamentals/scripts/validate-command.mjs`: コマンド構造検証スクリプト

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

### ハブ特化型構成（推奨：エージェント・スキル呼び出し用）

```markdown
---
description: |
  [1行目: コマンドの目的]

  [2-3行目: 起動するエージェントとその役割]

  🤖 起動エージェント:
  - `.claude/agents/[agent-name].md`: [役割]（[起動タイミング]）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（[状況]時）:** [スキル名リスト]
  **Phase 2（[状況]時）:** [スキル名リスト]

  ⚙️ このコマンドの設定:
  - argument-hint: [引数設計の根拠]
  - allowed-tools:
    - [ツールセット]
    - [ツールセット]
  - model: [選択理由]

  トリガーキーワード: [キーワード]
argument-hint: "[args]"
allowed-tools:
  - Task
  - Read
  - Write([path]/**)
model: sonnet
---

# [コマンドタイトル]

## 目的

[1-2文で簡潔に]

## エージェント起動フロー

### Phase 1: 準備

- 引数処理
- コンテキスト確認

### Phase 2: エージェント起動

Task ツールで `[エージェントパス]` を起動

**エージェントへの依頼:**

- [やること]（必要時: [スキルパス]）
- [やること]（必須: [スキルパス]）

**期待成果物:**

- [成果物]

### Phase 3: 検証と報告

- 成果物確認
- 完了報告

## 使用例

[1-2個の具体例]
```

**ハブ特化型の特徴**:

- ✅ エージェント起動に特化（詳細はエージェントに委譲）
- ✅ スキルは条件付き参照（トークン効率）
- ✅ 簡潔な本文（3フェーズのみ）
- ❌ 詳細な実装手順は記述しない
- ❌ スキル内容の重複は避ける

### 従来型構成（レガシー：直接実行用）

```markdown
---
description: Detailed description
argument-hint: [arg1] [arg2]
allowed-tools: Bash(git*), Read, Write(src/**)
model: sonnet
---

# Command Title

## Purpose

What this command does

## Execution Steps

1. Step 1
2. Step 2
3. Step 3

## Examples

Usage examples

## Error Handling

How to handle failures
```

**従来型の用途**:

- エージェントを使わない直接実行コマンド
- シンプルな自動化（Bash スクリプト相当）

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

**ハブ特化型（エージェント起動コマンド）**:

- 🤖 起動エージェント: 相対パス + 役割 + 起動タイミング
- 📚 利用可能スキル: フェーズ別・条件付き（「必要時」明記）
- ⚙️ 設定根拠: argument-hint, allowed-tools, model の選択理由を記述
- トリガーキーワード: 自然言語での起動キーワード

**従来型（直接実行コマンド）**:

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
allowed-tools: Bash(git*), Bash(pnpm*)

# パス制限
allowed-tools: Write(src/**/*.js), Read(*.md)

# 複数組み合わせ
allowed-tools: |
  Bash(git add:*),
  Bash(git commit:*),
  Read,
  Write(src/**)
```

**利用可能な全ツール（Claude Code 公式）**:

```yaml
# コアツール
- Task: サブエージェント起動
- Read: ファイル読み取り
- Write: ファイル書き込み（新規作成・上書き）
- Edit: ファイル編集（部分置換）
- Grep: コンテンツ検索
- Glob: ファイルパターン検索
- Bash: シェルコマンド実行

# その他のツール
- WebSearch: Web検索
- WebFetch: URL取得
- TodoWrite: タスク管理
- AskUserQuestion: ユーザーへ質問
- Skill: スキル実行
- SlashCommand: コマンド実行
- NotebookEdit: Jupyter編集
- BashOutput: バックグラウンドBash出力取得
- KillShell: バックグラウンドBash終了
```

**最小権限パターン（ハブ特化型）**:

```yaml
# パターン1: エージェント起動のみ（最小）
allowed-tools:
  - Task
  - Read
用途: シンプルなエージェント委譲、既存ファイル確認のみ
例: /ai:analyze, /ai:review

# パターン2: ファイル生成あり（制限付き書き込み）
allowed-tools:
  - Task
  - Read
  - Write(.claude/[特定パス]/**)
用途: .claude/ ディレクトリ内の生成、特定パスへの書き込み制限
例: /ai:create-agent, /ai:create-skill, /ai:create-command

# パターン3: 検索・パターン確認あり
allowed-tools:
  - Task
  - Read
  - Grep
  - Glob
  - Write([パス]/**)
用途: 既存パターン確認、重複チェック、ファイル生成
例: /ai:refactor, /ai:optimize

# パターン4: 編集操作あり
allowed-tools:
  - Task
  - Read
  - Edit
  - Grep
  - Glob
用途: 既存ファイルの部分編集、パターン検索
例: /ai:fix-bugs, /ai:update-docs

# パターン5: Bash実行あり（制限付き）
allowed-tools:
  - Task
  - Read
  - Bash(git*)
  - Write([パス]/**)
用途: Git操作、バージョン管理
例: /ai:commit, /ai:create-pr

# パターン6: パッケージ管理
allowed-tools:
  - Task
  - Read
  - Bash(pnpm*)
  - Write(package.json)
用途: 依存関係管理、パッケージインストール
例: /ai:add-dependency, /ai:update-dependencies

# パターン7: ビルド・テスト実行
allowed-tools:
  - Task
  - Read
  - Bash(pnpm*)
  - Edit
用途: ビルド、テスト実行、結果に基づく修正
例: /ai:build, /ai:test, /ai:lint

# パターン8: 複合ワークフロー（制限付きフルアクセス）
allowed-tools:
  - Task
  - Read
  - Write(src/**|docs/**)
  - Edit
  - Bash(git*|pnpm*)
  - Grep
  - Glob
用途: 複数フェーズの統合ワークフロー、複数ディレクトリへのアクセス
例: /ai:full-feature-development, /ai:prepare-release
```

**セキュリティ原則**:

```yaml
# ✅ 良い例：最小権限
allowed-tools:
  - Task
  - Read
  - Write(.claude/commands/**)
理由: 必要なツールのみ、パス制限あり、破壊的操作なし

# ⚠️ 注意が必要：部分的な権限拡大
allowed-tools:
  - Task
  - Read
  - Edit
  - Bash(pnpm test)
理由: Edit は慎重に、Bash は制限付きコマンドのみ

# ❌ 悪い例：過剰な権限
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Task
  - Grep
  - Glob
理由: すべてのツール、制限なし、Bash で任意のコマンド実行可能
```

**パス制限の重要性**:

```yaml
# ✅ 推奨：特定パスのみ
Write(.claude/commands/**)    # .claude/commands/ 配下のみ
Write(src/features/**)         # src/features/ 配下のみ
Write(docs/**)                 # docs/ 配下のみ

# ⚠️ 広範囲：慎重に
Write(src/**)                  # src/ 全体
Write(**)                      # プロジェクト全体（避けるべき）

# ❌ 制限なし：禁止
Write                          # どこでも書き込み可能（危険）
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

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# YAML Frontmatter完全リファレンス
cat .claude/skills/command-structure-fundamentals/resources/yaml-frontmatter-reference.md
```

### テンプレート参照

```bash
# 最小構成テンプレート
cat .claude/skills/command-structure-fundamentals/templates/minimal-command.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-structure-fundamentals/resources/yaml-frontmatter-reference.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-structure-fundamentals/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-structure-fundamentals
```

## 関連スキル

- `.claude/skills/command-arguments-system/SKILL.md` - 引数システムの詳細
- `.claude/skills/command-security-design/SKILL.md` - セキュリティ設計
- `.claude/skills/command-basic-patterns/SKILL.md` - 4つの基本実装パターン
- `.claude/skills/command-naming-conventions/SKILL.md` - 命名規則
- `.claude/skills/command-placement-priority/SKILL.md` - 配置と優先順位

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
