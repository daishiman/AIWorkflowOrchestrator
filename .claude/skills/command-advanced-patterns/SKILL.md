---
name: command-advanced-patterns
description: |
  高度な実装パターンを専門とするスキル。
  パイプラインパターン（複数コマンド連鎖）、メタコマンドパターン（コマンド自身の管理）、
  インタラクティブパターン（ユーザー確認統合）の設計と実装を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-advanced-patterns/resources/pipeline-pattern-guide.md`: パイプラインパターン詳細ガイド
  - `.claude/skills/command-advanced-patterns/resources/interactive-pattern-guide.md`: インタラクティブパターン詳細ガイド
  - `.claude/skills/command-advanced-patterns/resources/meta-command-pattern-guide.md`: メタコマンドパターン詳細ガイド
  - `.claude/skills/command-advanced-patterns/templates/pipeline-template.md`: パイプラインコマンドテンプレート
  - `.claude/skills/command-advanced-patterns/templates/interactive-template.md`: インタラクティブコマンドテンプレート
  - `.claude/skills/command-advanced-patterns/templates/meta-command-template.md`: メタコマンドテンプレート
  - `.claude/skills/command-advanced-patterns/scripts/validate-advanced.mjs`: 高度パターン検証スクリプト

  使用タイミング:
  - 複数コマンドを連鎖させたい時
  - コマンドを管理するメタコマンドを作成する時
  - ユーザー確認を統合したインタラクティブなコマンドを作成する時

  Use proactively when chaining multiple commands, creating meta-commands,
  or building interactive commands with user confirmation.
version: 1.0.0
---

# Command Advanced Patterns

## 概要

このスキルは、Claude Codeコマンドの高度な実装パターンを提供します。
パイプラインパターン、メタコマンドパターン、インタラクティブパターンにより、
複雑なワークフローや自動化を実現できます。

**主要な価値**:

- 複数コマンドの効率的な連鎖
- コマンド管理の自動化
- ユーザーインタラクションの統合
- 高度なワークフローの実装

**対象ユーザー**:

- コマンドを作成するエージェント（@command-arch）
- 複雑なワークフローを自動化したい開発者
- 高度なコマンドパターンを学びたいチーム

## リソース構造

```
command-advanced-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── pipeline-pattern-guide.md              # パイプラインパターン詳細
│   ├── meta-command-pattern-guide.md          # メタコマンドパターン詳細
│   └── interactive-pattern-guide.md           # インタラクティブパターン詳細
└── templates/
    ├── pipeline-template.md                   # パイプラインテンプレート
    ├── meta-command-template.md               # メタコマンドテンプレート
    └── interactive-template.md                # インタラクティブテンプレート
