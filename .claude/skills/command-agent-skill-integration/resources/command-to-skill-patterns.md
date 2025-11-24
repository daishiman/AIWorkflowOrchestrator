# Command → Skill統合パターン

## 概要

このドキュメントは、スラッシュコマンドからスキルを参照する統合パターンを提供します。コマンドによるワークフロー自動化とスキルのドメイン知識を組み合わせることで、ベストプラクティスに従った一貫性のある実行を実現します。

## 基本概念

### なぜコマンドからスキルを参照するのか？

**コマンドの強み**:
- ワークフロー定義と自動化
- 繰り返し可能性
- 手順の構造化

**スキルの強み**:
- ドメイン知識
- ベストプラクティス
- 段階的な情報開示（Progressive Disclosure）

**統合の価値**:
```
Command（ワークフロー自動化）+ Skill（ドメイン知識）
= ベストプラクティスに従った一貫性のある実行
```

## スキル参照の方法

### 明示的参照構文

```markdown
## Step N: Load Best Practices
Reference skill for [目的]:
- @.claude/skills/skill-name/SKILL.md

The skill provides:
- [提供内容1]
- [提供内容2]
- [提供内容3]
```

**重要**: 相対パス形式 `@.claude/skills/[skill-name]/SKILL.md` を使用

### 自動起動との違い

| 起動方法 | タイミング | 用途 |
|---------|----------|------|
| 明示的参照 | コマンドで指定 | 特定のドメイン知識が必須 |
| 自動起動 | モデル判断 | 一般的な知識提供 |

## パターン1: 単一スキル参照

### 構造

```markdown
---
description: [Task with domain expertise]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Load Best Practices
Reference: @.claude/skills/domain-skill/SKILL.md

The skill provides:
- [知識項目1]
- [知識項目2]
- [知識項目3]

## Step 2: Apply Knowledge
Based on skill guidance:
- [適用1]
- [適用2]
- [適用3]

## Step 3: Verify
Check against skill criteria:
- [検証項目1]
- [検証項目2]
```

### 実装例: Reactコンポーネント作成

```markdown
---
description: Create React component following best practices
---

# Create React Component

Component name: $ARGUMENTS

## Step 1: Load Best Practices
Reference skill for React component design:
- @.claude/skills/react-component-patterns/SKILL.md

The skill provides:
- Component structure guidelines (functional vs class)
- Naming conventions (PascalCase for components)
- Props design patterns (interface definitions)
- State management recommendations (useState, useReducer)
- Performance optimization (memo, useMemo, useCallback)
- Accessibility requirements (ARIA attributes)

## Step 2: Generate Component Structure
Based on skill guidance, create:

1. Component file with TypeScript:
   - Functional component with proper typing
   - Props interface definition
   - Export statement

2. Props interface:
   - Required vs optional props
   - Proper type annotations
   - JSDoc comments for complex props

3. Hooks usage:
   - useState for local state
   - useEffect for side effects
   - Custom hooks extraction for complex logic

4. JSDoc comments:
   - Component purpose
   - Props documentation
   - Usage examples

## Step 3: Generate Tests
Reference testing skill:
- @.claude/skills/testing-patterns/SKILL.md

Create tests following:
- Test file structure (describe, it blocks)
- Coverage requirements (>80%)
- Assertion best practices (expect statements)
- Mock strategies for dependencies

## Step 4: Verify Compliance
Check against skill criteria:
- Structure: Matches recommended patterns
- Naming: Follows conventions
- Types: Complete type coverage
- Tests: Adequate coverage
- Accessibility: ARIA attributes present
- Performance: Memoization where needed
```

### 使用シナリオ

**適用条件**:
- [ ] ドメイン固有の知識が必要
- [ ] ベストプラクティスの適用が必須
- [ ] 一貫性のある実装が求められる
- [ ] 複数のガイドラインを統合する必要がある

**期待される成果**:
- ベストプラクティスに準拠した実装
- 一貫性のあるコード品質
- ドキュメント化された知識基盤

