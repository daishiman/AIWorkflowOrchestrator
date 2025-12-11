# 複合ワークフロー設計（Composite Workflows）

## 概要

このドキュメントは、Command・Agent・Skillの3つを完全統合した複合ワークフローの設計パターンを提供します。三位一体アーキテクチャの最大の価値を実現するための実践的なガイドラインです。

## 三位一体統合の価値

### 完全統合がもたらすもの

```
Command（ワークフロー自動化）
  +
Agent（専門的判断）
  +
Skill（ドメイン知識）
  =
完璧な自動化と最高品質の実現
```

**単独・部分統合との比較**:

| 統合レベル                  | 自動化 | 専門性 | 知識基盤 | 品質  |
| --------------------------- | ------ | ------ | -------- | ----- |
| Commandのみ                 | ◎      | ✗      | ✗        | △     |
| Command + Agent             | ◎      | ◎      | ✗        | ○     |
| Command + Skill             | ◎      | ✗      | ◎        | ○     |
| **Command + Agent + Skill** | **◎**  | **◎**  | **◎**    | **◎** |

## パターン1: フェーズベースワークフロー

### 構造

```markdown
---
description: [Complete multi-phase workflow]
---

# [Workflow Name]

Target: $ARGUMENTS

## Phase 1: [Phase Name] (Command + Skill)

Reference: @.claude/skills/phase1-skill/SKILL.md
[ワークフロー定義 + 知識適用]

## Phase 2: [Phase Name] (Agent + Skill)

Invoke `@phase2-agent`
Agent references: @.claude/skills/phase2-skill/SKILL.md
[専門的実行 + 知識基盤]

## Phase 3: [Phase Name] (Command + Agent + Skill)

Reference: @.claude/skills/phase3-skill/SKILL.md
Invoke `@phase3-agent` with skill guidance
[完全統合]

## Summary

[ワークフロー全体のサマリー]
```

### 実装例: 完全な機能開発ワークフロー

```markdown
---
description: End-to-end feature development with quality assurance
---

# Feature Development Workflow

Feature: $ARGUMENTS

## Phase 1: Planning (Command + Skill)

Reference planning skill:

- @.claude/skills/feature-planning/SKILL.md

The skill provides:

- Requirements analysis framework
- Task breakdown methodology
- Dependency identification
- Complexity estimation

Based on skill guidance:

1. Define requirements:
   - Functional requirements
   - Non-functional requirements
   - Acceptance criteria

2. Identify dependencies:
   - External services
   - Existing components
   - Third-party libraries

3. Create task breakdown:
   - User stories
   - Technical tasks
   - Testing tasks

4. Estimate complexity:
   - Story points
   - Time estimates
   - Risk assessment

Capture: planning_document

## Phase 2: Design (Agent + Skill)

Invoke `@architect` to create technical design.

The @architect agent references:

- @.claude/skills/design-patterns/SKILL.md
- @.claude/skills/architecture-principles/SKILL.md

Agent will:

1. Analyze planning document
2. Apply design patterns from skill
3. Create architecture diagram
4. Define interfaces and contracts
5. Plan data flow
6. Identify integration points

Capture: design_specification

## Phase 3: Implementation (Command + Agent + Skill)

Reference implementation skill:

- @.claude/skills/implementation-patterns/SKILL.md

The skill provides:

- Coding standards
- Component structure patterns
- Error handling patterns
- Testing strategies

Invoke `@developer` with:

- Planning document from Phase 1
- Design specification from Phase 2
- Implementation patterns skill reference

The @developer agent will:

1. Follow design specification
2. Apply implementation patterns from skill
3. Write production code
4. Create unit tests (>80% coverage)
5. Document code (JSDoc/docstrings)

Capture: implementation_artifacts

## Phase 4: Review (Command + Agent + Skill)

Reference review skill:

- @.claude/skills/code-review-checklist/SKILL.md

The skill provides:

- Review criteria (quality, security, performance)
- Checklist items
- Severity classification
- Fix recommendations

Invoke `@code-reviewer` to review:

- Implementation artifacts from Phase 3
- Design specification (compliance check)
- Planning document (requirements check)

The @code-reviewer agent will:

1. Apply review checklist from skill
2. Check code quality
3. Verify pattern adherence
4. Assess test coverage
5. Evaluate security
6. Measure performance

Capture: review_results

## Phase 5: Deployment (Command + Agent)

If review_results status is "approved":

Reference deployment skill:

- @.claude/skills/deployment-patterns/SKILL.md

Invoke `@deployer` to deploy:

1. Run pre-deployment checks (skill guidance)
2. Execute deployment pipeline
3. Run smoke tests
4. Verify deployment
5. Rollback if verification fails

Capture: deployment_status

Else:
Block deployment
Create fix tasks from review_results
Notify team of blocking issues

## Phase 6: Summary

Generate complete workflow summary:

1. Planning Decisions:
   - Requirements defined: [list]
   - Dependencies identified: [list]
   - Complexity estimate: [metrics]

2. Design Choices:
   - Architecture pattern: [pattern name]
   - Key design decisions: [list]
   - Integration points: [list]

3. Implementation Details:
   - Files created/modified: [list]
   - Test coverage: [percentage]
   - Code quality metrics: [metrics]

4. Review Results:
   - Issues found: [count by severity]
   - Patterns verified: [checklist]
   - Approval status: [approved/rejected]

5. Deployment Status:
   - Environment: [prod/staging]
   - Version: [version number]
   - Verification: [passed/failed]

6. Next Steps:
   - If approved: Monitor production
   - If rejected: Address review findings
   - Follow-up tasks: [list]
```

