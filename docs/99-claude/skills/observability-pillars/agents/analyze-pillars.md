# Task: Observability成熟度分析

> **相対パス**: `agents/analyze-pillars.md`
> **バージョン**: 1.0.0

---

## 目的

既存システムのObservability成熟度を評価し、三本柱の実装状況と統合レベルを把握する。

## 入力

- 対象システムのコードベース
- 既存の監視・ログ設定
- インフラ構成情報

## 出力

- 成熟度評価レポート
- 三本柱の実装状況マトリクス
- 改善推奨事項

## 手順

### Step 1: ログ実装調査

```bash
# ロギングライブラリの確認
grep -r "winston\|pino\|bunyan\|log4js" --include="*.json" .

# 構造化ログの確認
grep -r "JSON.stringify\|\.json()" --include="*.ts" src/
```

**確認ポイント**:

- 構造化ログ（JSON形式）が使用されているか
- ログレベル（debug/info/warn/error）が適切に分類されているか
- コンテキスト情報（request_id、user_id等）が含まれているか

### Step 2: メトリクス実装調査

```bash
# メトリクスライブラリの確認
grep -r "prometheus\|prom-client\|statsd\|datadog" --include="*.json" .

# メトリクス定義の確認
grep -r "Counter\|Gauge\|Histogram\|Summary" --include="*.ts" src/
```

**確認ポイント**:

- Four Golden Signals（Latency/Traffic/Errors/Saturation）が計測されているか
- カスタムメトリクスの命名規則が一貫しているか
- ラベル設計が適切か（カーディナリティ爆発のリスク）

### Step 3: トレース実装調査

```bash
# トレーシングライブラリの確認
grep -r "opentelemetry\|jaeger\|zipkin\|dd-trace" --include="*.json" .

# スパン生成の確認
grep -r "startSpan\|tracer\.\|createSpan" --include="*.ts" src/
```

**確認ポイント**:

- 分散トレーシングが実装されているか
- スパン属性が適切に設定されているか
- コンテキスト伝播が実装されているか

### Step 4: 相関ID評価

```bash
# 相関IDの確認
grep -r "request_id\|trace_id\|correlation_id\|x-request-id" --include="*.ts" src/
```

**確認ポイント**:

- 統一された相関ID体系があるか
- ログ・メトリクス・トレースで同一IDが使用されているか
- コンテキスト伝播（HTTPヘッダー、AsyncLocalStorage等）が実装されているか

## 成熟度レベル定義

| レベル | 説明 | 特徴                                     |
| ------ | ---- | ---------------------------------------- |
| 0      | なし | 監視なし、console.logのみ                |
| 1      | 基本 | ログあり、メトリクス一部                 |
| 2      | 標準 | 三本柱すべてあり、統合なし               |
| 3      | 統合 | 相関IDで連携、ナビゲーション可能         |
| 4      | 高度 | 自動相関、高カーディナリティ、探索的調査 |

## 完了条件

- [ ] ログ・メトリクス・トレースの実装状況を確認
- [ ] 相関ID体系の有無を評価
- [ ] 成熟度レベルを判定
- [ ] 改善推奨事項を文書化
