# Interface Segregation Skill - Usage Logs

## Overview

このファイルは interface-segregation スキルの使用履歴とフィードバックを記録します。
`scripts/log_usage.mjs` によって自動的に更新されます。

---

## Log Format

各エントリは以下の形式で記録されます：

```markdown
### [YYYY-MM-DD HH:MM:SS] - {{result}}

- **Phase**: {{phase-name}}
- **Task**: {{task-name}}
- **Result**: {{success/failure}}
- **Duration**: {{duration}} minutes
- **Notes**: {{feedback-notes}}
- **Metrics**:
  - {{metric-1}}: {{value}}
  - {{metric-2}}: {{value}}
```

---

## Usage History

### 2025-12-31 - Initialization

- **Phase**: Setup
- **Task**: Skill Structure Initialization
- **Result**: success
- **Notes**: Skill restructured according to 18-skills.md specification
- **Changes**:
  - Created agents/ directory with 3 Task specifications
  - Created EVALS.json for metrics tracking
  - Created LOGS.md for usage history
  - Maintained references/ structure with Level1-4 files
  - Maintained scripts/ and assets/ directories

---

## Improvement Suggestions

<!-- このセクションは使用中に発見された改善点を記録します -->

---

## Common Issues

<!-- このセクションは頻発する問題とその解決策を記録します -->

---

## Best Practices Discovered

<!-- このセクションは使用中に発見されたベストプラクティスを記録します -->
