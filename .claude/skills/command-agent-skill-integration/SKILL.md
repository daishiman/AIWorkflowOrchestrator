---
name: command-agent-skill-integration
description: |
  コマンド、エージェント、スキルの統合を専門とするスキル。
  三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、
  複合ワークフローの設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-agent-skill-integration/resources/trinity-architecture.md`: コマンド・エージェント・スキル三位一体アーキテクチャ
  - `.claude/skills/command-agent-skill-integration/resources/command-to-agent-patterns.md`: コマンドからエージェント呼び出しパターン
  - `.claude/skills/command-agent-skill-integration/resources/command-to-skill-patterns.md`: コマンドからスキル参照パターン
  - `.claude/skills/command-agent-skill-integration/resources/composite-workflows.md`: 複合ワークフロー設計
  - `.claude/skills/command-agent-skill-integration/templates/agent-invocation-template.md`: エージェント起動テンプレート
  - `.claude/skills/command-agent-skill-integration/templates/skill-reference-template.md`: スキル参照テンプレート
  - `.claude/skills/command-agent-skill-integration/templates/composite-workflow-template.md`: 複合ワークフローテンプレート
  - `.claude/skills/command-agent-skill-integration/scripts/validate-integration.mjs`: エージェント参照・スキル参照・連携パターンの正確性検証とTrinity Architectureの統合チェック

  使用タイミング:
  - コマンドからエージェントを起動したい時
  - コマンド内でスキルを参照したい時
  - Command-Agent-Skillの協調ワークフローを設計する時

  Use proactively when integrating commands with agents and skills,
  designing collaborative workflows, or implementing the trinity architecture.
version: 1.0.0
---

# Command-Agent-Skill Integration

## 概要

このスキルは、Claude Codeの三位一体アーキテクチャ（Command-Agent-Skill）を提供します。
コマンド、エージェント、スキルの統合により、強力で柔軟な自動化ワークフローを実現できます。

**主要な価値**:
- 三位一体の概念の完全理解
- コマンド→エージェント起動の実装
- コマンド→スキル参照の実装
- 複合ワークフローの設計

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- エージェント・スキルを統合したい開発者
- 高度なワークフローを設計したいチーム

## リソース構造

```
command-agent-skill-integration/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── trinity-architecture.md                # 三位一体アーキテクチャ詳細
│   ├── command-to-agent-patterns.md           # コマンド→エージェントパターン
│   ├── command-to-skill-patterns.md           # コマンド→スキルパターン
│   └── composite-workflows.md                 # 複合ワークフロー設計
└── templates/
    ├── agent-invocation-template.md           # エージェント起動テンプレート
    ├── skill-reference-template.md            # スキル参照テンプレート
    └── composite-workflow-template.md         # 複合ワークフローテンプレート
