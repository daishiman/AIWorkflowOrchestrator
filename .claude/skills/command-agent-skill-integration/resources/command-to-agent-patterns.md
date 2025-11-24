# Command → Agent統合パターン

## 概要

このドキュメントは、スラッシュコマンドからエージェントを起動する統合パターンを提供します。コマンドによるワークフロー自動化とエージェントの専門的判断を組み合わせることで、繰り返し可能な高度タスク実行を実現します。

## 基本概念

### なぜコマンドからエージェントを起動するのか？

**コマンドの強み**:
- ワークフロー定義と自動化
- 繰り返し可能性
- ユーザーインターフェース

**エージェントの強み**:
- 専門知識
- 複雑な判断
- ツール協調

**統合の価値**:
```
Command（ワークフロー定義）+ Agent（専門的判断）
= 繰り返し可能な高度タスク実行
```

## パターン1: 単一エージェント起動

### 構造

```markdown
---
description: [タスク概要]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Prepare Context
[コンテキスト情報の収集]

## Step 2: Invoke Expert Agent
Call `@agent-name` with:
- [パラメータ1]
- [パラメータ2]
- [パラメータ3]

Wait for @agent-name to complete analysis.

## Step 3: Process Results
Based on @agent-name feedback:
- [結果処理1]
- [結果処理2]
- [結果処理3]

## Step 4: Output
Display:
- [出力1]
- [出力2]
- [出力3]
```

### 実装例: コードレビュー自動化

```markdown
---
description: Run comprehensive code review workflow
---

# Code Review Workflow

Target: $ARGUMENTS (default: current changes)

## Step 1: Prepare Context
Gather information:
- List changed files using `git diff --name-only`
- Extract commit messages from `git log`
- Identify related GitHub issues

## Step 2: Invoke Expert Agent
Call `@code-reviewer` with:
- Changed file list
- Commit context
- Review criteria (security, performance, maintainability)

Wait for @code-reviewer to complete comprehensive analysis.

## Step 3: Process Results
Based on @code-reviewer feedback:
- Categorize issues by severity:
  - Critical: Security vulnerabilities, breaking changes
  - Major: Performance issues, design problems
  - Minor: Style issues, documentation gaps
- Generate action items for each issue
- Prioritize fixes based on impact

## Step 4: Output
Display formatted review summary:
- Executive summary
- Issues found (grouped by severity)
- Detailed recommendations
- Suggested fixes with code examples
- Approval/rejection decision with reasoning
```

### 使用シナリオ

**適用条件**:
- [ ] 専門的な判断が必要
- [ ] 複雑な分析タスク
- [ ] コンテキストに応じた適応が必要
- [ ] ツールの協調的使用が必要

**期待される成果**:
- 一貫性のある高品質な分析
- 専門知識に基づく判断
- 繰り返し可能なワークフロー

## パターン2: 複数エージェント協調

### 構造

```markdown
---
description: [Multi-phase task with specialized agents]
---

# [Command Name]

Target: $ARGUMENTS

## Phase 1: [First Specialization] (@agent-1)
Invoke `@agent-1` to:
- [タスク1]
- [タスク2]

## Phase 2: [Second Specialization] (@agent-2)
Invoke `@agent-2` with @agent-1 results:
- Pass: [agent-1の結果]
- Request: [具体的タスク]

## Phase 3: [Third Specialization] (@agent-3)
Invoke `@agent-3` to:
- Process @agent-1 and @agent-2 results
- [最終タスク]

## Phase 4: Synthesis
Combine all agent feedback:
- [統合処理]
```

### 実装例: 機能品質チェック

```markdown
---
description: Comprehensive feature quality validation
---

# Feature Quality Check

Feature: $ARGUMENTS

## Phase 1: Code Quality (@code-reviewer)
Invoke `@code-reviewer` to analyze:
- Code style and consistency
- Best practices adherence
- Potential bugs and code smells
- Test coverage adequacy

Wait for completion and capture findings.

## Phase 2: Security Analysis (@security-auditor)
Invoke `@security-auditor` to check:
- Security vulnerabilities (OWASP Top 10)
- Sensitive data exposure
- Authentication/authorization issues
- Injection vulnerabilities
- Cryptographic weaknesses

Pass code-reviewer findings for context.

## Phase 3: Performance Review (@performance-analyzer)
Invoke `@performance-analyzer` to evaluate:
- Performance bottlenecks
- Resource usage (CPU, memory, I/O)
- Scalability concerns
- Database query optimization
- Caching opportunities

Consider security constraints from Phase 2.

## Phase 4: Synthesis
Combine all agent feedback:
1. Calculate overall quality score:
   - Code Quality: 40%
   - Security: 35%
   - Performance: 25%

2. Identify critical issues (blocking merge):
   - Security vulnerabilities (severity: critical/high)
   - Performance issues (>2x degradation)
   - Test coverage <80%

3. Generate comprehensive report:
   - Executive summary
   - Detailed findings by category
   - Prioritized recommendations
   - Approval decision with reasoning

4. Create action items:
   - Critical issues (must fix)
   - High-priority improvements
   - Nice-to-have enhancements
```

