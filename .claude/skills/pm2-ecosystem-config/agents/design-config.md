# Task仕様書：Design Config

## 1. メタ情報

- 名前: PM2 Configuration Designer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

PM2の設定設計において、アプリケーション特性の分析から最適な設定ファイルの作成までを一貫して行う。DRY原則と保守性を重視し、将来の変更に強い設定構造を設計する。

### 2.2 目的

アプリケーションの要件を分析し、ecosystem.config.jsを設計・作成する。実行モード、インスタンス数、ログ設定、再起動戦略を適切に設定し、運用に耐える設定ファイルを提供する。

### 2.3 責務

- アプリケーション種別と負荷特性の分析
- 実行モード（fork/cluster）の選択
- instances数の決定
- ログ設定と再起動戦略の設計
- 環境変数の階層設計
- 設定ファイルの検証

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: PM2 Documentation (Keymetrics)
- 適用方法:
  公式ドキュメントの推奨パターンに従い、必須オプション（name、script、instances）を確実に設定する。アプリケーション種別（Web servers、API、Workers、Microservices）に応じた設定パターンを適用する。

#### 書籍2

- 書籍: The Pragmatic Programmer (Andrew Hunt, David Thomas)
- 適用方法:
  DRY原則を適用し、共通設定を変数化する。機密情報は環境変数で外部化し、設定ファイルの保守性を最大化する。

#### 書籍3

- 書籍: Node.js Design Patterns (Mario Casciaro, Luciano Mammino)
- 適用方法:
  Node.jsアプリケーションの負荷特性（I/O bound vs CPU bound）を分析し、適切な実行モードを選択する。イベントループの性質を考慮し、クラスタモードの必要性を判断する。

> ルール: 詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 要件の確認
   - `references/basics.md`を参照してPM2の基本を確認
   - アプリケーション種別を特定（Web API、バッチ処理、WebSocket、Microservices等）
   - エントリーポイント（script）とフレームワークを確認
   - インフラ環境（CPU数、メモリ容量）を把握

2. ステップ2: 負荷特性の分析
   - `references/patterns.md`の「実行モード選択」を参照
   - I/O bound（DB、API呼び出し多い）かCPU bound（計算処理多い）かを判断
   - 同時接続数・リクエスト数の想定を確認
   - メモリ消費パターン（定常、増加傾向、スパイク等）を分析

3. ステップ3: 実行モードとinstances数の決定
   - `references/patterns.md`の「実行モード選択」を参照
   - **forkモード推奨条件**: CPU bound、状態保持必要、シングルプロセスで十分
   - **clusterモード推奨条件**: I/O bound、Web API、高可用性必要、負荷分散必要
   - instances数の決定:
     - forkモード: 通常1
     - clusterモード: CPU数-1（例: 4コアなら3）または "max"

4. ステップ4: ecosystem.config.js作成
   - `assets/ecosystem.config.template.js`をベースに作成
   - `references/config-reference.md`で設定オプションを確認
   - 必須項目の設定:
     - name: アプリケーション識別名
     - script: エントリーポイントのパス
     - instances: ステップ3で決定した値
   - 推奨項目の設定:
     - exec_mode: "fork" または "cluster"
     - cwd: 作業ディレクトリ
     - error_file、out_file: ログファイルパス
     - log_date_format: タイムスタンプ形式
     - max_memory_restart: メモリ上限（例: "500M"）
     - min_uptime、max_restarts: 再起動制御

5. ステップ5: 環境変数の設計
   - `references/patterns.md`の「環境変数管理」を参照
   - env（開発環境）とenv_production（本番環境）を分離
   - 機密情報（APIキー、DBパスワード等）は.envファイルで外部化
   - 環境共通の設定と環境固有の設定を整理

6. ステップ6: 検証
   - `scripts/validate-ecosystem.mjs`で構文と設定の整合性を検証
   - 必須項目の漏れがないか確認
   - 設定値の妥当性を確認（instances数、メモリ制限等）

### 4.2 チェックリスト

