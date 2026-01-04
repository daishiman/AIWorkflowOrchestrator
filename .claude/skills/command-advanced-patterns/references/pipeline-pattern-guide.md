# パイプラインパターンガイド

## 概要

パイプラインパターンは、複数のコマンドを連鎖させて統一されたワークフローを実現する高度なパターンです。各コマンドの出力を次のコマンドの入力として使用し、複雑なタスクを段階的に処理します。

## パイプラインの利点

### 1. 再利用性

- 既存のコマンドを組み合わせて新しいワークフローを作成
- 個別コマンドは独立して使用可能

### 2. 保守性

- 各ステップが独立しているため、変更が容易
- 問題の特定と修正が簡単

### 3. 柔軟性

- ステップの追加・削除が容易
- 条件分岐による動的なパイプライン

### 4. テスト容易性

- 各ステップを個別にテスト可能
- パイプライン全体の統合テストも実施可能

## 基本パターン

### 構造

```markdown
---
description: [Pipeline workflow description]
---

# [Pipeline Name]

Input: $ARGUMENTS

## Stage 1: [Stage Name]

Execute: `/command-1 $ARGUMENTS`
Output: stage1_result

## Stage 2: [Stage Name]

Execute: `/command-2 stage1_result`
Output: stage2_result

## Stage 3: [Stage Name]

Execute: `/command-3 stage2_result`
Output: final_result

## Summary

Pipeline completed: [status]
Results: [summary]
```

### 実装例: CI/CDパイプライン

```markdown
---
description: Complete CI/CD pipeline for deployment
---

# Deploy Pipeline

Branch: $ARGUMENTS (default: main)

## Stage 1: Code Quality Check

Execute: `/lint $ARGUMENTS`

Checks:

- ESLint validation
- TypeScript type check
- Prettier formatting

Output: lint_results

If lint_results contains errors:
Stop pipeline
Display errors
Exit with failure

## Stage 2: Test Execution

Execute: `/test unit integration`

Runs:

- Unit tests (Jest)
- Integration tests (Supertest)
- Coverage report

Output: test_results

If test_results.coverage < 80%:
Stop pipeline
Display coverage report
Exit with failure

## Stage 3: Build

Execute: `/build production`

Tasks:

- Clean dist directory
- Compile TypeScript
- Bundle assets
- Generate sourcemaps

Output: build_artifacts

If build fails:
Stop pipeline
Display build errors
Exit with failure

## Stage 4: Security Scan

Execute: `/security-scan build_artifacts`

Checks:

- Dependency vulnerabilities (pnpm audit)
- OWASP checks
- License compliance

Output: security_report

If security_report contains HIGH or CRITICAL:
Stop pipeline
Display vulnerabilities
Exit with failure

## Stage 5: Deploy

Execute: `/deploy staging build_artifacts`

Actions:

- Upload to staging environment
- Run database migrations
- Update configuration
- Restart services

Output: deploy_status

If deploy_status == "success":
Execute: `/smoke-test staging`

## Stage 6: Smoke Tests

Execute: `/smoke-test staging`

Tests:

- Health check endpoint
- Authentication flow
- Critical user journeys

Output: smoke_test_results

If all tests pass:
Display success message
Notify team on Slack
Else:
Rollback deployment
Notify team of failure

## Summary

Pipeline status: [success/failure]
Stages completed: [6/6]
Total time: [duration]
```

## 条件分岐パイプライン

### 構造

```markdown
## Stage N: Conditional Routing

Based on [condition]:

If [condition A]:
Execute: `/command-a`
→ Continue to Stage N+1

Else if [condition B]:
Execute: `/command-b`
→ Skip to Stage N+2

Else:
Execute: `/command-default`
→ Continue to Stage N+1
```

### 実装例: スマートデプロイ

