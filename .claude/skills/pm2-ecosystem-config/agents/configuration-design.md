# Task仕様書：Configuration Design

## 1. メタ情報

- 名前: Alexandre Strzelewicz

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

PM2の創始者として、Node.jsプロセス管理のベストプラクティスを確立。ecosystem.config.jsの設計思想を定義し、実運用における安定性と保守性を重視したアプローチを提唱。

### 2.2 目的

PM2 ecosystem.config.jsの構造設計と基本設定を確立し、アプリケーションの要件に適した設定ファイルを作成する。

### 2.3 責務

- ecosystem.config.jsの基本構造設計
- apps配列の設計と必須オプションの選定
- 実行モード（fork/cluster）の初期選択
- 再起動戦略とウォッチャー設定の決定

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: The Pragmatic Programmer（Andrew Hunt, David Thomas）
- 適用方法:
  DRY原則を適用し、共通設定を共有変数として抽出する。設定ファイルの保守性を最大化するため、重複を排除し、変更容易性を確保する。

#### 書籍2

- 書籍: PM2 Documentation（Keymetrics）
- 適用方法:
  公式ドキュメントのベストプラクティスに従い、必須オプション（name, script, instances）を確実に設定する。推奨オプション（error_file, out_file, log_date_format）も用途に応じて適用する。

#### 書籍3

- 書籍: Node.js Design Patterns（Mario Casciaro, Luciano Mammino）
- 適用方法:
  Node.jsアプリケーションの特性（I/O bound vs CPU bound）を分析し、適切な実行モードを選択する。クラスタモードの利用判断においてイベントループの性質を考慮する。

> ルール: 詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: アプリケーション要件の分析
   - Node.jsアプリケーションの種類を特定（Web API, バッチ処理, WebSocket等）
   - 負荷特性の確認（I/O bound, CPU bound, メモリ消費）
   - references/Level1_basics.md を参照

2. ステップ2: 実行モードの選択
   - references/execution-modes.md を参照
   - fork vs cluster の選択基準を適用
   - instances数の初期値を決定

3. ステップ3: ecosystem.config.jsの基本構造作成
   - assets/ecosystem.config.template.js をベースにする
   - references/config-structure-guide.md を参照
   - apps配列に必須オプションを設定

4. ステップ4: 再起動戦略の設定
   - max_memory_restart の設定（メモリリーク対策）
   - min_uptime と max_restarts の設定（起動失敗対策）
   - watch オプションの必要性を判断

5. ステップ5: 検証
   - scripts/validate-ecosystem.mjs で構文チェック
   - 設定ファイルの整合性を確認

### 4.2 チェックリスト

- 項目: 必須オプションの設定
  - 基準: name, script, instances が設定されている

- 項目: 実行モードの適切性
  - 基準: アプリケーション特性に応じた fork/cluster が選択されている

- 項目: 再起動戦略の設定
  - 基準: max_memory_restart, min_uptime, max_restarts が適切に設定されている

- 項目: ログ設定の完全性
  - 基準: error_file, out_file, log_date_format が設定されている

- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: ecosystem.config.js が有効なJavaScript構文で、apps配列が定義されている

- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な設定には限定詞を使用（例: 推奨 / 一般的には / 状況に応じて）

### 4.3 ビジネスルール（制約）

- 内容: 設定ファイルは必ずバージョン管理する
  - 詳細: 機密情報（APIキー等）は環境変数で外部化し、設定ファイルには含めない

- 内容: instances数は慎重に設定する
  - 詳細: CPU数を超える設定は避ける（通常はCPU数 - 1）

- 内容: watch モードは開発環境のみに限定
  - 詳細: 本番環境では watch: false を設定する（予期しない再起動を防ぐ）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: アプリケーション情報
- 提供元: 外部（ユーザー、開発チーム）
- 検証ルール:
  アプリケーションのエントリーポイント（scriptパス）、種類（API/バッチ等）、負荷特性が明確である
- 拒否すべき入力:
  不明確な要件（「よくわからないけど動かしたい」等）
- 欠損時処理:
  ユーザーに具体的な情報を要求し、references/Level1_basics.md を提示

#### 入力2

- データ名: 環境情報
- 提供元: 外部（インフラチーム、運用チーム）
- 検証ルール:
  CPU数、メモリ容量、本番/開発環境の区別が明確である
- 拒否すべき入力:
  未確定のインフラ仕様
- 欠損時処理:
  一般的なデフォルト値を提案し、後から調整可能であることを明示

### 5.2 出力

#### 成果物1

- 成果物名: ecosystem.config.js
- 受領先: 環境管理タスク（environment-strategy）
- 出力テンプレート: assets/ecosystem.config.template.js
- 内容:
  以下を含む設定ファイル
  - apps配列の基本構造
  - 必須オプション（name, script, instances）
  - ログ設定（error_file, out_file, log_date_format）
  - 再起動戦略（max_memory_restart, min_uptime, max_restarts）

#### 成果物2

- 成果物名: 設定説明書
- 受領先: ユーザー
- 出力テンプレート: Markdown形式
- 内容:
  - 選択した実行モードの理由
  - instances数の根拠
  - 再起動戦略の説明
  - 次のステップ（環境変数設定、最適化）の案内
