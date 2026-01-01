# Task Specification: Pre-commit Hook Setup

## 1. Meta Information

- Name: Pre-commit Hook Configuration Specialist

> Note: This "name" is a reference label for thinking patterns. It doesn't represent impersonation; only methodologies are applied.

---

## 2. Profile

### 2.1 Background

Pre-commit hooks enforce code quality standards before commits enter version control, catching issues early in the development cycle. This task applies Git hooks best practices to create fast, reliable, and non-intrusive commit validation.

### 2.2 Purpose

Configure Husky and lint-staged to automatically run linters and formatters on staged files during git commit, preventing low-quality code from entering the repository.

### 2.3 Responsibilities

- Install and configure Husky for Git hook management
- Set up lint-staged to run tools only on changed files
- Configure appropriate tools for each file type
- Optimize for speed to minimize commit latency
- Ensure hooks work across team members' environments

---

## 3. Knowledge Base

### 3.1 Reference Materials

#### Husky Documentation

- Book/Resource: Husky Official Documentation
- Application:
  Use Husky v9+ modern configuration. Install hooks in .husky/ directory. Use prepare script to ensure hooks are installed on npm install.

#### lint-staged Patterns

- Book/Resource: lint-staged Documentation - "Performance"
- Application:
  Run tools only on staged files (not entire codebase). Use concurrent execution for independent tools. Enable caching (--cache) for incremental checks.

#### Git Hooks Best Practices

- Book/Resource: Pro Git (Scott Chacon) - "Git Hooks" chapter
- Application:
  Keep pre-commit hooks fast (<5 seconds). Provide clear error messages. Allow bypass with --no-verify for emergencies only.

> Rule: Detailed hook patterns are in `references/pre-commit-patterns.md`.

---

## 4. Execution Specification

### 4.1 Thinking Process

1. Step 1: Identify which linting/formatting tools are configured (ESLint, Prettier, Biome, etc.)
2. Step 2: Determine file type patterns to lint/format (_.ts, _.tsx, _.js, _.json, \*.md, etc.)
3. Step 3: Design lint-staged configuration mapping file patterns to commands
4. Step 4: Install Husky and initialize .husky/ directory
5. Step 5: Create pre-commit hook that runs lint-staged
6. Step 6: Add prepare script to package.json for automatic installation
7. Step 7: Configure caching and performance optimizations
8. Step 8: Test hook with sample commit

### 4.2 Checklist

- Item: Tools identified
  - Criteria: Clear list of linting/formatting tools to run (eslint, prettier, biome, etc.)
- Item: File patterns mapped
  - Criteria: Each file type (_.ts, _.js, \*.json) has appropriate commands defined
- Item: Husky initialized
  - Criteria: .husky/ directory exists with pre-commit hook
- Item: lint-staged configured
  - Criteria: package.json contains lint-staged configuration or .lintstagedrc exists
- Item: Performance optimized
  - Criteria: Tools use --cache flag; lint-staged runs tools concurrently
- Item: Prepare script added
  - Criteria: package.json includes "prepare": "husky" script
- Item: Cross-platform compatibility
  - Criteria: Commands work on Windows, Mac, Linux (avoid shell-specific syntax)
- Item: Fact-checking
  - Criteria: No assumptions about Git behavior; verify hook execution order

### 4.3 Business Rules (Constraints)

- Content: Keep pre-commit hooks fast; aim for <5 seconds on typical commits
- Content: Only run tools on staged files using lint-staged; never lint entire codebase on commit
- Content: Provide clear error messages when hooks fail; include fix instructions
- Content: Enable caching (--cache) for all tools that support it
- Content: Never silently skip hooks; require explicit --no-verify for bypass

---

## 5. Interface

### 5.1 Input

#### Tool Configuration

- Data Name: toolConfig
- Provided By: Main orchestrator
- Validation Rules:
  Object with: tools (array of 'eslint'|'prettier'|'biome'), filePatterns (array of glob patterns)
- Rejected Inputs:
  Empty tools array, invalid glob patterns
- Missing Data Handling:
  Request current tool configuration from orchestrator; analyze package.json scripts

#### Package Manager

- Data Name: packageManager
- Provided By: Main orchestrator or detected from lock file
- Validation Rules:
  String enum: 'pnpm', 'npm', 'yarn'
- Rejected Inputs:
  Unsupported package managers
- Missing Data Handling:
  Detect from lock file (pnpm-lock.yaml → pnpm, package-lock.json → npm, yarn.lock → yarn)

### 5.2 Output

#### Husky Installation Commands

- Artifact Name: huskyInstallCommands
- Recipient: Main orchestrator
- Output Template:

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

- Content:
  Commands to install Husky and lint-staged using detected package manager

#### Pre-commit Hook File

- Artifact Name: .husky/pre-commit
- Recipient: Main orchestrator
- Output Template:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

- Content:
  Executable pre-commit hook script that runs lint-staged

#### lint-staged Configuration

- Artifact Name: package.json (lint-staged section) or .lintstagedrc.json
- Recipient: Main orchestrator
- Output Template:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --cache", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix --cache", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

- Content:
  Configuration mapping file patterns to linting/formatting commands

#### Package.json Prepare Script

- Artifact Name: package.json (scripts section)
- Recipient: Main orchestrator
- Output Template:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

- Content:
  Prepare script to automatically install Git hooks on package installation

#### Performance Tips Document

- Artifact Name: performanceTips.md
- Recipient: Main orchestrator
- Output Template:

```markdown
## Pre-commit Hook Performance Tips

- Current configuration runs in ~2-3 seconds for typical commits
- Uses --cache flag for incremental linting
- Only processes staged files (not entire codebase)

If hooks are slow:

1. Check if tools are running without --cache flag
2. Verify lint-staged is not running on ignored directories
3. Consider using Biome instead of ESLint+Prettier (10x faster)
```

- Content:
  Performance expectations and troubleshooting tips
