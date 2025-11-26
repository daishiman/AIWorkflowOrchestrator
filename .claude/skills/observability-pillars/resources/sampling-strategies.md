# サンプリング戦略設計

## サンプリングの必要性

**課題**: すべてのリクエストをログ・トレースで記録するとコストが膨大

**解決**: サンプリング戦略でコストと診断能力をバランス

## サンプリングの種類

### 1. ヘッドベースサンプリング（Head-based Sampling）

**特徴**: リクエスト受信時に記録するか決定

**利点**:
- 実装がシンプル
- リアルタイムで決定可能
- リソース使用量を予測可能

**欠点**:
- エラーリクエストを見逃す可能性
- 重要なリクエストを判別できない

**実装例**:
```typescript
// 10%のリクエストをサンプリング
const shouldSample = Math.random() < 0.10;

if (shouldSample) {
  logger.debug('Request details', { req });
  startTrace(req);
}
```

### 2. テールベースサンプリング（Tail-based Sampling）

**特徴**: リクエスト完了後に記録するか決定

**利点**:
- エラーリクエストは100%記録可能
- レイテンシ等の条件で判断可能
- 重要なリクエストを確実に記録

**欠点**:
- 実装が複雑
- 一時的にすべてのデータを保持する必要
- リアルタイム性が低い

**実装**:
OpenTelemetry Collectorで設定

```yaml
processors:
  tail_sampling:
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow_requests
        type: latency
        latency: {threshold_ms: 1000}
      - name: important_users
        type: string_attribute
        string_attribute: {key: user.tier, values: [premium, enterprise]}
      - name: baseline_sampling
        type: probabilistic
        probabilistic: {sampling_percentage: 1}
```

### 3. 適応的サンプリング（Adaptive Sampling）

**特徴**: システム状態に応じてサンプリング率を動的調整

**利点**:
- 通常時は低サンプリング、問題時は高サンプリング
- リソース使用量を自動最適化
- 診断能力を維持しながらコスト削減

**実装例**:
```typescript
let samplingRate = 0.01; // 初期値: 1%

// エラー率に応じて調整
function updateSamplingRate(errorRate: number) {
  if (errorRate > 0.05) {
    samplingRate = 1.0; // エラー多発時は100%
  } else if (errorRate > 0.01) {
    samplingRate = 0.10; // エラー率やや高時は10%
  } else {
    samplingRate = 0.01; // 正常時は1%
  }
}

// 定期的にエラー率を計算してサンプリング率を調整
setInterval(() => {
  const errorRate = calculateErrorRate();
  updateSamplingRate(errorRate);
}, 60000); // 1分ごと
```

## データタイプ別サンプリング戦略

### ログサンプリング

**基本戦略**:
```
DEBUG: 0% (本番では無効)
INFO: 1-10% (正常イベント)
WARN: 100% (問題の予兆)
ERROR: 100% (必ず記録)
FATAL: 100% (必ず記録)
```

**実装**:
```typescript
function shouldLogInfo(level: LogLevel): boolean {
  if (level === 'WARN' || level === 'ERROR' || level === 'FATAL') {
    return true; // 必ず記録
  }

  if (level === 'INFO') {
    return Math.random() < 0.10; // 10%サンプリング
  }

  if (level === 'DEBUG' && process.env.NODE_ENV === 'production') {
    return false; // 本番では無効
  }

  return true;
}
```

### トレースサンプリング

**基本戦略**:
```
正常リクエスト: 1% (コスト削減)
エラーリクエスト: 100% (診断能力確保)
遅いリクエスト (>1秒): 100% (パフォーマンス調査)
```

**実装**（テールベース）:
```yaml
tail_sampling:
  policies:
    - name: errors
      type: status_code
      status_code: {status_codes: [ERROR]}
    - name: slow_requests
      type: latency
      latency: {threshold_ms: 1000}
    - name: baseline
      type: probabilistic
      probabilistic: {sampling_percentage: 1}
```

### メトリクスサンプリング

**基本戦略**:
メトリクスは軽量なため、通常は100%記録

