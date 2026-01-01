# ロールバック戦略

## 概要

ロールバックは、デプロイ後に問題が発生した際に、
前の安定バージョンに戻すプロセスです。

## ロールバックの種類

### 1. 即時ロールバック

**特徴**: 問題検出後、即座に前バージョンに切り替え

```
問題検出 → ロールバック決定 → 実行 → 確認
   └─────────────────────────────────────┘
            目標: 5分以内
```

**適用場面**:

- 重大なエラー（500エラー急増）
- セキュリティ脆弱性
- データ破損の可能性

### 2. 段階的ロールバック

**特徴**: トラフィックを段階的に前バージョンに戻す

```
100% 新版 → 50% 新版 → 25% 新版 → 0% 新版（完全ロールバック）
```

**適用場面**:

- 一部ユーザーにのみ影響
- パフォーマンス劣化
- 機能的な問題

### 3. 部分ロールバック

**特徴**: 問題のある機能/サービスのみをロールバック

**適用場面**:

- マイクロサービスアーキテクチャ
- 機能フラグで制御可能な場合
- 特定のAPIエンドポイントの問題

## 自動ロールバック

### トリガー条件

```yaml
auto_rollback:
  enabled: true
  triggers:
    # エラー率ベース
    - type: error_rate
      threshold: 5% # 5%以上でロールバック
      window: 5m # 5分間の監視

    # レスポンスタイムベース
    - type: response_time
      threshold: 2000ms # 2秒以上でロールバック
      percentile: p95
      window: 5m

    # ヘルスチェック失敗
    - type: health_check
      consecutive_failures: 3

    # CPU/メモリ使用率
    - type: resource_usage
      cpu_threshold: 90%
      memory_threshold: 90%
```

### 実装例（GitHub Actions）

```yaml
deploy-with-rollback:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy
      id: deploy
      run: |
        railway up
        echo "deployment_id=$(railway status --json | jq -r '.deployment.id')" >> $GITHUB_OUTPUT

    - name: Health Check
      id: health
      continue-on-error: true
      run: |
        for i in {1..10}; do
          if curl -f https://app.example.com/api/health; then
            echo "Health check passed"
            exit 0
          fi
          sleep 10
        done
        echo "Health check failed"
        exit 1

    - name: Rollback on Failure
      if: steps.health.outcome == 'failure'
      run: |
        echo "Rolling back deployment..."
        railway rollback ${{ steps.deploy.outputs.deployment_id }}

    - name: Notify on Rollback
      if: steps.health.outcome == 'failure'
      run: |
        curl -X POST ${{ secrets.DISCORD_WEBHOOK_URL }} \
          -H "Content-Type: application/json" \
          -d '{"content": "🚨 Deployment rolled back due to health check failure"}'
```

## 手動ロールバック

### Railway CLI

```bash
# デプロイ履歴を確認
railway deployments list

# 特定のデプロイにロールバック
railway rollback <deployment-id>

# 最新の成功デプロイにロールバック
railway rollback --latest-success
```

### Railway Dashboard

```
1. Railway Dashboard にアクセス
2. プロジェクト → サービスを選択
3. Deployments タブ
4. ロールバック先のデプロイを選択
5. "Rollback to this deployment" をクリック
```

## ロールバック手順書

### 事前準備

```markdown
## ロールバック手順書

### 1. 判断基準

- [ ] エラー率が5%を超えた
- [ ] レスポンスタイムが2秒を超えた
- [ ] ヘルスチェックが3回連続失敗
- [ ] ユーザーからの重大な報告

### 2. 権限確認

- 実行者: [名前]
- 承認者: [名前]（必要な場合）

### 3. 実行手順

1. 状況確認
   - エラーログの確認
   - メトリクスダッシュボードの確認

2. ロールバック実行
   - Railway Dashboard でロールバック
   - または: `railway rollback <deployment-id>`

3. 確認
   - ヘルスチェック確認
   - エラー率の正常化確認
   - 主要機能の動作確認

### 4. 事後対応

- [ ] 障害報告書の作成
- [ ] 根本原因の調査
- [ ] 再発防止策の検討
```

