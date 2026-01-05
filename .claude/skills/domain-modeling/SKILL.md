---
name: domain-modeling
description: |
  Domain modeling skill for creating accurate representations of business domains through entities, value objects, aggregates, and domain services. Guides systematic analysis of business requirements and translation into robust domain models.

  Anchors:
  • Domain-Driven Design (Eric Evans) / 適用: Entity and Value Object identification / 目的: Clear domain boundaries
  • Implementing Domain-Driven Design (Vaughn Vernon) / 適用: Aggregate design and modeling patterns / 目的: Consistent aggregate boundaries
  • Domain Modeling Made Functional (Scott Wlaschin) / 適用: Type-driven design / 目的: Compile-time domain validation

  Trigger:
  Use when designing domain models, identifying entities and value objects, defining aggregate boundaries, modeling business invariants, creating ubiquitous language, or translating business requirements into domain structures.
  Keywords: domain model, entity, value object, aggregate, domain service, invariant, ubiquitous language, business logic

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Domain Modeling

## Overview

Domain modeling is the practice of creating an accurate representation of a business domain through code structures that reflect business concepts, rules, and invariants. This skill guides you through systematic domain analysis, identification of domain building blocks, and creation of maintainable domain models.

For detailed knowledge and patterns, see references/:

- `references/modeling-fundamentals.md`: 基本概念とパターン

## Workflow

### Phase 1: Domain Analysis

**Goal**: Understand the business domain and identify core concepts

**Actions**:

1. Invoke `agents/domain-analyst.md` task to analyze business requirements
2. Identify domain terminology and create ubiquitous language
3. Map domain concepts to potential entities and value objects
4. Document business invariants and rules

**Input**: Business requirements, domain expert interviews, existing documentation
**Output**: Domain concept map, ubiquitous language glossary

### Phase 2: Model Design

**Goal**: Design domain model structure with entities, value objects, and aggregates

**Actions**:

1. Invoke `agents/model-designer.md` task to design model structure
2. Identify entities (objects with identity and lifecycle)
3. Identify value objects (immutable descriptive objects)
4. Define aggregate boundaries based on transactional consistency
5. Design domain services for operations spanning multiple entities

**Input**: Domain concept map from Phase 1
**Output**: Domain model diagram, entity/value object specifications

**References**:

- See `references/entity-vs-value-object.md` for identification criteria
- See `references/aggregate-patterns.md` for boundary design patterns

### Phase 3: Invariant Definition

**Goal**: Define and enforce business invariants

**Actions**:

1. Invoke `agents/invariant-designer.md` task to define invariants
2. Identify aggregate-level invariants (must be consistent)
3. Identify cross-aggregate invariants (eventual consistency acceptable)
4. Design validation logic within domain model
5. Document invariant enforcement strategy

**Input**: Domain model from Phase 2
**Output**: Invariant specifications, validation rules

### Phase 4: Implementation

**Goal**: Implement domain model with proper structure

**Actions**:

1. Use templates from `assets/` directory:
   - `assets/entity-template.ts` for entities
   - `assets/value-object-template.ts` for value objects
   - `assets/aggregate-root-template.ts` for aggregate roots
   - `assets/domain-service-template.ts` for domain services
2. Implement domain model following type-driven design
3. Ensure all invariants are enforced at compile-time where possible
4. Write unit tests for domain logic

**Input**: Model design and invariant specifications
**Output**: Implemented domain model code

### Phase 5: Validation

**Goal**: Verify domain model correctness and completeness

**Actions**:

1. Run `scripts/validate-domain-model.mjs` to check model structure
2. Verify all business rules are enforced
3. Check aggregate boundaries for consistency
4. Review ubiquitous language alignment
5. Log usage with `scripts/log_usage.mjs`

**Input**: Implemented domain model
**Output**: Validation report, usage metrics

## Task Navigation

### agents/domain-analyst.md

**When to use**: During Phase 1 - Domain Analysis
**Input**: Business requirements, domain documentation
**Output**: Domain concept map, ubiquitous language glossary
**Purpose**: Systematic analysis of business domain to extract core concepts

### agents/model-designer.md

**When to use**: During Phase 2 - Model Design
**Input**: Domain concept map from domain analyst
**Output**: Entity/value object/aggregate specifications
**Purpose**: Transform domain concepts into structured model design

