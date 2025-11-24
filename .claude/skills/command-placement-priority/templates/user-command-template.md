# ユーザーコマンドテンプレート

```markdown
---
description: [General-purpose utility]
---

# [Command Name]

## Purpose
Personal utility for [general task]
Works across all projects

## Execution
[Generic steps]

## Configuration
[User-specific settings]
```

## 例

```markdown
---
description: Quick note-taking with timestamp
---

# note

Text: $ARGUMENTS

## Create Note
File: ~/notes/$(date +%Y-%m-%d).md
Append: "[$(date +%H:%M)] $ARGUMENTS"

## Display
Show confirmation with file path
```
