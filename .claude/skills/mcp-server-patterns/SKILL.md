---
name: mcp-server-patterns
description: |
  MCP server design patterns and architectural best practices. Provides proven patterns for tool organization, error handling, state management, and server lifecycle management in Model Context Protocol implementations.

  Anchors:
  • Clean Architecture / 適用: Server structure and dependency management / 目的: Maintain testable, maintainable MCP server code
  • Domain-Driven Design / 適用: Tool domain modeling and bounded contexts / 目的: Organize tools by business capability
  • Pragmatic Programmer / 適用: Error handling and resilience patterns / 目的: Build robust MCP servers

  Trigger:
  Use when designing MCP server architecture, organizing tool definitions, implementing error handling patterns, managing server state, structuring MCP server projects, or refactoring existing MCP servers.
  Keywords: mcp server design, tool organization, server patterns, mcp architecture, server lifecycle, state management, error handling mcp
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
tags:
  - mcp
  - architecture
  - design-patterns
  - server-design
dependencies:
  - .claude/skills/mcp-protocol
---

# MCP Server Patterns Skill

## Overview

This skill provides comprehensive design patterns and architectural guidance for building robust, maintainable Model Context Protocol (MCP) servers. It covers server structure, tool organization, error handling, state management, and lifecycle patterns.

## Workflow

### Phase 1: Architecture Design

**Objective**: Define server architecture and tool organization strategy

**Actions**:

1. Review `references/Level1_basics.md` for fundamental server structure patterns
2. Identify tool domains and boundaries (see `references/Level2_intermediate.md`)
3. Select appropriate architectural pattern from `assets/architecture-patterns.md`
4. Launch Task: `agents/architecture-designer.md` for detailed architecture design

**Deliverables**: Architecture diagram, tool domain map, dependency graph

### Phase 2: Implementation Structure

**Objective**: Implement server structure following chosen patterns

**Actions**:

1. Use `assets/server-template/` as project scaffolding
2. Organize tools by domain (see `references/Level3_advanced.md`)
3. Implement error handling patterns from `references/error-patterns.md`
4. Launch Task: `agents/implementation-guide.md` for implementation guidance
5. Run `scripts/validate-server-structure.mjs` to verify structure

**Deliverables**: Implemented server structure, organized tool files, error handlers

### Phase 3: State & Lifecycle Management

**Objective**: Implement state management and server lifecycle handling

**Actions**:

1. Review `references/state-management.md` for state patterns
2. Implement initialization and cleanup patterns from `references/Level4_expert.md`
3. Launch Task: `agents/lifecycle-manager.md` for lifecycle implementation
4. Run `scripts/validate-lifecycle.mjs` to verify lifecycle handling

**Deliverables**: State management implementation, lifecycle hooks, cleanup handlers

### Phase 4: Validation & Documentation

**Objective**: Validate implementation and generate documentation

**Actions**:

1. Run `scripts/validate-server-structure.mjs` for structure validation
2. Run `scripts/validate-lifecycle.mjs` for lifecycle validation
3. Generate documentation using `assets/doc-template.md`
4. Record results with `scripts/log_usage.mjs`

**Deliverables**: Validation report, server documentation

## Task Specifications

### Architecture Designer (`agents/architecture-designer.md`)

**When to use**: Need to design overall server architecture and tool organization

**Input**: Project requirements, tool list, domain boundaries

**Output**: Architecture design document, tool organization plan

**Resources**: Uses `references/Level1_basics.md`, `references/Level2_intermediate.md`, `assets/architecture-patterns.md`

### Implementation Guide (`agents/implementation-guide.md`)

**When to use**: Implementing server structure following architectural patterns

**Input**: Architecture design, tool definitions

**Output**: Implementation plan, code structure, error handling strategy

**Resources**: Uses `references/Level3_advanced.md`, `references/error-patterns.md`, `assets/server-template/`

### Lifecycle Manager (`agents/lifecycle-manager.md`)

**When to use**: Implementing server lifecycle and state management

**Input**: Server implementation, state requirements

**Output**: Lifecycle implementation, state management code

**Resources**: Uses `references/Level4_expert.md`, `references/state-management.md`

## Best Practices

### Do

- Organize tools by domain/capability for better maintainability
- Implement comprehensive error handling with proper MCP error codes
- Use dependency injection for testability
- Separate concerns: transport, business logic, data access
- Implement proper lifecycle management (initialization, cleanup)
- Use TypeScript for type safety in tool schemas
- Follow single responsibility principle for tool definitions
- Implement idempotent operations where possible
- Use structured logging for debugging
- Validate all inputs at tool boundaries