```markdown
---
description: Smart deployment with environment detection
---

# Smart Deploy

Target: $ARGUMENTS

## Stage 1: Environment Detection

Analyze $ARGUMENTS to determine target:

- If "prod" or "production" → production environment
- If "staging" or "stg" → staging environment
- If "dev" or "development" → development environment
- Default → development environment

Output: target_environment

## Stage 2: Pre-deployment Validation

Based on target_environment:

If target_environment == "production":
Requirements:

- All tests must pass
- Security scan required
- Manual approval required
  Execute: `/validate-prod $ARGUMENTS`

Else if target_environment == "staging":
Requirements:

- Tests must pass
- Automated approval
  Execute: `/validate-staging $ARGUMENTS`

Else:
Requirements:

- Basic checks only
  Execute: `/validate-dev $ARGUMENTS`

Output: validation_results

## Stage 3: Deployment Strategy

Based on target_environment:

If target_environment == "production":
Strategy: Blue-green deployment
Execute: `/deploy-blue-green production`

Else if target_environment == "staging":
Strategy: Rolling update
Execute: `/deploy-rolling staging`

Else:
Strategy: Direct deployment
Execute: `/deploy-direct development`

## Stage 4: Verification

Execute: `/verify-deployment target_environment`

## Summary

Environment: [target]
Strategy: [deployment strategy]
Status: [success/failure]
```

## 並列実行パイプライン

### 構造

```markdown
## Stage N: Parallel Execution

Launch in parallel:

Branch A:
Execute: `/command-a`
Output: result_a

Branch B:
Execute: `/command-b`
Output: result_b

Branch C:
Execute: `/command-c`
Output: result_c

Wait for all branches to complete.

## Stage N+1: Synchronization

Combine results:

- result_a
- result_b
- result_c
```

### 実装例: 並列テスト実行

```markdown
---
description: Parallel test execution for faster feedback
---

# Parallel Test Suite

Test types: $ARGUMENTS (default: all)

## Stage 1: Test Preparation

Setup test environment:

- Clean test database
- Reset test data
- Clear cache

Output: test_env_ready

## Stage 2: Parallel Test Execution

Launch 4 parallel test suites:

### Branch A: Unit Tests

Execute: `/test unit --coverage`
Tests: ~500 tests
Expected duration: 30 seconds
Output: unit_test_results

### Branch B: Integration Tests

Execute: `/test integration --parallel`
Tests: ~200 tests
Expected duration: 60 seconds
Output: integration_test_results

### Branch C: E2E Tests

Execute: `/test e2e --headless`
Tests: ~50 tests
Expected duration: 120 seconds
Output: e2e_test_results

### Branch D: Performance Tests

Execute: `/test performance --benchmark`
Tests: ~20 tests
Expected duration: 45 seconds
Output: performance_test_results

**Note**: All branches execute simultaneously

## Stage 3: Wait for Completion

Monitor progress:

- Branch A: [status] [progress%]
- Branch B: [status] [progress%]
- Branch C: [status] [progress%]
- Branch D: [status] [progress%]

Wait for all branches to complete or timeout (5 minutes).

## Stage 4: Results Aggregation

Combine all test results:

Total tests: [unit + integration + e2e + performance]
Passed: [count]
Failed: [count]
Skipped: [count]
Coverage: [percentage]

Failed tests by category:

- Unit: [list]
- Integration: [list]
- E2E: [list]
- Performance: [list]

## Stage 5: Quality Gate

Check aggregate results:

If all tests passed AND coverage >= 80%:
Status: ✅ PASS
Continue to deployment

Else:
Status: ❌ FAIL
Block deployment
Generate failure report

## Summary

Total execution time: [duration] (vs ~255s sequential)
Time saved: [~50-60%]
Status: [PASS/FAIL]
```

## エラーハンドリング

### 早期終了（Fail Fast）

```markdown
## Stage N: [Stage Name]

Execute: `/command-n`

If command fails:
Stop pipeline immediately
Save partial results
Generate error report: - Failed stage: Stage N - Error message: [details] - Logs: [relevant logs]
Notify user
Exit with failure code
```

### 継続実行（Continue on Error）

```markdown
## Stage N: [Stage Name]

Execute: `/command-n`

If command fails:
Log error
Mark stage as failed
Continue to next stage

[After all stages]
If any stage failed:
Display summary of failures
Exit with warning code
```

### リトライ戦略

```markdown
## Stage N: [Stage Name with Retry]

Max retries: 3
Retry delay: 5 seconds

Attempt 1:
Execute: `/command-n`
If success: Continue
If failure: Wait 5s, retry

Attempt 2:
Execute: `/command-n`
If success: Continue
If failure: Wait 5s, retry

Attempt 3:
Execute: `/command-n`
If success: Continue
If failure: Mark stage as failed, stop pipeline
```

## ロールバックパターン

### 自動ロールバック

