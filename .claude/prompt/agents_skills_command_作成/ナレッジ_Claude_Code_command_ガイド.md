# Claude Code スラッシュコマンド完全ガイド

## 目次

1. [概念的基盤](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E6%A6%82%E5%BF%B5%E7%9A%84%E5%9F%BA%E7%9B%A4)
2. [コマンド構造の詳細仕様](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E6%A7%8B%E9%80%A0%E3%81%AE%E8%A9%B3%E7%B4%B0%E4%BB%95%E6%A7%98)
3. [起動メカニズムと実行フロー](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E8%B5%B7%E5%8B%95%E3%83%A1%E3%82%AB%E3%83%8B%E3%82%BA%E3%83%A0%E3%81%A8%E5%AE%9F%E8%A1%8C%E3%83%95%E3%83%AD%E3%83%BC)
4. [高度な実装パターン](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E9%AB%98%E5%BA%A6%E3%81%AA%E5%AE%9F%E8%A3%85%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3)
5. [エージェント・スキルとの統合](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E3%82%B9%E3%82%AD%E3%83%AB%E3%81%A8%E3%81%AE%E7%B5%B1%E5%90%88)
6. [ベストプラクティス](https://claude.ai/chat/92f669e4-7a87-46dd-b248-85d7ff04556e#%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9)

---

## 1. 概念的基盤

### 1.1 スラッシュコマンドの定義と本質

```
┌─────────────────────────────────────────────────────────────┐
│           スラッシュコマンドの3つの顔                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐          ┌──▼───┐          ┌───▼────┐
    │SHORTCUT│          │PROMPT│          │WORKFLOW│
    │ショートカット│          │テンプレート│          │自動化   │
    └────────┘          └──────┘          └────────┘
        │                   │                   │
   即座の実行           再利用可能           複雑なフロー
   手動トリガー         パラメータ化         決定論的
```

#### 上位概念：プログラマブルAI

**従来のアプローチ:**

```
ユーザー: "このコードをレビューして、次にセキュリティチェックして、
         その後テストを作成して、最後にコミットして"

問題:
- 毎回同じ指示を繰り返す
- 指示の一貫性がない
- トークン消費が多い
- ステップを忘れる可能性
```

**スラッシュコマンドアプローチ:**

```
ユーザー: /full-code-review

自動実行:
1. コードレビュー実行
2. セキュリティスキャン
3. テスト生成
4. コミット作成

利点:
- 1回のコマンドで完結
- 常に同じワークフロー
- トークン効率的
- ステップの漏れなし
```

**重要な洞察:**

> "スラッシュコマンドは、AIを会話のパートナーから**プログラマブルな自動化ツール**に変換する。同じワークフローを繰り返し説明する代わりに、一度エンコードして効率的に再利用する。"

### 1.2 スラッシュコマンド vs その他の機能

|特性|スラッシュコマンド|スキル|エージェント|CLAUDE.md|
|---|---|---|---|---|
|**起動方法**|ユーザー明示（`/cmd`）|モデル判断（自動）|モデル判断 or 明示|常時ロード|
|**用途**|特定ワークフロー実行|手続き的知識提供|タスク実行と判断|プロジェクト全体の文脈|
|**パラメータ**|`$ARGUMENTS` サポート|なし|コンテキスト依存|静的|
|**実行タイミング**|即座|必要時|委譲時|セッション開始時|
|**トークン使用**|コマンド本文のみ|Progressive Disclosure|独立コンテキスト|常時消費|
|**スコープ**|プロジェクト or ユーザー|同左|同左|プロジェクトのみ|
|**バージョン管理**|Git可能|Git可能|Git可能|Git必須|

#### 使い分けの原則

```markdown
スラッシュコマンドを使うべき時:
✓ 繰り返し実行する定型ワークフロー
✓ 複数ステップの決定論的タスク
✓ 明示的なトリガーが望ましい操作
✓ チーム全体で共有したいプロセス

スキルを使うべき時:
✓ ドメイン知識の段階的提供
✓ コンテキストに応じた自動起動
✓ 大量の参照情報
✓ プロアクティブな支援

エージェントを使うべき時:
✓ 複雑な判断が必要
✓ 複数ツールの協調
✓ 独立したコンテキストが必要
✓ サブタスクへの委譲

CLAUDE.mdを使うべき時:
✓ プロジェクト全体のルール
✓ 常に適用される制約
✓ チーム規約
✓ 環境設定情報
```

### 1.3 コマンドの2つの起動モード

#### モード1: ユーザー明示起動（デフォルト）

```bash
# 直接入力
> /commit

# 引数付き
> /fix-issue 123

# 名前空間付き
> /project:create-feature user-authentication
```

#### モード2: モデル起動（SlashCommand Tool経由）

```markdown
# CLAUDE.md での設定
## ワークフロー

コードレビューが必要な時:
- `/code-review` コマンドを実行

テスト作成時:
- `/generate-tests` コマンドを実行
```

**Claudeの動作:**

```
1. ユーザー: "このコードをレビューして"

2. Claude が CLAUDE.md を参照
   → "コードレビューには /code-review" を発見

3. Claude が SlashCommand Tool を使用
   → /code-review を自動実行

4. コマンド結果を受け取って継続
```

**重要な制約:**

```yaml
SlashCommand Tool が起動できるのは:
  ✓ カスタムコマンド（.claude/commands/）
  ✗ ビルトインコマンド（/compact, /init等）
  
条件:
  - description frontmatter が必須
  - disable-model-invocation: true の場合は起動不可
```

---

## 2. コマンド構造の詳細仕様

### 2.1 ファイル構造

#### 基本構造

```markdown
---
description: Brief description of what this command does
---

# Command Title

Detailed instructions for Claude to execute this command.
```

#### 完全版（全オプション）

```markdown
---
description: Brief description (必須: SlashCommand Tool用)
argument-hint: [arg1] [arg2] [arg3]
allowed-tools: Bash(git*), Read, Write
model: claude-3-5-haiku-20241022
disable-model-invocation: false
---

# Command Title

## 目的
このコマンドが何をするかの説明

## 前提条件
- 必要な環境
- 依存関係

## 実行手順
1. ステップ1
2. ステップ2
3. ステップ3

## 例
使用例をここに記載
```

### 2.2 Frontmatter 詳細

#### description（必須）

```yaml
description: Create a git commit with conventional commit format
```

**重要性:**

- SlashCommand Tool がコマンドを選択する際の**主要シグナル**
- `/help` で表示される説明文
- コマンド検索時のキーワード

**ベストプラクティス:**

```yaml
# 悪い例
description: Commit code

# 良い例
description: |
  Create a git commit following Conventional Commits specification.
  Automatically stages changes, generates descriptive message, and pushes.
```

#### argument-hint（オプション）

```yaml
argument-hint: [issue-number]
```

**用途:**

- コマンドの引数を明示
- `/help` 表示時にヒントとして表示
- ドキュメント目的

**例:**

```yaml
# 単一引数
argument-hint: [filename]

# 複数引数
argument-hint: [source] [destination]

# オプション引数
argument-hint: [--flag] [value]

# 位置引数
argument-hint: [pr-number] [priority] [assignee]
```

**使用例:**

```markdown
---
argument-hint: [issue-number] [priority-level]
---

# Fix GitHub Issue

Fix GitHub issue #$1 with priority $2
```

#### allowed-tools（オプション）

```yaml
allowed-tools: Bash(git*), Read, Write(src/**), Search
```

**構文:**

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
  Bash(git push:*),
  Read,
  Write(src/**)
```

**セキュリティ利用:**

```yaml
# 読み取り専用コマンド
allowed-tools: Read, Search

# Git専用コマンド
allowed-tools: Bash(git*)

# 特定ディレクトリのみ書き込み可能
allowed-tools: Read, Write(tests/**), Bash(npm test)
```

#### model（オプション）

```yaml
model: claude-3-5-haiku-20241022
```

**利用可能なモデル:**

```yaml
# Opus 4（高度な推論）
model: claude-opus-4-20250514

# Sonnet 4.5（バランス）
model: claude-sonnet-4-5-20250929

# Haiku 3（高速・低コスト）
model: claude-3-5-haiku-20241022
```

**使用ガイドライン:**

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

#### disable-model-invocation（オプション）

```yaml
disable-model-invocation: true
```

**用途:**

- SlashCommand Tool による自動起動を禁止
- ユーザーの明示的な実行のみ許可
- 危険な操作や破壊的なコマンドに使用

**例:**

```yaml
---
description: Delete all temporary files and caches
disable-model-invocation: true  # モデルが勝手に実行しないように
---

# Cleanup Command

⚠️ このコマンドは破壊的な操作を行います。
```

### 2.3 本文の構造パターン

#### パターン1: シンプル指示型

````markdown
---
description: Format code with Prettier
---

# Code Formatting

Run Prettier on all JavaScript and TypeScript files:

```bash
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
````

Verify formatting is correct.

````

#### パターン2: ステップバイステップ型
```markdown
---
description: Create a new React component with tests
---

# Create React Component

Component name: $ARGUMENTS

## Step 1: Create Component File
Create `src/components/$ARGUMENTS.tsx` with:
- TypeScript interface for props
- Functional component with hooks
- JSDoc comments

## Step 2: Create Test File
Create `src/components/$ARGUMENTS.test.tsx` with:
- Render test
- Props test
- Interaction tests

## Step 3: Update Index
Add export to `src/components/index.ts`

## Step 4: Verify
Run tests and type checking:
```bash
npm test -- $ARGUMENTS
npm run typecheck
````

````

#### パターン3: 条件分岐型
```markdown
---
description: Deploy to environment (staging/production)
---

# Deployment Command

Environment: $ARGUMENTS

## Environment Detection
Determine target environment from $ARGUMENTS:
- If "staging" → Deploy to staging
- If "production" → Deploy to production  
- Else → Error

## Pre-deployment Checks
1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Build: `npm run build`

## Deployment Steps

### If Staging:
```bash
aws s3 sync dist/ s3://staging-bucket/
aws cloudfront create-invalidation --distribution-id STAGING_ID
````

### If Production:

```bash
# Require confirmation
aws s3 sync dist/ s3://production-bucket/
aws cloudfront create-invalidation --distribution-id PROD_ID
```

## Post-deployment

Verify deployment health:

```bash
curl -f https://$ARGUMENTS.example.com/health
```

````

#### パターン4: ファイル参照型
```markdown
---
description: Review code following team guidelines
---

# Code Review

## Load Guidelines
Read team coding standards:
- @.claude/code-standards.md
- @.claude/review-checklist.md

## Review Criteria
Based on guidelines, check:
1. Code style consistency
2. Test coverage
3. Documentation
4. Security considerations
5. Performance implications

## Generate Review Comments
Create detailed review with:
- Issues found (with severity)
- Suggestions for improvement
- Approved sections
````

### 2.4 配置場所と優先順位

#### 配置オプション

**1. プロジェクトコマンド（最高優先度）**

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

**2. ユーザーコマンド（中優先度）**

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

**3. MCPプロンプト（動的）**

```bash
# MCPサーバーが提供
/mcp__github__create_pr
/mcp__jira__create_issue
/mcp__slack__send_message
```

- **スコープ**: MCPサーバー接続時
- **共有**: MCP経由
- **識別子**: `/mcp__servername__promptname`
- **表示**: MCPサーバー名付き

#### 優先順位解決

```
同名コマンドが存在する場合:

1. .claude/commands/review.md          (プロジェクト)
2. ~/.claude/commands/review.md        (ユーザー)
3. mcp__server__review                 (MCP)

→ 1 が実行される
```

#### 名前空間の活用

```bash
# フラットな構造（避けるべき）
.claude/commands/
├── test.md
├── test-unit.md
├── test-integration.md
├── test-e2e.md
└── test-performance.md

# 名前空間構造（推奨）
.claude/commands/
└── test/
    ├── unit.md            # /project:test:unit
    ├── integration.md     # /project:test:integration
    ├── e2e.md            # /project:test:e2e
    └── performance.md     # /project:test:performance
```

**利点:**

- 組織化が容易
- コマンドの発見性向上
- 命名の衝突回避
- 論理的なグループ化

---

## 3. 起動メカニズムと実行フロー

### 3.1 $ARGUMENTS の詳細

#### 基本的な使用

```markdown
---
description: Commit changes with message
---

# Git Commit

Commit message: $ARGUMENTS

Steps:
1. Stage all changes: `git add -A`
2. Commit with message: `git commit -m "$ARGUMENTS"`
3. Push: `git push`
```

**実行:**

```bash
> /commit "feat: add user authentication"

→ $ARGUMENTS = "feat: add user authentication"
```

#### 位置引数

````markdown
---
argument-hint: [source] [destination]
---

# Copy File

Copy file from $1 to $2

```bash
cp "$1" "$2"
````

Verify copy succeeded.

````

**実行:**
```bash
> /copy src/old.js src/new.js

→ $1 = "src/old.js"
→ $2 = "src/new.js"
````

#### 引数の検証

```markdown
---
description: Deploy to environment
---

# Deployment

Target environment: $ARGUMENTS

## Validation
Check if $ARGUMENTS is valid:
- Must be "staging" or "production"
- If invalid, show error and exit

## Execution
Proceed with deployment to $ARGUMENTS
```

#### デフォルト値の提供

````markdown
---
description: Run tests with optional pattern
---

# Test Runner

Test pattern: $ARGUMENTS (default: all tests)

## Determine Pattern
```bash
PATTERN="${$ARGUMENTS:-**/*.test.js}"
npm test -- "$PATTERN"
````

````

### 3.2 Extended Thinking のトリガー

#### Extended Thinking キーワード
```markdown
コマンド内に以下のキーワードを含めると、
Claudeは深い思考モードに入る:

- "think carefully"
- "consider thoroughly"
- "analyze deeply"
- "reason about"
````

**例:**

```markdown
---
description: Refactor code with careful analysis
---

# Intelligent Refactoring

## Analysis Phase
**Think carefully** about the code structure:
1. Identify code smells
2. Consider design patterns
3. Analyze dependencies

## Refactoring Plan
**Reason about** the best refactoring approach:
- What patterns would improve the code?
- What are the risks?
- What's the migration path?

## Implementation
Apply the refactoring carefully
```

### 3.3 実行フローの完全図解

#### ユーザー明示起動フロー

```
┌──────────────────────────────────────┐
│ ユーザー入力: /commit "feat: add X" │
└───────────────┬──────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ Claude Code がコマンドファイル検索     │
│ 1. .claude/commands/commit.md         │
│ 2. ~/.claude/commands/commit.md       │
│ 3. MCP プロンプト                      │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ コマンドファイル読み込み                │
│ - Frontmatter 解析                    │
│ - $ARGUMENTS 置換                     │
│ - 本文をプロンプトとして使用           │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ Claude 実行                            │
│ - 指定モデル使用（デフォルト: Sonnet） │
│ - allowed-tools 制約適用              │
│ - ツール呼び出し実行                   │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ 結果返却                               │
│ - 標準出力へ表示                       │
│ - ファイル変更適用                     │
│ - 完了メッセージ                       │
└────────────────────────────────────────┘
```

#### モデル自動起動フロー（SlashCommand Tool）

```
┌──────────────────────────────────────┐
│ ユーザー: "コードをレビューして"      │
└───────────────┬──────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ Claude が CLAUDE.md 参照              │
│ "コードレビュー時は /code-review" 発見│
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ SlashCommand Tool 起動判断            │
│ - description フィールド確認          │
│ - disable-model-invocation チェック   │
│ - コマンドの関連性評価                │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ /code-review 自動実行                 │
│ （以降はユーザー明示起動と同じ）      │
└────────────────────────────────────────┘
```

### 3.4 自然言語トリガーの実装

#### CLAUDE.md での設定

```markdown
# ワークフローキーワード

以下のキーワードを検出したら、対応するコマンドを実行:

## コミット関連
- "commit", "コミット", "変更を保存"
  → `/commit` を実行

## レビュー関連
- "review", "レビュー", "コードチェック"
  → `/code-review` を実行

## テスト関連
- "test", "テスト", "動作確認"
  → `/run-tests` を実行

## デプロイ関連
- "deploy", "デプロイ", "本番反映"
  → 環境を確認してから `/deploy:staging` または `/deploy:production`
```

**実行例:**

```
ユーザー: "変更をコミットして"
↓
Claude: CLAUDE.md を参照
↓
"変更を保存" → /commit を発見
↓
SlashCommand Tool で /commit 実行
```

---

## 4. 高度な実装パターン

### 4.1 パイプラインパターン

#### 複数コマンドの連鎖

```markdown
---
description: Full feature development pipeline
---

# Feature Pipeline

Feature name: $ARGUMENTS

## Phase 1: Planning
Execute `/plan-feature $ARGUMENTS`
Wait for completion.

## Phase 2: Implementation
Execute `/implement-feature $ARGUMENTS`
Wait for completion.

## Phase 3: Testing
Execute `/test-feature $ARGUMENTS`
Wait for completion.

## Phase 4: Review
Execute `/review-feature $ARGUMENTS`
Wait for completion.

## Phase 5: Deployment
Execute `/deploy-feature $ARGUMENTS staging`
If successful, ask for production deployment approval.
```

### 4.2 条件付き実行パターン

#### 環境別処理

````markdown
---
description: Environment-aware command
---

# Smart Deploy

Target: $ARGUMENTS

## Environment Detection
```bash
if [ "$ARGUMENTS" = "staging" ]; then
  BUCKET="staging-bucket"
  CLOUDFRONT="STAGING_CF_ID"
elif [ "$ARGUMENTS" = "production" ]; then
  BUCKET="production-bucket"
  CLOUDFRONT="PRODUCTION_CF_ID"
else
  echo "Error: Invalid environment"
  exit 1
fi
````

## Pre-deployment Checks

Run based on environment:

- Staging: Basic tests only
- Production: Full test suite + manual approval

## Deployment

```bash
npm run build
aws s3 sync dist/ s3://$BUCKET/
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT
```

````

### 4.3 インタラクティブパターン

#### ユーザー確認の統合
```markdown
---
description: Interactive database migration
---

# Database Migration

Migration file: $ARGUMENTS

## Step 1: Preview Changes
Show the migration SQL:
```bash
cat migrations/$ARGUMENTS
````

## Step 2: Dry Run

Execute in transaction (rollback):

```sql
BEGIN;
\i migrations/$ARGUMENTS
ROLLBACK;
```

## Step 3: User Confirmation

⚠️ **This will modify the production database.**

Ask user: "Proceed with migration? (yes/no)"

## Step 4: Execute (if confirmed)

```sql
BEGIN;
\i migrations/$ARGUMENTS
COMMIT;
```

## Step 5: Verification

Verify migration success:

```bash
psql -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"
```

````

### 4.4 エラーハンドリングパターン

#### 堅牢なエラー処理
```markdown
---
description: Robust deployment with rollback
---

# Safe Deployment

Environment: $ARGUMENTS

## Backup Current State
```bash
git tag backup-$(date +%Y%m%d-%H%M%S)
aws s3 sync s3://$BUCKET/ s3://$BUCKET-backup-$(date +%Y%m%d)/
````

## Deployment Attempt

```bash
set -e  # Exit on error
npm run build
aws s3 sync dist/ s3://$BUCKET/
```

## Health Check

```bash
HEALTH_URL="https://$ARGUMENTS.example.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$RESPONSE" != "200" ]; then
  echo "❌ Health check failed (HTTP $RESPONSE)"
  echo "🔄 Rolling back..."
  
  # Rollback
  aws s3 sync s3://$BUCKET-backup-$(date +%Y%m%d)/ s3://$BUCKET/
  
  echo "✅ Rollback complete"
  exit 1
fi
```

## Success

```
✅ Deployment successful
📊 Health check: OK
🗑️ Cleaning up backup
```

## Error Notification

If any step fails:

1. Send notification to Slack
2. Create incident in PagerDuty
3. Log to monitoring system

````

### 4.5 メタコマンドパターン

#### コマンド自身を管理するコマンド
```markdown
---
description: Create new slash command
---

# Command Generator

Command name: $ARGUMENTS

## Step 1: Gather Information
Ask user:
- Command description
- Required arguments
- Tools needed
- Workflow steps

## Step 2: Generate Command File
Create `.claude/commands/$ARGUMENTS.md`:

```markdown
---
description: [user-provided description]
argument-hint: [user-provided args]
allowed-tools: [user-provided tools]
---

# [Command Name]

[user-provided workflow]
````

## Step 3: Test Command

Ask user to test: `/project:$ARGUMENTS [test-args]`

## Step 4: Git Commit

```bash
git add .claude/commands/$ARGUMENTS.md
git commit -m "feat: add /$ARGUMENTS command"
```

```

---

## 5. エージェント・スキルとの統合

### 5.1 統合モデル

```

┌─────────────────────────────────────────────────────┐ │ 三位一体の協調モデル │ └─────────────────────────────────────────────────────┘ │ ┌────────────────┼────────────────┐ │ │ │ ┌───▼────┐ ┌───▼────┐ ┌───▼─────┐ │Command │ │ Agent │ │ Skill │ │ (DO) │ │ (WHO) │ │ (KNOW) │ └───┬────┘ └───┬────┘ └───┬─────┘ │ │ │ ワークフロー 意思決定 知識提供 即座実行 委譲判断 段階開示

````

### 5.2 コマンド → エージェント 起動パターン

```markdown
---
description: Full-stack feature development
---

# Feature Development

Feature: $ARGUMENTS

## Phase 1: Requirements
Invoke @pm-spec-agent:
- Analyze feature requirements
- Create user stories
- Define acceptance criteria

## Phase 2: Architecture
Invoke @architect-agent:
- Design system architecture
- Define API contracts
- Plan database schema

## Phase 3: Backend Development
Invoke @backend-developer-agent:
- Implement API endpoints
- Write business logic
- Create database migrations

## Phase 4: Frontend Development
Invoke @frontend-developer-agent:
- Build UI components
- Integrate with API
- Add state management

## Phase 5: Testing
Invoke @qa-tester-agent:
- Write unit tests
- Create integration tests
- Run E2E tests

## Phase 6: Review
Invoke @code-reviewer-agent:
- Review all changes
- Check security
- Verify best practices
````

### 5.3 コマンド → スキル 活用パターン

```markdown
---
description: API endpoint creation with best practices
---

# Create API Endpoint

Endpoint: $ARGUMENTS

## Step 1: Design Review
Refer to `api-design-patterns` skill:
- RESTful principles
- Naming conventions
- Versioning strategy

## Step 2: Implementation
Apply `error-handling-patterns` skill:
- Unified error responses
- HTTP status codes
- Error logging

## Step 3: Validation
Use `input-validation` skill:
- Request body validation
- Query parameter sanitization
- Type checking

## Step 4: Documentation
Leverage `api-documentation` skill:
- OpenAPI spec generation
- Example requests/responses
- Error documentation

## Step 5: Testing
Apply `api-testing` skill:
- Unit test creation
- Integration test setup
- Contract testing
```

### 5.4 複合ワークフローパターン

```markdown
---
description: Complete feature with all checks
---

# Feature Complete Workflow

Feature: $ARGUMENTS

## Stage 1: Development
```

/feature-develop $ARGUMENTS

```
This command will:
- Invoke @developer-agent
- Use coding-standards skill
- Create implementation

## Stage 2: Quality Assurance
```

/feature-test $ARGUMENTS

```
This command will:
- Invoke @qa-agent
- Use testing-strategies skill
- Generate test suite

## Stage 3: Security Check
```

/security-scan $ARGUMENTS

```
This command will:
- Invoke @security-auditor-agent
- Use owasp-top-10 skill
- Perform SAST analysis

## Stage 4: Code Review
```

/code-review $ARGUMENTS

```
This command will:
- Invoke @code-reviewer-agent
- Use review-checklist skill
- Generate review report

## Stage 5: Documentation
```

/document-feature $ARGUMENTS

```
This command will:
- Invoke @documentation-generator-agent
- Use documentation-templates skill
- Update README and docs

## Stage 6: Deployment Prep
```

/prepare-deploy $ARGUMENTS

```
This command will:
- Create release notes
- Update changelog
- Tag version
```

---

## 6. ベストプラクティス

### 6.1 設計原則

#### 原則1: 単一責任の原則

```markdown
✓ 良いコマンド設計:
/commit        - Git commit のみ
/test          - テスト実行のみ
/deploy        - デプロイのみ

✗ 悪いコマンド設計:
/do-everything - commit, test, deploy 全部
               → 柔軟性がない、デバッグ困難
```

#### 原則2: 組み合わせ可能性の原則

```markdown
個別コマンド:
/test         - テスト実行
/lint         - Lint実行
/build        - ビルド実行

組み合わせコマンド:
/pre-commit   - test + lint を実行
/ci-check     - test + lint + build を実行

利点:
- 小さなコマンドは再利用可能
- 大きなワークフローは組み合わせで構築
- 保守が容易
```

#### 原則3: 冪等性の原則

```markdown
コマンドは何度実行しても安全:

✓ 良い例:
/format-code
- 既にフォーマット済みなら何もしない
- 複数回実行しても同じ結果

✗ 悪い例:
/increment-version
- 実行のたびにバージョンが上がる
- 意図しない重複実行のリスク
```

### 6.2 命名規則

#### コマンド名

```bash
# 推奨パターン: [動詞]-[対象]
/create-component
/delete-cache
/review-code
/deploy-staging

# 名前空間の活用
/git:commit
/git:push
/test:unit
/test:integration
/deploy:staging
/deploy:production

# 避けるべき
/cmd1          # 意味不明
/do-stuff      # 曖昧
/magic         # 予測不可能
```

#### ファイル配置

```bash
# フラット（シンプル）
.claude/commands/
├── commit.md
├── test.md
└── deploy.md

# 名前空間（推奨）
.claude/commands/
├── git/
│   ├── commit.md       # /project:git:commit
│   ├── push.md
│   └── revert.md
├── test/
│   ├── unit.md         # /project:test:unit
│   ├── integration.md
│   └── e2e.md
└── deploy/
    ├── staging.md      # /project:deploy:staging
    └── production.md
```

### 6.3 Description の最適化

#### フォーミュラ

```
[動詞] + [対象] + [方法] + [用途/タイミング]

例:
"Create React component with TypeScript and tests. 
Use when scaffolding new UI components."
```

#### 実例集

```yaml
# レベル1: 最小限（起動しにくい）
description: Commit

# レベル2: 基本
description: Create git commit

# レベル3: 明確
description: Create git commit with conventional commit format

# レベル4: 詳細（推奨）
description: |
  Create git commit following Conventional Commits specification.
  Automatically stages changes, analyzes diff, generates descriptive
  message, and pushes to remote. Use for committing code changes.

# レベル5: 完璧
description: |
  Create git commit following Conventional Commits specification
  (feat/fix/docs/style/refactor/test/chore). Automatically stages
  all changes with 'git add -A', analyzes the diff to determine
  appropriate type, generates a descriptive message under 50 chars,
  and pushes to the current branch. Use when you want to commit and
  push changes in one command. Ideal for rapid development cycles.
```

### 6.4 引数設計のパターン

#### パターン1: 単一引数（シンプル）

```markdown
---
argument-hint: [filename]
---

# Analyze File

Analyze file: $ARGUMENTS
```

#### パターン2: 複数引数（位置指定）

```markdown
---
argument-hint: [source] [destination]
---

# Copy and Transform

Copy from $1 to $2 with transformations
```

#### パターン3: フラグスタイル

```markdown
---
argument-hint: [--env] [--verbose] [--dry-run]
---

# Flexible Deploy

Parse arguments: $ARGUMENTS

Check for flags:
- --env: Target environment
- --verbose: Detailed logging
- --dry-run: Simulate only
```

#### パターン4: 引数なし（インタラクティブ）

```markdown
---
description: Interactive component generator
---

# Component Generator

## Step 1: Ask for component name
Prompt user for component name

## Step 2: Ask for type
- Functional or Class component?
- With or without state?

## Step 3: Ask for tests
- Include tests? (yes/no)

## Step 4: Generate
Create component based on answers
```

### 6.5 エラーハンドリング戦略

#### 明示的なエラーチェック

````markdown
---
description: Safe deployment with validation
---

# Validated Deploy

Environment: $ARGUMENTS

## Validation Phase
```bash
# Check environment
if [ -z "$ARGUMENTS" ]; then
  echo "❌ Error: Environment not specified"
  echo "Usage: /deploy [staging|production]"
  exit 1
fi

if [ "$ARGUMENTS" != "staging" ] && [ "$ARGUMENTS" != "production" ]; then
  echo "❌ Error: Invalid environment '$ARGUMENTS'"
  echo "Valid options: staging, production"
  exit 1
fi
````

## Pre-flight Checks

```bash
# Check tests pass
if ! npm test; then
  echo "❌ Error: Tests failed"
  echo "Fix tests before deploying"
  exit 1
fi

# Check build succeeds
if ! npm run build; then
  echo "❌ Error: Build failed"
  exit 1
fi
```

## Deployment

Proceed with deployment...

````

### 6.6 ドキュメンテーション

#### セルフドキュメンティングコマンド
```markdown
---
description: Well-documented example command
---

# Example Command

## 📋 Purpose
This command demonstrates best practices for command documentation.

## 📥 Input
- `$ARGUMENTS`: Description of what this argument represents

## 📤 Output
- Modified files
- Console output
- Any side effects

## ⚙️ Prerequisites
- Node.js 18+
- Git configured
- AWS CLI installed

## 🔧 Configuration
This command reads from:
- `.env` file
- `package.json`

## 📝 Examples

### Example 1: Basic usage
```bash
/example basic-input
````

### Example 2: Advanced usage

```bash
/example advanced-input --flag
```

## ⚠️ Warnings

- This command modifies production data
- Requires admin privileges
- Cannot be undone

## 🐛 Troubleshooting

### Issue: Command fails with "X not found"

**Solution**: Install X with `npm install X`

### Issue: Permission denied

**Solution**: Run with appropriate permissions

## 📚 Related Commands

- `/related-command-1` - Description
- `/related-command-2` - Description

## 🔗 External Resources

- [Documentation](https://example.com/docs)
- [Tutorial](https://example.com/tutorial)

````

### 6.7 テストとデバッグ

#### コマンドのユニットテスト
```markdown
# .claude/commands/test-command.md
---
description: Test a slash command
---

# Command Tester

Command to test: $ARGUMENTS

## Step 1: Dry Run
Execute command with dry-run flag if available

## Step 2: Capture Output
Save output for verification

## Step 3: Verify Expected Behavior
Check:
- Exit code
- Output format
- Side effects
- Error handling

## Step 4: Report
Generate test report with:
- ✅ Passed checks
- ❌ Failed checks
- 📊 Performance metrics
````

#### デバッグモード

````markdown
---
description: Debug-enabled command template
---

# Debug Command

Task: $ARGUMENTS

## Debug Mode Check
```bash
if [ "$DEBUG" = "true" ]; then
  set -x  # Enable bash debugging
  echo "🔍 Debug mode enabled"
fi
````

## Execution with Logging

```bash
echo "📍 Starting task: $ARGUMENTS" | tee -a debug.log
echo "⏰ Timestamp: $(date)" | tee -a debug.log

# Your command logic here

echo "✅ Task complete" | tee -a debug.log
```

````

### 6.8 パフォーマンス最適化

#### トークン効率
```markdown
# 非効率（全情報を毎回読み込み）
---
description: Create component
---

Load all documentation:
@docs/react.md (5000 tokens)
@docs/typescript.md (3000 tokens)
@docs/testing.md (4000 tokens)

# 効率的（必要な情報のみ）
---
description: Create component
---

## Step 1: Component Structure
Reference: @docs/react-components.md (500 tokens)

## Step 2: TypeScript Types  
Reference: @docs/typescript-interfaces.md (300 tokens)

## Step 3: Tests
Reference: @docs/testing-basics.md (400 tokens)

Total: 1,200 tokens vs 12,000 tokens
````

#### 実行速度

````markdown
# 遅い（逐次実行）
Run test suite... (60s)
Wait for completion
Run lint... (20s)
Wait for completion
Run build... (40s)
Total: 120s

# 速い（並列実行）
```bash
npm test &
npm run lint &
npm run build &
wait
````

Total: 60s (最長タスクの時間)

````

---

## 7. 実践的なコマンドライブラリ

### 7.1 Git ワークフロー

```markdown
# .claude/commands/git/commit.md
---
description: Create conventional commit and push
allowed-tools: Bash(git*)
---

# Git Commit & Push

Message: $ARGUMENTS

1. Stage: `git add -A`
2. Commit: `git commit -m "$ARGUMENTS"`
3. Push: `git push`
````

### 7.2 テストワークフロー

```markdown
# .claude/commands/test/full.md
---
description: Run complete test suite with coverage
allowed-tools: Bash(npm*), Bash(jest*)
---

# Full Test Suite

1. Unit tests: `npm test`
2. Integration: `npm run test:integration`
3. Coverage: `npm run test:coverage`
4. Report generation
```

### 7.3 デプロイワークフロー

```markdown
# .claude/commands/deploy/production.md
---
description: Deploy to production with full checks
disable-model-invocation: true  # 安全のため手動のみ
---

# Production Deployment

⚠️ PRODUCTION DEPLOYMENT ⚠️

1. Confirmation required
2. Full test suite
3. Build production bundle
4. Deploy to AWS
5. Health check
6. Rollback on failure
```

---

このガイドは、Claude Code Slash Commands の公式ドキュメント、コミュニティのベストプラクティス、実践的な使用例から抽出した包括的な情報を基に作成されています。