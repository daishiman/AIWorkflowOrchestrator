# インタラクティブパターン

## 概要

ユーザー確認を統合し、破壊的操作の前に明示的な承認を求めるパターン。

## 基本構造

```markdown
---
description: [Command with confirmation]
---

# Destructive Operation

Target: $ARGUMENTS

## Step 1: Show Impact
Display what will be affected:
- Files to delete: [list]
- Data to modify: [summary]

## Step 2: Request Confirmation
Ask: "Proceed with deletion? (yes/no)"

## Step 3: Execute or Cancel
If confirmed:
  Execute operation
Else:
  Cancel and exit
```

## 実装例：安全な削除

```markdown
---
description: Delete files with confirmation
---

# safe-delete

Files: $ARGUMENTS

## Impact Analysis
List files matching pattern:
- Count: [N] files
- Size: [total size]
- Locations: [directories]

## Confirmation
Display warning:
"⚠️ This will permanently delete [N] files ([size])"
"Type 'DELETE' to confirm:"

## Execution
If input == "DELETE":
  Delete files
  Display: "Deleted [N] files"
Else:
  Display: "Cancelled"
  Exit
```

## 確認レベル

### Level 1: Yes/No
```markdown
Proceed? (yes/no)
```

### Level 2: 明示的ワード
```markdown
Type 'CONFIRM' to proceed:
```

### Level 3: ドライラン
```markdown
Run with --dry-run first
Show what would happen
Then ask for confirmation
```

## ベストプラクティス

1. **影響範囲を明示**: 何が変更されるか具体的に表示
2. **デフォルトは安全側**: デフォルト=キャンセル
3. **ドライランオプション**: `--dry-run` で事前確認
4. **アンドゥ可能性**: 可能なら元に戻す方法を提供
