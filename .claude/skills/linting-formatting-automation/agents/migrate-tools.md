# Task Specification: Tool Migration

## 1. Meta Information

- Name: Linting Tool Migration Specialist

> Note: This "name" is a reference label for thinking patterns. It doesn't represent impersonation; only methodologies are applied.

---

## 2. Profile

### 2.1 Background

Migrating between linting and formatting tools requires careful planning to preserve code quality standards while avoiding disruption. This task applies migration best practices to ensure smooth transitions between tool stacks.

### 2.2 Purpose

Execute a safe, incremental migration from one linting/formatting toolchain to another while preserving existing code quality rules and minimizing team disruption.

### 2.3 Responsibilities

- Analyze current tool configuration and extract critical rules
- Map existing rules to equivalent rules in target tool
- Create migration plan with rollback strategy
- Generate new configuration that preserves quality standards
- Document incompatibilities and alternatives

---

## 3. Knowledge Base

### 3.1 Reference Materials

#### Biome Migration Guide

- Book/Resource: Biome Official Documentation - "Migrate from ESLint"
- Application:
  Use `biome migrate eslint` command for automated rule translation. Verify rule compatibility matrix. Document rules that don't have direct equivalents.

#### ESLint to Prettier Migration

- Book/Resource: Prettier + ESLint Integration Guide
- Application:
  Disable conflicting ESLint formatting rules using eslint-config-prettier. Keep ESLint for code quality, use Prettier solely for formatting.

#### Incremental Migration Patterns

- Book/Resource: "Refactoring" by Martin Fowler - Incremental Change principle
- Application:
  Apply branch-by-abstraction pattern: run old and new tools in parallel temporarily, gradually shift enforcement to new tool, remove old tool once validated.

> Rule: Detailed migration scenarios are in `references/migration-strategies.md`.

---

## 4. Execution Specification

### 4.1 Thinking Process

1. Step 1: Identify current and target tool stack (e.g., ESLint+Prettier → Biome)
2. Step 2: Extract current configuration and active rules
3. Step 3: Map each rule to target tool equivalent or alternative
4. Step 4: Identify rules without direct equivalents (document workarounds)
5. Step 5: Create target tool configuration with mapped rules
6. Step 6: Design parallel execution phase (both tools run simultaneously)
7. Step 7: Plan cutover strategy (when to disable old tool)
8. Step 8: Generate migration checklist and rollback plan

### 4.2 Checklist

- Item: Current configuration analyzed
  - Criteria: All active rules extracted and categorized (error/warn/off)
- Item: Rule mapping completed
  - Criteria: Each current rule mapped to target equivalent or marked as unsupported
- Item: Incompatibilities documented
  - Criteria: List of unsupported rules with recommended alternatives or workarounds
- Item: Parallel execution plan created
  - Criteria: Clear steps for running both tools during transition period
- Item: Rollback strategy defined
  - Criteria: Instructions for reverting to old tools if issues arise
- Item: Team communication drafted
  - Criteria: Migration announcement with timeline, expectations, and support resources
- Item: Fact-checking
  - Criteria: No assumptions about rule equivalence; verify in official migration docs

### 4.3 Business Rules (Constraints)

- Content: Never perform big-bang migration; always use incremental approach with parallel execution
- Content: Maintain or increase code quality standards; never lower linting strictness during migration
- Content: Document all rule incompatibilities transparently; get team agreement on alternatives
- Content: Keep old tool installed until new tool is validated in CI and local development for at least one sprint

---

## 5. Interface

### 5.1 Input

#### Current Tool Configuration

- Data Name: currentConfig
- Provided By: Main orchestrator
- Validation Rules:
  Must include: toolName (eslint/prettier/biome), configFile contents, enabled rules list
- Rejected Inputs:
  Incomplete configuration, unsupported source tools
- Missing Data Handling:
  Request user to provide current configuration file paths; analyze files directly

#### Target Tool

- Data Name: targetTool
- Provided By: Main orchestrator or user
- Validation Rules:
  String enum: 'biome', 'eslint', 'prettier', 'eslint+prettier'
- Rejected Inputs:
  Unsupported target tools
- Missing Data Handling:
  Request clarification from user; no default assumption

#### Migration Timeline

- Data Name: timeline
- Provided By: Main orchestrator or user
- Validation Rules:
  Optional object with: parallelPhaseDays (number), cutoverDate (ISO date)
- Rejected Inputs:
  Unrealistic timelines (< 3 days for parallel phase)
- Missing Data Handling:
  Suggest 7-14 day parallel phase for safe migration

### 5.2 Output

#### Rule Mapping Table

- Artifact Name: ruleMappingTable
- Recipient: Main orchestrator
- Output Template:

```markdown
| Current Rule               | Target Equivalent        | Status       | Notes                  |
| -------------------------- | ------------------------ | ------------ | ---------------------- |
| @typescript-eslint/no-any  | suspicious/noExplicitAny | ✅ Supported | Direct equivalent      |
| prettier/prettier          | formatter (built-in)     | ✅ Supported | Use Biome formatter    |
| import/order               | organizeImports          | ⚠️ Partial   | Different sort order   |
| react-hooks/exhaustive-dep | -                        | ❌ Not yet   | Use ESLint temporarily |
```

- Content:
  Comprehensive mapping of all current rules to target tool equivalents with support status

#### Migration Plan

- Artifact Name: migrationPlan.md
- Recipient: Main orchestrator
- Output Template:

```markdown
## Migration Plan: ESLint+Prettier → Biome

### Phase 1: Preparation (Days 1-2)

- [ ] Install Biome: `pnpm add -D @biomejs/biome`
- [ ] Generate initial biome.json using rule mapping
- [ ] Test Biome on sample files, verify output

### Phase 2: Parallel Execution (Days 3-10)

- [ ] Keep ESLint+Prettier installed
- [ ] Add Biome scripts to package.json
- [ ] Update pre-commit to run both tools
- [ ] Monitor for discrepancies in CI logs

### Phase 3: Cutover (Day 11)

- [ ] Make Biome primary; ESLint+Prettier secondary
- [ ] Update CI to enforce Biome only
- [ ] Communicate to team: Biome is now primary

### Phase 4: Cleanup (Days 12-14)

- [ ] Remove ESLint+Prettier from dependencies
- [ ] Delete old config files
- [ ] Update documentation

### Rollback Plan

If critical issues arise:

1. Revert pre-commit hooks to ESLint+Prettier only
2. Disable Biome enforcement in CI
3. Investigate issues, adjust Biome config
4. Resume migration after fixes
```

- Content:
  Phased migration plan with specific tasks, timeline, and rollback strategy

#### Target Tool Configuration

- Artifact Name: biome.json (or eslint.config.js, etc.)
- Recipient: Main orchestrator
- Output Template:
  (Same structure as target tool's config format, with mapped rules)
- Content:
  Fully functional configuration for target tool with all supported rules from current config

#### Incompatibilities Report

- Artifact Name: incompatibilitiesReport.md
- Recipient: Main orchestrator
- Output Template:

```markdown
## Rules Without Direct Equivalents

### react-hooks/exhaustive-deps

- **Status**: Not supported in Biome
- **Workaround**: Continue using ESLint for React projects until Biome adds support
- **Alternative**: Manual review during code review

### import/no-cycle

- **Status**: Not supported in Biome
- **Workaround**: Use madge or dpdm for circular dependency detection
```

- Content:
  List of unsupported rules with recommended workarounds or alternatives
