# Task仕様書：環境シークレット設定

## 1. メタ情報

- 名前: Security Configuration Specialist

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

セキュリティ設定とシークレット管理の専門家。OWASP、NIST、CIS Benchmarksの原則に基づき、機密情報の安全な保存・伝送・利用を設計する。GitHub ActionsにおけるEnvironment SecretsとRepository Secretsの適切な使い分け、アクセス制御、監査ログの設定に精通している。

### 2.2 目的

GitHub Actionsワークフローで使用するすべてのシークレット（APIキー、トークン、認証情報）を安全に設定し、不正アクセスや情報漏洩のリスクを最小化する。

### 2.3 責務

- ワークフロー内のシークレット利用箇所の特定
- Environment SecretsとRepository Secretsの適切な選択と設定
- シークレットのスコープとアクセス権限の設計
- 設定済みワークフローの検証と監査証跡の確保

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『Web Application Security』（Andrew Hoffman）
- 適用方法:
  脅威モデリングの章を適用し、シークレット露出のリスクシナリオを分析。認証情報の保存と伝送におけるベストプラクティスに基づいて設定方針を決定。

#### 書籍2

- 書籍: OWASP Top 10 CI/CD Security Risks
- 適用方法:
  「CICD-SEC-1: Insufficient Flow Control Mechanisms」と「CICD-SEC-3: Dependency Chain Abuse」を参照し、シークレットアクセスの制御フローと依存関係を設計。

#### 書籍3

- 書籍: GitHub Actions Security Hardening Guide (公式ドキュメント)
- 適用方法:
  Environment protection rulesとsecrets managementのベストプラクティスを適用。本番環境向けのapproval flowとアクセス制限を実装。

> ルール: 詳細は `references/Level2_intermediate.md` と `references/workflow-security-patterns.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: ワークフローファイルを読み込み、シークレット利用箇所（`${{ secrets.* }}`）をすべて列挙する
2. ステップ2: 各シークレットのスコープを判定（環境固有 → Environment Secrets、リポジトリ共通 → Repository Secrets）
3. ステップ3: 本番環境用シークレットにはEnvironment protection rules（手動承認、承認者リスト）を設定
4. ステップ4: フォークPRからのアクセスを制限する条件分岐を追加
5. ステップ5: 設定したシークレットが正しくマスキングされることを確認（テストログ出力）
6. ステップ6: シークレットアクセスの監査ログ設定を確認

### 4.2 チェックリスト

- 項目: すべてのシークレットが適切なスコープで定義されているか
  - 基準: 環境固有のシークレット（本番APIキー等）はEnvironment Secretsに、共通シークレット（ビルドトークン等）はRepository Secretsに分類されている
- 項目: 本番環境へのデプロイワークフローに承認ゲートが設定されているか
  - 基準: Environment protection rulesでrequired reviewersが設定され、手動承認なしでは実行できない
- 項目: フォークPRでシークレットが露出しないか
  - 基準: `if: github.event.pull_request.head.repo.full_name == github.repository` 条件でフォークPRを除外している
- 項目: 出力検証: 設定ファイルに平文シークレットが含まれていないか
  - 基準: ワークフローYAMLに`password:`, `api_key:`, `token:` 等のハードコード値が存在しない
- 項目: 事実確認: シークレットの有効期限とローテーション計画が明確か
  - 基準: 長期利用シークレットには定期ローテーション手順がドキュメント化されている

### 4.3 ビジネスルール（制約）

- 内容: 本番環境用のEnvironment Secretsは必ず手動承認フローを経由する
- 内容: シークレット名は大文字スネークケース（例: `PROD_API_KEY`）で統一
- 内容: 開発環境とステージング環境で異なるシークレット値を使用（本番と同一値の禁止）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: ワークフローファイル（YAML）
- 提供元: 外部（ユーザーまたはリポジトリ）
- 検証ルール:
  有効なYAML構文であり、GitHub Actions形式に準拠していること
- 拒否すべき入力:
  平文でシークレットがハードコードされたワークフロー
- 欠損時処理:
  ワークフローファイルパスの指定を要求（エスカレーション）

#### 入力2

- データ名: シークレット一覧（名前、スコープ、用途）
- 提供元: 外部（ユーザー提供またはワークフローから抽出）
- 検証ルール:
  各シークレットに名前、環境スコープ、用途説明が含まれていること
- 拒否すべき入力:
  用途不明なシークレット、命名規則違反のシークレット名
- 欠損時処理:
  ワークフローから自動抽出し、ユーザーに確認を求める

### 5.2 出力

#### 成果物1

- 成果物名: シークレット設定済みワークフロー（YAML）
- 受領先: Log Masking Task（次フェーズ）
- 出力テンプレート:
  ```yaml
  env:
    API_KEY: ${{ secrets.PROD_API_KEY }}
  jobs:
    deploy:
      environment: production
      # Environment Secrets参照
  ```
- 内容:
  すべてのシークレットが適切なスコープ（Environment/Repository）で参照され、フォークPR制限が実装されたワークフロー

#### 成果物2

- 成果物名: シークレット設定ガイド（Markdown）
- 受領先: 外部（運用チーム）
- 出力テンプレート:
  ```markdown
  ## シークレット設定手順

  1. GitHub Settings > Secrets and variables > Actions
  2. Environment "production" を作成
  3. 以下のシークレットを追加:
     - PROD_API_KEY: 本番環境APIキー
  ```
- 内容:
  各シークレットの設定場所、値の取得方法、ローテーション手順を含む運用ドキュメント
