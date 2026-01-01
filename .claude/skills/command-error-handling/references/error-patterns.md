# エラーハンドリングパターン

## パターン1: 早期バリデーション

```markdown
## Validation

If $ARGUMENTS is empty:
Error: "Argument required"
Usage: /command [arg]
Exit

If $1 not in ["valid", "options"]:
Error: "Invalid option: $1"
Valid options: valid, options
Exit
```

## パターン2: Try-Catch相当

```markdown
## Execute Task

Attempt operation

If operation fails:
Log error details
Display user-friendly message
Suggest fix
Exit with error code
```

## パターン3: ロールバック

```markdown
## Backup

Create backup before changes

## Execute

Perform operation

If fails:
Restore from backup
Display: "Rolled back due to error"
Exit
```

## パターン4: 部分的成功

```markdown
## Process Multiple Items

For each item:
Try process
If success: Track success
If fail: Track failure, continue

## Report

Display: "[N] succeeded, [M] failed"
List failed items with reasons
```

## ベストプラクティス

1. **早期検証**: 実行前にすべての前提条件をチェック
2. **明確なメッセージ**: エラー原因と解決方法を提示
3. **ロールバック**: 破壊的操作は必ずロールバック可能に
4. **ログ記録**: デバッグ用に詳細をログ
