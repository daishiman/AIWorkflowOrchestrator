# Skill Reference Template

このテンプレートは、スラッシュコマンドからスキルを参照する標準パターンを提供します。

## 基本テンプレート

```markdown
---
description: [Task requiring domain knowledge]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Load Best Practices
Reference skill for [purpose]:
- @.claude/skills/domain-skill/SKILL.md

The skill provides:
- [Knowledge item 1]
- [Knowledge item 2]
- [Knowledge item 3]

## Step 2: Apply Knowledge
Based on skill guidance:
- [Application step 1]
- [Application step 2]
- [Application step 3]

## Step 3: Implement
Following skill patterns:
- [Implementation step 1]
- [Implementation step 2]

## Step 4: Verify
Check against skill criteria:
- [Criterion 1]: ✓ Met / ✗ Not met
- [Criterion 2]: ✓ Met / ✗ Not met
- [Criterion 3]: ✓ Met / ✗ Not met
```

## 使用例: Reactコンポーネント作成

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
- Props design patterns (TypeScript interfaces)
- State management strategies (hooks)
- Performance optimization (memo, callbacks)
- Accessibility requirements (ARIA, semantic HTML)

## Step 2: Design Component Structure
Based on skill guidance:
- Choose functional component (modern React)
- Define Props interface with TypeScript
- Plan state requirements (useState, useReducer)
- Identify side effects (useEffect)
- Determine memoization needs

## Step 3: Implement Component
Following skill patterns:

1. Create component file:
   - PascalCase filename: ComponentName.tsx
   - Props interface definition
   - Functional component with TypeScript
   - Proper exports

2. Implement component logic:
   - Use hooks for state management
   - Extract custom hooks for complex logic
   - Apply memoization where beneficial
   - Add JSDoc comments

3. Add accessibility:
   - Semantic HTML elements
   - ARIA attributes where needed
   - Keyboard navigation support

4. Create tests:
   - Unit tests for logic
   - Integration tests for rendering
   - Accessibility tests

## Step 4: Verify Compliance
Check against skill criteria:
- Structure: ✓ Follows functional component pattern
- Naming: ✓ PascalCase for component, camelCase for functions
- Types: ✓ Complete TypeScript coverage
- Hooks: ✓ Proper hooks usage (no violations)
- Performance: ✓ Memoization applied where needed
- Accessibility: ✓ ARIA attributes present
- Tests: ✓ Coverage >80%
- Documentation: ✓ JSDoc comments complete
```

## 複数スキル組み合わせテンプレート

```markdown
---
description: [Task requiring multiple knowledge domains]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Load Domain Skill A
Reference: @.claude/skills/domain-a/SKILL.md

Apply for:
- [Specific aspect A]
- [Specific aspect B]

## Step 2: Load Domain Skill B
Reference: @.claude/skills/domain-b/SKILL.md

Apply for:
- [Specific aspect C]
- [Specific aspect D]

## Step 3: Load Domain Skill C
Reference: @.claude/skills/domain-c/SKILL.md

Apply for:
- [Specific aspect E]
- [Specific aspect F]

## Step 4: Integrate Knowledge
Combine guidance from all skills:
- Integration point 1: [How skills A+B combine]
- Integration point 2: [How skills B+C combine]
- Conflict resolution: [If skills conflict, which takes priority]

## Step 5: Implement
Apply integrated knowledge:
- [Implementation with all patterns]

## Step 6: Verify Compliance
Check against all skill criteria:
- Skill A: [Criteria checklist]
- Skill B: [Criteria checklist]
- Skill C: [Criteria checklist]
```

## 使用例: セキュアAPI実装

```markdown
---
description: Implement secure REST API endpoint with best practices
---

# Create Secure API Endpoint

Endpoint: $ARGUMENTS

## Step 1: Load API Design Patterns
Reference: @.claude/skills/api-design-patterns/SKILL.md

Apply for:
- RESTful resource naming conventions
- HTTP method selection (GET, POST, PUT, DELETE)
- Request/response structure
- Status code usage (200, 201, 400, 401, 404, 500)
- Error response format
- Pagination and filtering patterns

## Step 2: Load Security Patterns
Reference: @.claude/skills/security-patterns/SKILL.md

Apply for:
- Authentication strategies (JWT, OAuth2)
- Authorization checks (RBAC, ABAC)
- Input validation (Joi, Zod schemas)
- Output sanitization (XSS prevention)
- Rate limiting (per user, per IP)
- CORS configuration
- Security headers (CSP, HSTS, X-Frame-Options)