### Avoid

- Mixing business logic with protocol handling
- Coupling tools tightly to specific implementations
- Ignoring error handling or using generic error messages
- Storing mutable state without proper management
- Hardcoding configuration values
- Skipping input validation
- Creating monolithic tool definitions
- Neglecting lifecycle cleanup
- Using any type in TypeScript schemas
- Blocking the event loop with synchronous operations

## Resource References

### References (Progressive Disclosure)

- **Level 1 - Basics**: `references/Level1_basics.md` - Fundamental server structure, basic patterns
- **Level 2 - Intermediate**: `references/Level2_intermediate.md` - Tool organization, domain modeling
- **Level 3 - Advanced**: `references/Level3_advanced.md` - Advanced patterns, scalability
- **Level 4 - Expert**: `references/Level4_expert.md` - Complex scenarios, optimization
- **Error Patterns**: `references/error-patterns.md` - Comprehensive error handling strategies
- **State Management**: `references/state-management.md` - State management patterns and best practices
- **Testing Guide**: `references/testing-patterns.md` - Testing strategies for MCP servers
- **Legacy Content**: `references/legacy-skill.md` - Previous version reference

### Scripts

- `scripts/validate-server-structure.mjs` - Validates server directory structure and organization
  - Usage: `node scripts/validate-server-structure.mjs <server-path>`
  - Exit codes: 0=success, 1=structure errors, 2=argument error

- `scripts/validate-lifecycle.mjs` - Validates lifecycle implementation completeness
  - Usage: `node scripts/validate-lifecycle.mjs <server-path>`
  - Exit codes: 0=success, 1=lifecycle errors, 2=argument error

- `scripts/generate-architecture-docs.mjs` - Generates architecture documentation from server code
  - Usage: `node scripts/generate-architecture-docs.mjs <server-path> [--output <path>]`
  - Exit codes: 0=success, 1=generation errors, 2=argument error

- `scripts/log_usage.mjs` - Records usage and updates metrics
  - Usage: `node scripts/log_usage.mjs --result <success|failure> [--phase <phase>] [--notes <notes>]`
  - Exit codes: 0=success, 1=logging errors, 2=argument error

### Assets

- `assets/architecture-patterns.md` - Catalog of MCP server architectural patterns
- `assets/server-template/` - Complete server project template with best practices
- `assets/tool-template.ts` - TypeScript template for tool definitions
- `assets/error-handler-template.ts` - Error handling implementation template
- `assets/doc-template.md` - Server documentation template

## Quick Start Examples

### Pattern Selection

To select an appropriate architectural pattern:

1. Read `assets/architecture-patterns.md` for pattern catalog
2. Consider:
   - Number of tools (1-5: Simple, 6-20: Modular, 20+: Domain-Driven)
   - Tool complexity (Simple: Flat, Complex: Layered)
   - Team size (Solo: Simple, Team: Modular/Domain-Driven)
3. Launch `agents/architecture-designer.md` for guidance

### Server Structure Validation

```bash
# Validate server structure
node .claude/skills/mcp-server-patterns/scripts/validate-server-structure.mjs ./my-mcp-server

# Validate lifecycle implementation
node .claude/skills/mcp-server-patterns/scripts/validate-lifecycle.mjs ./my-mcp-server

# Generate architecture documentation
node .claude/skills/mcp-server-patterns/scripts/generate-architecture-docs.mjs ./my-mcp-server
```

### Implementation Workflow

1. **Design**: Use `agents/architecture-designer.md` → Architecture document
2. **Structure**: Copy `assets/server-template/` → Customize for your project
3. **Implement**: Follow `agents/implementation-guide.md` → Working server
4. **Lifecycle**: Use `agents/lifecycle-manager.md` → Add lifecycle management
5. **Validate**: Run validation scripts → Ensure compliance
6. **Document**: Use `assets/doc-template.md` → Generate documentation

## Integration with Other Skills

- **mcp-protocol**: Use for protocol-level specifications and tool schema definitions
- **clean-architecture-principles**: Apply for overall architecture design
- **typescript-patterns**: Use for TypeScript-specific implementation patterns

## Metrics & Feedback

This skill tracks usage through `scripts/log_usage.mjs` and maintains metrics in `EVALS.json`. Progress through skill levels as documented in `LOGS.md`.

## Version History

| Version | Date       | Changes                                       |
| ------- | ---------- | --------------------------------------------- |
| 1.0.0   | 2025-12-31 | Initial release with complete skill structure |
