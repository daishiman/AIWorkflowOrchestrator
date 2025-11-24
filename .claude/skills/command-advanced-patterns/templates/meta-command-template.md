# メタコマンドテンプレート

```markdown
---
description: Manage and discover commands
---

# cmd

Action: $ARGUMENTS

## List Commands
Scan `.claude/commands/*.md`
Parse YAML frontmatter
Display: | Name | Description |

## Search
If $ARGUMENTS:
  Filter by keyword
  Display matches

## Help
If $ARGUMENTS == "help":
  Show usage guide
```