### ロールバック後のチェックリスト

```markdown
## ロールバック後チェックリスト

### 即時確認（5分以内）

- [ ] ヘルスチェックが成功
- [ ] エラー率が正常化
- [ ] 主要APIの応答確認

### 短期確認（30分以内）

- [ ] ログにエラーがないこと
- [ ] メトリクスが安定
- [ ] ユーザー報告の減少

### 中期確認（24時間以内）

- [ ] 障害報告書の完成
- [ ] 根本原因の特定
- [ ] 修正計画の策定
```

## データベースを伴うロールバック

### 問題点

デプロイにDBマイグレーションが含まれる場合、
単純なロールバックは危険です。

```
問題のシナリオ:
1. v1.0 → v1.1 デプロイ
2. DBマイグレーション実行（カラム追加）
3. v1.1 で問題発生
4. v1.0 にロールバック
5. ❌ v1.0 は新カラムを認識しない
```

### 解決策

#### 1. 前方互換マイグレーション

```sql
-- 良い例: 新カラムにデフォルト値
ALTER TABLE users ADD COLUMN new_field VARCHAR(255) DEFAULT '';

-- 悪い例: 既存カラムの削除
ALTER TABLE users DROP COLUMN old_field;
```

#### 2. 段階的マイグレーション

```
Phase 1: 新カラム追加（古いコードは無視）
Phase 2: 新コードでデュアルライト
Phase 3: データ移行
Phase 4: 古いカラムの使用停止
Phase 5: 古いカラム削除（別のリリース）
```

#### 3. ロールバックマイグレーション

```sql
-- up migration
CREATE TABLE new_users AS SELECT * FROM users;

-- down migration (ロールバック用)
DROP TABLE IF EXISTS new_users;
```

## ロールバック時間目標

| 種類               | 目標時間 | 説明                 |
| ------------------ | -------- | -------------------- |
| 即時ロールバック   | < 5分    | LB切替、コンテナ切替 |
| 段階的ロールバック | < 15分   | トラフィック調整     |
| DB伴うロールバック | < 30分   | データ整合性確認含む |

## ベストプラクティス

### すべきこと

1. **ロールバック手順の事前テスト**
   - 本番以外の環境で定期的にテスト
   - 手順書の最新化

2. **自動ロールバックの設定**
   - 明確なトリガー条件
   - 通知の設定

3. **DBマイグレーションの前方互換性**
   - 破壊的変更を避ける
   - 段階的な変更

4. **デプロイ履歴の保持**
   - 複数世代のデプロイを保持
   - ロールバック先の選択肢を確保

### 避けるべきこと

1. **テストなしのロールバック**
   - ❌ 事前検証なしで本番ロールバック
   - ✅ ステージングで手順を確認

2. **DBの破壊的変更と同時デプロイ**
   - ❌ カラム削除とコード変更を同時に
   - ✅ 段階的に分離してデプロイ

3. **ロールバック手順の属人化**
   - ❌ 特定の人しかできない
   - ✅ 手順書を整備、複数人が実行可能

## トラブルシューティング

### ロールバックが失敗する

**症状**: ロールバックを実行しても問題が解決しない

**確認事項**:

1. 正しいバージョンにロールバックしているか
2. 環境変数の変更が含まれていないか
3. 外部サービスの依存関係
4. キャッシュの影響

### ロールバック後もエラーが続く

**症状**: 前バージョンに戻しても問題が継続

**可能性**:

1. DBの状態が変わっている
2. 外部サービスの問題
3. キャッシュのクリアが必要
4. 設定変更が別途必要

**対応**:

```bash
# キャッシュクリア
railway run -- pnpm run cache:clear

# 環境変数確認
railway variables

# ログ詳細確認
railway logs --lines 500
```
