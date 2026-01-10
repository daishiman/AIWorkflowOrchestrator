# 可観測性の基本概念

## 概要

可観測性（Observability）は、システムの外部出力からその内部状態を推論する能力を指す。ファイル監視システムでは、イベント検出の遅延、処理スループット、エラー発生状況を把握するために不可欠。

## 3本柱

### 1. Metrics（メトリクス）

数値データの時系列。定量的な傾向分析とアラートに使用。

| 種類      | 説明                 | 例                 |
| --------- | -------------------- | ------------------ |
| Counter   | 単調増加する値       | 処理イベント総数   |
| Gauge     | 上下する瞬間値       | キューの現在長     |
| Histogram | 値の分布             | レイテンシの分位数 |
| Summary   | ヒストグラムの軽量版 | p50/p90/p99        |

### 2. Logs（ログ）

イベントの離散記録。詳細なコンテキストを保持し、デバッグに使用。

```json
{
  "timestamp": "2025-01-02T10:30:00Z",
  "level": "INFO",
  "message": "File event detected",
  "file_path": "/data/input.csv",
  "event_type": "modify",
  "processing_time_ms": 45
}
```

### 3. Traces（トレース）

リクエスト/イベントのライフサイクル追跡。分散システムでの因果関係を可視化。

| 概念    | 説明                         |
| ------- | ---------------------------- |
| Trace   | 1つのリクエストの全体像      |
| Span    | トレース内の1つの処理単位    |
| Context | トレース情報を伝搬する仕組み |

## ゴールデンシグナル

SREの観点から、4つの主要指標を監視する（Google SRE Book）:

| シグナル   | 定義                     | ファイル監視での例            |
| ---------- | ------------------------ | ----------------------------- |
| Latency    | 処理にかかる時間         | イベント検出から処理完了まで  |
| Traffic    | リクエスト/イベント量    | 1秒あたりのファイルイベント数 |
| Errors     | 失敗したリクエストの割合 | 処理失敗したイベントの比率    |
| Saturation | リソースの使用率         | キュー長、CPU使用率           |

## SLI/SLO/SLA

| 用語 | 定義                            | 例                        |
| ---- | ------------------------------- | ------------------------- |
| SLI  | Service Level Indicator（指標） | イベント検出遅延のp99     |
| SLO  | Service Level Objective（目標） | p99遅延が1秒未満          |
| SLA  | Service Level Agreement（契約） | SLO未達時の対応（返金等） |

## 参考文献

- 『Observability Engineering』（Charity Majors, Liz Fong-Jones, George Miranda）
- 『Site Reliability Engineering』（Google）
- Prometheus Documentation: https://prometheus.io/docs/
