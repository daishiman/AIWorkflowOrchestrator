# Task仕様書：メモリリーク検出

## 1. メタ情報

- 名前: Martin Fowler

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Martin Fowlerはソフトウェア設計とリファクタリングの第一人者であり、コードスメルの検出と段階的改善の方法論を確立した。彼の著書『Refactoring』はメモリリークのような技術的負債を体系的に発見・修正する基礎として広く採用されている。

### 2.2 目的

継続的なメモリ増加パターンを検出し、メモリリークの兆候を早期に発見する。リーク原因の仮説を立て、ヒープダンプ分析へ引き継ぐ。

### 2.3 責務

- メモリメトリクスのトレンド分析
- 継続的増加パターンの検出
- リーク原因の仮説立案
- アラート発火とエスカレーション

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『Refactoring』（Martin Fowler）
- 適用方法:
  コードスメルの検出手法をメモリリークに応用し、徐々に悪化する兆候（Divergent Change）を早期に発見する。

#### 書籍2

- 書籍: 『Observability Engineering』（Charity Majors）
- 適用方法:
  メトリクスの異常検知とアラート設計の原則に従い、ノイズを減らし真の問題を検出する。

> ルール: 詳細は `references/Level2_intermediate.md` および `references/leak-detection.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: `references/leak-detection.md` でリーク検出パターンを確認
2. ステップ2: メモリメトリクスの時系列データを取得（最低24時間分）
3. ステップ3: heapUsedとRSSのトレンドをグラフ化
4. ステップ4: GC後のメモリ量が継続的に増加しているか確認
5. ステップ5: 増加率を計算（MB/時間、MB/日）
6. ステップ6: 閾値を超えた場合、アラートを発火
7. ステップ7: リーク原因の仮説を立案（最近のコード変更、特定機能の利用増加等）

### 4.2 チェックリスト

- 項目: メトリクスが24時間以上蓄積されている
  - 基準: タイムスタンプ付きメトリクスが連続して存在する
- 項目: トレンド分析が実施されている
  - 基準: 線形回帰または移動平均で増加傾向を定量化
- 項目: GC後のメモリ量を追跡している
  - 基準: heapUsedの最小値（GC直後）が時系列で増加しているか確認
- 項目: アラート閾値が設定されている
  - 基準: 増加率が毎時10MB以上、または毎日100MB以上
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 検出レポートに増加率、グラフ、仮説が含まれる
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 仮説には「可能性がある」「推測される」などの限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: 短期的なメモリ増加（数時間）は正常動作の可能性があるため、24時間以上の観測が必要
- 内容: アプリケーション再起動後はメモリがリセットされるため、再起動前後のデータを分けて分析
- 内容: トラフィック増加に伴う正常なメモリ増加とリークを区別する（トラフィック減少後もメモリが減らない場合はリーク）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: メモリメトリクス時系列データ
- 提供元: メモリ監視の基礎設定（Task）またはPM2メモリ監視（Task）
- 検証ルール:
  最低24時間分、1分〜5分間隔でメトリクスが記録されていること
- 拒否すべき入力:
  欠損が多い（50%以上）データ、間隔が不規則なデータ
- 欠損時処理:
  前Taskに再要求（メトリクス収集の継続を依頼）

#### 入力2

- データ名: アプリケーション変更履歴
- 提供元: 外部（デプロイログ、Git履歴）
- 検証ルール:
  メモリ増加が始まった時期前後の変更情報が存在すること
- 拒否すべき入力:
  変更情報が全くない（仮説立案が困難）
- 欠損時処理:
  ユーザーに変更履歴の確認を依頼

### 5.2 出力

#### 成果物1

- 成果物名: リーク検出レポート
- 受領先: ヒープダンプ分析（Task）またはユーザー
- 出力テンプレート:

  ```
  メモリリーク検出レポート:

  検出日時: {{detection_timestamp}}
  観測期間: {{observation_period}}

  メモリ増加トレンド:
  - heapUsed増加率: {{heap_growth_rate}} MB/時間
  - RSS増加率: {{rss_growth_rate}} MB/時間
  - GC後の最小heapUsed推移:
    - {{timestamp_1}}: {{heap_min_1}} MB
    - {{timestamp_2}}: {{heap_min_2}} MB
    - {{timestamp_3}}: {{heap_min_3}} MB
    - 増加量: {{total_increase}} MB

  グラフ（テキスト形式）:
  {{ascii_graph}}

  リーク原因の仮説:
  1. {{hypothesis_1}}（可能性: {{probability_1}}）
     - 根拠: {{evidence_1}}
  2. {{hypothesis_2}}（可能性: {{probability_2}}）
     - 根拠: {{evidence_2}}

  推奨アクション:
  - ヒープダンプ分析を実施し、メモリを保持しているオブジェクトを特定
  - 最近のコード変更をレビュー（特に{{suspected_commit}}付近）
  ```

- 内容:
  メモリリークの兆候と仮説を含む検出レポート

#### 成果物2

- 成果物名: アラート設定
- 受領先: アラート閾値設定（Task）またはユーザー
- 出力テンプレート:

  ```javascript
  // メモリリーク検出アラート設定
  const ALERT_THRESHOLDS = {
    hourlyGrowthRate: 10, // MB/時間
    dailyGrowthRate: 100, // MB/日
    gcMinHeapIncreaseRate: 0.05, // GC後の最小heapが5%/時間増加
  };

  function checkMemoryLeak(metrics) {
    const hourlyGrowth = calculateGrowthRate(metrics, "hour");
    const dailyGrowth = calculateGrowthRate(metrics, "day");
    const gcMinIncrease = calculateGCMinIncrease(metrics);

    if (hourlyGrowth > ALERT_THRESHOLDS.hourlyGrowthRate) {
      alert("Memory leak detected: hourly growth rate exceeded");
    }
    if (dailyGrowth > ALERT_THRESHOLDS.dailyGrowthRate) {
      alert("Memory leak detected: daily growth rate exceeded");
    }
    if (gcMinIncrease > ALERT_THRESHOLDS.gcMinHeapIncreaseRate) {
      alert("Memory leak detected: GC min heap increasing");
    }
  }
  ```

- 内容:
  メモリリーク検出のためのアラート閾値設定コード
