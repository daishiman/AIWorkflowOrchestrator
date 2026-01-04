# Level 1: Domain Modeling Basics

## Overview

This guide covers fundamental domain modeling concepts for beginners. It introduces the core building blocks of domain models and provides practical guidance for identifying and implementing them.

## Core Concepts

### What is Domain Modeling?

Domain modeling is the practice of creating a software representation of a business domain that:

- Uses business terminology (ubiquitous language)
- Reflects business rules and constraints
- Separates business logic from technical concerns
- Makes business concepts explicit in code

### Why Domain Modeling Matters

**Benefits**:

- Code that business experts can understand
- Business rules enforced consistently
- Reduced bugs from invalid states
- Easier maintenance and evolution
- Better communication between technical and business teams

**When to Use**:

- Complex business logic
- Long-lived systems
- Multiple team members
- Frequent requirement changes
- Need for business expert collaboration

## Building Blocks

### 1. Entities

**Definition**: Objects with unique identity that persists over time

**Characteristics**:

- Has identity (ID) that distinguishes it from others
- Identity remains same even if attributes change
- Has lifecycle (created, modified, deleted)
- Mutable (state can change)
- Equality based on identity, not attributes

**How to Identify**:

Ask: "If all attributes were the same, would these be different things?"

- If YES → Entity
- If NO → Value Object

**Examples**:

```typescript
// Customer is an Entity - each customer is unique even with same name
class Customer {
  constructor(
    private readonly id: CustomerId, // Identity
    private name: string, // Can change
    private email: Email, // Can change
  ) {}

  // Two customers with same name are still different customers
  equals(other: Customer): boolean {
    return this.id.equals(other.id); // Compare by ID only
  }
}
```

**Common Mistakes**:

- Using primitive types for identity (use Value Object instead)
- Making everything an entity (many things should be value objects)
- Not protecting entity lifecycle transitions

### 2. Value Objects

**Definition**: Immutable objects that describe characteristics but have no identity

**Characteristics**:

- No unique identity
- Immutable (cannot change)
- Equality based on all attributes
- Interchangeable (two with same values are identical)
- Lightweight

**How to Identify**:

Ask: "Does this describe or measure something?"

- If YES → Probably Value Object
- Does it need identity? If NO → Value Object

**Examples**:

```typescript
// Money is a Value Object - $10 is $10, no unique identity needed
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {
    // Validate in constructor
    if (amount < 0) throw new Error("Money cannot be negative");
  }

  // All operations return new instance (immutability)
  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error("Cannot add different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  // Equality checks all attributes
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }
}

// Email is a Value Object
class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid email format");
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }
}
```

**Common Mistakes**:

- Using primitives instead of value objects (primitive obsession)
- Making value objects mutable
- Not validating in constructor
- Not implementing proper equality

### 3. Aggregates

**Definition**: Cluster of entities and value objects treated as a single unit for data changes

**Characteristics**:

- Has one root entity (aggregate root)
- Root controls access to internal entities
- Maintains consistency within boundary
- Loaded and saved as a unit
- External references only to root

**How to Identify**:

Ask: "What needs to change together in one transaction?"

- Things that must be consistent → Same aggregate
- Things that can be eventually consistent → Different aggregates

**Example**:

```typescript
// Order is Aggregate Root
class Order {
  private constructor(
    private readonly id: OrderId,
    private customerId: CustomerId, // Reference to other aggregate
    private items: OrderItem[], // Internal entities
    private status: OrderStatus,
  ) {
    this.validateInvariants();
  }

  // Factory method ensures valid creation
  static create(customerId: CustomerId): Order {
    return new Order(OrderId.generate(), customerId, [], OrderStatus.Draft);
  }

  // Public method - only way to modify
  addItem(product: Product, quantity: number): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Cannot modify submitted order");
    }
    this.items.push(new OrderItem(product.id, quantity, product.price));
    this.validateInvariants();
  }

  // Invariants enforced after each change
  private validateInvariants(): void {
    if (this.items.length === 0 && this.status !== OrderStatus.Draft) {
      throw new Error("Non-draft order must have items");
    }
    // More invariants...
  }

  // External only sees aggregate root
  submit(): void {
    if (this.items.length === 0) {
      throw new Error("Cannot submit empty order");
    }
    this.status = OrderStatus.Submitted;
  }
}

// OrderItem is internal entity - not exposed outside
class OrderItem {
  constructor(
    private readonly productId: ProductId,
    private quantity: number,
    private readonly unitPrice: Money,
  ) {}

  totalPrice(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
```

**Key Rules**:

1. Small aggregates (1-3 entities) are better
2. Reference other aggregates by ID only
3. One transaction = one aggregate
4. Enforce invariants within aggregate

### 4. Domain Services

**Definition**: Operations that don't naturally belong to an entity or value object

**When to Use**:

- Operation involves multiple aggregates
- Operation is a significant business process
- Operation doesn't naturally fit in any entity

