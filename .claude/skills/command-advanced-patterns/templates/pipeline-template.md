# パイプラインテンプレート

```markdown
---
description: [Pipeline workflow]
---

# [Pipeline Name]

Input: $ARGUMENTS

## Stage 1: [Name]

Execute: `/command-1 $ARGUMENTS`
Output: stage1_result
If fails: Stop pipeline

## Stage 2: [Name]

Execute: `/command-2 stage1_result`
Output: stage2_result
If fails: Stop pipeline

## Stage 3: [Name]

Execute: `/command-3 stage2_result`
Output: final_result

## Summary

Status: [success/failure]
Duration: [time]
```

## 並列実行版

```markdown
## Stage N: Parallel Tasks

Branch A: `/command-a` → result_a
Branch B: `/command-b` → result_b
Branch C: `/command-c` → result_c

Wait for completion.

## Stage N+1: Combine

Merge: result_a, result_b, result_c
```