## パターン2: 品質ゲートワークフロー

### 構造

```markdown
---
description: [Quality-gated workflow with validation points]
---

# [Workflow Name]

## Stage 1: Implementation

[実装フェーズ]

Gate 1: Code Quality Check

- Skill: @quality-standards
- Agent: @quality-validator
- Criteria: [基準]

## Stage 2: Security Validation

[セキュリティ検証]

Gate 2: Security Audit

- Skill: @security-standards
- Agent: @security-auditor
- Criteria: [基準]

## Stage 3: Performance Validation

[パフォーマンス検証]

Gate 3: Performance Check

- Skill: @performance-standards
- Agent: @performance-tester
- Criteria: [基準]

## Stage 4: Deployment

[Only if all gates passed]
```

### 実装例: セキュアデプロイワークフロー

```markdown
---
description: Security-first deployment with quality gates
---

# Secure Deployment Workflow

Target: $ARGUMENTS

## Stage 1: Code Implementation

Reference implementation skill:

- @.claude/skills/secure-coding-patterns/SKILL.md

Invoke `@secure-developer` to implement:

- Apply secure coding patterns from skill
- Input validation
- Output sanitization
- Error handling without information leakage
- Logging without sensitive data

Capture: implementation

---

## Gate 1: Code Quality Check

Reference quality skill:

- @.claude/skills/code-quality-standards/SKILL.md

Invoke `@quality-validator` to check:

- Code style compliance
- Complexity metrics (cyclomatic < 10)
- Test coverage (>80%)
- Documentation completeness

Quality criteria from skill:

- ✓ No code smells
- ✓ DRY principle applied
- ✓ SOLID principles followed
- ✓ Error handling present

If Gate 1 FAILS:

- Stop workflow
- Create fix tasks
- Notify developer
- Exit workflow

If Gate 1 PASSES:

- Log quality metrics
- Proceed to Stage 2

## Stage 2: Security Validation

Reference security skill:

- @.claude/skills/security-standards/SKILL.md

Invoke `@security-auditor` to audit:

- OWASP Top 10 vulnerabilities
- Authentication/authorization checks
- Data encryption (at rest, in transit)
- Sensitive data handling
- Dependency vulnerabilities

---

## Gate 2: Security Audit

Security criteria from skill:

- ✓ No high/critical vulnerabilities
- ✓ Authentication implemented
- ✓ Authorization enforced
- ✓ Input validation present
- ✓ Encryption configured
- ✓ Dependencies up-to-date

If Gate 2 FAILS:

- Stop workflow
- Create security fix tasks
- Notify security team
- Exit workflow

If Gate 2 PASSES:

- Log security metrics
- Proceed to Stage 3

## Stage 3: Performance Validation

Reference performance skill:

- @.claude/skills/performance-standards/SKILL.md

Invoke `@performance-tester` to test:

- Response time (p95, p99)
- Throughput (requests/second)
- Resource usage (CPU, memory)
- Database query performance
- Caching effectiveness

---

## Gate 3: Performance Check

Performance criteria from skill:

- ✓ Response time p95 < 200ms
- ✓ Response time p99 < 500ms
- ✓ Throughput > 1000 req/s
- ✓ CPU usage < 70%
- ✓ Memory usage < 80%
- ✓ No N+1 queries

If Gate 3 FAILS:

- Stop workflow
- Create performance tasks
- Notify team
- Exit workflow

If Gate 3 PASSES:

- Log performance metrics
- Proceed to Stage 4

## Stage 4: Deployment

**All gates passed - proceed with deployment**

Reference deployment skill:

- @.claude/skills/deployment-best-practices/SKILL.md

Invoke `@deployer` to deploy:

1. Pre-deployment checks:
   - Verify all gates passed
   - Check environment health
   - Backup current version

2. Deployment execution:
   - Blue-green deployment pattern
   - Canary release (10% traffic)
   - Monitor metrics

3. Post-deployment validation:
   - Smoke tests
   - Health checks
   - Error rate monitoring

4. Completion:
   - If validation passes: Full rollout
   - If validation fails: Automatic rollback

## Workflow Summary

Generate deployment report:

1. Gate Results:
   - Gate 1 (Quality): [PASSED] - Score: [X/100]
   - Gate 2 (Security): [PASSED] - Score: [X/100]
   - Gate 3 (Performance): [PASSED] - Score: [X/100]

2. Deployment Details:
   - Environment: [production]
   - Version: [v1.2.3]
   - Strategy: [blue-green]
   - Status: [success]

3. Quality Metrics:
   - Code quality: [metrics]
   - Security posture: [metrics]
   - Performance characteristics: [metrics]

4. Next Actions:
   - Monitor production for 24h
   - Verify no regressions
   - Update documentation
```