## パターン2: 複数スキル組み合わせ

### 構造

```markdown
---
description: [Task requiring multiple domains]
---

# [Command Name]

## Step 1: Load Domain Skill A
Reference: @.claude/skills/domain-a/SKILL.md
Apply: [特定の側面]

## Step 2: Load Domain Skill B
Reference: @.claude/skills/domain-b/SKILL.md
Apply: [別の側面]

## Step 3: Integrate Knowledge
Combine guidance from both skills:
- [統合ポイント1]
- [統合ポイント2]

## Step 4: Implement
Apply integrated knowledge
```

### 実装例: セキュアAPI実装

```markdown
---
description: Implement secure REST API endpoint
---

# Create Secure API Endpoint

Endpoint: $ARGUMENTS

## Step 1: Load API Design Patterns
Reference: @.claude/skills/api-design-patterns/SKILL.md

Apply guidance for:
- RESTful resource naming
- HTTP method selection (GET, POST, PUT, DELETE)
- Request/response structure
- Status code usage
- Error response format
- Pagination patterns
- Versioning strategy

## Step 2: Load Security Patterns
Reference: @.claude/skills/security-patterns/SKILL.md

Apply guidance for:
- Authentication mechanisms (JWT, OAuth2)
- Authorization checks (RBAC, ABAC)
- Input validation (schema validation)
- Output sanitization (XSS prevention)
- Rate limiting configuration
- CORS policy
- Security headers

## Step 3: Load Performance Patterns
Reference: @.claude/skills/performance-patterns/SKILL.md

Apply guidance for:
- Caching strategies (Redis, CDN)
- Database query optimization
- Response compression
- Connection pooling
- Async processing

## Step 4: Integrate Knowledge
Combine all three skill domains:

1. API Structure (from API Design):
   - Endpoint path: /api/v1/resource
   - HTTP methods with proper semantics
   - Request/response schemas

2. Security Layer (from Security):
   - JWT authentication middleware
   - Role-based authorization
   - Input validation middleware
   - Rate limiting middleware

3. Performance Layer (from Performance):
   - Caching middleware
   - Response compression
   - Database query optimization

## Step 5: Implement Endpoint
Create endpoint with:
- Route definition
- Middleware stack (auth, validation, rate limit)
- Controller logic
- Error handling
- Response formatting

## Step 6: Generate Tests
Reference: @.claude/skills/api-testing-patterns/SKILL.md

Create tests for:
- Happy path scenarios
- Error cases
- Security scenarios (unauthorized, invalid tokens)
- Performance tests (load testing)

## Step 7: Verify Compliance
Check against all skill criteria:
- API Design: RESTful compliance
- Security: All checks implemented
- Performance: Caching and optimization active
- Testing: Complete coverage
```

## パターン3: 動的スキル選択

### 構造

```markdown
---
description: [Task with context-dependent knowledge needs]
---

# [Command Name]

Type: $ARGUMENTS

## Step 1: Determine Required Knowledge
Analyze $ARGUMENTS to select appropriate skill

## Step 2: Load Selected Skill
Based on analysis:
- If type A → @.claude/skills/skill-a/SKILL.md
- If type B → @.claude/skills/skill-b/SKILL.md
- If type C → @.claude/skills/skill-c/SKILL.md

## Step 3: Apply Knowledge
Follow guidance from selected skill

## Step 4: Validate
Verify against skill criteria
```

### 実装例: 機能実装

