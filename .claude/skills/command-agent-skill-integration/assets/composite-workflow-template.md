# Composite Workflow Template

このテンプレートは、Command・Agent・Skillの3つを完全統合した複合ワークフローを作成する標準パターンを提供します。

## 基本テンプレート

```markdown
---
description: [Complete workflow with trinity integration]
---

# [Workflow Name]

Target: $ARGUMENTS

## Phase 1: [Phase Name] (Command + Skill)

Reference: @.claude/skills/phase1-skill/SKILL.md

The skill provides:

- [Knowledge for phase 1]

Based on skill guidance:

- [Action 1]
- [Action 2]

Capture: phase1_results

## Phase 2: [Phase Name] (Agent + Skill)

Invoke `@phase2-agent` with phase1_results.

Agent references:

- @.claude/skills/phase2-skill/SKILL.md

Agent will:

- [Task 1 with skill guidance]
- [Task 2 with skill guidance]

Capture: phase2_results

## Phase 3: [Phase Name] (Command + Agent + Skill)

Reference: @.claude/skills/phase3-skill/SKILL.md

Invoke `@phase3-agent` with:

- phase1_results
- phase2_results
- Guidance from phase3-skill

Agent applies skill patterns to:

- [Integrated task 1]
- [Integrated task 2]

Capture: phase3_results

## Summary

Generate workflow summary:

- Phase 1: [Outcomes]
- Phase 2: [Outcomes]
- Phase 3: [Outcomes]
- Overall: [Final result]
```

## フェーズベースワークフロー例

```markdown
---
description: End-to-end feature development workflow
---

# Feature Development Workflow

Feature: $ARGUMENTS

## Phase 1: Planning (Command + Skill)

Reference planning skill:

- @.claude/skills/feature-planning/SKILL.md

The skill provides:

- Requirements analysis framework (5W1H)
- Task breakdown methodology (user stories)
- Dependency mapping techniques
- Complexity estimation (story points)

Based on skill guidance:

1. Define Requirements:
   - Functional: What the feature does
   - Non-functional: Performance, security constraints
   - Acceptance criteria: Definition of done

2. Identify Dependencies:
   - External services to integrate
   - Existing components to modify
   - Third-party libraries needed

3. Create Task Breakdown:
   - User stories with acceptance criteria
   - Technical tasks (API, database, UI)
   - Testing tasks (unit, integration, E2E)

4. Estimate Complexity:
   - Story points per task
   - Time estimates (optimistic/realistic/pessimistic)
   - Risk assessment (high/medium/low)

Capture: planning_document

## Phase 2: Design (Agent + Skill)

Invoke `@architect` to create technical design.

Agent references:

- @.claude/skills/design-patterns/SKILL.md
- @.claude/skills/architecture-principles/SKILL.md

Agent will:

1. Analyze planning_document
2. Apply design patterns from skills:
   - Architectural patterns (MVC, microservices)
   - Component patterns (factory, repository)
   - Integration patterns (API gateway, message queue)
3. Create deliverables:
   - Architecture diagram
   - API interface definitions
   - Database schema design
   - Data flow documentation

Capture: design_specification

## Phase 3: Implementation (Command + Agent + Skill)

Reference implementation skill:

- @.claude/skills/implementation-patterns/SKILL.md

The skill provides:

- Coding standards (naming, formatting)
- Error handling patterns (try/catch, custom errors)
- Testing strategies (AAA pattern, mocking)
- Documentation requirements (JSDoc, README)

Invoke `@developer` with:

- Planning document (requirements)
- Design specification (architecture)
- Implementation patterns (coding standards)

Agent will apply skill patterns to:

1. Implement core functionality
2. Add error handling
3. Create comprehensive tests (>80% coverage)
4. Write documentation

Capture: implementation_artifacts

## Phase 4: Review (Command + Agent + Skill)

Reference review skill:

- @.claude/skills/code-review-checklist/SKILL.md

The skill provides:

- Review criteria (quality, security, performance)
- Checklist items (SOLID, DRY, KISS)
- Severity classification (critical/major/minor)

Invoke `@code-reviewer` with:

- implementation_artifacts
- design_specification (for compliance check)

Agent applies skill checklist to:

1. Verify code quality
2. Check security (OWASP Top 10)
3. Assess performance
4. Validate test coverage

Capture: review_results

## Phase 5: Deployment (Command + Agent + Skill)

If review_results.status == "approved":

Reference deployment skill:

- @.claude/skills/deployment-patterns/SKILL.md

The skill provides:

- Pre-deployment checklist
- Deployment strategies (blue-green, canary)
- Rollback procedures

Invoke `@deployer` to deploy following skill guidance:

1. Pre-deployment checks
2. Execute deployment
3. Run smoke tests
4. Verify deployment

Capture: deployment_status

Else:
Block deployment due to: review_results.blocking_issues
Create fix tasks
Notify team

## Summary

Generate complete workflow report:

1. Planning Phase:
   - Requirements: [count] functional, [count] non-functional
   - Dependencies: [list]
   - Estimated complexity: [story points]

2. Design Phase:
   - Architecture pattern: [pattern name]
   - Key decisions: [list]
   - API endpoints: [count]

3. Implementation Phase:
   - Files: [created/modified counts]
   - Test coverage: [percentage]
   - Code quality: [metrics]

4. Review Phase:
   - Issues: [count by severity]
   - Status: [approved/rejected]

5. Deployment Phase:
   - Status: [deployed/blocked]
   - Environment: [prod/staging]

6. Next Steps: [action items]
```