## パターン3: 反復改善ワークフロー

### 構造

```markdown
---
description: [Iterative improvement with feedback loops]
---

# [Workflow Name]

## Iteration 1: Initial Implementation

- Command: Structure
- Agent: Implement
- Skill: Patterns

## Iteration 2: Quality Improvement

- Command: Review workflow
- Agent: Analyze and fix
- Skill: Quality standards

## Iteration 3: Optimization

- Command: Optimization workflow
- Agent: Optimize
- Skill: Performance patterns

[Repeat until criteria met]
```

### 実装例: パフォーマンス最適化ループ

```markdown
---
description: Iterative performance optimization with quality preservation
---

# Performance Optimization Loop

Target: $ARGUMENTS
Max iterations: 3
Performance goal: Response time p95 < 100ms

## Iteration 1: Baseline and Initial Optimization

### Step 1.1: Measure Baseline (Command + Skill)

Reference performance skill:

- @.claude/skills/performance-measurement/SKILL.md

Based on skill guidance, measure:

- Response time (p50, p95, p99)
- Throughput
- Resource usage
- Database query time
- Network latency

Capture: baseline_metrics

### Step 1.2: Identify Bottlenecks (Agent + Skill)

Invoke `@performance-analyzer` to analyze:

- Baseline metrics
- Code profiling
- Database query analysis
- Network trace

Agent references:

- @.claude/skills/performance-patterns/SKILL.md

Agent identifies:

- Top 3 bottlenecks
- Optimization opportunities
- Risk assessment

Capture: bottleneck_analysis

### Step 1.3: Apply Initial Optimizations (Command + Agent + Skill)

Reference optimization skill:

- @.claude/skills/optimization-techniques/SKILL.md

Invoke `@optimizer` to optimize:

- Apply low-risk optimizations from skill
- Implement caching (Redis)
- Optimize database queries
- Add connection pooling

Capture: optimized_code_v1

### Step 1.4: Validate Quality (Agent + Skill)

Invoke `@quality-validator` to ensure:

- No functionality regression
- Tests still pass
- Code quality maintained

If validation fails:
Rollback optimization
Document lesson learned
Exit iteration

If validation passes:
Proceed to measurement

### Step 1.5: Measure Improvement

Reference measurement skill:

- @.claude/skills/performance-measurement/SKILL.md

Measure optimized version:

- Response time improvement: [X%]
- Resource usage change: [+/-X%]
- Throughput change: [+/-X%]

Capture: iteration_1_metrics

Compare to baseline:

- Goal achieved?: [Yes/No]
- Improvement: [X%]

If goal achieved:

- Document optimizations
- Exit loop (success)

If goal not achieved:

- Proceed to Iteration 2

## Iteration 2: Advanced Optimization

### Step 2.1: Deep Analysis (Agent + Skill)

Invoke `@performance-engineer` for deep analysis:

- Profile bottlenecks remaining
- Analyze algorithm complexity
- Review data structures
- Check I/O patterns

Agent references:

- @.claude/skills/advanced-optimization/SKILL.md

Agent identifies:

- Algorithm improvements (O(n²) → O(n log n))
- Data structure changes (array → map)
- Caching strategies (memoization)

Capture: advanced_optimization_plan

### Step 2.2: Apply Advanced Optimizations (Command + Agent + Skill)

Reference advanced skill:

- @.claude/skills/advanced-optimization/SKILL.md

Invoke `@optimizer` to implement:

- Algorithm improvements
- Data structure changes
- Advanced caching patterns
- Lazy loading

Capture: optimized_code_v2

### Step 2.3: Validate Quality

Invoke `@quality-validator` to ensure:

- Functionality preserved
- Edge cases handled
- Tests comprehensive

### Step 2.4: Measure Improvement

Measure iteration 2 results:

- Response time improvement: [X%]
- Total improvement from baseline: [X%]

If goal achieved:

- Document optimizations
- Exit loop (success)

If goal not achieved and iterations < max:

- Proceed to Iteration 3

## Iteration 3: Radical Optimization

### Step 3.1: Architectural Analysis (Agent + Skill)

Invoke `@system-architect` for architectural review:

- Identify architectural bottlenecks
- Consider architectural changes
- Evaluate trade-offs

Agent references:

- @.claude/skills/architecture-patterns/SKILL.md

Agent proposes:

- Microservice split
- CQRS pattern
- Event sourcing
- CDN usage

Capture: architectural_changes

### Step 3.2: Risk Assessment (Command + Skill)

Reference risk skill:

- @.claude/skills/risk-assessment/SKILL.md

Assess proposed changes:

- Complexity increase: [High/Medium/Low]
- Development time: [estimate]
- Testing effort: [estimate]
- Rollback difficulty: [Hard/Medium/Easy]

If risk too high:

- Document why goal not achievable
- Propose alternative approach
- Exit loop

If risk acceptable:

- Proceed with architectural changes

### Step 3.3: Implement Changes (Command + Agent + Skill)

Invoke `@architect` to implement:

- Architectural refactoring
- Pattern application
- Migration strategy

### Step 3.4: Comprehensive Validation

Invoke multiple agents:

- `@quality-validator`: Quality check
- `@security-auditor`: Security maintained
- `@performance-tester`: Performance test

### Step 3.5: Final Measurement

Measure iteration 3 results:

- Response time: [Xms]
- Goal achieved?: [Yes/No]
- Total improvement: [X%]

## Loop Summary

Generate optimization report:

1. Baseline Metrics:
   - Response time p95: [Xms]
   - Throughput: [X req/s]

2. Iteration Results:
   - Iteration 1: [+X% improvement]
   - Iteration 2: [+X% improvement]
   - Iteration 3: [+X% improvement]
   - Total: [+X% improvement]

3. Optimizations Applied:
   - [List all optimizations]

4. Final Metrics:
   - Response time p95: [Xms]
   - Throughput: [X req/s]
   - Goal achieved: [Yes/No]

5. Lessons Learned:
   - [Key insights from process]

6. Recommendations:
   - [Future optimization opportunities]
```

