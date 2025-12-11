# 並列実行テンプレート

```markdown
---
description: [Parallel workflow]
---

# [command]

## Parallel Phase

Branch A: `/cmd-a $1` → a_result
Branch B: `/cmd-b $2` → b_result
Branch C: `/cmd-c $3` → c_result

Wait for all.

## Combine

Process results: a_result, b_result, c_result

## Output

[Combined result]
```

## 実例

```markdown
---
description: Run all test suites in parallel
---

# test-all

## Parallel Execution

Branch A: `/test unit` → unit_results
Branch B: `/test integration` → integration_results
Branch C: `/test e2e` → e2e_results

Wait for completion.

## Aggregate

Total: [sum of all tests]
Passed: [count]
Failed: [count]

## Status

If all passed: ✅ PASS
Else: ❌ FAIL
```