```markdown
---
description: Deployment with automatic rollback
---

# Safe Deploy

Target: $ARGUMENTS

## Stage 1: Backup Current State

Execute: `/backup-state production`
Output: backup_id

## Stage 2: Deploy New Version

Execute: `/deploy production $ARGUMENTS`
Output: deploy_status

## Stage 3: Health Check

Execute: `/health-check production`

If health check fails:
→ Trigger automatic rollback

## Stage 4: Smoke Tests

Execute: `/smoke-test production`

If smoke tests fail:
→ Trigger automatic rollback

## Stage 5: Monitor (5 minutes)

Monitor key metrics:

- Error rate
- Response time
- CPU/Memory usage

If metrics degrade:
→ Trigger automatic rollback

---

## Rollback Procedure:

If any stage fails:
Execute: `/rollback production backup_id`
Verify rollback success
Notify team of failure
Exit pipeline

## Summary

Deployment: [success/rolled back]
Version: [version]
Status: [healthy/degraded]
```

## パフォーマンス最適化

### 1. ステージのキャッシング

```markdown
## Stage N: [Cacheable Stage]

Check cache for: cache_key_n

If cache hit:
Load cached result
Skip stage execution
Continue to next stage

Else:
Execute: `/command-n`
Store result in cache with key: cache_key_n
Continue to next stage
```

### 2. 並列化可能な判定

```
Stage 1 → Stage 2A (parallel) ↘
                              → Stage 3
       → Stage 2B (parallel) ↗

条件:
- Stage 2A と Stage 2B が独立
- どちらも Stage 1 の出力のみに依存
- Stage 3 は両方の出力を必要とする
```

### 3. トークン効率化

**Before（冗長）**:

```markdown
## Stage 1: Linting

This stage will run the linting process on all JavaScript and TypeScript files.
It will check for code style issues, potential bugs, and best practice violations.
The linting process uses ESLint with our custom configuration.
If any errors are found, the pipeline will stop immediately.
Execute: `/lint`
```

**After（最適化）**:

```markdown
## Stage 1: Lint

Execute: `/lint`
Stops on error.
```

## ベストプラクティス

### 1. 明確なステージ名

```markdown
✓ 良い例:
Stage 1: Code Quality Check
Stage 2: Unit Test Execution
Stage 3: Build Production Assets

✗ 悪い例:
Stage 1: Step 1
Stage 2: Do stuff
Stage 3: More things
```

### 2. 出力の明示的なキャプチャ

```markdown
✓ 良い例:

## Stage 1

Execute: `/lint`
Output: lint_results
Success criteria: No errors

## Stage 2

Input: lint_results
Execute: `/test`

✗ 悪い例:

## Stage 1

Run lint

## Stage 2

Run tests (前のステージとの関係が不明)
```

### 3. エラー処理の明確化

```markdown
✓ 良い例:
If lint_results contains errors:
Stop pipeline
Display errors with file locations
Exit with code 1

✗ 悪い例:
Handle errors somehow
```

### 4. タイムアウトの設定

```markdown
## Stage N: Long-running Task

Execute: `/long-task`
Timeout: 10 minutes

If timeout exceeded:
Cancel task
Log partial results
Mark stage as failed
```

## トラブルシューティング

### 問題: パイプラインが途中で止まる

**症状**: 特定のステージで実行が停止

**診断**:

- ステージのログを確認
- エラーメッセージを検索
- 依存関係を確認

**解決策**:

```markdown
## Stage N: [Failing Stage]

Execute: `/command-n`

Debug mode:
Set verbose logging
Capture full output
Display intermediate results

If still fails:
Add fallback logic
Or skip stage with warning
```

### 問題: パイプラインが遅い

**症状**: 実行時間が長すぎる

**診断**:

- 各ステージの実行時間を測定
- ボトルネックを特定
- 並列化可能なステージを識別

**解決策**:

- 並列実行パターンを適用
- キャッシング戦略を実装
- 不要なステップを削除

## まとめ

パイプラインパターンのキーポイント:

1. **段階的実行**: 複雑なタスクを管理可能なステップに分割
2. **明確な依存関係**: ステージ間の入出力を明示
3. **エラーハンドリング**: 各ステージでの失敗処理を定義
4. **並列化**: 独立したステージを並列実行
5. **ロールバック**: 失敗時の復旧手順を用意

**次のステップ**:

- `meta-command-pattern-guide.md`: メタコマンドパターン
- `interactive-pattern-guide.md`: インタラクティブパターン
- `pipeline-template.md`: パイプラインテンプレート
