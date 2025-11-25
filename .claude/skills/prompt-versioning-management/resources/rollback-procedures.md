# ロールバック手順

## ロールバック戦略の概要

### 戦略の種類

| 戦略 | 速度 | データ影響 | 用途 |
|------|------|----------|------|
| 即座ロールバック | 秒単位 | なし | 重大障害 |
| 段階的ロールバック | 分単位 | 最小 | 部分的問題 |
| 計画的ロールバック | 時間単位 | 管理可能 | 非緊急の問題 |

---

## ロールバックトリガー

### 自動ロールバック条件

```yaml
automatic_rollback:
  triggers:
    critical:  # 即座ロールバック
      - error_rate > 10%
      - availability < 95%
      - p99_latency > 10000ms

    warning:  # アラート + 手動判断
      - error_rate > 5%
      - p95_latency > 3000ms
      - hallucination_rate > 15%

    watch:  # 監視強化
      - error_rate > 2%
      - p50_latency > 1000ms
      - user_complaints > 5

  observation_window: "5 minutes"
  confirmation_window: "2 minutes"
```

### 手動ロールバック判断基準

```markdown
## ロールバック判断フロー

1. 問題の重大度を評価
   - ユーザー影響: 全体 / 一部 / 軽微
   - ビジネス影響: 高 / 中 / 低
   - 修正見込み時間: 短 / 中 / 長

2. 判断マトリックス

   | ユーザー影響 | ビジネス影響 | 修正時間 | アクション |
   |-------------|-------------|---------|-----------|
   | 全体        | 高          | -       | 即座ロールバック |
   | 全体        | 中          | 長      | 即座ロールバック |
   | 一部        | 高          | 長      | 段階的ロールバック |
   | 一部        | 中          | 短      | 修正を試みる |
   | 軽微        | 低          | -       | 次回リリースで修正 |
```

---

## 即座ロールバック

### 手順

```yaml
immediate_rollback:
  step_1:
    name: "問題の確認"
    duration: "< 1 minute"
    actions:
      - confirm error metrics
      - identify affected version
      - notify incident team

  step_2:
    name: "ルーティング切り替え"
    duration: "< 30 seconds"
    actions:
      - switch to previous version
      - verify routing change
      - confirm traffic flow

  step_3:
    name: "検証"
    duration: "< 5 minutes"
    actions:
      - verify error rate decrease
      - check user-facing behavior
      - confirm stability

  step_4:
    name: "事後対応"
    actions:
      - create incident ticket
      - notify stakeholders
      - schedule post-mortem
```

### 実装例（Blue-Green環境）

```bash
#!/bin/bash
# rollback-immediate.sh

echo "=== 即座ロールバック開始 ==="

# 現在のアクティブ環境を確認
CURRENT=$(kubectl get service prompt-service -o jsonpath='{.spec.selector.version}')
echo "現在のバージョン: $CURRENT"

# 前バージョンに切り替え
PREVIOUS="v1.0.0"  # 設定または自動取得
echo "ロールバック先: $PREVIOUS"

# サービス切り替え
kubectl patch service prompt-service -p "{\"spec\":{\"selector\":{\"version\":\"$PREVIOUS\"}}}"

# 確認
echo "切り替え完了。エラー率を監視中..."
./scripts/monitor-errors.sh --duration 5m
```

---

## 段階的ロールバック

### Canary環境でのロールバック

```yaml
gradual_rollback:
  initial_state:
    new_version: 50%
    old_version: 50%

  phase_1:
    name: "トラフィック削減"
    new_version: 25%
    old_version: 75%
    observation: "10 minutes"

  phase_2:
    name: "さらに削減"
    new_version: 5%
    old_version: 95%
    observation: "10 minutes"

  phase_3:
    name: "完全ロールバック"
    new_version: 0%
    old_version: 100%
    action: "remove new version from rotation"
```

### 実装例

```python
# gradual_rollback.py
import time

def gradual_rollback(current_percentage, target_percentage=0, step=10, interval_minutes=5):
    """段階的ロールバックを実行"""

    percentage = current_percentage

    while percentage > target_percentage:
        percentage = max(percentage - step, target_percentage)

        print(f"新バージョンのトラフィックを {percentage}% に設定")
        update_traffic_split(new_version=percentage, old_version=100-percentage)

        if percentage > target_percentage:
            print(f"{interval_minutes}分間メトリクスを監視...")
            metrics = monitor_metrics(duration_minutes=interval_minutes)

            if metrics['error_rate'] > 0.05:
                print("エラー率が高い。即座に完全ロールバック")
                update_traffic_split(new_version=0, old_version=100)
                break

    print("ロールバック完了")
```