### エージェント間通信パターン

**シーケンシャル依存**:
```markdown
## Phase 1: Analysis (@analyzer)
Invoke `@analyzer` to analyze codebase
Capture: architecture_analysis

## Phase 2: Planning (@planner)
Invoke `@planner` with analysis results:
- Input: architecture_analysis from @analyzer
- Request: Create refactoring plan

Capture: refactoring_plan

## Phase 3: Execution (@executor)
Invoke `@executor` with plan:
- Input: refactoring_plan from @planner
- Task: Execute planned changes

Capture: execution_results

## Phase 4: Verification (@verifier)
Invoke `@verifier` to verify:
- Original issues from @analyzer resolved
- Plan from @planner executed correctly
- No new issues introduced by @executor
```

**並列実行**:
```markdown
## Phase 1: Parallel Analysis
Launch in parallel:
- `@code-reviewer` for code quality
- `@security-auditor` for security
- `@performance-analyzer` for performance

Wait for all agents to complete.

## Phase 2: Synthesis
Combine results from all three agents:
- Merge findings
- Resolve conflicts
- Generate unified report
```

## パターン3: 条件付きエージェント起動

### 構造

```markdown
---
description: [Conditional agent invocation based on context]
---

# [Command Name]

## Step 1: Context Analysis
Analyze $ARGUMENTS to determine required expertise

## Step 2: Conditional Routing
Based on analysis:
- If condition A → Invoke `@agent-a`
- If condition B → Invoke `@agent-b`
- If condition C → Invoke `@agent-c`

## Step 3: Process Results
Handle agent-specific output
```

### 実装例: スマートデバッグ

```markdown
---
description: Intelligent debugging with appropriate specialist
---

# Smart Debug

Error: $ARGUMENTS

## Step 1: Error Classification
Analyze error message and stack trace:
- Extract error type
- Identify affected component
- Determine error domain

## Step 2: Specialist Selection
Route to appropriate specialist:

If error domain is "frontend":
  - UI rendering issues → `@frontend-architect`
  - React/component issues → `@react-specialist`
  - CSS/styling issues → `@ui-designer`

If error domain is "backend":
  - API errors → `@api-specialist`
  - Database issues → `@dba-mgr`
  - Authentication errors → `@auth-specialist`

If error domain is "performance":
  - Slow queries → `@performance-engineer`
  - Memory leaks → `@system-architect`

If error domain is "security":
  - Vulnerabilities → `@security-engineer`

## Step 3: Invoke Selected Specialist
Call selected agent with:
- Full error context
- Relevant code sections
- System state information

## Step 4: Apply Solution
Based on specialist recommendation:
- Apply fix
- Verify solution
- Document resolution
```

## パターン4: エージェントパイプライン

### 構造

```markdown
---
description: [Multi-stage processing pipeline]
---

# [Command Name]

## Stage 1: Ingestion (@ingestor)
Input processing

## Stage 2: Transformation (@transformer)
Data transformation

## Stage 3: Enrichment (@enricher)
Data enrichment

## Stage 4: Validation (@validator)
Quality assurance

## Stage 5: Output (@publisher)
Result publication
```

### 実装例: データ処理パイプライン

```markdown
---
description: Complete data processing pipeline
---

# Data Processing Pipeline

Source: $ARGUMENTS

## Stage 1: Data Ingestion (@data-ingestor)
Invoke `@data-ingestor` to:
- Read data from source
- Validate data format
- Handle errors gracefully
- Output: raw_data

## Stage 2: Data Cleaning (@data-cleaner)
Invoke `@data-cleaner` with raw_data:
- Remove duplicates
- Handle missing values
- Normalize formats
- Output: clean_data

## Stage 3: Data Transformation (@data-transformer)
Invoke `@data-transformer` with clean_data:
- Apply business logic
- Calculate derived fields
- Aggregate data
- Output: transformed_data

## Stage 4: Data Enrichment (@data-enricher)
Invoke `@data-enricher` with transformed_data:
- Add external data
- Calculate analytics
- Apply ML models
- Output: enriched_data

## Stage 5: Quality Validation (@quality-validator)
Invoke `@quality-validator` with enriched_data:
- Verify data quality
- Check business rules
- Generate quality report
- Output: validated_data, quality_report

## Stage 6: Publication (@data-publisher)
Invoke `@data-publisher` with validated_data:
- Write to destination
- Update metadata
- Trigger downstream processes
- Generate completion report
```

