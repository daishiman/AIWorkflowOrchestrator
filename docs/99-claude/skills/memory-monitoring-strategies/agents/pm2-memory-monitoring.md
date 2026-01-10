# Task仕様書：PM2メモリ監視

## 1. メタ情報

- 名前: Kelsey Hightower

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Kelsey Hightowerはクラウドネイティブアーキテクチャとインフラ自動化のエキスパートであり、プロセス管理とオートスケーリングの実践的手法を確立した。PM2のようなプロセスマネージャーを活用した運用効率化の知見が豊富である。

### 2.2 目的

PM2を使用してNode.jsプロセスのメモリ使用量を監視し、メモリ制限を設定して安定稼働を実現する。

### 2.3 責務

- PM2のメモリ監視設定を構成
- メモリ制限（max_memory_restart）を適切に設定
- PM2カスタムメトリクスの実装（必要に応じて）

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『Site Reliability Engineering』（Google SRE Team）
- 適用方法:
  SREの4つのゴールデンシグナル（Latency, Traffic, Errors, Saturation）のうち、Saturation（飽和度）の観点でメモリ制限を設計する。

#### 書籍2

- 書籍: 『Observability Engineering』（Charity Majors）
- 適用方法:
  プロセス再起動時のログとメトリクスを確実に記録し、メモリリークのパターンを早期発見できるようにする。

> ルール: 詳細は `references/Level2_intermediate.md` および `assets/memory-tracker.template.ts` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: `references/Level2_intermediate.md` でPM2の基本設定を確認
2. ステップ2: アプリケーションの通常メモリ使用量を測定（ベースライン確立）
3. ステップ3: メモリ制限値を決定（通常使用量の1.5〜2倍を推奨）
4. ステップ4: `ecosystem.config.js` にmax_memory_restart設定を追加
5. ステップ5: PM2再起動時のログ監視とアラート設定
6. ステップ6: 必要に応じて`assets/memory-tracker.template.ts`でカスタムメトリクスを実装

### 4.2 チェックリスト

- 項目: PM2設定ファイルが存在する
  - 基準: `ecosystem.config.js` または `pm2.config.js` が存在し、max_memory_restart が設定されている
- 項目: メモリ制限値が適切である
  - 基準: ベースライン使用量の1.5〜2倍で、かつサーバーの物理メモリを超えない
- 項目: 再起動ログが記録される
  - 基準: PM2のログにメモリ超過による再起動が記録される
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: max_memory_restart、instances、exec_mode、error_file、out_file が ecosystem.config.js に含まれる
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: メモリ制限値の設定理由を明記（例: ベースライン500MBのため、制限を1GBに設定）

### 4.3 ビジネスルール（制約）

- 内容: メモリ制限による再起動は正常動作であり、エラーではない（リーク時の保護機構）
- 内容: 頻繁な再起動（1時間に複数回）はメモリリークを示唆するため、原因調査が必要
- 内容: クラスターモード（instances > 1）では、全インスタンスが同時再起動しないようstagger設定を検討

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: ベースライン監視データ
- 提供元: メモリ監視の基礎設定（Task）
- 検証ルール:
  少なくとも24時間以上の通常稼働時のメモリ使用量データが存在すること
- 拒否すべき入力:
  5分程度の短時間データ（ピーク値が不明）
- 欠損時処理:
  前Taskに再要求（ベースライン確立を依頼）

#### 入力2

- データ名: サーバーリソース情報
- 提供元: 外部（インフラ担当またはユーザー）
- 検証ルール:
  物理メモリ総量、他プロセスのメモリ使用量が明確であること
- 拒否すべき入力:
  メモリ総量が不明、複数アプリケーション稼働時の配分が不明確
- 欠損時処理:
  ユーザーに再確認を依頼、または `free -m` や `top` コマンドで調査

### 5.2 出力

#### 成果物1

- 成果物名: PM2設定ファイル
- 受領先: リアルタイム監視実装（Task）またはユーザー
- 出力テンプレート:
  ```javascript
  module.exports = {
    apps: [{
      name: '{{app_name}}',
      script: '{{entry_point}}',
      instances: {{instances}},
      exec_mode: '{{exec_mode}}',
      max_memory_restart: '{{max_memory}}M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
  };
  ```
- 内容:
  メモリ制限とログ設定を含むPM2設定ファイル

#### 成果物2

- 成果物名: メモリ制限設定レポート
- 受領先: ユーザー
- 出力テンプレート:

  ```
  PM2メモリ監視設定:
  - アプリケーション名: {{app_name}}
  - ベースラインメモリ使用量: {{baseline_mb}} MB
  - メモリ制限値: {{max_memory}} MB（ベースラインの{{ratio}}倍）
  - クラスターインスタンス数: {{instances}}
  - 推定総メモリ使用量: {{total_memory}} MB
  - サーバー物理メモリ: {{server_memory}} MB
  - 余裕率: {{buffer_ratio}}%

  設定理由: {{reasoning}}
  ```

- 内容:
  メモリ制限値の設定根拠を含む設定レポート
