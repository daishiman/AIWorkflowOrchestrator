# Agent Invocation Template

このテンプレートは、スラッシュコマンドからエージェントを起動する標準パターンを提供します。

## 基本テンプレート

```markdown
---
description: [Task that requires expert agent]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Prepare Context

Gather information needed for agent:

- [Context item 1]
- [Context item 2]
- [Context item 3]

## Step 2: Invoke Expert Agent

Call `@agent-name` with:

- Context: [prepared context]
- Task: [specific task description]
- Constraints: [any constraints or requirements]

Wait for @agent-name to complete [task type].

## Step 3: Process Results

Based on @agent-name feedback:

- [Result processing step 1]
- [Result processing step 2]
- [Result processing step 3]

## Step 4: Output

Display:

- [Output item 1]
- [Output item 2]
- [Final decision/recommendation]
```

## 使用例: コードレビューコマンド

```markdown
---
description: Automated code review with expert analysis
---

# Code Review

Files: $ARGUMENTS (default: changed files)

## Step 1: Prepare Context

Gather information for review:

- List changed files: `git diff --name-only`
- Get commit messages: `git log -5 --oneline`
- Identify related PRs/issues

## Step 2: Invoke Expert Agent

Call `@code-reviewer` with:

- Files: [list from Step 1]
- Context: Recent commits and related issues
- Constraints: Focus on security and performance

Wait for @code-reviewer to complete comprehensive analysis.

## Step 3: Process Results

Based on @code-reviewer feedback:

- Categorize issues by severity (critical/major/minor)
- Extract actionable recommendations
- Identify blocking issues
- Generate fix suggestions

## Step 4: Output

Display review summary:

- Executive summary
- Issues by severity
- Recommendations with code examples
- Approval decision
```

## 複数エージェント協調テンプレート

```markdown
---
description: [Multi-agent collaborative task]
---

# [Command Name]

Target: $ARGUMENTS

## Phase 1: [Specialization A] (@agent-a)

Invoke `@agent-a` to analyze:

- [Agent A task 1]
- [Agent A task 2]

Capture: agent_a_results

## Phase 2: [Specialization B] (@agent-b)

Invoke `@agent-b` with agent_a_results:

- Input: Findings from @agent-a
- Task: [Agent B specific task]

Capture: agent_b_results

## Phase 3: [Specialization C] (@agent-c)

Invoke `@agent-c` to synthesize:

- Input: Results from @agent-a and @agent-b
- Task: [Integration task]

Capture: final_results

## Phase 4: Summary

Combine all agent feedback:

- [Synthesis step 1]
- [Synthesis step 2]
- [Final deliverable]
```

## 使用例: 機能品質チェック

```markdown
---
description: Comprehensive quality validation with multiple specialists
---

# Feature Quality Check

Feature: $ARGUMENTS

## Phase 1: Code Quality (@code-reviewer)

Invoke `@code-reviewer` to analyze:

- Code style and consistency
- Best practices adherence
- Potential bugs

Capture: code_quality_report

## Phase 2: Security Audit (@security-auditor)

Invoke `@security-auditor` with code_quality_report:

- Input: Code locations from @code-reviewer
- Task: Security vulnerability assessment
- Focus: OWASP Top 10

Capture: security_report

## Phase 3: Performance Analysis (@performance-analyzer)

Invoke `@performance-analyzer` to evaluate:

- Input: Implementation details
- Task: Performance bottleneck identification
- Constraints: Response time < 200ms

Capture: performance_report

## Phase 4: Summary

Generate comprehensive quality report:

- Overall quality score (weighted average)
- Critical issues (blocking)
- Recommendations by category
- Approval decision with justification
```

## 条件付きエージェント起動テンプレート

```markdown
---
description: [Context-dependent agent selection]
---

# [Command Name]

Issue: $ARGUMENTS

## Step 1: Context Analysis

Analyze issue to determine required expertise:

- Extract issue type/domain
- Identify affected components
- Assess complexity level

## Step 2: Agent Selection

Route to appropriate specialist:

If [condition A]:
Call `@specialist-a` for [specific expertise]

Else if [condition B]:
Call `@specialist-b` for [specific expertise]

Else if [condition C]:
Call `@specialist-c` for [specific expertise]

Else:
Call `@generalist` for general analysis

## Step 3: Process Specialist Results

Handle agent-specific output:

- [Common processing steps]
- [Agent-specific handling]

## Step 4: Apply Solution

Based on specialist recommendation:

- [Implementation steps]
- [Verification steps]
```

