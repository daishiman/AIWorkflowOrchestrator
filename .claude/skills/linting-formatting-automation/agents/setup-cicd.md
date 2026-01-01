# Task Specification: CI/CD Integration

## 1. Meta Information

- Name: CI/CD Lint Integration Specialist

> Note: This "name" is a reference label for thinking patterns. It doesn't represent impersonation; only methodologies are applied.

---

## 2. Profile

### 2.1 Background

Integrating linting and formatting checks into CI/CD pipelines creates automated quality gates that prevent low-quality code from being merged. This task applies CI/CD best practices to create fast, reliable, and actionable code quality checks.

### 2.2 Purpose

Configure CI/CD workflows (GitHub Actions, GitLab CI, etc.) to automatically run linting and formatting checks on pull requests, providing quick feedback to developers and preventing regressions.

### 2.3 Responsibilities

- Generate CI/CD workflow files for target platform
- Configure caching for fast execution
- Set up proper error reporting and PR comments
- Ensure workflows fail fast on quality issues
- Optimize for parallel execution and minimal cost

---

## 3. Knowledge Base

### 3.1 Reference Materials

#### GitHub Actions Best Practices

- Book/Resource: GitHub Actions Documentation - "Caching dependencies"
- Application:
  Use actions/cache for node_modules and tool caches (ESLint --cache). Cache key based on package-lock.json hash. Restore cache before running checks.

#### GitLab CI/CD Optimization

- Book/Resource: GitLab CI/CD Documentation - "Pipelines"
- Application:
  Use cache with policy: pull-push for dependencies. Define artifacts for test results. Use needs keyword for job dependencies, not stages.

#### Continuous Integration Patterns

- Book/Resource: "Continuous Delivery" by Jez Humble - "Build Quality In"
- Application:
  Fail fast: run linting before tests. Provide clear error messages in logs. Use non-zero exit codes to block PRs. Report results as PR comments for visibility.

> Rule: Detailed CI/CD patterns are in `references/cicd-integration.md`.

---

## 4. Execution Specification

### 4.1 Thinking Process

1. Step 1: Identify CI/CD platform (GitHub Actions, GitLab CI, CircleCI, etc.)
2. Step 2: Determine which tools to run (ESLint, Prettier, Biome, type checking)
3. Step 3: Design workflow trigger (on PR, on push to main, etc.)
4. Step 4: Configure caching strategy for dependencies and tool caches
5. Step 5: Define job steps (checkout, setup, cache, install, lint, format check)
6. Step 6: Add error reporting (annotations, PR comments)
7. Step 7: Configure required checks for PR merge protection
8. Step 8: Optimize for cost (use appropriate runner, minimize execution time)

### 4.2 Checklist

- Item: Platform identified
  - Criteria: Confirmed as GitHub Actions, GitLab CI, or other supported platform
- Item: Tools to run determined
  - Criteria: Clear list of commands to execute (eslint, prettier, biome, tsc, etc.)
- Item: Trigger configuration set
  - Criteria: Workflow triggers on appropriate events (pull_request, push, etc.)
- Item: Caching configured
  - Criteria: node_modules and tool caches are cached based on lock file hash
- Item: Error reporting set up
  - Criteria: Failed checks show annotations or PR comments with specific errors
- Item: Required checks configured
  - Criteria: Instructions provided for enabling branch protection with required checks
- Item: Cost optimization verified
  - Criteria: Uses appropriate runner size; jobs run in parallel where possible
- Item: Fact-checking
  - Criteria: No assumptions about platform features; verify support in current version

### 4.3 Business Rules (Constraints)

- Content: Always cache dependencies (node_modules) based on lock file hash
- Content: Use cache for tool-specific caches (ESLint --cache) to speed up subsequent runs
- Content: Run lint checks before tests (fail fast on quality issues)
- Content: Provide actionable error messages; include file path and line number
- Content: Never ignore lint failures in CI; always use non-zero exit codes to block PRs

---

## 5. Interface

### 5.1 Input

#### CI/CD Platform

- Data Name: ciPlatform
- Provided By: Main orchestrator or user
- Validation Rules:
  String enum: 'github-actions', 'gitlab-ci', 'circleci', 'azure-pipelines'
- Rejected Inputs:
  Unsupported platforms
- Missing Data Handling:
  Detect from repository structure (.github/ → GitHub Actions, .gitlab-ci.yml → GitLab)

#### Tool Configuration

- Data Name: toolConfig
- Provided By: Main orchestrator
- Validation Rules:
  Object with: linter ('eslint'|'biome'), formatter ('prettier'|'biome'|'none'), typeCheck (boolean)
- Rejected Inputs:
  Conflicting tool combinations
- Missing Data Handling:
  Analyze package.json scripts and devDependencies to infer tool configuration

#### Package Manager

- Data Name: packageManager
- Provided By: Main orchestrator or detected
- Validation Rules:
  String enum: 'pnpm', 'npm', 'yarn'
- Rejected Inputs:
  Unsupported package managers
- Missing Data Handling:
  Detect from lock file presence

### 5.2 Output

#### GitHub Actions Workflow File

- Artifact Name: .github/workflows/code-quality.yml
- Recipient: Main orchestrator
- Output Template:

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Check formatting
        run: pnpm format:check

      - name: Type check
        run: pnpm typecheck
```

- Content:
  Complete GitHub Actions workflow with caching, linting, formatting, and type checking

#### GitLab CI Configuration

- Artifact Name: .gitlab-ci.yml (lint job section)
- Recipient: Main orchestrator
- Output Template:

```yaml
lint:
  stage: test
  image: node:20
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - node_modules/
      - .eslintcache
  before_script:
    - corepack enable
    - pnpm install --frozen-lockfile
  script:
    - pnpm lint
    - pnpm format:check
    - pnpm typecheck
  only:
    - merge_requests
    - main
```

- Content:
  GitLab CI job definition with caching and linting steps

#### Required Checks Configuration Guide

- Artifact Name: required-checks-guide.md
- Recipient: Main orchestrator
- Output Template:

```markdown
## Enabling Required Checks

### GitHub

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select checks: `lint`, `format:check`, `typecheck`
5. Enable "Require branches to be up to date before merging"

### GitLab

1. Go to Settings → Repository → Protected Branches
2. Select `main` branch
3. Enable "Pipelines must succeed"
4. Optional: Enable "All threads must be resolved"
```

- Content:
  Step-by-step guide for configuring required checks on the CI platform

#### Cache Optimization Notes

- Artifact Name: cache-optimization.md
- Recipient: Main orchestrator
- Output Template:

```markdown
## CI Cache Optimization

Current configuration:

- **Dependencies Cache**: Based on pnpm-lock.yaml hash (~500MB, restore in 10-15s)
- **ESLint Cache**: .eslintcache file persisted between runs (saves ~30s)
- **Estimated CI Time**: 2-3 minutes for typical PR

Further optimizations:

- Use `pnpm install --prefer-offline` if cache is available
- Enable Biome instead of ESLint+Prettier (reduces lint time by 70%)
- Split lint/test jobs to run in parallel
```

- Content:
  Current cache configuration and suggestions for further optimization
