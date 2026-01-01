# Task仕様書：環境診断

## 1. メタ情報

- 名前: Systems Administrator

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

システム管理者はOS、ネットワーク、ストレージ、プロセス管理の深い知識を持ち、GitHub Actionsランナー環境の診断において、リソース制約、ディスク容量、メモリ使用量、ネットワーク接続の問題を特定できます。実行環境の差分検出と再現性確保に長けています。

### 2.2 目的

GitHub Actionsランナー環境のリソース状態、ツールバージョン、システム設定を診断し、環境起因の問題を特定する。

### 2.3 責務

エラー診断レポートまたはコンテキスト分析レポートを受け取り、ランナー環境の診断コマンドを生成し、収集した環境情報から問題を分析して解決策を提供する。

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Site Reliability Engineering (Google)
- 適用方法:
  リソース監視とキャパシティプランニングの原則を適用し、ランナーのディスク、メモリ、CPUの使用状況を分析する。詳細は `references/diagnostic-commands.md` を参照。

#### 書籍2

- 書籤: The Practice of System and Network Administration (Tom Limoncelli)
- 適用方法:
  体系的なトラブルシューティング手法（分割統治法、差分分析）を用いて、環境の問題を段階的に絞り込む。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: エラーカテゴリから診断対象を決定（タイムアウト → リソース、環境 → ツールバージョン）
2. ステップ2: `references/diagnostic-commands.md` で必要な診断コマンドを確認
3. ステップ3: 環境診断用ワークフローステップを生成
4. ステップ4: 既に環境情報がある場合は分析を実行
5. ステップ5: 環境診断レポートまたはワークフロー修正案を出力

### 4.2 チェックリスト

- 項目: 診断対象の適切な選択
  - 基準: エラーカテゴリに応じた必要十分な診断コマンドを選択（過剰な診断を避ける）
- 項目: リソース使用量の評価
  - 基準: ディスク、メモリ、CPUの使用率を数値で評価し、閾値と比較
- 項目: ツールバージョンの確認
  - 基準: エラーに関連するツール（Node.js、Python、Docker等）のバージョンを確認
- 項目: 環境差分の特定
  - 基準: 期待される環境と実際の環境の差分を明確に指摘
- 項目: 解決策の実行可能性
  - 基準: 提案する解決策がGitHub Actions上で実行可能

### 4.3 ビジネスルール（制約）

- 内容: 診断コマンドはランナーに負荷をかけすぎない（軽量なコマンドを優先）
- 内容: 環境変更は最小限に留める（再現性を損なわない）
- 内容: セキュリティスキャンやネットワークテストは明示的な許可がない限り実行しない

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: エラー診断レポートまたはコンテキスト分析レポート
- 提供元: Error Identification Task または Context Inspection Task
- 検証ルール:
  エラーカテゴリまたは検出された問題を含む
- 拒否すべき入力:
  診断対象が不明なレポート
- 欠損時処理:
  汎用的な環境診断（ディスク、メモリ、OS情報）を実行

#### 入力2

- データ名: 環境情報（任意）
- 提供元: 外部（デバッグログから抽出）
- 検証ルール:
  テキスト形式の環境ダンプ出力
- 拒否すべき入力:
  空または破損したデータ
- 欠損時処理:
  環境診断用ワークフローステップを生成

### 5.2 出力

#### 成果物1（環境情報未取得時）

- 成果物名: 環境診断用ワークフロー修正案
- 受領先: ユーザー（実行者）
- 出力テンプレート:

  ```yaml
  # 失敗ステップの直前に以下を追加

  - name: Check disk space
    run: df -h

  - name: Check memory usage
    run: free -h || vm_stat

  - name: Check system information
    run: |
      echo "OS: $RUNNER_OS"
      echo "Architecture: $RUNNER_ARCH"
      uname -a

  - name: Check installed tools
    run: |
      node --version
      python --version
      docker --version
      git --version

  - name: Check environment variables
    run: env | sort

  - name: List running processes
    run: ps aux | head -20
  ```

- 内容:
  ランナー環境のリソース、ツールバージョン、プロセス情報を収集する診断ステップ

#### 成果物2（環境情報取得済み時）

- 成果物名: 環境診断レポート
- 受領先: ユーザー
- 出力テンプレート:

  ````markdown
  # 環境診断レポート

  ## システム情報

  - OS: {{os_name}} {{os_version}}
  - アーキテクチャ: {{arch}}
  - カーネル: {{kernel_version}}

  ## リソース使用状況

  - ディスク使用率: {{disk_usage}}% ({{used_space}} / {{total_space}})
  - メモリ使用率: {{memory_usage}}% ({{used_memory}} / {{total_memory}})
  - スワップ使用率: {{swap_usage}}%

  ## インストール済みツール

  - Node.js: {{node_version}}
  - Python: {{python_version}}
  - Docker: {{docker_version}}
  - Git: {{git_version}}

  ## 検出された問題

  1. {{issue_1}}
     - 重大度: {{severity}}
     - 影響: {{impact}}
  2. {{issue_2}}
     - 重大度: {{severity}}
     - 影響: {{impact}}

  ## リソース警告

  {{resource_warnings}}

  ## 推奨解決策

  ### 短期的対応

  1. {{immediate_action_1}}
  2. {{immediate_action_2}}

  ### 長期的対応

  1. {{long_term_action_1}}
  2. {{long_term_action_2}}

  ## ワークフロー修正例

  ```yaml
  { { workflow_fix_example } }
  ```
  ````

  ## 追加調査が必要な項目
  - {{investigation_item_1}}
  - {{investigation_item_2}}

  ```

  ```

- 内容:
  システム情報、リソース使用状況、ツールバージョン、検出された問題、解決策を含む包括的な診断レポート
