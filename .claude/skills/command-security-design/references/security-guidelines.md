# セキュリティガイドライン

## allowed-tools でツール制限

```yaml
---
description: Safe file viewer
allowed-tools:
  - Read # 読み取りのみ許可
  # Write は意図的に除外
---
```

**用途**: 破壊的操作の防止

## disable-model-invocation

```yaml
---
description: Static template
disable-model-invocation: true
---
```

**用途**: モデル呼び出しなし（セキュリティ向上）

## 入力バリデーション

```markdown
## Validation

If $ARGUMENTS contains dangerous patterns:

- "../" (パストラバーサル)
- "rm -rf" (破壊的コマンド)
  Error and exit
```

## 確認プロンプト

```markdown
## Destructive Operation Warning

Display: "This will delete [N] files"
Ask: "Type 'DELETE' to confirm"

If input != "DELETE":
Cancel and exit
```

## ベストプラクティス

1. 破壊的操作は常に確認
2. allowed-tools で最小権限
3. パス入力は検証
4. --dry-run オプション提供