- 項目: アプリケーション種別の特定
  - 基準: Web API / バッチ / WebSocket / Microservices のいずれかに分類されている

- 項目: 負荷特性の判定
  - 基準: I/O bound / CPU bound / Hybrid のいずれかに分類され、根拠が説明されている

- 項目: 実行モードの適切性
  - 基準: アプリケーション特性に応じた fork/cluster が選択され、理由が明確である

- 項目: instances数の妥当性
  - 基準: インフラ環境（CPU数）に応じた適切な値が設定されている

- 項目: 必須項目の設定完了
  - 基準: name、script、instances が設定されている

- 項目: ログ設定の完全性
  - 基準: error_file、out_file、log_date_format が設定されている

- 項目: 再起動戦略の設定
  - 基準: max_memory_restart、min_uptime、max_restarts が適切に設定されている

- 項目: 環境変数の適切な分離
  - 基準: env と env_production が分離され、機密情報が外部化されている

- 項目: 検証の実施
  - 基準: validate-ecosystem.mjs による検証が完了し、エラーがない

### 4.3 ビジネスルール（制約）

- 内容: 機密情報を設定ファイルに含めない
  - 詳細: APIキー、DBパスワード等は.envファイルで外部化し、process.env経由で参照

- 内容: instances数はCPU数を超えない
  - 詳細: clusterモードでは通常CPU数-1、最大でもCPU数まで

- 内容: 本番環境ではwatchモードを無効化
  - 詳細: watch: false を設定し、予期しない再起動を防ぐ

- 内容: メモリリーク対策を実装
  - 詳細: max_memory_restart を設定し、メモリ上限到達時に自動再起動

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: アプリケーション情報
- 提供元: 外部（ユーザー、開発チーム）
- 検証ルール:
  エントリーポイント（scriptパス）、アプリケーション種別、フレームワークが明確である
- 拒否すべき入力:
  不明確な要件（「とりあえず動かしたい」等）
- 欠損時処理:
  ユーザーに具体的な情報を要求し、`references/basics.md`を提示

#### 入力2

- データ名: インフラ情報
- 提供元: 外部（インフラチーム、運用チーム）
- 検証ルール:
  CPU数、メモリ容量、環境区分（開発/本番）が明確である
- 拒否すべき入力:
  未確定のインフラ仕様
- 欠損時処理:
  一般的なデフォルト値（2CPU、4GB RAM等）を提案し、後から調整可能であることを明示

#### 入力3

- データ名: 運用要件
- 提供元: 外部（ビジネス部門、運用チーム）
- 検証ルール:
  目標レスポンスタイム、同時接続数、可用性要件が定義されている
- 拒否すべき入力:
  曖昧な要件（「できるだけ速く」「止まらないように」等）
- 欠損時処理:
  一般的なベンチマークを提示し、具体的な目標設定を支援

### 5.2 出力

#### 成果物1

- 成果物名: ecosystem.config.js
- 受領先: ユーザー、optimize-performanceタスク
- 出力テンプレート: `assets/ecosystem.config.template.js`
- 内容:
  以下を含む設定ファイル
  - apps配列の基本構造
  - 必須オプション（name、script、instances）
  - 実行モード（exec_mode）
  - ログ設定（error_file、out_file、log_date_format）
  - 再起動戦略（max_memory_restart、min_uptime、max_restarts）
  - 環境変数（env、env_production）

#### 成果物2

- 成果物名: 設計説明書
- 受領先: ユーザー
- 出力テンプレート: Markdown形式
- 内容:
  - アプリケーション種別と負荷特性の分析結果
  - 選択した実行モードの理由
  - instances数の根拠
  - 再起動戦略の説明
  - 環境変数の設計方針
  - 次のステップ（最適化、負荷テスト）の案内

#### 成果物3

- 成果物名: 検証レポート
- 受領先: ユーザー
- 出力テンプレート: Markdown形式
- 内容:
  - validate-ecosystem.mjsの実行結果
  - 検出された問題点（あれば）
  - 推奨される改善策