## パターン4: 並列ワークフロー

### 構造

```markdown
---
description: [Parallel execution with synchronization]
---

# [Workflow Name]

## Phase 1: Parallel Execution

Branch A (Command + Agent + Skill):
[並列タスクA]

Branch B (Command + Agent + Skill):
[並列タスクB]

Branch C (Command + Agent + Skill):
[並列タスクC]

## Phase 2: Synchronization

Wait for all branches

## Phase 3: Integration

Combine results from all branches
```

### 実装例: マルチフロントエンド開発

```markdown
---
description: Parallel development of multiple frontend components
---

# Multi-Component Development

Components: $ARGUMENTS

## Phase 1: Parallel Component Development

### Branch A: Header Component (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` to create:

- Header component structure
- Navigation logic
- Responsive design
- Accessibility (ARIA)

Capture: header_component

### Branch B: Main Content Component (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` to create:

- Content layout
- Data fetching hooks
- Loading states
- Error boundaries

Capture: content_component

### Branch C: Footer Component (Command + Agent + Skill)

Reference UI skill:

- @.claude/skills/react-component-patterns/SKILL.md

Invoke `@frontend-architect` to create:

- Footer structure
- Links and navigation
- Responsive layout

Capture: footer_component

**Note**: All three branches execute in parallel