## 品質ゲートワークフロー例

```markdown
---
description: Multi-gate quality assurance workflow
---

# Quality-Gated Deployment

Target: $ARGUMENTS

## Stage 1: Implementation

Reference secure coding skill:

- @.claude/skills/secure-coding-patterns/SKILL.md

Invoke `@secure-developer` applying skill patterns:

- Input validation patterns
- Output sanitization techniques
- Error handling without leaks
- Secure logging practices

Capture: implementation

---

## Quality Gate 1: Code Quality

Reference quality skill:

- @.claude/skills/code-quality-standards/SKILL.md

Invoke `@quality-validator` to check against skill criteria:

- ✓ Complexity < 10 (cyclomatic)
- ✓ Test coverage >80%
- ✓ No code smells
- ✓ SOLID principles applied

If Gate 1 FAILS:
Stop workflow → Create fix tasks → Exit

If Gate 1 PASSES:
Log metrics → Proceed to Stage 2

## Stage 2: Security Validation

Reference security skill:

- @.claude/skills/security-standards/SKILL.md

Invoke `@security-auditor` applying skill checklist:

- OWASP Top 10 vulnerabilities
- Authentication/authorization
- Encryption (rest, transit)
- Dependency vulnerabilities

---

## Quality Gate 2: Security

Security criteria from skill:

- ✓ No high/critical vulnerabilities
- ✓ Authentication enforced
- ✓ Input validation present
- ✓ Encryption configured

If Gate 2 FAILS:
Stop workflow → Security fixes → Exit

If Gate 2 PASSES:
Log security score → Proceed to Stage 3

## Stage 3: Performance Validation

Reference performance skill:

- @.claude/skills/performance-standards/SKILL.md

Invoke `@performance-tester` checking skill benchmarks:

- Response time p95 < 200ms
- Throughput > 1000 req/s
- CPU usage < 70%
- Memory usage < 80%

---

## Quality Gate 3: Performance

If Gate 3 FAILS:
Stop workflow → Performance tasks → Exit

If Gate 3 PASSES:
Log performance → Proceed to Stage 4

## Stage 4: Deployment

All gates passed - deploy with confidence

Reference deployment skill:

- @.claude/skills/deployment-best-practices/SKILL.md

Invoke `@deployer` following skill procedures:

1. Pre-checks
2. Blue-green deployment
3. Smoke tests
4. Health verification

## Summary

Quality gates report:

- Gate 1 (Quality): [score]
- Gate 2 (Security): [score]
- Gate 3 (Performance): [score]
- Deployment: [status]
```

## 反復改善ワークフロー例

```markdown
---
description: Iterative optimization with feedback loop
---

# Performance Optimization Loop

Target: $ARGUMENTS
Goal: Response time p95 < 100ms
Max iterations: 3

## Iteration 1: Baseline + Initial Optimization

### Step 1.1: Measure Baseline (Command + Skill)

Reference measurement skill:

- @.claude/skills/performance-measurement/SKILL.md

Apply skill methodology:

- Response time metrics (p50, p95, p99)
- Throughput measurement
- Resource profiling

Capture: baseline_metrics

### Step 1.2: Analyze Bottlenecks (Agent + Skill)

Invoke `@performance-analyzer` to identify issues.

Agent references:

- @.claude/skills/performance-patterns/SKILL.md

Agent identifies:

- Top bottlenecks with impact assessment
- Optimization opportunities ranked
- Risk level per optimization

Capture: bottleneck_analysis

### Step 1.3: Apply Optimizations (Command + Agent + Skill)

Reference optimization skill:

- @.claude/skills/optimization-techniques/SKILL.md

Invoke `@optimizer` applying skill techniques:

- Caching patterns (Redis, in-memory)
- Query optimization (indexes, joins)
- Connection pooling

Capture: optimized_code_v1

### Step 1.4: Validate + Measure

Invoke `@quality-validator` to ensure no regressions.

Measure improvement:

- Response time: [baseline] → [current]
- Improvement: [X%]

If goal achieved:
Document success → Exit loop

Else:
Proceed to Iteration 2

## Iteration 2: Advanced Optimization

### Step 2.1: Deep Analysis (Agent + Skill)

Invoke `@performance-engineer` for advanced analysis.

Agent references:

- @.claude/skills/advanced-optimization/SKILL.md

Agent identifies:

- Algorithm complexity improvements
- Data structure changes
- Advanced caching strategies

Capture: advanced_plan

### Step 2.2: Implement Advanced Techniques

Invoke `@optimizer` with advanced_plan

### Step 2.3: Validate + Measure

Check quality, measure improvement

If goal achieved: Exit
Else if iterations < max: Proceed to Iteration 3
Else: Document results → Exit

## Iteration 3: Architectural Optimization

[Similar structure for architectural changes]

## Summary

Optimization journey:

- Baseline: [metrics]
- Iteration 1: [+X% improvement]
- Iteration 2: [+X% improvement]
- Iteration 3: [+X% improvement]
- Final: [metrics]
- Goal achieved: [Yes/No]
```