## Step 3: Load Performance Patterns
Reference: @.claude/skills/performance-patterns/SKILL.md

Apply for:
- Caching strategies (Redis, in-memory)
- Database query optimization (indexes, joins)
- Response compression (gzip, brotli)
- Connection pooling
- Async processing for heavy operations

## Step 4: Integrate Knowledge
Combine all three domains:

1. API Structure (from API Design):
   - Endpoint: POST /api/v1/resources
   - Request schema with validation
   - Response format with status codes

2. Security Layer (from Security):
   - JWT authentication middleware
   - RBAC authorization check
   - Input validation before processing
   - Rate limiting: 100 req/min per user

3. Performance Layer (from Performance):
   - Redis caching with 5-minute TTL
   - Database query with proper indexes
   - Response compression enabled

Integration priorities:
- Security > Performance (never compromise security for speed)
- API Design provides structure, other patterns enhance it

## Step 5: Implement Endpoint
Create endpoint following integrated patterns:

1. Route definition:
   ```javascript
   router.post('/api/v1/resources',
     authenticate,      // Security
     authorize('create'), // Security
     validate(schema),  // Security
     rateLimit,         // Security
     cacheMiddleware,   // Performance
     createResource     // Core logic
   )
   ```

2. Controller implementation:
   - Apply API design patterns for structure
   - Implement security checks
   - Use performance optimizations

3. Tests:
   - API design compliance
   - Security scenarios (auth, validation)
   - Performance benchmarks

## Step 6: Verify Compliance
Check against all skill criteria:

API Design Patterns:
- ✓ RESTful naming (resource-based)
- ✓ Proper HTTP method (POST for creation)
- ✓ Correct status codes (201 for created)
- ✓ Consistent error format

Security Patterns:
- ✓ Authentication required
- ✓ Authorization enforced
- ✓ Input validation present
- ✓ Rate limiting active
- ✓ CORS configured
- ✓ Security headers set

Performance Patterns:
- ✓ Caching implemented
- ✓ DB queries optimized
- ✓ Response compressed
- ✓ Response time <200ms
```

## 動的スキル選択テンプレート

```markdown
---
description: [Context-dependent skill selection]
---

# [Command Name]

Type: $ARGUMENTS

## Step 1: Analyze Context
Determine required knowledge based on $ARGUMENTS:
- Extract keywords
- Classify domain
- Assess complexity

## Step 2: Select Appropriate Skill
Based on context analysis:

If [condition A]:
  Reference: @.claude/skills/skill-a/SKILL.md
  For: [Specific guidance from skill A]

Else if [condition B]:
  Reference: @.claude/skills/skill-b/SKILL.md
  For: [Specific guidance from skill B]

Else if [condition C]:
  Reference: @.claude/skills/skill-c/SKILL.md
  For: [Specific guidance from skill C]

Else:
  Reference: @.claude/skills/general-skill/SKILL.md
  For: [General guidance]

## Step 3: Apply Selected Skill
Follow guidance from selected skill:
- [Application steps based on selection]

## Step 4: Validate
Verify against selected skill criteria:
- [Criteria from selected skill]
```

## 使用例: 機能実装

```markdown
---
description: Implement feature with domain-appropriate patterns
---

# Feature Implementation

Feature type: $ARGUMENTS

## Step 1: Classify Feature
Analyze $ARGUMENTS to determine domain:
- Extract feature keywords
- Identify primary concern (auth, API, UI, data, etc.)
- Assess technical complexity

## Step 2: Select Appropriate Pattern Skill
Based on classification:

If "authentication" or "login" or "auth" in $ARGUMENTS:
  Reference: @.claude/skills/auth-patterns/SKILL.md

  The skill provides:
  - Authentication strategies (JWT, sessions, OAuth)
  - Password hashing (bcrypt, argon2)
  - Token management
  - Session handling

If "api" or "endpoint" or "rest" in $ARGUMENTS:
  Reference: @.claude/skills/api-design-patterns/SKILL.md

  The skill provides:
  - RESTful design principles
  - Request/response patterns
  - Error handling strategies

If "ui" or "component" or "frontend" in $ARGUMENTS:
  Reference: @.claude/skills/ui-component-patterns/SKILL.md

  The skill provides:
  - Component architecture
  - State management approaches
  - Styling strategies

If "database" or "data" or "storage" in $ARGUMENTS:
  Reference: @.claude/skills/database-patterns/SKILL.md

  The skill provides:
  - Schema design principles
  - Query optimization
  - Migration strategies