## Phase 2: Synchronization

Wait for all component developments to complete:

- ⏳ Branch A (Header): [status]
- ⏳ Branch B (Content): [status]
- ⏳ Branch C (Footer): [status]

Once all complete, proceed to integration.

## Phase 3: Integration (Command + Agent + Skill)

Reference integration skill:

- @.claude/skills/component-integration/SKILL.md

Invoke `@integration-specialist` to integrate:

1. Combine all components
2. Establish prop contracts
3. Set up context providers
4. Configure routing
5. Apply global styles

Capture: integrated_application

## Phase 4: Validation (Command + Agent + Skill)

Reference testing skill:

- @.claude/skills/integration-testing/SKILL.md

Invoke `@qa-engineer` to test:

- Component interactions
- Data flow
- Responsive behavior
- Accessibility compliance
- Browser compatibility

## Summary

Component development report:

1. Components Created:
   - Header: [status, features]
   - Content: [status, features]
   - Footer: [status, features]

2. Integration:
   - Status: [success/failure]
   - Issues resolved: [list]

3. Validation:
   - Test results: [passed/failed]
   - Coverage: [X%]

4. Delivery:
   - Components ready: [Yes/No]
   - Documentation: [Complete/Incomplete]
```

## 設計原則

### 1. 適切なコンポーネント配置

**フェーズごとの選択**:

```
Planning Phase:
  → Command + Skill
  (ワークフロー定義 + 計画知識)

Design Phase:
  → Agent + Skill
  (専門的設計 + 設計パターン)

Implementation Phase:
  → Command + Agent + Skill
  (ワークフロー + 実装 + パターン)

Review Phase:
  → Command + Agent + Skill
  (レビュー構造 + 専門分析 + 基準)
```

### 2. 明確な成果物管理

**キャプチャと引き継ぎ**:

```markdown
## Phase N

[処理]
Capture: artifact_name

## Phase N+1

Use artifact_name from Phase N:

- [活用方法]
```

### 3. 品質ゲート

**ゲート配置基準**:

- 各フェーズの完了時
- リスクの高い変更の後
- デプロイ前
- 反復ループの各サイクル

### 4. フィードバックループ

**効果的なループ**:

```
実行 → 測定 → 分析 → 改善 → [実行に戻る]
```

## まとめ

複合ワークフロー設計の重要ポイント:

1. **フェーズベース**: 各フェーズで適切なコンポーネント組み合わせ
2. **品質ゲート**: 各段階での検証
3. **成果物管理**: フェーズ間の明確な引き継ぎ
4. **反復改善**: フィードバックループ
5. **並列実行**: 独立タスクの効率化

**Complete Trinity Pattern**:

```
Command: ワークフロー構造と自動化
Agent: 専門的判断と実行
Skill: ドメイン知識とベストプラクティス
= 最高品質の完全自動化
```
