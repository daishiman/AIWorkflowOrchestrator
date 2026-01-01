---
name: linting-formatting-automation
description: |
  Code quality and formatting automation specialist. Provides setup, configuration, CI/CD integration, pre-commit hook construction, and editor integration for linters and formatters like ESLint, Prettier, Biome, and Stylelint.

  Anchors:
  • ESLint Official Documentation / Apply: Rule configuration and plugin integration / Purpose: Ensure correct API usage and best practices
  • Prettier Philosophy / Apply: Opinionated formatting decisions / Purpose: Minimize configuration bikeshedding
  • Biome Performance Model / Apply: Rust-based tooling migration / Purpose: Optimize development workflow speed

  Trigger:
  Use when setting up linting/formatting for new projects, integrating code quality checks into CI/CD pipelines, configuring pre-commit hooks for consistent style enforcement, or migrating between linting tools (ESLint to Biome, etc).
  Keywords: eslint, prettier, biome, lint, format, pre-commit, husky, lint-staged, code quality
version: 2.0.0
level: 1
last_updated: 2025-12-31
tags:
  - code-quality
  - automation
  - ci-cd
  - tooling
dependencies:
  - .claude/skills/code-style-guides
  - .claude/skills/ci-cd-pipelines
---

# Linting & Formatting Automation Skill

## Overview

This skill provides expertise in setting up and maintaining automated code quality through linting and formatting tools. It ensures consistent code style and early error detection across projects.

**Key Value Propositions**:

- Automated consistent code style maintenance
- Early detection of potential bugs
- Streamlined code reviews (reduced style discussions)

**When to Apply**: New project setup, CI/CD integration, tool migration, pre-commit hook configuration

## Workflow

### Phase 1: Planning & Assessment

**Purpose**: Determine appropriate tooling strategy

**Actions**:

1. Assess project requirements (language, framework, team size)
2. Choose tool combination (see `references/tool-comparison.md`)
3. Review `references/Level1_basics.md` for foundational concepts

**Decision Points**:

- Simple project with minimal customization needs? → Consider Biome
- Complex project requiring extensive plugin ecosystem? → Consider ESLint + Prettier
- Migration from existing setup? → Review `references/migration-strategies.md`

### Phase 2: Configuration Setup

**Purpose**: Implement chosen tooling strategy

**Task Assignment**:

- For ESLint setup → Use `agents/setup-eslint.md`
- For Prettier setup → Use `agents/setup-prettier.md`
- For Biome setup → Use `agents/setup-biome.md`
- For tool migration → Use `agents/migrate-tools.md`

**Resources**:

- Configuration templates: `assets/`
- Detailed guides: `references/Level2_intermediate.md`

### Phase 3: Integration

**Purpose**: Integrate with development workflow

**Task Assignment**:

- Pre-commit hooks → Use `agents/setup-precommit.md`
- CI/CD pipeline → Use `agents/setup-cicd.md`
- Editor integration → Reference `references/editor-integration.md`

**Resources**:

- GitHub Actions templates: `assets/github-actions-lint.yml`
- Husky configuration: `references/pre-commit-patterns.md`

### Phase 4: Validation & Documentation

**Purpose**: Ensure setup works correctly and team understands it

**Actions**:

1. Run validation tests (commit, PR simulation)
2. Document team guidelines in project README
3. Record completion with `scripts/log_usage.mjs`

## Task Specifications

### Available Tasks (agents/)

| Task              | File                        | When to Use                | Input                  | Output              |
| ----------------- | --------------------------- | -------------------------- | ---------------------- | ------------------- |
| ESLint Setup      | `agents/setup-eslint.md`    | New ESLint configuration   | Project type, language | ESLint config files |
| Prettier Setup    | `agents/setup-prettier.md`  | New Prettier configuration | Style preferences      | Prettier config     |
| Biome Setup       | `agents/setup-biome.md`     | All-in-one solution        | Project requirements   | Biome config        |
| Tool Migration    | `agents/migrate-tools.md`   | Switching tools            | Current/target tools   | Migration plan      |
| Pre-commit Hooks  | `agents/setup-precommit.md` | Commit validation          | Hook requirements      | Husky + lint-staged |
| CI/CD Integration | `agents/setup-cicd.md`      | PR quality gates           | CI platform            | Workflow files      |

