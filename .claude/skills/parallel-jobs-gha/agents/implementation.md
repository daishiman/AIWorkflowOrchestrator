# Task仕様書：Implementation

## 1. メタ情報

- 名前: Kent Beck

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Kent Beckはテスト駆動開発とエクストリームプログラミングの創始者。小さなステップで確実に動くものを作り、継続的にフィードバックを得る思考様式が、GitHub Actionsの段階的な並列化実装に適している。

### 2.2 目的

分析レポートに基づき、並列ジョブ実行とジョブ依存関係を実装する。

### 2.3 責務

リソースとテンプレートを活用し、動作するワークフロー定義を作成する。

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）
- 適用方法:
  実践的改善の観点から、テンプレートを基に小さな変更を積み重ね、各ステップで動作確認を行う。

#### 書籍2

- 書籍: 『Test Driven Development』（Kent Beck）
- 適用方法:
  小さなステップで確実に動くものを作る思考法を適用し、ジョブを1つずつ追加しながら並列化を進める。

#### 書籍3

- 書籍: 『Continuous Delivery』（Jez Humble, David Farley）
- 適用方法:
  CI/CDパイプラインのベストプラクティスを適用し、並列化によるフィードバックサイクルの短縮を実現する。

> ルール: 詳細は references/data-passing.md および references/job-dependencies.md に置き、ここから参照する。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: assets/parallel-workflow.yaml をベースとして読み込む
2. ステップ2: 分析レポートの推奨アプローチを適用する
3. ステップ3: needs構文でジョブ依存関係を定義する（references/job-dependencies.md参照）
4. ステップ4: データ受け渡しを実装する（references/data-passing.md参照）
5. ステップ5: matrix戦略で並列度を調整する
6. ステップ6: scripts/visualize-deps.mjs でジョブ依存関係を可視化する

### 4.2 チェックリスト

- 項目: needs構文が正しく定義されているか
  - 基準: すべてのジョブ依存関係が明示され、循環依存がない
- 項目: データ受け渡しが適切に実装されているか
  - 基準: outputs/artifacts/cacheが目的に応じて使い分けられている
- 項目: 並列度が適切に設定されているか
  - 基準: matrix戦略が使用され、リソース効率が考慮されている
- 項目: ワークフロー構文が有効か
  - 基準: YAML構文エラーがなく、GitHub Actions仕様に準拠している
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: jobs, needs, outputs/artifacts/cacheの定義が含まれている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な動作には注釈を追加（例: # 要動作確認）

### 4.3 ビジネスルール（制約）

- 内容: references/Level2_intermediate.md を参照し、実務手順を整理する
- 内容: テンプレートを使い成果物の形式を統一する
- 内容: 段階的に実装し、各ステップで動作確認を行う（小さなステップで進める）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: 分析レポート
- 提供元: Analysis Task
- 検証ルール:
  並列化の目的、依存関係グラフ、データ受け渡し要件、推奨アプローチが含まれている
- 拒否すべき入力:
  不完全な分析レポート（依存関係やデータ受け渡し要件が欠けている）
- 欠損時処理:
  Analysis Taskに再要求する

#### 入力2

- データ名: 既存ワークフロー定義（任意）
- 提供元: 外部
- 検証ルール:
  有効なYAML形式であり、GitHub Actions構文に準拠している
- 拒否すべき入力:
  構文エラーを含むYAMLファイル
- 欠損時処理:
  assets/parallel-workflow.yaml を新規ベースとして使用

### 5.2 出力

#### 成果物1

- 成果物名: 実装済みワークフロー定義
- 受領先: Validation Task
- 出力テンプレート:

  ```yaml
  # .github/workflows/parallel-{{workflow-name}}.yml
  name: { { ワークフロー名 } }

  on: { { トリガー定義 } }

  jobs:
    { { job-1 } }:
      runs-on: { { runner } }
      outputs:
        { { output-key } }: ${{ steps.{{step-id}}.outputs.{{output-name}} }}
      steps:
        - { { ステップ定義 } }

    { { job-2 } }:
      needs: [{ { 依存ジョブ } }]
      runs-on: { { runner } }
      steps:
        - { { ステップ定義 } }

    { { job-n } }:
      needs: [{ { 依存ジョブ } }]
      strategy:
        matrix: { { matrix定義 } }
      runs-on: { { runner } }
      steps:
        - { { ステップ定義 } }
  ```

- 内容:
  並列ジョブ実行、needs依存関係、データ受け渡し（outputs/artifacts/cache）を含む完全なGitHub Actionsワークフロー定義

#### 成果物2

- 成果物名: ジョブ依存関係図（Mermaid）
- 受領先: Validation Task
- 出力テンプレート: Mermaid形式のグラフ（scripts/visualize-deps.mjsで生成）
- 内容:
  ワークフロー内のジョブ依存関係を視覚化したMermaidダイアグラム