## 使用例: スマートデバッグ

```markdown
---
description: Intelligent debugging with appropriate specialist routing
---

# Smart Debug

Error: $ARGUMENTS

## Step 1: Error Classification

Analyze error message and stack trace:

- Extract error type (TypeError, ReferenceError, etc.)
- Identify affected layer (frontend/backend/database)
- Determine error domain

## Step 2: Specialist Selection

Route to appropriate specialist:

If error domain is "frontend":
If "React" in stack trace:
Call `@react-specialist` for React-specific debugging
Else if "CSS" or "styling" in error:
Call `@ui-designer` for styling issues
Else:
Call `@frontend-architect` for general frontend debugging

Else if error domain is "backend":
If "database" or "SQL" in error:
Call `@dba-mgr` for database debugging
Else if "auth" in error:
Call `@auth-specialist` for authentication issues
Else:
Call `@backend-architect` for general backend debugging

Else if error domain is "performance":
Call `@performance-engineer` for performance analysis

Else:
Call `@root-cause-analyst` for general debugging

## Step 3: Process Specialist Analysis

Extract from specialist report:

- Root cause identification
- Recommended fix
- Prevention strategies

## Step 4: Apply Solution

Implement specialist recommendation:

- Apply code fix
- Add tests to prevent regression
- Update documentation
- Verify solution resolves error
```

## エージェントパイプラインテンプレート

```markdown
---
description: [Multi-stage processing with agents]
---

# [Pipeline Name]

Input: $ARGUMENTS

## Stage 1: [Stage A] (@agent-a)

Invoke `@agent-a` to process:

- Input: $ARGUMENTS
- Task: [Stage A task]
- Output: stage_a_result

## Stage 2: [Stage B] (@agent-b)

Invoke `@agent-b` to transform:

- Input: stage_a_result
- Task: [Stage B task]
- Output: stage_b_result

## Stage 3: [Stage C] (@agent-c)

Invoke `@agent-c` to enrich:

- Input: stage_b_result
- Task: [Stage C task]
- Output: stage_c_result

## Stage 4: [Stage D] (@agent-d)

Invoke `@agent-d` to validate:

- Input: stage_c_result
- Task: [Validation task]
- Output: final_result

## Summary

Pipeline execution report:

- Stages completed: [4/4]
- Processing time: [duration]
- Final output: [description]
```

## チェックリスト

コマンドにエージェント起動を追加する際の確認項目：

### エージェント選択

- [ ] エージェントの専門性がタスクに合致している
- [ ] エージェントが必要なツールアクセスを持っている
- [ ] エージェントのスコープが明確

### コンテキスト準備

- [ ] エージェントに必要な情報を特定した
- [ ] コンテキストを構造化して渡す方法を定義した
- [ ] 不要な情報を除外した（効率化）

### 起動構文

- [ ] バッククォート付きメンションを使用: `@agent-name`
- [ ] 明示的な"Call"または"Invoke"を使用
- [ ] タスクの説明が明確

### 結果処理

- [ ] エージェント出力の処理方法を定義した
- [ ] 結果の検証ステップを含めた
- [ ] 次のステップへの引き継ぎを明確にした

### エラーハンドリング

- [ ] エージェント失敗時の処理を定義した
- [ ] タイムアウト処理を考慮した
- [ ] フォールバック戦略を用意した

## ベストプラクティス

1. **明確な起動**: `Call \`@agent-name\` with:` の形式を使用
2. **構造化コンテキスト**: 箇条書きで必要情報を整理
3. **待機の明示**: "Wait for completion" を記述
4. **結果の明示的処理**: "Based on @agent-name feedback:" で処理開始
5. **キャプチャの活用**: `Capture: result_name` で成果物を記録

## よくある間違い

❌ **悪い例**:

```markdown
Use @code-reviewer somehow to review
```

✅ **良い例**:

```markdown
Call `@code-reviewer` with:

- Files: [changed files list]
- Focus: security, performance

Wait for review completion.
```

❌ **悪い例**:

```markdown
@agent-name does the work (hope it succeeds)
```

✅ **良い例**:

```markdown
Invoke `@agent-name` to analyze:

- [Task details]

If @agent-name fails:

- Log error
- Apply fallback analysis
- Notify user of degraded mode
```

## 関連リソース

- `command-to-agent-patterns.md`: 詳細なパターン説明
- `trinity-architecture.md`: アーキテクチャ全体像
- `composite-workflows.md`: 完全統合ワークフロー例