Else:
  Reference: @.claude/skills/general-development-patterns/SKILL.md

  The skill provides:
  - General best practices
  - Code organization
  - Testing strategies

## Step 3: Implement with Selected Patterns
Apply domain-specific patterns:
1. Follow structural guidance from skill
2. Apply security considerations
3. Implement error handling
4. Add appropriate tests
5. Document following skill standards

## Step 4: Verify Against Skill
Check implementation against selected skill criteria:
- Pattern compliance: [✓/✗]
- Security requirements: [✓/✗]
- Performance considerations: [✓/✗]
- Test coverage: [✓/✗]
- Documentation: [✓/✗]
```

## スキル階層参照テンプレート

```markdown
---
description: [Task with general and specific knowledge needs]
---

# [Command Name]

Target: $ARGUMENTS

## Step 1: Load Foundation Skill
Reference: @.claude/skills/foundation-skill/SKILL.md

Apply general principles:
- [General principle 1]
- [General principle 2]
- [General principle 3]

## Step 2: Load Language Skill
Reference: @.claude/skills/language-specific-skill/SKILL.md

Apply language patterns:
- [Language pattern 1]
- [Language pattern 2]

## Step 3: Load Framework Skill
Reference: @.claude/skills/framework-specific-skill/SKILL.md

Apply framework patterns:
- [Framework pattern 1]
- [Framework pattern 2]

## Step 4: Apply Hierarchically
Layer knowledge from general to specific:
- Level 1 (Foundation): [General structure]
- Level 2 (Language): [Language-specific implementation]
- Level 3 (Framework): [Framework-specific details]

## Step 5: Implement
Create implementation combining all levels

## Step 6: Verify All Levels
Check compliance at each level:
- Foundation: [Criteria]
- Language: [Criteria]
- Framework: [Criteria]
```

## チェックリスト

コマンドにスキル参照を追加する際の確認項目:

### スキル選択
- [ ] スキルのドメインがタスクに合致している
- [ ] スキルが必要な知識レベルを提供している
- [ ] スキルが最新のベストプラクティスを含んでいる

### 参照構文
- [ ] 正しい形式を使用: `@.claude/skills/skill-name/SKILL.md`
- [ ] "Reference skill for [purpose]" で目的を明示
- [ ] "The skill provides:" でリスト化

### 知識適用
- [ ] スキルガイダンスの適用方法を明確に記述
- [ ] 段階的な適用ステップを定義
- [ ] 具体的な実装例を含む

### 検証
- [ ] スキル基準に対する明示的な検証を含む
- [ ] チェックリスト形式で検証項目を列挙
- [ ] 不合格時の対処を定義

### 統合（複数スキル使用時）
- [ ] スキル間の統合ポイントを明確化
- [ ] 競合する推奨事項の解決方法を定義
- [ ] 優先順位を明示

## ベストプラクティス

1. **明確な参照**: `Reference: @.claude/skills/skill-name/SKILL.md` 形式
2. **提供内容の列挙**: "The skill provides:" で具体的にリスト化
3. **段階的適用**: "Based on skill guidance:" で適用開始を明示
4. **明示的検証**: "Check against skill criteria:" でチェックリスト化
5. **統合戦略**: 複数スキル使用時は優先順位を明示

## よくある間違い

❌ **悪い例**:
```markdown
Use the skill documentation
```

✅ **良い例**:
```markdown
Reference skill for component design:
- @.claude/skills/react-patterns/SKILL.md

The skill provides:
- Component structure patterns
- State management strategies
- Performance optimization
```

❌ **悪い例**:
```markdown
Follow the patterns (どのパターン?)
```

✅ **良い例**:
```markdown
Based on skill guidance:
1. Use functional components (modern React pattern)
2. Apply hooks for state (useState, useReducer)
3. Memoize expensive calculations (useMemo)
```

❌ **悪い例**:
```markdown
Make sure it's good (曖昧)
```

✅ **良い例**:
```markdown
Check against skill criteria:
- Structure: ✓ Functional component pattern
- Naming: ✓ PascalCase for component
- Types: ✓ TypeScript coverage 100%
- Tests: ✓ Coverage >80%
```

## 関連リソース

- `command-to-skill-patterns.md`: 詳細なパターン説明
- `trinity-architecture.md`: アーキテクチャ全体像
- `composite-workflows.md`: 完全統合ワークフロー例
