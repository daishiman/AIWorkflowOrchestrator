# パターン選択ガイド

## 決定フローチャート

```
複雑度は？
├─ 非常に単純（1ステップ）
│  → パターン1: シンプル指示型
│
├─ 中程度（2-5ステップ）
│  → パターン2: ステップバイステップ型
│
├─ 条件分岐あり
│  → パターン3: 条件分岐型
│
└─ 大量の参照データ
   → パターン4: ファイル参照型
```

## パターン1: シンプル指示型

```markdown
---
description: List files in directory
---

# ls-files

List all files in current directory
```

**適用**: 1-2行で完結するタスク

## パターン2: ステップバイステップ型

```markdown
## Step 1: Validate

## Step 2: Execute

## Step 3: Verify
```

**適用**: 明確な順次ステップ

## パターン3: 条件分岐型

```markdown
If $1 == "prod":
[Production flow]
Else:
[Development flow]
```

**適用**: 引数に応じた異なる処理

## パターン4: ファイル参照型

```markdown
Load templates from:

- templates/component.tsx
- templates/test.spec.tsx
```

**適用**: 大量のテンプレートや設定データ
