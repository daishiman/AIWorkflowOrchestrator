# ログ集約ガイド

## ログ集約の必要性

分散システムでは、複数のサーバー・コンテナからログを集約して
一元管理する必要があります。

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ App 1   │     │ App 2   │     │ App 3   │
│ Server  │     │ Server  │     │ Server  │
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
                     ▼
           ┌─────────────────┐
           │ Log Aggregator  │
           │ (ELK/Datadog/   │
           │  CloudWatch)    │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ 検索・分析・    │
           │ アラート        │
           └─────────────────┘
```

## ログ集約オプション

### ELK Stack (Elasticsearch, Logstash, Kibana)

**特徴**:
- オープンソース
- 高度な検索・分析機能
- オンプレミス運用可能

**構成**:
```
App → Filebeat → Logstash → Elasticsearch → Kibana
```

**Filebeat設定** (`filebeat.yml`):
```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/*.log
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "myapp-%{+yyyy.MM.dd}"
```

### Datadog

**特徴**:
- SaaS、管理不要
- APM統合
- リッチなダッシュボード

**Agent設定** (`datadog.yaml`):
```yaml
logs_enabled: true

logs_config:
  container_collect_all: true
```

**カスタムログ設定** (`conf.d/myapp.d/conf.yaml`):
```yaml
logs:
  - type: file
    path: /var/log/myapp/*.log
    service: myapp
    source: nodejs
    sourcecategory: app
```

### AWS CloudWatch Logs

**特徴**:
- AWSネイティブ統合
- 低コスト
- Lambda連携

**CloudWatch Agent設定**:
```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/myapp/*.log",
            "log_group_name": "myapp",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S"
          }
        ]
      }
    }
  }
}
```

### Grafana Loki

**特徴**:
- 軽量
- Grafana統合
- ラベルベース検索

**Promtail設定** (`promtail.yaml`):
```yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: myapp
    static_configs:
      - targets:
          - localhost
        labels:
          job: myapp
          __path__: /var/log/myapp/*.log
```

## アプリケーション側の実装

### Winston + 外部サービス

```javascript
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    // ファイル出力
    new winston.transports.File({
      filename: 'logs/app.log'
    }),
    // Elasticsearch送信
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: 'http://elasticsearch:9200'
      },
      indexPrefix: 'myapp'
    })
  ]
});
```

### Pino + HTTP送信

```javascript
const pino = require('pino');
const pinoHttp = require('pino-http');

// HTTP経由でログ送信
const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: './logs/app.log' }
    },
    {
      target: 'pino-datadog-transport',
      options: {
        ddClientConf: {
          authMethods: {
            apiKeyAuth: process.env.DD_API_KEY
          }
        }
      }
    }
  ]
});

const logger = pino(transport);
```

### 構造化ログフォーマット

```javascript
// 推奨フォーマット
const logEntry = {
  timestamp: new Date().toISOString(),
  level: 'info',
  service: 'myapp',
  version: '1.0.0',
  host: os.hostname(),
  pid: process.pid,

  // リクエストコンテキスト
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,

  // ログ内容
  message: 'User logged in',
  event: 'user.login',
  duration: 150,

  // エラー情報（該当する場合）
  error: {
    name: err.name,
    message: err.message,
    stack: err.stack
  }
};
```

## ログフィルタリングとサンプリング

### ログレベルフィルタリング

```javascript
// 本番環境ではinfo以上のみ
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // ...
});
```

### サンプリング

```javascript
// 高頻度ログのサンプリング
const sampleRate = 0.1; // 10%のみ記録

function logWithSampling(level, message, meta) {
  if (Math.random() < sampleRate) {
    logger.log(level, message, { ...meta, sampled: true });
  }
}
```

### 動的ログレベル

```javascript
// 環境変数で動的変更
process.on('SIGUSR2', () => {
  const newLevel = logger.level === 'info' ? 'debug' : 'info';
  logger.level = newLevel;
  logger.info(`Log level changed to: ${newLevel}`);
});
```

## ログ検索クエリ例

### Elasticsearch (Kibana)

```
# エラーログ検索
level:error AND service:myapp

# 特定ユーザーの行動
userId:12345 AND event:*

# レスポンス遅延
duration:>1000 AND service:api

# 時間範囲指定
@timestamp:[2025-01-15T00:00:00 TO 2025-01-15T23:59:59]
```

### CloudWatch Logs Insights

```sql
-- エラー数集計
fields @timestamp, @message
| filter level = 'error'
| stats count() by bin(1h)

-- 遅いリクエスト
fields @timestamp, duration, path
| filter duration > 1000
| sort duration desc
| limit 20
```

### Loki (LogQL)

```
# サービス別エラー
{service="myapp"} |= "error"

# JSON解析
{service="myapp"} | json | level="error"

# 集計
sum by (level) (rate({service="myapp"}[5m]))
```

## アラート設定

### Elasticsearch Watcher

```json
{
  "trigger": {
    "schedule": { "interval": "1m" }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["myapp-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                { "match": { "level": "error" } },
                { "range": { "@timestamp": { "gte": "now-1m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": { "ctx.payload.hits.total": { "gt": 10 } }
  },
  "actions": {
    "notify_slack": {
      "webhook": {
        "url": "https://hooks.slack.com/services/xxx"
      }
    }
  }
}
```

### CloudWatch Alarms

```json
{
  "AlarmName": "HighErrorRate",
  "MetricName": "ErrorCount",
  "Namespace": "MyApp",
  "Statistic": "Sum",
  "Period": 60,
  "EvaluationPeriods": 5,
  "Threshold": 10,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": ["arn:aws:sns:ap-northeast-1:xxx:alerts"]
}
```

## コスト最適化

### 保持期間の最適化

| ログタイプ | 推奨保持期間 |
|-----------|-------------|
| デバッグログ | 3-7日 |
| アプリログ | 30-90日 |
| 監査ログ | 1-7年 |
| セキュリティログ | 1-7年 |

### データ圧縮

```yaml
# Elasticsearch ILM (Index Lifecycle Management)
PUT _ilm/policy/myapp-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_size": "50GB", "max_age": "1d" }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "forcemerge": { "max_num_segments": 1 },
          "shrink": { "number_of_shards": 1 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {}
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": { "delete": {} }
      }
    }
  }
}
```
