---
name: log-rotation-strategies
description: |
  Node.jsアプリケーションのログローテーション戦略を専門とするスキル。
  PM2、logrotate、Winston等を活用した効率的なログ管理を設計します。

  専門分野:
  - PM2ログ管理: pm2-logrotate、ログファイル設定、自動ローテーション
  - ログフォーマット: 構造化ログ、JSON形式、タイムスタンプ
  - ローテーション戦略: サイズベース、時間ベース、ハイブリッド
  - ログ集約: 集中ログ管理、外部サービス連携

  使用タイミング:
  - ログローテーションを設定する時
  - ディスク容量管理を最適化する時
  - ログフォーマットを標準化する時
  - PM2ログ設定を行う時

  Use proactively when configuring log rotation, optimizing disk usage,
  or standardizing log formats across applications.
version: 1.0.0
---

# Log Rotation Strategies

## 概要

ログローテーションは、ディスク容量を管理しながらログを適切に保持するための
重要な運用プラクティスです。アプリケーションの可観測性を維持しつつ、
リソース効率を最適化します。

**主要な価値**:
- ディスク容量の効率的管理
- ログの長期保持と検索性
- アプリケーションパフォーマンスの維持
- コンプライアンス要件への対応

## リソース構造

```
log-rotation-strategies/
├── SKILL.md
├── resources/
│   ├── rotation-patterns.md
│   ├── pm2-logrotate-guide.md
│   └── log-aggregation.md
├── scripts/
│   └── analyze-log-usage.mjs
└── templates/
    └── winston-rotation.template.ts
```

## コマンドリファレンス

### リソース読み取り

```bash
# ローテーションパターンガイド
cat .claude/skills/log-rotation-strategies/resources/rotation-patterns.md

# PM2ログローテーションガイド
cat .claude/skills/log-rotation-strategies/resources/pm2-logrotate-guide.md

# ログ集約ガイド
cat .claude/skills/log-rotation-strategies/resources/log-aggregation.md
```

### スクリプト実行

```bash
# ログ使用量分析
node .claude/skills/log-rotation-strategies/scripts/analyze-log-usage.mjs [log-dir]
```

### テンプレート参照

```bash
# Winstonログローテーションテンプレート
cat .claude/skills/log-rotation-strategies/templates/winston-rotation.template.ts
```

## ワークフロー

### Phase 1: ログ戦略設計

**ローテーション方式の選択**:
| 方式 | 特徴 | 適用シナリオ |
|------|------|-------------|
| サイズベース | ファイルサイズで分割 | 均一なログ量 |
| 時間ベース | 時間間隔で分割 | 時系列分析重視 |
| ハイブリッド | サイズ+時間 | 大規模本番環境 |

**判断基準**:
- [ ] 1日あたりの予想ログ量は？
- [ ] 必要な保持期間は？
- [ ] ディスク容量の制約は？

**リソース**: `resources/rotation-patterns.md`

### Phase 2: PM2ログ設定

**pm2-logrotate設定**:
```bash
# インストール
pm2 install pm2-logrotate

# 設定確認
pm2 conf pm2-logrotate
```

**主要設定項目**:
```bash
pm2 set pm2-logrotate:max_size 10M      # ファイルサイズ上限
pm2 set pm2-logrotate:retain 7          # 保持世代数
pm2 set pm2-logrotate:compress true     # 圧縮有効化
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # 毎日0時
```

**ecosystem.config.js設定**:
```javascript
{
  error_file: './logs/error.log',
  out_file: './logs/out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
  log_type: 'json'
}
```

**リソース**: `resources/pm2-logrotate-guide.md`

### Phase 3: アプリケーションログ

**Winstonローテーション**:
```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  compress: true
});
```

**Pinoローテーション**:
```javascript
const pino = require('pino');
const rfs = require('rotating-file-stream');

const stream = rfs.createStream('app.log', {
  size: '10M',
  interval: '1d',
  compress: 'gzip',
  path: './logs'
});

const logger = pino(stream);
```

### Phase 4: システムレベルローテーション

**logrotate設定** (`/etc/logrotate.d/myapp`):
```
/var/log/myapp/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    dateext
}
```

**オプション解説**:
| オプション | 説明 |
|-----------|------|
| daily | 毎日ローテーション |
| rotate 7 | 7世代保持 |
| compress | gzip圧縮 |
| delaycompress | 1世代後に圧縮 |
| copytruncate | ログを切り詰め（再起動不要） |

### Phase 5: ログ集約

**集中ログ管理オプション**:
| サービス | 特徴 |
|---------|------|
| ELK Stack | オンプレミス、高度な分析 |
| Datadog | SaaS、APM統合 |
| CloudWatch | AWS統合、低コスト |
| Loki | Grafana統合、軽量 |

**リソース**: `resources/log-aggregation.md`

## ベストプラクティス

### すべきこと

1. **構造化ログ**: JSON形式でログを出力し、解析を容易に
2. **ログレベル活用**: debug/info/warn/errorを適切に使い分け
3. **タイムスタンプ統一**: ISO8601形式でタイムゾーン明示
4. **圧縮有効化**: 古いログはgzip圧縮でディスク節約

### 避けるべきこと

1. **無制限ログ**: サイズ・世代制限なしのログ設定
2. **console.log依存**: 本番環境での生console.log使用
3. **機密情報ログ**: パスワード、トークン等のログ出力
4. **同期ログ**: 高負荷時のブロッキングI/O

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 |

## 関連スキル

- **pm2-ecosystem-config** (`.claude/skills/pm2-ecosystem-config/SKILL.md`)
- **process-lifecycle-management** (`.claude/skills/process-lifecycle-management/SKILL.md`)
- **monitoring-alerting** (`.claude/skills/monitoring-alerting/SKILL.md`)