```markdown
---
description: Implement feature with appropriate patterns
---

# Feature Implementation

Feature type: $ARGUMENTS

## Step 1: Determine Feature Category
Analyze $ARGUMENTS to classify:
- Extract feature keywords
- Identify primary domain
- Determine complexity level

## Step 2: Select Appropriate Skill
Based on feature category:

If "authentication" or "login" or "auth":
  Reference: @.claude/skills/auth-patterns/SKILL.md
  Provides:
  - Authentication strategies
  - Session management
  - Token handling
  - Password security

If "api" or "endpoint" or "rest":
  Reference: @.claude/skills/api-design-patterns/SKILL.md
  Provides:
  - RESTful design
  - Request/response structure
  - Error handling

If "ui" or "component" or "frontend":
  Reference: @.claude/skills/ui-component-patterns/SKILL.md
  Provides:
  - Component architecture
  - State management
  - Styling approaches

If "database" or "data" or "storage":
  Reference: @.claude/skills/database-patterns/SKILL.md
  Provides:
  - Schema design
  - Query optimization
  - Migration strategies

If "performance" or "optimization":
  Reference: @.claude/skills/performance-patterns/SKILL.md
  Provides:
  - Caching strategies
  - Code optimization
  - Resource management

## Step 3: Load Selected Skill
Reference the appropriate skill for:
- Design patterns specific to domain
- Implementation guidelines
- Security considerations
- Testing requirements
- Performance optimization

## Step 4: Implement Feature
Follow skill guidance to implement:
1. Core functionality
2. Error handling
3. Security measures
4. Performance optimization
5. Tests
6. Documentation

## Step 5: Validate Implementation
Verify against skill criteria:
- Pattern compliance
- Security requirements
- Performance benchmarks
- Test coverage
- Documentation completeness
```

## パターン4: スキル階層参照

### 構造

```markdown
---
description: [Task with general and specific knowledge needs]
---

# [Command Name]

## Step 1: Load General Skill
Reference: @.claude/skills/general-patterns/SKILL.md
For: [一般的なガイドライン]

## Step 2: Load Specific Skill
Reference: @.claude/skills/specific-patterns/SKILL.md
For: [特化したガイドライン]

## Step 3: Apply Hierarchically
General principles → Specific implementation
```

### 実装例: テスト作成

```markdown
---
description: Create comprehensive test suite
---

# Create Test Suite

Target: $ARGUMENTS

## Step 1: Load General Testing Principles
Reference: @.claude/skills/testing-fundamentals/SKILL.md

Apply general principles:
- Test pyramid (unit, integration, E2E)
- AAA pattern (Arrange, Act, Assert)
- Test isolation
- Descriptive test names
- Single assertion per test
- Test data management

## Step 2: Load Language-Specific Patterns
Detect language from target and reference:

For JavaScript/TypeScript:
  Reference: @.claude/skills/javascript-testing-patterns/SKILL.md
  Provides:
  - Jest/Vitest configuration
  - React Testing Library patterns
  - Mock strategies (jest.mock)
  - Async testing patterns

For Python:
  Reference: @.claude/skills/python-testing-patterns/SKILL.md
  Provides:
  - pytest fixtures
  - Mock/patch strategies
  - Parametrized tests
  - Coverage configuration

## Step 3: Load Framework-Specific Patterns
Detect framework and reference:

For React:
  Reference: @.claude/skills/react-testing-patterns/SKILL.md
  Provides:
  - Component testing strategies
  - Hook testing patterns
  - User event simulation
  - Accessibility testing

For Express:
  Reference: @.claude/skills/express-testing-patterns/SKILL.md
  Provides:
  - API endpoint testing
  - Middleware testing
  - Request/response mocking

## Step 4: Apply Hierarchically
Combine knowledge at three levels:

Level 1 - General (Testing Fundamentals):
- Overall test structure
- Testing principles
- Best practices

Level 2 - Language (JS/Python Testing):
- Language-specific tools
- Testing framework setup
- Mock strategies

Level 3 - Framework (React/Express Testing):
- Framework-specific patterns
- Component/API testing
- Integration approaches

## Step 5: Generate Test Suite
Create tests applying all levels:
1. General structure (Level 1)
2. Language-specific implementation (Level 2)
3. Framework-specific patterns (Level 3)

## Step 6: Verify Compliance
Check against all skill criteria:
- Testing Fundamentals: Principles applied
- Language Testing: Tools and patterns correct
- Framework Testing: Framework-specific best practices
```

