# 最適化コマンドテンプレート

```markdown
---
description: [Concise description]
model: haiku  # If simple task
---

# [command]

## Validation
Quick checks
Early exit on error

## Main Task
[Optimized logic]

## Output
Minimal necessary information
```

## トークン最適化例

```markdown
---
description: Create React component
model: haiku
---

# create-component

Name: $ARGUMENTS

## Check
Component exists? → Error

## Create
- Component file
- Test file
- Export in index

## Done
Display: "Created [name]"
```

**特徴**:
- 簡潔なdescription
- Haiku指定（単純タスク）
- 最小限の説明
- 明確な構造
