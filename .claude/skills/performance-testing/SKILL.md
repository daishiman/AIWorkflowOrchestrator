---
name: performance-testing
description: |
  システムのパフォーマンス測定・分析・最適化を行うスキル。
  負荷テスト、ストレステスト、ボトルネック分析を通じて性能改善策を提示します。

  Anchors:
  • The Art of Application Performance Testing (Ian Molyneaux) / 適用: パフォーマンステスト戦略 / 目的: 体系的な性能評価手法の確立
  • Systems Performance (Brendan Gregg) / 適用: USE/REDメソッド / 目的: メトリクス分析とボトルネック特定
  • Google SRE Book / 適用: SLO/SLI設計 / 目的: 目標ベースの性能評価

  Trigger:
  Use when measuring system performance, identifying bottlenecks, load testing, or optimizing application speed.
  performance testing, load testing, stress testing, bottleneck analysis, latency, throughput, response time, profiling, benchmarking, performance optimization
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# performance-testing

## 概要

システムのパフォーマンス測定・分析・最適化を行うスキル。
負荷テスト、ストレステスト、プロファイリング、ボトルネック分析を通じて性能改善策を提示する。

---

## ワークフロー

### Phase 1: 要件定義とベースライン測定

**目的**: パフォーマンステストの目標設定と現状把握

**アクション**:

1. SLO（Service Level Objectives）を定義
2. 測定対象のシステム構成を確認
3. ベースライン測定の実行
4. 測定環境の妥当性検証
5. 必要なリソースレベル（Level 1-4）を判定

**Task**: `agents/define-requirements.md` を参照

**成果物**:

- SLO定義書
- システム構成図
- ベースライン測定結果

### Phase 2: テスト設計と実装

**目的**: パフォーマンステストシナリオの作成と実装

**アクション**:

1. テストシナリオの設計（負荷パターン、ストレスポイント）
2. `references/test-scenarios.md` でパターンを確認
3. テストツールの選定（k6, JMeter, Locust等）
4. テストスクリプトの実装
5. `assets/k6-template.js` などのテンプレートを使用

**Task**: `agents/design-tests.md` を参照

**成果物**:

- テストシナリオ仕様書
- テストスクリプト
- 環境設定ファイル

### Phase 3: テスト実行と測定

**目的**: 計画されたテストの実行とデータ収集

**アクション**:

1. テスト環境の準備確認
2. 段階的負荷増加による測定
3. リアルタイムモニタリング
4. データ収集と保存
5. `scripts/run-performance-test.sh` で自動実行

**Task**: `agents/execute-tests.md` を参照

**成果物**:

- 測定データ（JSON/CSV）
- リアルタイムグラフ
- システムメトリクス

### Phase 4: 分析とボトルネック特定

**目的**: 測定データからボトルネックと改善ポイントを特定

**アクション**:

1. USE/REDメソッドによるメトリクス分析
2. `references/analysis-methods.md` で分析手法を確認
3. レイテンシ分布の解析（P50/P95/P99）
4. リソース使用率の確認（CPU、メモリ、I/O、ネットワーク）
5. ボトルネック特定と優先順位付け
6. `scripts/analyze-results.mjs` で自動分析

**Task**: `agents/analyze-bottlenecks.md` を参照

**成果物**:

- 分析レポート
- ボトルネック一覧（優先度付き）
- パフォーマンスグラフ

### Phase 5: 最適化提案と検証

**目的**: 改善策の提案と効果検証

**アクション**:

1. ボトルネック別の最適化戦略を立案
2. `references/optimization-strategies.md` でパターンを確認
3. 改善案の実装（または実装指示書作成）
4. 最適化後の再測定
5. Before/After比較
6. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/propose-optimizations.md` を参照

**成果物**:

- 最適化提案書
- Before/After比較レポート
- 実装ガイド

---

## Task仕様ナビ

| Task                  | 起動タイミング | 入力                           | 出力                           |
| --------------------- | -------------- | ------------------------------ | ------------------------------ |
| define-requirements   | Phase 1開始時  | システム仕様、目標性能         | SLO定義、ベースライン結果      |
| design-tests          | Phase 2開始時  | SLO定義、システム構成          | テストシナリオ、スクリプト     |
| execute-tests         | Phase 3開始時  | テストスクリプト、環境設定     | 測定データ、メトリクス         |
| analyze-bottlenecks   | Phase 4開始時  | 測定データ、システムメトリクス | 分析レポート、ボトルネック一覧 |
| propose-optimizations | Phase 5開始時  | ボトルネック一覧、分析レポート | 最適化提案書、比較レポート     |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項             | 理由                                    |
| -------------------- | --------------------------------------- |
| SLOを明確に定義      | 測定の目的と成功基準を明確化            |
| 段階的な負荷増加     | システムの限界点を安全に特定            |
| 複数メトリクスの測定 | 多角的な分析で真のボトルネックを特定    |
| 本番相当の環境で測定 | 現実的なパフォーマンス評価              |
| ベースライン確立     | 改善効果の定量的評価を可能に            |
| パーセンタイル分析   | P50/P95/P99で異常値を含めた全体像を把握 |
| 継続的測定           | 性能劣化の早期検知                      |

### 避けるべきこと

| 非推奨事項             | 理由                                   |
| ---------------------- | -------------------------------------- |
| 単一メトリクスのみ測定 | ボトルネックの見落としリスク           |
| 開発環境のみでのテスト | 本番環境との乖離により誤った結論       |
| 過負荷による本番影響   | 段階的負荷増加を怠ると障害リスク       |
| 平均値のみでの評価     | 外れ値を無視すると重要な問題を見落とす |
| 孤立した最適化         | システム全体の視点がないと効果が限定的 |
| キャッシュなしの測定   | 非現実的な結果になる可能性             |

---

## テストタイプ別ガイド

### 負荷テスト（Load Testing）

**目的**: 通常負荷・ピーク負荷時の動作確認

**シナリオ**:

- 段階的負荷増加（Ramp-up）
- 定常負荷維持（Steady State）
- 想定ピーク負荷

**詳細**: `references/load-testing.md` を参照

### ストレステスト（Stress Testing）

**目的**: システムの限界点と破綻条件の特定

**シナリオ**:

- 限界までの負荷増加
- スパイク負荷
- 長時間負荷

**詳細**: `references/stress-testing.md` を参照

### スパイクテスト（Spike Testing）

**目的**: 急激な負荷変動への対応確認

**シナリオ**:

- 急激な負荷増加
- 急激な負荷減少

**詳細**: `references/spike-testing.md` を参照

### 耐久テスト（Soak Testing）

**目的**: 長時間稼働時のメモリリーク等の検出

**シナリオ**:

- 中程度負荷の長時間維持
- リソースリーク検出

**詳細**: `references/soak-testing.md` を参照

---

## リソース参照ガイド

### 知識リソース（references/）

| ファイル                   | 内容                       | 読むタイミング       |
| -------------------------- | -------------------------- | -------------------- |
| Level1_basics.md           | パフォーマンステストの基礎 | Phase 1で必ず読む    |
| Level2_intermediate.md     | テスト設計とツール選定     | Phase 2で参照        |
| Level3_advanced.md         | 高度な分析手法とメトリクス | Phase 4で参照        |
| Level4_expert.md           | 大規模システム・分散テスト | 複雑なシステムで参照 |
| test-scenarios.md          | テストシナリオパターン集   | Phase 2で参照        |
| analysis-methods.md        | USE/REDメソッド詳細        | Phase 4で参照        |
| optimization-strategies.md | 最適化戦略カタログ         | Phase 5で参照        |
| load-testing.md            | 負荷テスト詳細ガイド       | 負荷テスト時         |
| stress-testing.md          | ストレステスト詳細ガイド   | ストレステスト時     |
| spike-testing.md           | スパイクテスト詳細ガイド   | スパイクテスト時     |
| soak-testing.md            | 耐久テスト詳細ガイド       | 耐久テスト時         |

### スクリプト（scripts/）

| スクリプト              | 用途                 | 実行タイミング |
| ----------------------- | -------------------- | -------------- |
| run-performance-test.sh | テスト実行の自動化   | Phase 3        |
| analyze-results.mjs     | 測定データの自動分析 | Phase 4        |
| generate-report.mjs     | レポート生成         | Phase 4/5      |
| validate-slo.mjs        | SLO達成状況の検証    | Phase 1/5      |
| log_usage.mjs           | スキル使用記録       | Phase 5終了時  |

### テンプレート（assets/）

| テンプレート             | 用途                       |
| ------------------------ | -------------------------- |
| k6-template.js           | k6負荷テストスクリプト雛形 |
| jmeter-template.jmx      | JMeter負荷テストプラン雛形 |
| slo-template.md          | SLO定義書テンプレート      |
| report-template.md       | 分析レポートテンプレート   |
| optimization-proposal.md | 最適化提案書テンプレート   |

---

## メトリクス定義

### レイテンシメトリクス

| メトリクス | 説明                       | 目標例   |
| ---------- | -------------------------- | -------- |
| P50        | 50パーセンタイル（中央値） | < 100ms  |
| P95        | 95パーセンタイル           | < 500ms  |
| P99        | 99パーセンタイル           | < 1000ms |
| P99.9      | 99.9パーセンタイル         | < 2000ms |
| Max        | 最大レイテンシ             | 記録のみ |

### スループットメトリクス

| メトリクス | 説明                    | 目標例       |
| ---------- | ----------------------- | ------------ |
| RPS        | Requests Per Second     | > 1000 req/s |
| TPS        | Transactions Per Second | > 500 tx/s   |
| データ転送 | Throughput (MB/s)       | > 100 MB/s   |

### リソースメトリクス

| メトリクス   | 説明                | 目標例 |
| ------------ | ------------------- | ------ |
| CPU使用率    | CPU Utilization     | < 70%  |
| メモリ使用率 | Memory Utilization  | < 80%  |
| ディスクI/O  | Disk I/O Wait       | < 10%  |
| ネットワーク | Network Utilization | < 70%  |

### エラーメトリクス

| メトリクス     | 説明         | 目標例  |
| -------------- | ------------ | ------- |
| エラー率       | Error Rate   | < 0.1%  |
| タイムアウト率 | Timeout Rate | < 0.01% |

---

## ツール選定ガイド

### 負荷テストツール比較

| ツール  | 特徴                          | 推奨用途               |
| ------- | ----------------------------- | ---------------------- |
| k6      | モダン、JS記述、CLI/Cloud対応 | API/マイクロサービス   |
| JMeter  | GUI、多機能、プラグイン豊富   | Web全般                |
| Locust  | Python記述、分散実行対応      | カスタマイズ重視       |
| Gatling | Scala/Java、DSL、リアルタイム | エンタープライズ       |
| wrk     | 軽量、高速、C実装             | シンプルなベンチマーク |

### プロファイリングツール

| ツール           | 対象                    | 用途               |
| ---------------- | ----------------------- | ------------------ |
| Chrome DevTools  | ブラウザ/フロントエンド | フロントエンド分析 |
| Node.js Profiler | Node.js                 | バックエンド分析   |
| py-spy           | Python                  | Python分析         |
| pprof            | Go                      | Go分析             |
| perf             | Linux                   | システムレベル分析 |

---

## よくある問題と対処法

### 問題1: テスト環境が本番と異なる

**症状**: 本番で性能問題が発生するがテストでは再現しない

**対処**:

- インフラ構成を本番と揃える
- データ量を本番相当にする
- ネットワークレイテンシを考慮

### 問題2: 負荷が上がらない

**症状**: 負荷テストツールが想定負荷を生成できない

**対処**:

- 分散実行を検討
- ツールのリソース制限を確認
- Keep-Alive設定を確認

### 問題3: 結果にばらつきが大きい

**症状**: 同じテストで毎回結果が大きく変動

**対処**:

- ウォームアップ期間を設ける
- バックグラウンドプロセスを停止
- 複数回実行して統計的に評価

### 問題4: ボトルネックが特定できない

**症状**: 性能が悪いが原因が不明

**対処**:

- USE/REDメソッドを適用
- 分散トレーシングを導入
- 階層的にプロファイリング

---

## 注意事項

### セキュリティ

- 本番環境での負荷テストは必ず許可を得る
- APIキー等の認証情報をハードコードしない
- テストデータに本番データを使用しない

### コスト

- クラウド環境でのテストはコストに注意
- 不要なリソースは速やかに削除
- 予算上限を設定

### 倫理

- 外部サービスへの負荷テストは禁止（DDoS攻撃とみなされる）
- 自組織管理下のシステムのみテスト対象とする

---

## 関連スキル

- `monitoring-observability`: モニタリング基盤構築
- `database-optimization`: データベース最適化
- `api-optimization`: API最適化
- `frontend-performance`: フロントエンド性能最適化

---

## 参考資料

### 書籍

- The Art of Application Performance Testing (Ian Molyneaux)
- Systems Performance (Brendan Gregg)
- Google SRE Book
- Database Performance Tuning (Dennis Shasha)

### オンラインリソース

- k6 Documentation: https://k6.io/docs/
- JMeter User Manual: https://jmeter.apache.org/usermanual/
- Brendan Gregg's Blog: https://www.brendangregg.com/

---

_最終更新: 2025-12-31_