```

### リソース種別

- **アーキテクチャ詳細** (`resources/trinity-architecture.md`): 三位一体の概念と設計原則
- **統合パターン** (`resources/*-patterns.md`): 各統合パターンの実装方法
- **複合ワークフロー** (`resources/composite-workflows.md`): 高度なワークフロー設計
- **テンプレート** (`templates/`): 統合パターン別のテンプレート

## いつ使うか

### シナリオ1: エージェント起動
**状況**: コマンドから専門エージェントを起動したい

**適用条件**:
- [ ] 複雑な判断が必要
- [ ] 専門的なタスク実行が必要
- [ ] エージェントの専門知識が必要

**期待される成果**: エージェント起動コマンド

### シナリオ2: スキル参照
**状況**: コマンド内でスキルの知識を活用したい

**適用条件**:
- [ ] ドメイン知識が必要
- [ ] ベストプラクティスの適用が必要
- [ ] 段階的な知識提供が必要

**期待される成果**: スキル参照コマンド

### シナリオ3: 複合ワークフロー
**状況**: コマンド、エージェント、スキルを組み合わせたワークフローを設計したい

**適用条件**:
- [ ] 複数の専門領域が関与
- [ ] 段階的な処理が必要
- [ ] 協調的なタスク実行が必要

**期待される成果**: 複合ワークフローコマンド

## 三位一体の概念

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│           三位一体アーキテクチャ（Trinity）                    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐          ┌──▼───┐          ┌───▼────┐
    │COMMAND │          │AGENT │          │ SKILL  │
    │コマンド │          │エージェント│          │スキル │
    └────────┘          └──────┘          └────────┘
        │                   │                   │
   ワークフロー           タスク実行           知識提供
   自動化                判断と協調            段階的開示
   ユーザー起動          専門性                自動起動
```

### 各要素の役割

#### Command（コマンド）
- **役割**: ワークフロー定義と自動化
- **起動**: ユーザー明示（`/cmd`）または SlashCommand Tool
- **強み**: 繰り返し可能、決定論的、パラメータ化
- **制約**: 静的な指示のみ、動的判断は不可

#### Agent（エージェント）
- **役割**: タスク実行と判断
- **起動**: 明示的メンション（`@agent`）またはCLAUDE.mdのルール
- **強み**: 専門知識、複雑な判断、ツール協調
- **制約**: コンテキスト独立、並列実行は不可

#### Skill（スキル）
- **役割**: 手続き的知識提供
- **起動**: モデル判断（自動）
- **強み**: Progressive Disclosure、大量の参照情報
- **制約**: 実行は行わない、知識提供のみ

### 統合の価値

**単独使用**:
- Command: シンプルなワークフローには十分
- Agent: 複雑なタスクには有効だが、繰り返しが面倒
- Skill: 知識は提供できるが、実行はできない

**統合使用**:
- Command + Agent: ワークフローの自動化 + 専門的判断
- Command + Skill: ワークフローの自動化 + ドメイン知識
- Agent + Skill: 専門的判断 + ドメイン知識
- **Command + Agent + Skill**: 最強の組み合わせ

## パターン1: コマンド → エージェント起動

### 基本パターン

```markdown
---
description: Run comprehensive code review
---

# Code Review

Target: $ARGUMENTS (default: current changes)

## Step 1: Prepare Context
Gather information:
- Changed files
- Commit messages
- Related issues

## Step 2: Invoke Expert Agent
Call `@code-reviewer` with:
- File list
- Context information
- Review criteria

Wait for @code-reviewer to complete analysis.

## Step 3: Process Results
Based on @code-reviewer feedback:
- Categorize issues (critical/major/minor)
- Generate action items
- Create review summary

## Step 4: Output
Display:
- Review summary
- Issues found (by severity)
- Suggested fixes
- Approval/rejection decision
```

### 複数エージェント協調

```markdown
---
description: Full feature quality check
---

# Feature Quality Check

Feature: $ARGUMENTS

## Phase 1: Code Quality (@code-reviewer)
Invoke `@code-reviewer` to analyze:
- Code style and consistency
- Best practices adherence
- Potential bugs

## Phase 2: Security Analysis (@security-auditor)
Invoke `@security-auditor` to check:
- Security vulnerabilities
- Sensitive data exposure
- Authentication/authorization issues

## Phase 3: Performance Review (@performance-analyzer)
Invoke `@performance-analyzer` to evaluate:
- Performance bottlenecks
- Resource usage
- Scalability concerns

## Phase 4: Synthesis
Combine all agent feedback:
- Overall quality score
- Critical issues (block merge)
- Recommendations
- Approval decision
```

## パターン2: コマンド → スキル参照

### 基本パターン

```markdown
---
description: Create component following best practices
---

# Component Creation

Component name: $ARGUMENTS

## Step 1: Load Best Practices
Reference skill for component design patterns:
- @.claude/skills/react-component-patterns/SKILL.md

The skill provides:
- Component structure guidelines
- Naming conventions
- Props design patterns
- State management recommendations

## Step 2: Generate Component
Based on skill guidance, create:
- Component file with TypeScript
- Props interface
- Proper hooks usage
- JSDoc comments

## Step 3: Generate Tests
Reference testing skill:
- @.claude/skills/testing-patterns/SKILL.md

Create tests following:
- Test structure patterns
- Coverage requirements
- Assertion best practices

## Step 4: Verify
Check against skill criteria:
- Structure compliance
- Naming conventions
- Test coverage
```

### 動的スキル選択

```markdown
---
description: Implement feature with appropriate patterns
---

# Feature Implementation

Feature type: $ARGUMENTS

## Step 1: Determine Pattern
Based on $ARGUMENTS, select appropriate skill:
- If "authentication" → @.claude/skills/auth-patterns/SKILL.md
- If "api" → @.claude/skills/api-design-patterns/SKILL.md
- If "ui" → @.claude/skills/ui-component-patterns/SKILL.md
- If "database" → @.claude/skills/database-patterns/SKILL.md

## Step 2: Load Selected Skill
Reference the appropriate skill for:
- Design patterns
- Implementation guidelines
- Security considerations
- Testing requirements

## Step 3: Implement
Follow skill guidance to implement feature

## Step 4: Validate
Verify implementation against skill criteria
```

## パターン3: 複合ワークフロー

### Command + Agent + Skill

```markdown
---
description: Complete feature development workflow
---

# Feature Development Workflow

Feature: $ARGUMENTS

## Phase 1: Planning (Command + Skill)
Reference planning skill:
- @.claude/skills/feature-planning/SKILL.md

Based on skill guidance:
1. Define requirements
2. Identify dependencies
3. Create task breakdown
4. Estimate complexity

## Phase 2: Design (Agent + Skill)
Invoke `@architect` to create design:
- Reference design patterns skill
- Create architecture diagram
- Define interfaces
- Plan data flow

## Phase 3: Implementation (Command + Agent + Skill)
Invoke `@developer` with:
- Planning results from Phase 1
- Design from Phase 2
- Implementation patterns skill reference

@developer will:
- Write code following patterns
- Apply best practices
- Create tests

## Phase 4: Review (Command + Agent + Skill)
Invoke `@code-reviewer` to review:
- Code quality
- Pattern adherence
- Test coverage

Reference review skill for criteria:
- @.claude/skills/code-review-checklist/SKILL.md

## Phase 5: Deployment (Command + Agent)
If review passes:
Invoke `@deployer` to deploy:
- Run pre-deployment checks
- Execute deployment
- Verify deployment

## Summary
Provide complete workflow summary:
- Planning decisions
- Design choices
- Implementation details
- Review results
- Deployment status
```

### エージェント間通信

```markdown
## Phase 1: Analysis (@analyzer)
Invoke `@analyzer` to analyze codebase

## Phase 2: Planning (@planner)
Invoke `@planner` with @analyzer results:
- Pass analysis findings
- Request refactoring plan

## Phase 3: Execution (@executor)
Invoke `@executor` with @planner results:
- Pass refactoring plan
- Execute changes

## Phase 4: Verification (@verifier)
Invoke `@verifier` to verify:
- Original @analyzer issues resolved
- @planner plan executed correctly
- No new issues introduced
```

## 設計原則

### 1. 明確な責任分離
```
✓ 良い設計:
Command: ワークフロー定義
Agent: 複雑な判断と実行
Skill: ドメイン知識提供

✗ 悪い設計:
Command: 全てを実行しようとする
Agent: ワークフロー管理も行う
Skill: 実行ロジックを含む
```

### 2. 適切な統合レベル
```
✓ 良い設計:
- Command が Agent を起動
- Agent が Skill を参照
- Skill が知識を提供

✗ 悪い設計:
- Skill が Agent を起動（逆転）
- Command が Skill の内部に依存
```

### 3. 疎結合の維持
```
✓ 良い設計:
- Command は Agent の内部実装を知らない
- Agent は Skill の存在を知らない（自動起動）
- Skill は独立して更新可能

✗ 悪い設計:
- Command が Agent の内部に依存
- Agent が Skill の存在を前提
```

## 実装ガイドライン

### コマンドからエージェントを起動
```markdown
## Invoke Agent
Call `@agent-name` with context:
- Parameter 1
- Parameter 2

Wait for completion.

Process @agent-name results:
- Action based on results
```

### コマンドからスキルを参照
```markdown
## Reference Skill
Load best practices:
- @.claude/skills/skill-name/SKILL.md

Apply skill guidance:
- Implementation step 1
- Implementation step 2
```

### エージェントからスキルを参照
```markdown
# Agent Definition

## 専門知識の基盤

### 参照スキル

このエージェントは以下のスキルに依存します:

| スキル名 | パス | 使用タイミング |
|---------|------|--------------|
| **skill-1** | `.claude/skills/skill-1/SKILL.md` | Phase 1で参照 |
| **skill-2** | `.claude/skills/skill-2/SKILL.md` | Phase 2で参照 |
```

## 詳細リソースの参照

### 三位一体アーキテクチャ
詳細は `resources/trinity-architecture.md` を参照

### コマンド→エージェントパターン
詳細は `resources/command-to-agent-patterns.md` を参照

### コマンド→スキルパターン
詳細は `resources/command-to-skill-patterns.md` を参照

### 複合ワークフロー設計
詳細は `resources/composite-workflows.md` を参照

### テンプレート
- エージェント起動: `templates/agent-invocation-template.md`
- スキル参照: `templates/skill-reference-template.md`
- 複合ワークフロー: `templates/composite-workflow-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 三位一体アーキテクチャ詳細
cat .claude/skills/command-agent-skill-integration/resources/trinity-architecture.md

# コマンド→エージェントパターン
cat .claude/skills/command-agent-skill-integration/resources/command-to-agent-patterns.md

# コマンド→スキルパターン
cat .claude/skills/command-agent-skill-integration/resources/command-to-skill-patterns.md

# 複合ワークフロー設計
cat .claude/skills/command-agent-skill-integration/resources/composite-workflows.md
```

### テンプレート参照

```bash
# エージェント起動テンプレート
cat .claude/skills/command-agent-skill-integration/templates/agent-invocation-template.md

# スキル参照テンプレート
cat .claude/skills/command-agent-skill-integration/templates/skill-reference-template.md

# 複合ワークフローテンプレート
cat .claude/skills/command-agent-skill-integration/templates/composite-workflow-template.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-agent-skill-integration/resources/trinity-architecture.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-agent-skill-integration/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-agent-skill-integration
```

## 関連スキル

- `.claude/skills/command-advanced-patterns/SKILL.md` - パイプラインパターンとの組み合わせ
- `.claude/skills/command-basic-patterns/SKILL.md` - 基本パターンの理解

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