**Example**:

```typescript
// Transfer money between accounts - involves two aggregates
class MoneyTransferService {
  constructor(private accountRepository: AccountRepository) {}

  transfer(from: AccountId, to: AccountId, amount: Money): void {
    // Load both aggregates
    const fromAccount = this.accountRepository.findById(from);
    const toAccount = this.accountRepository.findById(to);

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found");
    }

    // Business logic
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // Save both
    this.accountRepository.save(fromAccount);
    this.accountRepository.save(toAccount);
  }
}
```

**Common Mistakes**:

- Using services for everything (anemic domain model)
- Putting entity logic in services
- Making services stateful

## Practical Workflow

### Step 1: Identify Domain Concepts

1. Review business requirements
2. List all nouns (potential entities/value objects)
3. List all verbs (potential operations)
4. Create ubiquitous language glossary

### Step 2: Classify Concepts

For each concept ask:

1. Does it have identity? → Entity
2. Is it descriptive/measurable? → Value Object
3. Is it an operation? → Service or Entity method

### Step 3: Group into Aggregates

1. Find entities that must change together
2. Pick the most important as aggregate root
3. Keep aggregates small

### Step 4: Define Invariants

1. List "must", "always", "never" rules
2. Determine which aggregate enforces each
3. Validate in constructors and methods

## Quick Reference

### Entity vs Value Object Decision Tree

```
Has unique identity?
├─ YES → Entity
│  └─ Needs tracking over time?
│     ├─ YES → Entity (e.g., Customer, Order)
│     └─ NO → Reconsider if really needs identity
│
└─ NO → Value Object
   └─ Describes or measures?
      ├─ YES → Value Object (e.g., Money, Address)
      └─ NO → Might be a Service
```

### Common Patterns

**Entity Identity Pattern**:

```typescript
class EntityId {
  private constructor(private readonly value: string) {}

  static generate(): EntityId {
    return new EntityId(uuid());
  }

  static fromString(value: string): EntityId {
    return new EntityId(value);
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Value Object Pattern**:

```typescript
class ValueObject {
  constructor(/* readonly fields */) {
    // Validate all invariants in constructor
    this.validate();
  }

  private validate(): void {
    // Throw if invalid
  }

  equals(other: this): boolean {
    // Compare all fields
  }

  // All operations return new instance
  someOperation(): this {
    return new ValueObject(/* new values */);
  }
}
```

**Aggregate Root Pattern**:

```typescript
class AggregateRoot {
  private constructor(/* dependencies */) {
    this.validateInvariants();
  }

  static create(/* params */): AggregateRoot {
    return new AggregateRoot(/* ... */);
  }

  // Public methods for all state changes
  publicOperation(): void {
    // Change state
    this.validateInvariants();
  }

  private validateInvariants(): void {
    // Check all business rules
  }
}
```

## Common Mistakes

### Mistake 1: Primitive Obsession

**Bad**:

```typescript
class Customer {
  constructor(
    public email: string,
    public age: number,
  ) {}
}
```

**Good**:

```typescript
class Customer {
  constructor(
    public email: Email,
    public age: Age,
  ) {}
}

class Email {
  constructor(private value: string) {
    if (!Email.isValid(value)) throw new Error("Invalid email");
  }
}
```

### Mistake 2: Anemic Domain Model

**Bad**:

```typescript
// Just data, no behavior
class Order {
  items: OrderItem[] = [];
  status: string = "draft";
}

// Logic in service
class OrderService {
  addItem(order: Order, item: OrderItem) {
    order.items.push(item);
  }
}
```

**Good**:

```typescript
// Rich domain model
class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = OrderStatus.Draft;

  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Cannot modify submitted order");
    }
    this.items.push(item);
  }
}
```

### Mistake 3: Large Aggregates

**Bad**:

```typescript
// One aggregate contains too much
class Customer {
  orders: Order[] = []; // Don't embed all orders
  addresses: Address[] = [];
  paymentMethods: PaymentMethod[] = [];
  preferences: Preferences;
  // ... many more
}
```

**Good**:

```typescript
// Separate aggregates
class Customer {
  // Reference other aggregates by ID
  constructor(
    private id: CustomerId,
    private name: CustomerName,
    private primaryAddress: Address, // Value object OK
  ) {}
}

class Order {
  constructor(
    private id: OrderId,
    private customerId: CustomerId, // Reference by ID
  ) {}
}
```

## Next Steps

After mastering Level 1 basics, proceed to:

- `Level2_intermediate.md`: Advanced patterns and techniques
- `entity-vs-value-object.md`: Deep dive into classification
- `aggregate-patterns.md`: Common aggregate structures

## Further Reading

- Domain-Driven Design (Eric Evans) - Chapters 5-6
- Implementing Domain-Driven Design (Vaughn Vernon) - Chapters 5-10
- Domain Modeling Made Functional (Scott Wlaschin) - Part 1
