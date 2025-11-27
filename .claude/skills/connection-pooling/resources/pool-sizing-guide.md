# 接続プールサイジングガイド

## 基本原則

### PostgreSQLの推奨式

```
最適接続数 = (コア数 * 2) + 有効スピンドル数
```

**例**:
- 4コアサーバー、SSD: `(4 * 2) + 1 = 9 接続`
- 8コアサーバー、RAID-10 HDD: `(8 * 2) + 4 = 20 接続`

### サーバーレス環境での考慮

サーバーレスでは、インスタンス数が動的に変化するため：

```
プール合計 = インスタンス数 × インスタンスあたりの接続数 ≤ DB最大接続数
```

**Neonの場合**:
- Free: 最大100接続
- Pro: 最大500接続（プランによる）

**Supabaseの場合**:
- Free: 最大60接続（15 direct + 45 pooled）
- Pro: より多くの接続

## 環境別設定

### 開発環境

```typescript
const devPool = {
  max: 5,              // 最大接続数
  min: 1,              // 最小接続数
  idleTimeoutMillis: 30000,  // 30秒でアイドル接続を解放
  connectionTimeoutMillis: 5000,
};
```

**理由**:
- 開発者は少数
- リソース節約
- 素早いフィードバック

### ステージング環境

```typescript
const stagingPool = {
  max: 20,
  min: 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
};
```

**理由**:
- 本番に近い設定
- パフォーマンステスト可能
- 中程度のリソース

### 本番環境

```typescript
const prodPool = {
  max: 50,            // 負荷に応じて調整
  min: 10,            // 常時接続を維持
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 15000,
};
```

**理由**:
- 高負荷対応
- 接続確立のオーバーヘッド削減
- 安定したパフォーマンス

## プールモードの選択

### Transaction Mode（推奨）

```yaml
mode: transaction

特徴:
  - トランザクション完了後に接続を解放
  - 接続の効率的な共有
  - ほとんどのWebアプリケーションに最適

注意点:
  - PREPARE / EXECUTE は使用不可
  - セッション変数は保持されない
  - LISTEN / NOTIFY は使用不可
```

### Session Mode

```yaml
mode: session

特徴:
  - セッション全体で接続を保持
  - すべてのPostgreSQL機能が使用可能
  - 長いトランザクションに適切

注意点:
  - 接続効率が低い
  - より多くの接続が必要
  - コスト増加
```

### Statement Mode

```yaml
mode: statement

特徴:
  - ステートメント単位で接続を解放
  - 最も効率的な接続共有
  - 単純なクエリに最適

注意点:
  - トランザクションは使用不可
  - 非常に限定的な用途
```

## サイジングの計算例

### Webアプリケーション

```yaml
想定:
  - 同時ユーザー: 1000人
  - リクエスト/秒: 100
  - 平均クエリ時間: 50ms
  - DBサーバー: 4コア

計算:
  # 同時に必要な接続数
  同時クエリ数 = リクエスト/秒 × 平均クエリ時間
              = 100 × 0.05秒
              = 5 接続

  # 余裕を持たせる（2-3倍）
  推奨接続数 = 5 × 3 = 15 接続

設定:
  max: 20
  min: 5
```

### サーバーレス（Lambda）

```yaml
想定:
  - 最大同時Lambda: 100インスタンス
  - DB最大接続: 100
  - プーラー使用: はい（Neon Pooler）

計算:
  # プーラーなしの場合
  必要接続 = 100 Lambda × 1 接続/Lambda = 100 接続（上限到達）

  # プーラーありの場合
  Lambdaあたり1接続でもプーラーが共有

設定:
  # プーラー経由
  max: 1-2（Lambda側）
  # DB側
  max_connections: 100（プーラーで管理）
```

### マイクロサービス

```yaml
想定:
  - サービス数: 5
  - インスタンス/サービス: 3
  - DB最大接続: 100

計算:
  # サービスあたりの接続数
  接続/サービス = 100 / 5 = 20 接続

  # インスタンスあたり
  接続/インスタンス = 20 / 3 ≈ 6-7 接続

設定:
  各サービス:
    max: 7
    min: 2
```

## 動的スケーリング

### 負荷に応じた調整

```typescript
// 動的プールサイジング（概念）
function calculatePoolSize(metrics: {
  activeConnections: number;
  waitingRequests: number;
  avgQueryTime: number;
}) {
  const baseSize = 10;
  const utilizationFactor = metrics.activeConnections / currentMax;

  if (utilizationFactor > 0.8 || metrics.waitingRequests > 5) {
    // プールサイズを増加
    return Math.min(currentMax * 1.5, MAX_ALLOWED);
  }

  if (utilizationFactor < 0.3 && metrics.waitingRequests === 0) {
    // プールサイズを減少
    return Math.max(currentMax * 0.7, MIN_ALLOWED);
  }

  return currentMax;
}
```

## 監視指標

### 監視すべきメトリクス

| メトリクス | 説明 | 閾値 |
|-----------|------|------|
| pool_size | 現在のプールサイズ | - |
| active_connections | アクティブ接続数 | < max * 0.8 |
| idle_connections | アイドル接続数 | > min |
| waiting_clients | 待機中クライアント | 0 |
| total_connections | 累計接続数 | - |
| connection_errors | 接続エラー数 | 0 |

### アラート設定例

```yaml
alerts:
  - name: high_connection_usage
    condition: active_connections / max > 0.9
    severity: warning
    action: notify_team

  - name: connection_exhaustion
    condition: active_connections >= max AND waiting_clients > 0
    severity: critical
    action: notify_oncall

  - name: connection_errors
    condition: connection_errors > 10 per minute
    severity: critical
    action: notify_oncall
```

## チェックリスト

### 初期設定時
- [ ] 環境タイプ（開発/ステージング/本番）を確認
- [ ] DBの最大接続数を確認
- [ ] インスタンス数を把握
- [ ] プーラーの使用を検討
- [ ] タイムアウト値を設定

### パフォーマンス調整時
- [ ] 接続使用率を監視
- [ ] 待機リクエストを確認
- [ ] クエリ時間を分析
- [ ] 接続エラーを確認
- [ ] 必要に応じてサイズ調整

### 障害対応時
- [ ] 現在の接続数を確認
- [ ] アイドル接続を特定
- [ ] 長時間クエリを確認
- [ ] 必要に応じて接続を切断
- [ ] 根本原因を分析