---

## フォールバック設計

### フォールバックチェーン

```yaml
fallback_chain:
  primary:
    version: "v2.0.0"
    timeout: 3000ms

  fallback_1:
    version: "v1.5.0"
    timeout: 5000ms
    trigger: "primary_timeout or primary_error"

  fallback_2:
    version: "v1.0.0"  # 最も安定したバージョン
    timeout: 10000ms
    trigger: "fallback_1_error"

  final_fallback:
    action: "return_error_message"
    message: "サービスが一時的に利用できません"
```

### 実装例

```typescript
async function executePrompt(input: string): Promise<string> {
  const versions = ['v2.0.0', 'v1.5.0', 'v1.0.0'];

  for (const version of versions) {
    try {
      const result = await callPromptWithTimeout(version, input, 3000);
      return result;
    } catch (error) {
      console.warn(`${version} failed, trying fallback...`);
      recordFallbackEvent(version, error);
    }
  }

  throw new Error('All prompt versions failed');
}
```

---

## ロールバック後の対応

### 根本原因分析（RCA）

```markdown
## 根本原因分析テンプレート

### 概要
- インシデント日時: YYYY-MM-DD HH:MM
- 影響時間: XX分
- 影響範囲: XXユーザー

### タイムライン
| 時刻 | イベント |
|------|---------|
| HH:MM | 新バージョンデプロイ |
| HH:MM | エラー率上昇を検知 |
| HH:MM | ロールバック実施 |
| HH:MM | 正常復旧確認 |

### 根本原因
[詳細な原因分析]

### 再発防止策
1. [対策1]
2. [対策2]
3. [対策3]

### アクションアイテム
- [ ] [担当者] [タスク] [期限]
```

### 修正版の準備

```yaml
fix_preparation:
  step_1:
    name: "問題の特定"
    actions:
      - analyze logs and metrics
      - reproduce issue in development
      - identify root cause

  step_2:
    name: "修正の開発"
    actions:
      - create fix in development branch
      - add regression tests
      - peer review

  step_3:
    name: "テスト強化"
    actions:
      - add test cases for the bug
      - run full test suite
      - staging validation

  step_4:
    name: "再デプロイ"
    actions:
      - increment patch version
      - more cautious canary (1% start)
      - extended monitoring
```

---

## ロールバック訓練

### 定期訓練スケジュール

```yaml
rollback_drills:
  frequency: "quarterly"

  scenarios:
    - name: "高エラー率シミュレーション"
      trigger: "inject_errors"
      expected_response: "< 5 minutes"

    - name: "レイテンシスパイク"
      trigger: "inject_latency"
      expected_response: "< 10 minutes"

    - name: "部分障害"
      trigger: "partial_outage"
      expected_response: "< 15 minutes"

  evaluation:
    - detection_time
    - decision_time
    - rollback_execution_time
    - communication_quality
```

### 訓練チェックリスト

```markdown
## ロールバック訓練チェックリスト

### 準備
- [ ] 訓練シナリオの選定
- [ ] 関係者への事前通知
- [ ] モニタリングダッシュボード準備
- [ ] 通信チャネルの確認

### 実施
- [ ] 障害シミュレーション開始
- [ ] 検知時間の記録
- [ ] ロールバック判断の記録
- [ ] 実行時間の記録
- [ ] コミュニケーションの評価

### 振り返り
- [ ] 目標時間との比較
- [ ] 改善点の特定
- [ ] ランブックの更新
- [ ] 次回訓練の計画
```

---

## ランブック

### ロールバックランブック

```markdown
# プロンプトロールバック ランブック

## 前提条件
- 本番環境へのアクセス権限
- ロールバック実行権限
- 監視ダッシュボードへのアクセス

## 手順

### 1. 状況確認 (所要時間: 1分)
\`\`\`bash
# エラー率確認
curl -s http://monitoring/api/metrics/error_rate
# 現在のバージョン確認
kubectl get deployment prompt-service -o jsonpath='{.spec.template.metadata.labels.version}'
\`\`\`

### 2. ロールバック実行 (所要時間: 30秒)
\`\`\`bash
# ロールバックスクリプト実行
./scripts/rollback.sh --target v1.0.0
\`\`\`

### 3. 確認 (所要時間: 5分)
\`\`\`bash
# エラー率の低下を確認
./scripts/monitor-errors.sh --duration 5m
\`\`\`

### 4. 通知
- [ ] Slackの#incident チャネルに投稿
- [ ] オンコールエンジニアに連絡

## エスカレーション
- 15分以内に解決しない場合: シニアエンジニアに連絡
- 30分以内に解決しない場合: マネージャーに連絡
```