### agents/invariant-designer.md

**When to use**: During Phase 3 - Invariant Definition
**Input**: Domain model design
**Output**: Invariant specifications and validation rules
**Purpose**: Define and document all business invariants and consistency rules

## Best Practices

### Do

- Start with ubiquitous language - use business terms in code
- Make value objects immutable by default
- Enforce invariants at aggregate boundaries
- Keep aggregates small and focused
- Use domain services for operations spanning multiple aggregates
- Make illegal states unrepresentable through types
- Separate domain logic from infrastructure concerns
- Write domain tests using business terminology
- Iterate on model as understanding deepens

### Don't

- Mix technical and domain concerns in domain layer
- Create anemic domain models (pure data structures)
- Allow external code to bypass invariants
- Create large aggregates with complex internal structures
- Use primitive types for domain concepts (use value objects)
- Expose internal aggregate state for modification
- Skip validation in constructors and factory methods
- Couple domain model to persistence mechanisms

## Resource References

### Knowledge Resources

詳細な知識は `references/` に外部化:

| リソース       | パス                                  | 読込条件         |
| -------------- | ------------------------------------- | ---------------- |
| モデリング基礎 | `references/modeling-fundamentals.md` | 設計開始時に参照 |

### Scripts

| スクリプト           | 機能               |
| -------------------- | ------------------ |
| `log_usage.mjs`      | フィードバック記録 |
| `validate-skill.mjs` | スキル構造の検証   |

### Templates

| アセット                     | 用途                       |
| ---------------------------- | -------------------------- |
| `entity-template.ts`         | Entityテンプレート         |
| `value-object-template.ts`   | Value Objectテンプレート   |
| `aggregate-root-template.ts` | Aggregate Rootテンプレート |

## Anti-Patterns to Avoid

**Anemic Domain Model**

- Problem: Domain objects are pure data with no behavior
- Solution: Move business logic into domain entities and value objects

**God Aggregate**

- Problem: Single aggregate managing too many concepts
- Solution: Break into smaller aggregates with clear boundaries

**Primitive Obsession**

- Problem: Using primitive types for domain concepts
- Solution: Create value objects for domain concepts

**Leaky Abstraction**

- Problem: Domain model depends on infrastructure
- Solution: Use dependency inversion, keep domain pure

**Missing Invariants**

- Problem: Business rules not enforced in domain model
- Solution: Validate in constructors, use factory methods

## Examples

### Entity Example

```typescript
// See assets/entity-template.ts for full template
class Order {
  private constructor(
    private readonly id: OrderId,
    private customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {
    this.validateInvariants();
  }

  private validateInvariants(): void {
    if (this.items.length === 0) {
      throw new Error("Order must have at least one item");
    }
  }
}
```

### Value Object Example

```typescript
// See assets/value-object-template.ts for full template
class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### Aggregate Example

```typescript
// See assets/aggregate-root-template.ts for full template
class OrderAggregate {
  // Aggregate root enforces invariants across all entities within boundary
  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Cannot modify submitted order");
    }
    this.items.push(item);
    this.recordEvent(new OrderItemAdded(this.id, item));
  }
}
```

## Verification Checklist

Before completing domain modeling, verify:

- [ ] All domain concepts have corresponding code structures
- [ ] Ubiquitous language is used consistently in code
- [ ] Entities have clear identity and lifecycle management
- [ ] Value objects are immutable
- [ ] Aggregate boundaries are well-defined
- [ ] All business invariants are enforced
- [ ] Domain logic is separated from infrastructure
- [ ] Tests use business terminology
- [ ] Model can express business rules clearly

## Metrics

Track these metrics for continuous improvement:

- Model clarity: Can business experts understand the code?
- Invariant coverage: Are all business rules enforced?
- Test coverage: Are all domain behaviors tested?
- Refactoring frequency: How often does model change?
- Bug rate: How many domain logic bugs occur?

Run `scripts/log_usage.mjs` after each use to track effectiveness.

## Further Reading

詳細なパターンについては `references/modeling-fundamentals.md` を参照。

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-01 | 18-skills.md仕様完全準拠版に再構築 |
| 1.0.0   | 2025-12-31 | 初版作成                           |
