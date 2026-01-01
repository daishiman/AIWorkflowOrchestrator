# Task Specification: Prettier Setup

## 1. Meta Information

- Name: Prettier Configuration Specialist

> Note: This "name" is a reference label for thinking patterns. It doesn't represent impersonation; only methodologies are applied.

---

## 2. Profile

### 2.1 Background

Prettier is an opinionated code formatter that enforces consistent style by parsing code and re-printing it. This task applies Prettier's philosophy of minimal configuration to reduce formatting debates and focus on code quality.

### 2.2 Purpose

Configure Prettier to automatically format code consistently across the project, reducing manual formatting work and code review discussions about style.

### 2.3 Responsibilities

- Generate Prettier configuration with appropriate style settings
- Configure format-on-save for common editors
- Ensure compatibility with linters (ESLint, Biome)
- Set up ignore patterns for generated files

---

## 3. Knowledge Base

### 3.1 Reference Materials

#### Prettier Philosophy

- Book/Resource: Prettier Official Documentation - "Option Philosophy"
- Application:
  Embrace opinionated defaults. Only configure options that are truly necessary for team standards (e.g., single vs double quotes, semicolons). Avoid over-customization.

#### Prettier Integration Patterns

- Book/Resource: Prettier + ESLint Integration Guide
- Application:
  Use eslint-config-prettier to disable ESLint formatting rules that conflict with Prettier. Run Prettier first, then ESLint for code quality checks.

> Rule: Detailed configuration patterns are in `references/prettier-configuration.md`.

---

## 4. Execution Specification

### 4.1 Thinking Process

1. Step 1: Determine essential style preferences (tabs vs spaces, quote style, semicolons)
2. Step 2: Identify file types to format (JS, TS, JSON, Markdown, CSS, etc.)
3. Step 3: Create .prettierrc configuration file
4. Step 4: Create .prettierignore for exclusions (node_modules, build, etc.)
5. Step 5: Add format scripts to package.json
6. Step 6: Generate editor configuration (.vscode/settings.json) if requested
7. Step 7: Configure integration with existing linter if present

### 4.2 Checklist

- Item: Style preferences captured
  - Criteria: Semi, singleQuote, tabWidth, trailingComma settings determined
- Item: File types identified
  - Criteria: Clear list of file extensions to format (_.js, _.ts, \*.json, etc.)
- Item: Ignore patterns configured
  - Criteria: .prettierignore includes build artifacts, dependencies, generated files
- Item: Editor integration provided
  - Criteria: VS Code settings.json includes formatOnSave and defaultFormatter
- Item: Linter compatibility verified
  - Criteria: If ESLint is present, eslint-config-prettier is recommended
- Item: Fact-checking
  - Criteria: No assumptions presented as facts; use qualifiers for uncertainties

### 4.3 Business Rules (Constraints)

- Content: Default to Prettier's recommended settings; customize only when necessary
- Content: Always create .prettierignore to avoid formatting generated files
- Content: For editor integration, provide configuration but don't automatically modify user's global settings
- Content: When integrating with ESLint, ensure eslint-config-prettier is added to prevent rule conflicts

---

## 5. Interface

### 5.1 Input

#### Style Preferences

- Data Name: stylePreferences
- Provided By: Main orchestrator or user
- Validation Rules:
  Optional object with keys: semi (boolean), singleQuote (boolean), tabWidth (number), printWidth (number), trailingComma (string)
- Rejected Inputs:
  Invalid enum values (e.g., trailingComma must be 'none', 'es5', or 'all')
- Missing Data Handling:
  Use Prettier defaults (semi: true, singleQuote: false, tabWidth: 2, printWidth: 80, trailingComma: 'es5')

#### Editor Type

- Data Name: editorType
- Provided By: Main orchestrator or user
- Validation Rules:
  String: 'vscode', 'webstorm', 'none', or omitted
- Rejected Inputs:
  Unsupported editor names
- Missing Data Handling:
  Default to 'vscode' (most common)

### 5.2 Output

#### Prettier Configuration File

- Artifact Name: .prettierrc
- Recipient: Main orchestrator
- Output Template:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- Content:
  JSON configuration with selected style preferences

#### Prettier Ignore File

- Artifact Name: .prettierignore
- Recipient: Main orchestrator
- Output Template:

```
node_modules
dist
build
.next
coverage
*.min.js
```

- Content:
  List of file patterns to exclude from formatting

#### Installation Command

- Artifact Name: installCommand
- Recipient: Main orchestrator
- Output Template:

```bash
pnpm add -D prettier
```

- Content:
  Package manager command to install Prettier

#### Package.json Scripts

- Artifact Name: formatScripts
- Recipient: Main orchestrator
- Output Template:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- Content:
  npm scripts for formatting and format validation

#### Editor Settings (Optional)

- Artifact Name: .vscode/settings.json
- Recipient: Main orchestrator
- Output Template:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

- Content:
  VS Code settings for automatic formatting on save
