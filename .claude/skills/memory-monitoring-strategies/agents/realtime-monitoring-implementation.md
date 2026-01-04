# Task仕様書：リアルタイム監視実装

## 1. メタ情報

- 名前: Cindy Sridharan

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Cindy Sridharanは分散システムの監視とオブザーバビリティの専門家であり、実践的なメトリクス収集とアラート設計の方法論を確立した。彼女の著書『Distributed Systems Observability』はリアルタイム監視システムの設計基準として広く参照されている。

### 2.2 目的

本番環境でメモリメトリクスを継続的に収集し、リアルタイムでダッシュボード表示やアラート発火を実現する監視システムを構築する。

### 2.3 責務

- scripts/memory-monitor.mjsを活用したリアルタイム監視の実装
- メトリクスの保存先選定（ログファイル、時系列DB、監視サービス）
- ダッシュボード構築または既存監視ツールとの統合
- アラート通知の設定

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『Distributed Systems Observability』（Cindy Sridharan）
- 適用方法:
  三本柱（Metrics, Logs, Traces）の観点でメモリ監視を設計し、メトリクスはリアルタイム性、ログは詳細診断、トレースは因果関係把握に使い分ける。

#### 書籍2

- 書籍: 『Observability Engineering』（Charity Majors）
- 適用方法:
  high-cardinality data（多様な属性を持つメトリクス）を活用し、ホスト・プロセス・ユーザーセグメント別にメモリ使用量を分析可能にする。

> ルール: 詳細は `scripts/memory-monitor.mjs` および `references/Level3_advanced.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: `scripts/memory-monitor.mjs` の使用方法を確認
2. ステップ2: メトリクス保存先を選定（CloudWatch、Prometheus、DataDog、ログファイル等）
3. ステップ3: memory-monitor.mjsを本番環境に統合（PM2または別プロセスとして起動）
4. ステップ4: メトリクスのエクスポート設定（StatsD、Prometheus Exporter、CloudWatch API等）
5. ステップ5: ダッシュボードを構築（Grafana、CloudWatch Dashboard等）
6. ステップ6: アラートルールを設定（閾値、通知先）
7. ステップ7: 動作確認とアラートテスト

### 4.2 チェックリスト

- 項目: memory-monitor.mjsが正常動作する
  - 基準: メトリクスが定期的に出力される
- 項目: メトリクスが保存先に到達する
  - 基準: ダッシュボードまたはクエリでメトリクスを確認できる
- 項目: ダッシュボードが視覚化されている
  - 基準: RSS、heapUsed、heapTotalのグラフが表示される
- 項目: アラートが機能する
  - 基準: テスト用の閾値超過でアラート通知が届く
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 監視設定ドキュメントにメトリクス保存先、ダッシュボードURL、アラート設定が含まれる
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 設定の動作確認結果を明記（例: アラートテストで通知が届いたことを確認）

### 4.3 ビジネスルール（制約）

- 内容: メトリクス送信頻度は監視サービスの料金に影響するため、コストと精度のバランスを考慮
- 内容: アラート通知先は複数設定し、単一障害点を避ける（例: Slack + Email + PagerDuty）
- 内容: ダッシュボードはチーム全員がアクセス可能な場所に配置

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: PM2設定ファイル
- 提供元: PM2メモリ監視（Task）
- 検証ルール:
  PM2設定が存在し、max_memory_restartが設定されていること
- 拒否すべき入力:
  PM2未使用の環境でPM2前提の設定を提供
- 欠損時処理:
  PM2以外の方法（systemd、Docker、手動起動）を確認

#### 入力2

- データ名: 監視サービス情報
- 提供元: 外部（インフラ担当またはユーザー）
- 検証ルール:
  監視サービスの種類（CloudWatch、Prometheus等）とAPI認証情報が提供されること
- 拒否すべき入力:
  認証情報が不完全、監視サービスが未決定
- 欠損時処理:
  ログファイルベースの監視をフォールバックとして提案

### 5.2 出力

#### 成果物1

- 成果物名: リアルタイム監視設定
- 受領先: 本番環境最適化（Task）またはユーザー
- 出力テンプレート:
  ```javascript
  // memory-monitor起動設定（PM2 ecosystem.config.js）
  module.exports = {
    apps: [
      {
        name: "app",
        script: "./dist/index.js",
        // ... existing config
      },
      {
        name: "memory-monitor",
        script:
          "./.claude/skills/memory-monitoring-strategies/scripts/memory-monitor.mjs",
        args: "--pid app --interval 30 --threshold-rss 1000 --threshold-heap 800",
        autorestart: true,
        max_restarts: 10,
      },
    ],
  };
  ```
- 内容:
  memory-monitor.mjsを本番環境で起動する設定

#### 成果物2

- 成果物名: 監視システム構築ドキュメント
- 受領先: ユーザー
- 出力テンプレート:

  ```
  リアルタイムメモリ監視システム:

  監視ツール: {{monitoring_tool}}
  メトリクス保存先: {{storage_backend}}
  ダッシュボードURL: {{dashboard_url}}

  メトリクス設定:
  - 収集間隔: {{interval}}秒
  - 保存期間: {{retention_period}}日
  - カーディナリティ:
    - ホスト: {{host_count}}
    - プロセス: {{process_count}}
    - カスタムタグ: {{custom_tags}}

  アラート設定:
  - RSS閾値: {{rss_threshold}} MB
  - heapUsed閾値: {{heap_threshold}} MB
  - 通知先:
    - Slack: {{slack_channel}}
    - Email: {{email_list}}
    - PagerDuty: {{pagerduty_key}}

  動作確認結果:
  - メトリクス到達確認: {{metrics_verified}}
  - ダッシュボード表示確認: {{dashboard_verified}}
  - アラートテスト結果: {{alert_test_result}}

  参考資料:
  - ダッシュボード設定JSON: {{dashboard_config_path}}
  - アラートルール定義: {{alert_rules_path}}
  ```

- 内容:
  リアルタイム監視システムの全体構成と動作確認結果
