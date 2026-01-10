# ステップバイステップ型テンプレート

```markdown
---
description: [Multi-step task]
---

# [command-name]

Input: $ARGUMENTS

## Step 1: [Validation/Preparation]

Check requirements
Validate inputs

## Step 2: [Main Task]

Execute primary operation

## Step 3: [Post-processing]

Verify results
Clean up

## Step 4: [Output]

Display results
```

## 実例

```markdown
---
description: Create and test React component
---

# create-component

Name: $ARGUMENTS

## Step 1: Validation

Check component doesn't exist
Validate name format

## Step 2: Generate Files

Create component.tsx
Create test.spec.tsx

## Step 3: Run Tests

Execute test suite

## Step 4: Summary

Display: "Created [name] with tests passing"
```
