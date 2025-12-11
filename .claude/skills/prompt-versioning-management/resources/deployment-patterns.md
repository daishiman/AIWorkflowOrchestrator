# デプロイパターン

## デプロイ戦略の選択

| 戦略         | リスク | 速度 | 複雑性 | 用途                               |
| ------------ | ------ | ---- | ------ | ---------------------------------- |
| Big Bang     | 高     | 高   | 低     | 開発環境、低リスク変更             |
| Blue-Green   | 低     | 中   | 中     | 本番環境、重要プロンプト           |
| Canary       | 低     | 低   | 高     | 高トラフィック、慎重なロールアウト |
| Feature Flag | 低     | 高   | 中     | 段階的機能リリース                 |

---

## Blue-Green デプロイ

### 概念

```
┌─────────────────┐     ┌─────────────────┐
│  Blue (v1.0.0)  │ ←── │   Load Balancer │
│    [Active]     │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
┌─────────────────┐              │
│ Green (v1.1.0)  │ ←────────────┘ (切替後)
│   [Standby]     │
└─────────────────┘
```

### 実装手順

```yaml
blue_green_deployment:
  phase_1_prepare:
    - name: "Green環境にデプロイ"
      actions:
        - deploy prompt v1.1.0 to green
        - verify deployment success
    - name: "内部テスト"
      actions:
        - run smoke tests on green
        - verify output format
        - check error rates

  phase_2_validate:
    - name: "テストトラフィック"
      actions:
        - route 5% internal traffic to green
        - monitor metrics for 30 minutes
        - compare with blue baseline

  phase_3_switch:
    - name: "トラフィック切り替え"
      actions:
        - switch load balancer to green
        - monitor for anomalies
        - keep blue available for rollback

  phase_4_cleanup:
    - name: "クリーンアップ"
      after: "24 hours stable"
      actions:
        - mark blue as standby
        - update documentation
```

### メリット・デメリット

**メリット**:

- 即座のロールバックが可能
- ダウンタイムなし
- 検証環境と本番が同一

**デメリット**:

- 環境コストが2倍
- データ同期の考慮が必要
- 同時に複数バージョンを維持

---

## Canary デプロイ

### 概念

```
トラフィック分配:

Phase 1:  ████████████████████ 95% → v1.0.0
          █ 5% → v1.1.0

Phase 2:  ███████████████ 75% → v1.0.0
          █████ 25% → v1.1.0

Phase 3:  ██████████ 50% → v1.0.0
          ██████████ 50% → v1.1.0

Phase 4:  ████████████████████ 100% → v1.1.0
```

### 実装手順

```yaml
canary_deployment:
  config:
    initial_percentage: 5
    increment: [5, 25, 50, 100]
    observation_period: "2 hours"
    success_criteria:
      error_rate: "< 1%"
      latency_p95: "< 2000ms"
      hallucination_rate: "< 5%"

  phases:
    - name: "Phase 1: 5%"
      traffic: 5
      duration: "2 hours"
      auto_promote: true
      rollback_if:
        - error_rate > 5%
        - latency_p95 > 3000ms

    - name: "Phase 2: 25%"
      traffic: 25
      duration: "4 hours"
      requires_approval: false

    - name: "Phase 3: 50%"
      traffic: 50
      duration: "8 hours"
      requires_approval: true # 手動承認

    - name: "Phase 4: 100%"
      traffic: 100
      requires_approval: true
```

### モニタリング指標

```yaml
canary_metrics:
  primary:
    - name: error_rate
      threshold: "< 1%"
      window: "5 minutes"

    - name: latency_p95
      threshold: "< 2000ms"
      window: "5 minutes"

  secondary:
    - name: hallucination_rate
      threshold: "< 5%"
      window: "1 hour"

    - name: user_satisfaction
      threshold: "> 4.0/5.0"
      window: "1 hour"

  comparison:
    method: "statistical"
    confidence: 0.95
    baseline: "current_production"
```

---

## Feature Flag デプロイ

### 概念

```javascript
// Feature Flagによるプロンプト切り替え
const getPrompt = (userId, featureFlags) => {
  if (featureFlags.isEnabled("new-prompt-v2", userId)) {
    return loadPrompt("v2.0.0");
  }
  return loadPrompt("v1.0.0");
};
```

### 実装パターン

```yaml
feature_flags:
  new_prompt_v2:
    enabled: true
    rollout_percentage: 25
    target_groups:
      - beta_users
      - internal_testing

    conditions:
      - type: "user_segment"
        values: ["premium", "enterprise"]
      - type: "region"
        values: ["jp", "us"]

    override:
      enabled_for: ["user_123", "user_456"]
      disabled_for: ["user_789"]
```

### 段階的ロールアウト

```yaml
gradual_rollout:
  schedule:
    - date: "2025-04-01"
      percentage: 5
      target: "internal_users"

    - date: "2025-04-08"
      percentage: 20
      target: "beta_users"

    - date: "2025-04-15"
      percentage: 50
      target: "all_users"

    - date: "2025-04-22"
      percentage: 100
      target: "all_users"
      action: "remove_flag" # フラグ削除
```

---

## 環境構成

### 推奨環境フロー

```
Development → Staging → Production
    │            │           │
    │            │           └── 本番環境
    │            │               - Blue/Green または Canary
    │            │               - 完全監視
    │            │
    │            └── ステージング環境
    │                - 本番同等の負荷テスト
    │                - A/Bテスト
    │                - 統合テスト
    │
    └── 開発環境
        - 単体テスト
        - 実験的変更
        - 高速イテレーション
```

### 環境別設定

```yaml
environments:
  development:
    deployment: "big_bang"
    auto_deploy: true
    monitoring: "basic"
    rollback: "manual"

  staging:
    deployment: "blue_green"
    auto_deploy: false
    monitoring: "detailed"
    rollback: "automatic"
    ab_testing: true

  production:
    deployment: "canary"
    auto_deploy: false
    monitoring: "comprehensive"
    rollback: "automatic"
    approval_required: true
```

---

## デプロイ自動化

### CI/CDパイプライン例

```yaml
# .github/workflows/prompt-deploy.yml
name: Prompt Deployment

on:
  push:
    paths:
      - "prompts/**"
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run prompt tests
        run: pnpm run test:prompts

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy-prompt.sh staging

      - name: Run A/B tests
        run: pnpm run test:ab

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy canary (5%)
        run: ./scripts/deploy-canary.sh 5

      - name: Monitor (30 min)
        run: ./scripts/monitor-canary.sh 30

      - name: Promote or rollback
        run: ./scripts/promote-or-rollback.sh
```

---

## デプロイ前チェックリスト

```markdown
## デプロイ前確認事項

### 必須チェック

- [ ] すべてのテストがパス
- [ ] コードレビュー承認済み
- [ ] 変更ログ更新済み
- [ ] ドキュメント同期済み
- [ ] ロールバック手順確認済み

### 推奨チェック

- [ ] 負荷テスト実施済み
- [ ] セキュリティレビュー完了
- [ ] 依存関係の互換性確認
- [ ] モニタリングアラート設定済み

### デプロイ後確認

- [ ] ヘルスチェック正常
- [ ] エラー率が閾値以下
- [ ] レイテンシが許容範囲内
- [ ] ユーザーからの報告なし
```