**高カーディナリティ対策**:
```typescript
// request_idのような高カーディナリティはラベルに含めない
httpRequestDuration.labels({
  method: req.method,      // 低カーディナリティ（10種類程度）
  path: req.route.path,    // 低カーディナリティ（100種類程度）
  status: res.statusCode   // 低カーディナリティ（50種類程度）
  // ❌ request_id: req.request_id  // 高カーディナリティ（数百万種類）
}).observe(duration);
```

## コスト最適化

### ログボリューム削減

**戦略1**: 同一ログの集約
```typescript
const errorCounts = new Map<string, number>();

function logError(errorType: string, context: any) {
  const count = (errorCounts.get(errorType) || 0) + 1;
  errorCounts.set(errorType, count);

  // 10回ごとにログ
  if (count % 10 === 1) {
    logger.error(`Error occurred ${count} times`, { errorType, context });
  }
}
```

**戦略2**: 高頻度イベントのサンプリング
```typescript
// 毎秒1000回発生するイベントは1%のみログ
if (eventType === 'high_frequency' && Math.random() > 0.01) {
  return; // ログをスキップ
}
logger.info('Event', { eventType });
```

### トレースボリューム削減

**戦略1**: エンドポイント別サンプリング
```typescript
const samplingRates = {
  '/health': 0.001,      // ヘルスチェック: 0.1%
  '/metrics': 0.001,     // メトリクス: 0.1%
  '/api/orders': 0.10,   // ビジネスAPI: 10%
  '/api/payments': 1.0   // 重要API: 100%
};

const rate = samplingRates[req.path] || 0.01;
const shouldSample = Math.random() < rate;
```

**戦略2**: ユーザー層別サンプリング
```typescript
// プレミアムユーザーは高サンプリング
const samplingRate = user.tier === 'premium' ? 0.50 : 0.01;
```

## ストレージ最適化

### ログ保持期間

**推奨設定**:
```
DEBUG: 1日
INFO: 7日
WARN: 30日
ERROR: 90日
FATAL: 365日
```

**実装**（Elasticsearch）:
```json
{
  "policy": {
    "phases": {
      "hot": { "min_age": "0ms", "actions": {} },
      "delete": {
        "min_age": "7d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

### トレース保持期間

**推奨設定**:
```
正常トレース: 7日
エラートレース: 30日
```

### メトリクス集約

**推奨設定**:
```
1分粒度: 30日保持
1時間粒度: 90日保持
1日粒度: 365日保持
```

**実装**（Prometheus）:
```yaml
global:
  scrape_interval: 15s

storage:
  tsdb:
    retention.time: 30d
```

## サンプリング効果測定

### 診断能力の測定

**指標**:
- エラー検知率: エラーの何%を捕捉できたか
- 平均診断時間: 問題特定までの時間
- 根本原因特定率: トレースで原因を特定できた割合

**目標**:
```
エラー検知率: > 99% (エラーはほぼ100%記録)
平均診断時間: < 15分
根本原因特定率: > 80%
```

### コスト削減効果

**測定**:
```
ログストレージコスト削減率: (1 - 現在コスト / サンプリング前コスト) × 100%
トレースストレージコスト削減率: 同上
```

**目標**:
```
ログコスト削減: 60-80% (1%サンプリングで)
トレースコスト削減: 90-99% (1%サンプリングで)
診断能力維持: > 95% (エラー100%記録により)
```

## ベストプラクティス

1. **エラー優先**: エラーは常に100%記録
2. **段階的サンプリング**: 通常時は低サンプリング、問題時は高サンプリング
3. **重要度に応じた調整**: ビジネス重要度で差をつける
4. **定期的レビュー**: サンプリング率の妥当性を継続的に評価
5. **コスト監視**: ストレージコストを定期的に確認

## アンチパターン

❌ **すべて100%記録**: コスト爆発
✅ **適応的サンプリング**: 状況に応じて調整

❌ **エラーもサンプリング**: 診断能力低下
✅ **エラーは100%**: 問題を見逃さない

❌ **固定サンプリング率**: 状況変化に対応できない
✅ **動的調整**: システム状態に応じて変化