## 実装ガイドライン

### 1. スキル参照の記述方法

**明確な参照指示**:
```markdown
✓ 良い例:
Reference skill for [purpose]:
- @.claude/skills/skill-name/SKILL.md

The skill provides:
- [具体的な提供内容]

✗ 悪い例:
Use the skill somehow
Check the skill documentation
```

### 2. 知識の適用

**構造化された適用**:
```markdown
✓ 良い例:
Based on skill guidance:
1. Apply pattern A for scenario X
2. Follow guideline B for aspect Y
3. Verify criterion C

✗ 悪い例:
Do what the skill says
```

### 3. 検証

**明示的な検証**:
```markdown
✓ 良い例:
Check against skill criteria:
- Pattern compliance: ✓ Yes/✗ No
- Security requirements: ✓ Met/✗ Not met
- Performance benchmarks: ✓ Passed/✗ Failed

✗ 悪い例:
Make sure it follows the skill
```

### 4. 複数スキルの統合

**明確な統合ポイント**:
```markdown
✓ 良い例:
Combine guidance from skills:
1. Structure from @skill-a (components)
2. Security from @skill-b (auth)
3. Performance from @skill-c (caching)

Integration points:
- Component structure incorporates auth checks
- Caching respects security boundaries

✗ 悪い例:
Use all the skills together
```

## ベストプラクティス

### 1. 適切なスキル選択

**スキル選択基準**:
- ドメインがタスクに合致
- 必要な知識レベルが適切
- 最新のベストプラクティスを含む

### 2. 段階的な知識適用

**Progressive Application**:
```markdown
1. 概要を参照（SKILL.md Metadata）
2. 詳細を必要に応じて参照（resources/）
3. テンプレートを活用（templates/）
```

### 3. 検証の徹底

**品質保証**:
- スキルの基準に対する明示的な検証
- 逸脱がある場合の記録と正当化
- 定期的なスキル更新の確認

### 4. スキルの組み合わせ

**効果的な統合**:
- 重複する領域の明確化
- 競合する推奨事項の解決
- 統合ポイントの文書化

## トラブルシューティング

### 問題: スキルが参照されない

**症状**: スキル知識が適用されていない

**原因**:
- 参照構文が正しくない
- スキルが存在しない
- パス指定エラー

**解決策**:
```markdown
✓ 正しい記法:
Reference: @.claude/skills/skill-name/SKILL.md

✗ 間違った記法:
Reference: .claude/skills/skill-name/SKILL.md (@なし)
Reference: @skill-name (パス省略)
Use skill-name (参照構文なし)
```

### 問題: 複数スキルの統合が困難

**症状**: スキル間で矛盾する推奨事項

**原因**:
- スキルの責任範囲が不明確
- 統合ポイントが定義されていない

**解決策**:
```markdown
✓ 良い例:
## Integration Strategy
Primary: @skill-a for structure
Secondary: @skill-b for security (override structure if needed)
Tertiary: @skill-c for performance (non-conflicting)

Priority order: Security > Structure > Performance

✗ 悪い例:
Use all skills (統合戦略なし)
```

### 問題: スキル知識が古い

**症状**: 推奨パターンが最新でない

**原因**:
- スキルの更新不足
- フレームワークのバージョンアップ

**解決策**:
- スキルのバージョン管理
- 定期的なスキル更新プロセス
- 代替パターンの明示

## まとめ

Command → Skill統合パターンの重要ポイント:

1. **明確な参照**: `@.claude/skills/skill-name/SKILL.md` 形式
2. **提供内容の明示**: スキルが何を提供するか記述
3. **構造化された適用**: ステップごとに知識を適用
4. **明示的な検証**: スキル基準に対するチェック
5. **統合戦略**: 複数スキル使用時の優先順位

**次のステップ**:
- `composite-workflows.md`: Command + Agent + Skill の完全統合パターン
