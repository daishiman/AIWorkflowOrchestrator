---
name: memory-monitoring-strategies
description: |
  Node.jsアプリケーションのメモリ監視とリーク検出を専門とするスキル。
  PM2、V8ヒープ分析、メモリプロファイリングを活用した効率的なメモリ管理を設計します。

  専門分野:
  - メモリ監視: ヒープ使用量、RSS、外部メモリの追跡
  - リーク検出: メモリリークの特定と診断手法
  - PM2メモリ管理: max_memory_restart、メモリアラート設定
  - プロファイリング: heapdump、Chrome DevTools連携

  使用タイミング:
  - メモリ使用量の監視を設定する時
  - メモリリークを調査する時
  - PM2のメモリ制限を設定する時
  - ヒープ分析を行う時

  Use proactively when configuring memory monitoring, investigating leaks,
  or optimizing memory usage in Node.js applications.
version: 1.0.0
---

# Memory Monitoring Strategies

## 概要

メモリ監視は、Node.jsアプリケーションの安定性とパフォーマンスを
維持するための重要な運用プラクティスです。メモリリークの早期検出と
適切なリソース管理を実現します。

**主要な価値**:
- メモリリークの早期検出
- OOMクラッシュの防止
- パフォーマンスの最適化
- リソース使用量の可視化

## リソース構造

```
memory-monitoring-strategies/
├── SKILL.md
├── resources/
│   ├── memory-metrics.md
│   ├── leak-detection.md
│   └── heap-analysis.md
├── scripts/
│   └── memory-monitor.mjs
└── templates/
    └── memory-tracker.template.ts
```

## コマンドリファレンス

### リソース読み取り

```bash
# メモリメトリクスガイド
cat .claude/skills/memory-monitoring-strategies/resources/memory-metrics.md

# リーク検出ガイド
cat .claude/skills/memory-monitoring-strategies/resources/leak-detection.md

# ヒープ分析ガイド
cat .claude/skills/memory-monitoring-strategies/resources/heap-analysis.md
```

### スクリプト実行

```bash
# メモリ監視スクリプト
node .claude/skills/memory-monitoring-strategies/scripts/memory-monitor.mjs <pid>
node .claude/skills/memory-monitoring-strategies/scripts/memory-monitor.mjs --pm2 <app-name>
```

### テンプレート参照

```bash
# メモリトラッカーテンプレート
cat .claude/skills/memory-monitoring-strategies/templates/memory-tracker.template.ts
```

## ワークフロー

### Phase 1: メトリクス理解

**Node.jsメモリメトリクス**:
```javascript
const usage = process.memoryUsage();
// {
//   rss: 30000000,        // Resident Set Size（物理メモリ）
//   heapTotal: 20000000,  // V8ヒープ合計
//   heapUsed: 15000000,   // V8ヒープ使用量
//   external: 1000000,    // C++オブジェクト
//   arrayBuffers: 500000  // ArrayBuffer
// }
```

**メトリクス説明**:
| メトリクス | 説明 | 警告閾値 |
|-----------|------|---------|
| RSS | 物理メモリ総使用量 | 500MB-1GB |
| heapUsed | JSオブジェクトメモリ | ヒープの80% |
| heapTotal | V8ヒープ確保量 | 継続的増加 |
| external | ネイティブオブジェクト | 異常な増加 |

**リソース**: `resources/memory-metrics.md`

### Phase 2: PM2メモリ設定

**max_memory_restart設定**:
```javascript
// ecosystem.config.js
{
  max_memory_restart: '500M',  // メモリ超過で再起動
  exp_backoff_restart_delay: 100  // 再起動間隔
}
```

**推奨設定**:
| 環境 | max_memory_restart |
|------|-------------------|
| 開発 | 256M-512M |
| ステージング | 512M-1G |
| 本番 | 1G-2G |

### Phase 3: メモリ監視実装

**基本監視**:
```javascript
setInterval(() => {
  const usage = process.memoryUsage();
  const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;

  if (heapPercent > 85) {
    console.warn(`High heap usage: ${heapPercent.toFixed(1)}%`);
  }
}, 30000);
```

**PM2カスタムメトリクス**:
```javascript
const io = require('@pm2/io');

io.metric({
  name: 'Heap Used',
  value: () => {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024);
  }
});
```

### Phase 4: リーク検出

**リーク兆候**:
- heapUsedの継続的増加
- GC後もメモリが解放されない
- 長時間運用でRSS増加

**検出手法**:
1. 定期的なメモリスナップショット
2. heapdumpによる詳細分析
3. Chrome DevToolsでの可視化

**リソース**: `resources/leak-detection.md`

### Phase 5: ヒープ分析

**heapdump取得**:
```javascript
const heapdump = require('heapdump');

// 手動トリガー
heapdump.writeSnapshot('/tmp/heap-' + Date.now() + '.heapsnapshot');

// シグナルトリガー
process.on('SIGUSR2', () => {
  heapdump.writeSnapshot();
});
```

**分析手順**:
1. Chrome DevToolsを開く
2. Memory → Load からスナップショット読み込み
3. Summary/Comparison ビューで分析

**リソース**: `resources/heap-analysis.md`

## ベストプラクティス

### すべきこと

1. **定期監視**: メモリ使用量を継続的に追跡
2. **閾値アラート**: 危険値に達したら通知
3. **GC監視**: GC頻度と効果を追跡
4. **ベースライン設定**: 正常時のメモリ使用量を把握

### 避けるべきこと

1. **グローバル変数蓄積**: 不要なグローバルキャッシュ
2. **イベントリスナーリーク**: removeListenerの漏れ
3. **クロージャリーク**: 不要な参照の保持
4. **バッファ蓄積**: 未解放のBuffer/ArrayBuffer

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 |

## 関連スキル

- **pm2-ecosystem-config** (`.claude/skills/pm2-ecosystem-config/SKILL.md`)
- **process-lifecycle-management** (`.claude/skills/process-lifecycle-management/SKILL.md`)
- **monitoring-alerting** (`.claude/skills/monitoring-alerting/SKILL.md`)