```

### リソース種別

- **パターンガイド** (`resources/*-guide.md`): 各パターンの詳細仕様と実例
- **テンプレート** (`templates/`): パターン別のテンプレート

## いつ使うか

### シナリオ1: 複数コマンド連鎖

**状況**: 複数のコマンドを順番に実行したい

**適用条件**:

- [ ] 複数ステップのワークフローがある
- [ ] 各ステップが独立したコマンドになっている
- [ ] ステップ間の依存関係がある

**期待される成果**: パイプラインコマンド

### シナリオ2: コマンド管理の自動化

**状況**: コマンド自身を管理するコマンドを作成したい

**適用条件**:

- [ ] コマンドの一覧表示が必要
- [ ] コマンドの検索機能が必要
- [ ] コマンドのメタデータ管理が必要

**期待される成果**: メタコマンド

### シナリオ3: ユーザー確認の統合

**状況**: 危険な操作の前にユーザー確認を求めたい

**適用条件**:

- [ ] 破壊的な操作を行う
- [ ] ユーザーの明示的な承認が必要
- [ ] 条件付き実行が必要

**期待される成果**: インタラクティブコマンド

## パターン1: パイプラインパターン

### 概要

複数のコマンドを連鎖させ、統一されたワークフローを実現するパターン。

### 用途

- フル機能開発パイプライン
- CI/CDパイプライン
- 複雑なワークフローの自動化

### 実装例

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

## Summary

Provide summary of all phases:

- Planning results
- Implementation changes
- Test results
- Review feedback
- Deployment status
```

### エラーハンドリング

```markdown
## Error Handling

If any phase fails:

1. Stop the pipeline
2. Show which phase failed
3. Show error details
4. Suggest remediation steps
5. Offer rollback if applicable

Example:
```

❌ Pipeline failed at Phase 3: Testing

Error: 5 tests failed

- test/auth.test.js: 3 failures
- test/api.test.js: 2 failures

Suggested actions:

1. Fix failing tests
2. Re-run pipeline: /feature-pipeline $ARGUMENTS

Rollback available:

- /rollback-feature $ARGUMENTS

```

```

## パターン2: メタコマンドパターン

### 概要

コマンド自身を管理・操作するコマンドのパターン。

### 用途

- コマンド一覧表示
- コマンド検索
- コマンド実行履歴管理

### 実装例1: コマンド一覧

````markdown
---
description: List all available commands with descriptions
---

# Command List

## Step 1: Scan Commands

List all command files:

```bash
find .claude/commands -name "*.md" -type f
find ~/.claude/commands -name "*.md" -type f 2>/dev/null
```
````

## Step 2: Extract Metadata

For each command file:

- Read description from frontmatter
- Extract argument-hint if present
- Note file location

## Step 3: Display

Format as table:

```
| Command | Description | Arguments |
|---------|-------------|-----------|
| /commit | Create git commit | [message] |
| /test   | Run tests | [pattern] |
...
```

Group by namespace:

- project:\* - Project commands
- user:\* - User commands

````

### 実装例2: コマンド検索

```markdown
---
description: Search commands by keyword
---

# Command Search

Search keyword: $ARGUMENTS

## Step 1: Search
Search in command descriptions:
```bash
grep -r "description:" .claude/commands --include="*.md" | \
grep -i "$ARGUMENTS"
````

## Step 2: Rank Results

Rank by relevance:

- Exact match in description: High
- Partial match in description: Medium
- Match in command name: Low

## Step 3: Display

Show ranked results with usage examples

````

### 実装例3: コマンド履歴

```markdown
---
description: Show command execution history
---

# Command History

## Step 1: Load History
Read command execution log (if available)

## Step 2: Format Display
Show recent commands:
````

Recent Commands:

1. /commit "feat: add login" (2 mins ago)
2. /test unit (5 mins ago)
3. /deploy staging (10 mins ago)

```

## Step 3: Quick Re-run
Offer to re-run recent commands:
"Re-run a command? Enter number or 'n' to cancel:"
```

## パターン3: インタラクティブパターン

### 概要

ユーザーとの対話を統合し、動的に実行内容を決定するパターン。

### 用途

- 危険な操作の確認
- 動的な選択肢の提供
- ウィザード形式のワークフロー

### 実装例1: 確認付きデプロイ

````markdown
---
description: Interactive database migration
disable-model-invocation: true
---

# Database Migration

Migration file: $ARGUMENTS

## Step 1: Preview Changes

Show the migration SQL:

```bash
cat migrations/$ARGUMENTS
```
````

Display:

- Number of tables affected
- Number of rows affected (estimate)
- Potential data loss warnings

## Step 2: Dry Run

Execute in transaction (rollback):

```sql
BEGIN;
\i migrations/$ARGUMENTS
ROLLBACK;
```

Show dry run results:

- Changes that would be applied
- No errors detected

## Step 3: User Confirmation

⚠️ **This will modify the production database.**

Ask user: "Proceed with migration? (yes/no)"

If "yes":
→ Proceed to Step 4
If "no":
→ Cancel migration
Else:
→ Ask again

## Step 4: Execute (if confirmed)

```sql
BEGIN;
\i migrations/$ARGUMENTS
COMMIT;
```

## Step 5: Verification

Verify migration succeeded:

- Check migration status
- Verify expected changes
- Run smoke tests

````

### 実装例2: ウィザード形式

```markdown
---
description: Interactive project setup wizard
---

# Project Setup Wizard

## Step 1: Welcome
Display:
````

🚀 Project Setup Wizard
This wizard will guide you through setting up a new project.

```

## Step 2: Project Type
Ask: "What type of project?"
Options:
1. Web Application (React + TypeScript)
2. API Server (Node.js + Express)
3. Full Stack (Next.js)
4. CLI Tool (TypeScript)

Wait for user selection: $PROJECT_TYPE

## Step 3: Configuration
Based on $PROJECT_TYPE, ask:
- Project name
- Package manager (pnpm/yarn/pnpm)
- Testing framework (Jest/Vitest/None)
- Linter (ESLint/Biome/None)

## Step 4: Confirmation
Show summary:
```

Project Configuration:

- Type: $PROJECT_TYPE
- Name: $PROJECT_NAME
- Package Manager: $PKG_MANAGER
- Testing: $TEST_FRAMEWORK
- Linter: $LINTER

Proceed? (yes/no)

```

## Step 5: Execute Setup
If confirmed:
1. Create project structure
2. Install dependencies
3. Configure tools
4. Create initial files
5. Initialize git

## Step 6: Next Steps
Display next steps:
```

✅ Project setup complete!

Next steps:

1. cd $PROJECT_NAME
2. $PKG_MANAGER run dev

Commands available:

- /dev - Start development server
- /test - Run tests
- /build - Build for production

```

```

## パターンの組み合わせ

### パイプライン + インタラクティブ

```markdown
## Phase 1: Planning

Execute planning phase

## Phase 2: Confirmation

Ask user: "Review plan and proceed to implementation? (yes/no)"

If "no":

- Ask: "What changes are needed?"
- Update plan
- Ask for confirmation again

## Phase 3: Implementation

If confirmed, proceed with implementation pipeline
```

### メタコマンド + パイプライン

```markdown
## Step 1: Analyze Workflow

Detect which commands should be chained

## Step 2: Suggest Pipeline

Show suggested pipeline:
```

Detected workflow:

1. /test
2. /lint
3. /build
4. /deploy

Create pipeline command? (yes/no)

```

## Step 3: Generate Pipeline
If confirmed, create new pipeline command file
```

## 詳細リソースの参照

### パイプラインパターン詳細

詳細は `resources/pipeline-pattern-guide.md` を参照

### メタコマンドパターン詳細

詳細は `resources/meta-command-pattern-guide.md` を参照

### インタラクティブパターン詳細

詳細は `resources/interactive-pattern-guide.md` を参照

### テンプレート

- パイプライン: `templates/pipeline-template.md`
- メタコマンド: `templates/meta-command-template.md`
- インタラクティブ: `templates/interactive-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# パイプラインパターン詳細
cat .claude/skills/command-advanced-patterns/resources/pipeline-pattern-guide.md

# メタコマンドパターン詳細
cat .claude/skills/command-advanced-patterns/resources/meta-command-pattern-guide.md

# インタラクティブパターン詳細
cat .claude/skills/command-advanced-patterns/resources/interactive-pattern-guide.md
```

### テンプレート参照

```bash
# パイプラインテンプレート
cat .claude/skills/command-advanced-patterns/templates/pipeline-template.md

# メタコマンドテンプレート
cat .claude/skills/command-advanced-patterns/templates/meta-command-template.md

# インタラクティブテンプレート
cat .claude/skills/command-advanced-patterns/templates/interactive-template.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-advanced-patterns/resources/pipeline-pattern-guide.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-advanced-patterns/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-advanced-patterns
```

## 関連スキル

- `.claude/skills/command-basic-patterns/SKILL.md` - 基本パターンの理解
- `.claude/skills/command-error-handling/SKILL.md` - パイプラインでのエラーハンドリング
- `.claude/skills/command-security-design/SKILL.md` - インタラクティブコマンドのセキュリティ

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