## 実装ガイドライン

### 1. エージェント起動の記述方法

**明確な起動指示**:
```markdown
✓ 良い例:
Call `@agent-name` with context:
- Parameter 1: value
- Parameter 2: value

Wait for completion.

✗ 悪い例:
Use @agent-name somehow
```

### 2. コンテキスト渡し

**構造化されたコンテキスト**:
```markdown
✓ 良い例:
Invoke `@code-reviewer` with:
- Files: [list from git diff]
- Scope: security, performance
- Constraints: Must complete in 5 minutes

✗ 悪い例:
@code-reviewer please review the code
```

### 3. 結果処理

**明示的な結果処理**:
```markdown
✓ 良い例:
Based on @agent-name results:
1. Extract recommendations
2. Prioritize by severity
3. Generate action items
4. Display formatted output

✗ 悪い例:
Do something with the results
```

### 4. エラーハンドリング

**堅牢なエラー処理**:
```markdown
✓ 良い例:
## Step 2: Invoke Agent
Call `@agent-name` with context

If @agent-name fails:
- Log error details
- Retry with reduced scope
- If still fails, provide fallback analysis
- Notify user of degraded mode

✗ 悪い例:
Call @agent-name (hope it works)
```

## ベストプラクティス

### 1. エージェント選択

**適切なエージェント選択**:
- 専門性がタスクに合致している
- スコープが明確に定義されている
- 必要なツールアクセスを持っている

### 2. コンテキスト最適化

**効率的なコンテキスト**:
- 必要な情報のみを渡す
- 構造化されたフォーマット
- 優先度を明示

### 3. タイムアウト管理

**適切なタイムアウト**:
```markdown
## Step 2: Invoke Agent (max 5 minutes)
Call `@long-running-agent`

If timeout:
- Provide partial results
- Suggest manual intervention
- Log incomplete analysis
```

### 4. 結果検証

**品質保証**:
```markdown
## Step 3: Verify Results
Validate @agent-name output:
- Check completeness
- Verify format
- Ensure actionability

If validation fails:
- Request clarification from agent
- Apply fallback logic
```

## トラブルシューティング

### 問題: エージェントが起動しない

**症状**: コマンド実行時にエージェントが呼び出されない

**原因**:
- `@agent-name`の記法が正しくない
- エージェントが存在しない
- メンション構文エラー

**解決策**:
```markdown
✓ 正しい記法:
Call `@code-reviewer` with context

✗ 間違った記法:
Call @code-reviewer (バッククォートなし)
Use code-reviewer agent
Invoke agent: code-reviewer
```

### 問題: エージェント間でコンテキストが失われる

**症状**: Phase 2のエージェントがPhase 1の結果を認識しない

**原因**:
- 結果の明示的な受け渡しが不足
- コンテキストの構造化が不十分

**解決策**:
```markdown
✓ 良い例:
## Phase 1
Call `@analyzer`
Capture results as: analysis_findings

## Phase 2
Call `@planner` with:
- Input: analysis_findings from @analyzer
- Task: Create refactoring plan

✗ 悪い例:
## Phase 1
@analyzer does analysis

## Phase 2
@planner creates plan (コンテキスト不明)
```

### 問題: 複数エージェントの調整が困難

**症状**: エージェント間の依存関係が複雑になりすぎる

**原因**:
- 過度に細分化されたフェーズ
- 不明確な責任分離

**解決策**:
- エージェントの責任を再定義
- フェーズを統合
- より高レベルのエージェントを作成

## まとめ

Command → Agent統合パターンの重要ポイント:

1. **明確な起動**: バッククォート付きメンション `@agent-name`
2. **構造化コンテキスト**: 必要な情報を整理して渡す
3. **結果処理**: エージェント出力を明示的に処理
4. **エラーハンドリング**: 失敗時の対処を定義
5. **検証**: 結果の品質を確認

**次のステップ**:
- `command-to-skill-patterns.md`: コマンド→スキル統合パターン
- `composite-workflows.md`: Command + Agent + Skillの複合ワークフロー
