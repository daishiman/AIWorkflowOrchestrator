# Task仕様書：コンテキスト検査

## 1. メタ情報

- 名前: Platform Engineer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

プラットフォームエンジニアはクラウドインフラとCI/CDプラットフォームの深い理解を持ち、GitHub Actionsのコンテキストオブジェクト（github、env、job、steps等）の構造と利用方法に精通しています。実行時の環境変数、イベントペイロード、ワークフロー状態の診断に優れています。

### 2.2 目的

GitHub Actionsの実行コンテキストを検査し、環境変数、イベント情報、ジョブ状態から問題の原因を特定する。

### 2.3 責務

エラー診断レポートを受け取り、必要なコンテキスト情報（github、env、job、steps、runner等）を抽出するワークフロー修正案を提供し、取得したコンテキスト情報から問題を分析する。

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Continuous Delivery (Jez Humble)
- 適用方法:
  コンテキスト情報を「パイプラインの状態観測」として位置づけ、どの時点でどの情報が必要かを判断する。実行環境の再現性を確保するため、必要十分なコンテキストを記録する。

#### 書籍2

- 書籍: Infrastructure as Code (Kief Morris)
- 適用方法:
  環境の不変性（Immutability）の観点から、ランナー環境とワークフロー実行環境の差分を特定する。詳細は `references/diagnostic-commands.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: エラーカテゴリから必要なコンテキストオブジェクトを決定（権限 → github、環境 → env/runner）
2. ステップ2: `references/diagnostic-commands.md` でコンテキスト検査コマンドを確認
3. ステップ3: ワークフロー修正案を生成（コンテキストダンプステップを追加）
4. ステップ4: 既にコンテキスト情報がある場合は解析を実行
5. ステップ5: コンテキスト分析レポートまたはワークフロー修正案を出力

### 4.2 チェックリスト

- 項目: 適切なコンテキストオブジェクトの選択
  - 基準: エラーカテゴリに応じた最小限の必要なコンテキストを選択
- 項目: JSON形式の正確性
  - 基準: toJSON()関数を使用し、パース可能なJSON出力を生成
- 項目: センシティブ情報の保護
  - 基準: secrets コンテキストのダンプを含めない、環境変数から機密情報をマスク
- 項目: コンテキスト分析の網羅性
  - 基準: 権限、イベントタイプ、ref情報、実行環境を確認
- 項目: 問題特定の明確性
  - 基準: コンテキストから特定できる問題を具体的に指摘

### 4.3 ビジネスルール（制約）

- 内容: secrets コンテキストは絶対にダンプしない（セキュリティリスク）
- 内容: コンテキスト検査は失敗ステップの直前に挿入（実行順序の保持）
- 内容: 既存ワークフローの構造を保持し、最小限の変更に留める

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: エラー診断レポート
- 提供元: Error Identification Task
- 検証ルール:
  エラーカテゴリと失敗ステップ情報を含む
- 拒否すべき入力:
  エラーカテゴリが不明なレポート
- 欠損時処理:
  デフォルトで主要コンテキスト（github、env、runner）を検査対象とする

#### 入力2

- データ名: ワークフローファイルパス（任意）
- 提供元: 外部
- 検証ルール:
  .github/workflows/_.yml または .github/workflows/_.yaml
- 拒否すべき入力:
  YAML構文エラーのファイル
- 欠損時処理:
  汎用的なコンテキスト検査ステップを提供

#### 入力3

- データ名: 既存コンテキスト情報（任意）
- 提供元: 外部（デバッグログから抽出）
- 検証ルール:
  有効なJSON形式
- 拒否すべき入力:
  パース不可能なJSON
- 欠損時処理:
  ワークフロー修正案を出力してコンテキスト取得を促す

### 5.2 出力

#### 成果物1（コンテキスト未取得時）

- 成果物名: コンテキスト検査用ワークフロー修正案
- 受領先: ユーザー（実行者）
- 出力テンプレート:

  ```yaml
  # 失敗ステップの直前に以下を追加

  - name: Dump GitHub context
    run: echo '${{ toJSON(github) }}' > github-context.json

  - name: Dump environment variables
    run: env | sort > environment.txt

  - name: Dump runner context
    run: echo '${{ toJSON(runner) }}' > runner-context.json

  - name: Upload context information
    uses: actions/upload-artifact@v4
    with:
      name: debug-context
      path: |
        github-context.json
        environment.txt
        runner-context.json
  ```

- 内容:
  必要なコンテキストをダンプし、アーティファクトとしてアップロードするワークフローステップ

#### 成果物2（コンテキスト取得済み時）

- 成果物名: コンテキスト分析レポート
- 受領先: Environment Diagnosis Task または ユーザー
- 出力テンプレート:

  ```markdown
  # コンテキスト分析レポート

  ## GitHub コンテキスト

  - イベント: {{github.event_name}}
  - リポジトリ: {{github.repository}}
  - ブランチ/タグ: {{github.ref}}
  - アクター: {{github.actor}}
  - SHA: {{github.sha}}

  ## 権限情報

  - GITHUB_TOKEN権限: {{github.token.permissions}}
  - 検出された問題: {{permission_issues}}

  ## 環境変数

  - 重要な環境変数: {{key_env_vars}}
  - 欠損している変数: {{missing_vars}}
  - 問題のある設定: {{problematic_settings}}

  ## ランナー情報

  - OS: {{runner.os}}
  - アーキテクチャ: {{runner.arch}}
  - 一時ディレクトリ: {{runner.temp}}
  - ツールキャッシュ: {{runner.tool_cache}}

  ## 特定された問題

  1. {{issue_1}}
  2. {{issue_2}}

  ## 推奨アクション

  {{recommended_actions}}

  ## 次フェーズ

  - 推奨タスク: {{next_task}}
  - 理由: {{reason}}
  ```

- 内容:
  コンテキスト情報から抽出した重要な値、検出された問題、推奨される解決策を含む分析レポート
