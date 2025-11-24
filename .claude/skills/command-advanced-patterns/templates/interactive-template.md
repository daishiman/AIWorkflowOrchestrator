# インタラクティブテンプレート

```markdown
---
description: [Operation with confirmation]
---

# [Command Name]

Target: $ARGUMENTS

## Show Impact
Display what will be affected:
- Items: [list]
- Scope: [details]

## Request Confirmation
Ask: "Proceed? Type 'CONFIRM':"

## Execute
If confirmed:
  Execute operation
  Display: "Completed"
Else:
  Display: "Cancelled"
  Exit
```

## ドライラン版

```markdown
## Dry Run
If $ARGUMENTS contains "--dry-run":
  Show what would happen
  Don't execute
  Exit

## Execute
Show impact → Confirm → Execute
```
