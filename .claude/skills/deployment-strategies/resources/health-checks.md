# ヘルスチェック設計

## 概要

ヘルスチェックは、アプリケーションの健全性を確認するための仕組みです。
デプロイ後の検証、ロードバランサーの判断、自動ロールバックに使用されます。

## ヘルスチェックの種類

### 1. Liveness Check（生存確認）

**目的**: プロセスが応答しているかを確認

```typescript
// 最小限のliveness check
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
```

**特徴**:
- 軽量で高速
- 外部依存なし
- 失敗 → プロセス再起動

### 2. Readiness Check（準備確認）

**目的**: トラフィックを受け入れる準備ができているか

```typescript
// readiness check（依存サービスを確認）
app.get('/health/ready', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkCache(),
  ]);

  const allReady = checks.every(c => c.healthy);

  res.status(allReady ? 200 : 503).json({
    status: allReady ? 'ready' : 'not_ready',
    checks
  });
});
```

**特徴**:
- 依存サービスを確認
- 失敗 → トラフィックを停止
- プロセスは継続

### 3. Startup Check（起動確認）

**目的**: アプリケーションが完全に起動したか

```typescript
let isStarted = false;

// 初期化完了後に設定
async function initialize() {
  await loadConfig();
  await warmupCache();
  isStarted = true;
}

app.get('/health/startup', (req, res) => {
  res.status(isStarted ? 200 : 503).json({
    status: isStarted ? 'started' : 'starting'
  });
});
```

**特徴**:
- 起動時のみ使用
- 長い起動時間を許容
- 完了後はreadiness checkに移行

## ヘルスエンドポイント設計

### 基本構造

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: Record<string, CheckResult>;
}

interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
}
```

### 包括的なヘルスエンドポイント

```typescript
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();

  const checks: Record<string, CheckResult> = {};

  // Database check
  checks.database = await checkDatabase();

  // External API check
  checks.externalApi = await checkExternalApi();

  // Memory check
  checks.memory = checkMemory();

  // Determine overall status
  const statuses = Object.values(checks).map(c => c.status);
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

  if (statuses.every(s => s === 'pass')) {
    overallStatus = 'healthy';
  } else if (statuses.some(s => s === 'fail')) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200
    : overallStatus === 'degraded' ? 200
    : 503;

  res.status(statusCode).json(response);
});
```

## チェック項目の実装

### データベースチェック

```typescript
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    await db.raw('SELECT 1');
    return {
      status: 'pass',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: error.message,
    };
  }
}
```

### 外部APIチェック

```typescript
async function checkExternalApi(): Promise<CheckResult> {
  const start = Date.now();
  const timeout = 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('https://api.external.com/health', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    } else {
      return {
        status: 'warn',
        responseTime: Date.now() - start,
        message: `Status: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: error.name === 'AbortError' ? 'warn' : 'fail',
      responseTime: Date.now() - start,
      message: error.message,
    };
  }
}
```

### メモリチェック

```typescript
function checkMemory(): CheckResult {
  const used = process.memoryUsage();
  const heapUsedMB = used.heapUsed / 1024 / 1024;
  const heapTotalMB = used.heapTotal / 1024 / 1024;
  const usage = heapUsedMB / heapTotalMB;

  if (usage > 0.9) {
    return {
      status: 'fail',
      message: `High memory usage: ${(usage * 100).toFixed(1)}%`,
    };
  } else if (usage > 0.75) {
    return {
      status: 'warn',
      message: `Elevated memory usage: ${(usage * 100).toFixed(1)}%`,
    };
  }

  return {
    status: 'pass',
    message: `Memory usage: ${(usage * 100).toFixed(1)}%`,
  };
}
```

## スモークテスト

### 概念

デプロイ後に実行する、主要機能の動作確認テスト。

```
デプロイ完了 → スモークテスト → 成功 → トラフィック受付開始
                    └─→ 失敗 → ロールバック
```

### 実装例

```typescript
interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

async function runSmokeTests(): Promise<SmokeTestResult[]> {
  const tests = [
    { name: 'Homepage loads', fn: testHomepage },
    { name: 'API responds', fn: testApiHealth },
    { name: 'Auth works', fn: testAuthentication },
    { name: 'Database queries', fn: testDatabaseQuery },
  ];

  const results: SmokeTestResult[] = [];

  for (const test of tests) {
    const start = Date.now();
    try {
      await test.fn();
      results.push({
        name: test.name,
        passed: true,
        duration: Date.now() - start,
      });
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        duration: Date.now() - start,
        error: error.message,
      });
    }
  }

  return results;
}

async function testHomepage(): Promise<void> {
  const res = await fetch('https://app.example.com');
  if (!res.ok) throw new Error(`Status: ${res.status}`);
}

async function testApiHealth(): Promise<void> {
  const res = await fetch('https://app.example.com/api/health');
  if (!res.ok) throw new Error(`Status: ${res.status}`);
}
```

## Railway での設定

### railway.json

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### 設定項目

| 項目 | 説明 | 推奨値 |
|------|------|--------|
| healthcheckPath | ヘルスチェックエンドポイント | `/api/health` |
| healthcheckTimeout | タイムアウト秒数 | 30秒 |

### 動作

```
1. 新デプロイが起動
2. healthcheckPath にリクエスト
3. 200レスポンスを確認
4. トラフィックを切り替え
5. 失敗時は旧デプロイを維持
```

## ベストプラクティス

### すべきこと

1. **軽量なエンドポイント**
   - 高速な応答（< 1秒）
   - 最小限の処理

2. **適切なタイムアウト**
   - 依存サービスのタイムアウトを設定
   - 全体のタイムアウトを設定

3. **段階的な確認**
   - liveness → readiness → deep check
   - 用途に応じた使い分け

4. **エラー情報の提供**
   - 失敗時は原因を明示
   - デバッグ情報を含める

### 避けるべきこと

1. **重い処理**
   - ❌ ヘルスチェックで大量のDB操作
   - ✅ 軽量なクエリのみ

2. **キャッシュの影響**
   - ❌ キャッシュされた結果を返す
   - ✅ 毎回実際の状態を確認

3. **認証必須**
   - ❌ ヘルスチェックに認証を要求
   - ✅ 公開エンドポイントとして提供

## トラブルシューティング

### ヘルスチェックが常に失敗

**確認事項**:
1. エンドポイントのパスが正しいか
2. ポート番号が正しいか
3. 起動時間が足りているか
4. 依存サービスが起動しているか

### 間欠的なヘルスチェック失敗

**確認事項**:
1. タイムアウトが短すぎないか
2. 依存サービスの不安定さ
3. リソース不足（CPU、メモリ）
4. ネットワーク遅延

### 対処例

```bash
# ログを確認
railway logs | grep health

# 直接エンドポイントを確認
curl -v https://app.example.com/api/health

# タイムアウトを延長
# railway.json の healthcheckTimeout を増やす
```