## Knowledge References

### Progressive Disclosure Layers

**Level 1 (Basics)**: `references/Level1_basics.md`

- Core concepts and terminology
- Quick start guide
- Common use cases

**Level 2 (Intermediate)**: `references/Level2_intermediate.md`

- Tool comparison and selection criteria
- Configuration patterns
- Pre-commit hook setup

**Level 3 (Advanced)**: `references/Level3_advanced.md`

- Custom rule development
- Performance optimization
- Complex CI/CD integration

**Level 4 (Expert)**: `references/Level4_expert.md`

- Tool migration strategies
- Multi-project standardization
- Enterprise-scale deployment

### Specialized References

- `references/tool-comparison.md`: ESLint vs Prettier vs Biome
- `references/migration-strategies.md`: Moving between tools
- `references/editor-integration.md`: VS Code, JetBrains setup
- `references/troubleshooting.md`: Common issues and solutions
- `references/pre-commit-patterns.md`: Hook configuration patterns

## Scripts

### Execution Scripts

**log_usage.mjs**: Record skill usage for feedback loop

```bash
node scripts/log_usage.mjs --result success --phase "setup" --notes "ESLint configured"
```

**validate-skill.mjs**: Verify skill structure compliance

```bash
node scripts/validate-skill.mjs
```

## Assets (Output Templates)

### Configuration Templates

- `assets/eslint.config.js`: ESLint flat config template
- `assets/.prettierrc.json`: Prettier configuration
- `assets/biome.json`: Biome configuration
- `assets/.eslintrc.legacy.json`: ESLint legacy config (pre-v9)

### Workflow Templates

- `assets/github-actions-lint.yml`: GitHub Actions lint workflow
- `assets/gitlab-ci-lint.yml`: GitLab CI lint job
- `assets/pre-commit-config.json`: Husky + lint-staged setup

### Integration Templates

- `assets/vscode-settings.json`: VS Code recommended settings
- `assets/package-scripts.json`: npm/pnpm script snippets

## Best Practices

### Do's

1. Start with recommended presets, customize incrementally
2. Use caching (`--cache`) for performance
3. Integrate with editor for immediate feedback
4. Make CI checks required before merge
5. Document team-specific overrides

### Don'ts

1. Over-customize beyond recognition (stay close to standards)
2. Abuse `eslint-disable` comments (fix root cause)
3. Engage in formatting debates (accept opinionated defaults)
4. Skip cache configuration (impacts DX significantly)

## Quick Reference

### Tool Selection Decision Tree

```
Need extensive plugins/customization?
├─ Yes → ESLint + Prettier
└─ No → Is performance critical?
    ├─ Yes → Biome
    └─ No → ESLint + Prettier (battle-tested)
```

### Common Commands

```bash
# ESLint
pnpm eslint . --fix
pnpm eslint . --cache --max-warnings 0

# Prettier
pnpm prettier --write .
pnpm prettier --check .

# Biome
pnpm biome check --write .
pnpm biome ci .
```

## Validation Checklist

### Initial Setup

- [ ] Tool installed and configured
- [ ] Scripts added to package.json
- [ ] Editor integration verified
- [ ] Cache directories in .gitignore

### Pre-commit Hooks

- [ ] Husky installed and initialized
- [ ] lint-staged configured
- [ ] Hooks tested locally
- [ ] Team documentation updated

### CI/CD Integration

- [ ] Workflow file created
- [ ] Caching configured
- [ ] PR checks enforced
- [ ] Error reporting clear

## Related Skills

- `.claude/skills/code-style-guides/SKILL.md`: Code style guidelines
- `.claude/skills/clean-code-practices/SKILL.md`: Clean code principles
- `.claude/skills/ci-cd-pipelines/SKILL.md`: CI/CD automation

## Changelog

| Version | Date       | Changes                                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------------------ |
| 2.0.0   | 2025-12-31 | Restructured to 18-skills.md specification with agents/, enhanced references/, and assets/ |
| 1.0.0   | 2025-12-24 | Initial spec alignment                                                                     |