## 並列ワークフロー例

```markdown
---
description: Parallel development with synchronization
---

# Parallel Component Development

Components: $ARGUMENTS

## Phase 1: Parallel Development

### Branch A: Header Component (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` applying skill patterns:

- Component structure
- Responsive design
- Accessibility (ARIA)

Capture: header_component

### Branch B: Main Content (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` applying skill patterns:

- Layout patterns
- Data fetching
- Error boundaries

Capture: content_component

### Branch C: Footer Component (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` applying skill patterns:

- Footer structure
- Navigation patterns

Capture: footer_component

**Note**: All branches execute in parallel

## Phase 2: Synchronization

Wait for all branches:

- ⏳ Branch A: [status]
- ⏳ Branch B: [status]
- ⏳ Branch C: [status]

## Phase 3: Integration (Command + Agent + Skill)

Reference integration skill:

- @.claude/skills/component-integration/SKILL.md

Invoke `@integration-specialist` applying skill guidance:

1. Combine components
2. Establish contracts (props)
3. Configure routing
4. Apply global styles

Capture: integrated_app

## Phase 4: Validation

Invoke `@qa-engineer` for integration testing

## Summary

Components: [count] created
Integration: [status]
Tests: [coverage]
```

## チェックリスト

複合ワークフローを作成する際の確認項目：

### 全体構造

- [ ] フェーズが論理的に分割されている
- [ ] 各フェーズの目的が明確
- [ ] フェーズ間の依存関係が定義されている
- [ ] 成果物のキャプチャが明確

### 三位一体統合

- [ ] 各フェーズでCommand/Agent/Skillの役割が明確
- [ ] Command: ワークフロー定義
- [ ] Agent: 専門的判断と実行
- [ ] Skill: ドメイン知識提供

### スキル参照

- [ ] 各フェーズで適切なスキルを参照
- [ ] スキルの提供内容を明示
- [ ] スキルガイダンスの適用方法を記述

### エージェント起動

- [ ] エージェントの責任範囲が明確
- [ ] コンテキストの受け渡しが明示
- [ ] エージェントがスキルを参照（必要に応じて）

### 品質ゲート

- [ ] 重要なポイントでゲートを配置
- [ ] ゲート基準が明確（スキル由来）
- [ ] ゲート失敗時の処理を定義

### エラーハンドリング

- [ ] 各フェーズの失敗時処理を定義
- [ ] ロールバック手順を明確化
- [ ] フォールバック戦略を用意

## ベストプラクティス

1. **明確なフェーズ分割**: 各フェーズは単一の責任を持つ
2. **成果物管理**: `Capture: result_name` で明示的に記録
3. **品質ゲート**: リスクポイントでの検証
4. **スキル基盤**: 判断基準はスキルから導出
5. **エージェント活用**: 複雑な判断はエージェントに委譲

## よくある間違い

❌ **悪い例** (フェーズ区分が不明確):

```markdown
Do everything in one step
```

✅ **良い例**:

```markdown
## Phase 1: Planning (Command + Skill)

[明確な計画フェーズ]

## Phase 2: Implementation (Agent + Skill)

[明確な実装フェーズ]
```

❌ **悪い例** (成果物管理なし):

```markdown
Do task 1
Do task 2 (task 1の結果をどう使う?)
```

✅ **良い例**:

```markdown
## Phase 1

[処理]
Capture: phase1_results

## Phase 2

Use phase1_results to:

- [明確な活用方法]
```

❌ **悪い例** (ゲートなし):

```markdown
Implement → Deploy
(品質チェックは?)
```

✅ **良い例**:

```markdown
## Stage 1: Implement

---

## Quality Gate 1: Code Quality

If fails: Stop
If passes: Proceed

## Stage 2: Deploy
```

## 関連リソース

- `trinity-architecture.md`: 三位一体の概念
- `command-to-agent-patterns.md`: エージェント統合パターン
- `command-to-skill-patterns.md`: スキル統合パターン
- `composite-workflows.md`: 複合ワークフローの詳細解説
