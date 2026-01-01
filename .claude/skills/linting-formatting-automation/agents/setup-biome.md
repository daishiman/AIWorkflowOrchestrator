# Task Specification: Biome Setup

## 1. Meta Information

- Name: Biome Configuration Specialist

> Note: This "name" is a reference label for thinking patterns. It doesn't represent impersonation; only methodologies are applied.

---

## 2. Profile

### 2.1 Background

Biome is a Rust-based all-in-one toolchain that combines linting and formatting with exceptional performance. This task applies Biome's design philosophy of simplicity and speed to set up a unified code quality solution.

### 2.2 Purpose

Configure Biome as a single tool to replace both ESLint and Prettier, providing faster linting and formatting with minimal configuration.

### 2.3 Responsibilities

- Generate Biome configuration (biome.json)
- Enable linting, formatting, and import organization
- Configure rule sets appropriate for the project
- Set up editor integration for real-time feedback

---

## 3. Knowledge Base

### 3.1 Reference Materials

#### Biome Performance Model

- Book/Resource: Biome Official Documentation - "Philosophy"
- Application:
  Leverage Rust-based architecture for fast execution. Use unified toolchain to reduce dependency count and configuration complexity. Enable parallel processing for large codebases.

#### Biome Migration Guide

- Book/Resource: Biome Migration Documentation (ESLint/Prettier)
- Application:
  Map existing ESLint/Prettier rules to Biome equivalents. Use biome migrate command for automated rule translation. Validate that all critical rules are supported.

> Rule: Detailed migration patterns are in `references/biome-migration.md`.

---

## 4. Execution Specification

### 4.1 Thinking Process

1. Step 1: Determine if this is a new setup or migration from ESLint/Prettier
2. Step 2: Identify file types to process (JS, TS, JSX, TSX, JSON)
3. Step 3: Select linter rule sets (recommended, all, or custom)
4. Step 4: Configure formatter options (indentStyle, lineWidth, etc.)
5. Step 5: Enable organizeImports feature
6. Step 6: Generate biome.json configuration
7. Step 7: Add Biome scripts to package.json
8. Step 8: Provide editor integration instructions

### 4.2 Checklist

- Item: Setup type identified
  - Criteria: Confirmed as new setup or migration from existing tools
- Item: File types configured
  - Criteria: Specified which files Biome should process (_.js, _.ts, \*.json, etc.)
- Item: Linter rules enabled
  - Criteria: Selected recommended, all, or custom rule configuration
- Item: Formatter configured
  - Criteria: indentStyle, indentWidth, lineWidth, quoteStyle set
- Item: Import organization enabled
  - Criteria: organizeImports.enabled set to true
- Item: Output verification
  - Criteria: biome.json includes linter, formatter, and organizeImports sections
- Item: Fact-checking
  - Criteria: No unsupported features claimed; check current Biome version capabilities

### 4.3 Business Rules (Constraints)

- Content: Biome has fewer plugins than ESLint; verify required rules are supported before migration
- Content: Start with recommended rules, then customize based on team needs
- Content: Biome's formatter is mostly compatible with Prettier, but some edge cases differ
- Content: Use `biome migrate` command when migrating from ESLint/Prettier configs

---

## 5. Interface

### 5.1 Input

#### Project Type

- Data Name: projectType
- Provided By: Main orchestrator or user
- Validation Rules:
  Object with: language (js/ts), framework (react/vue/none), isMigration (boolean)
- Rejected Inputs:
  Unsupported languages or frameworks
- Missing Data Handling:
  Assume TypeScript + recommended rules; request clarification for framework

#### Style Preferences (Optional)

- Data Name: stylePreferences
- Provided By: Main orchestrator or user
- Validation Rules:
  Optional object with: indentStyle ('space'/'tab'), indentWidth (number), lineWidth (number)
- Rejected Inputs:
  Invalid enum values or out-of-range numbers
- Missing Data Handling:
  Use Biome defaults (indentStyle: 'tab', indentWidth: 2, lineWidth: 80)

### 5.2 Output

#### Biome Configuration File

- Artifact Name: biome.json
- Recipient: Main orchestrator
- Output Template:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDoubleEquals": "error",
        "noDebugger": "error"
      },
      "style": {
        "useConst": "error",
        "noVar": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

- Content:
  Complete Biome configuration with linter, formatter, and import organizer

#### Installation Command

- Artifact Name: installCommand
- Recipient: Main orchestrator
- Output Template:

```bash
pnpm add -D @biomejs/biome
```

- Content:
  Package manager command to install Biome

#### Package.json Scripts

- Artifact Name: biomeScripts
- Recipient: Main orchestrator
- Output Template:

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "ci": "biome ci ."
  }
}
```

- Content:
  npm scripts for linting, formatting, and CI validation

#### Migration Notes (If Applicable)

- Artifact Name: migrationNotes
- Recipient: Main orchestrator
- Output Template:

```markdown
## Migration from ESLint + Prettier

1. Remove old dependencies: `pnpm remove eslint prettier`
2. Remove config files: `.eslintrc.json`, `.prettierrc`
3. Update scripts in package.json
4. Update pre-commit hooks to use Biome
5. Update CI/CD workflows to use `biome ci`

Unsupported rules (if any):

- [List any ESLint rules not available in Biome]
```

- Content:
  Step-by-step migration instructions and list of unsupported rules (if migration)
