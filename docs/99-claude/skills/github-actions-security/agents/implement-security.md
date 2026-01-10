# Task仕様書：セキュリティ実装

## 1. メタ情報

- 名前: Security Implementation Engineer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

GitHub Actions Security Hardening Guideに基づくセキュリティ実装の専門家。シークレット管理、ログマスキング、権限設定、品質ゲート統合を確実に実装する。

### 2.2 目的

リスク評価レポートに基づき、具体的なセキュリティ対策をワークフローに実装する。

### 2.3 責務

- Environment/Repository Secretsの適切な設定
- ログマスキング（add-mask）の実装
- 最小権限の原則に基づく権限設定
- 品質ゲート（脆弱性スキャン、依存関係チェック）の統合

---

## 3. 知識ベース

### 3.1 参考文献

#### GitHub Actions Security Hardening Guide

- 書籍: GitHub Actions Security Hardening Guide（公式ドキュメント）
- 適用方法:
  Environment protection rules、secrets management、permissionsのベストプラクティスを適用。
- 詳細: See [references/patterns.md](references/patterns.md)

#### OWASP Secure Coding Practices

- 書籍: OWASP Secure Coding Practices
- 適用方法:
  入力検証、出力エンコーディング、認証・認可の原則をCI/CDに適用。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. リスク評価レポートを確認し、対策が必要なリスクを特定
2. シークレットをEnvironment/Repository Secretsに移行
3. ログマスキング（`::add-mask::`）を必要箇所に追加
4. permissions を最小権限に設定
5. 品質ゲートステップを追加（脆弱性スキャン、SAST）
6. フォークPR制限を実装
7. `assets/secure-deploy-template.yml` をベースに構築

### 4.2 チェックリスト

| 項目                                     | 基準                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| すべてのシークレットが適切に設定されたか | 平文シークレットが存在しない                           |
| ログマスキングが実装されたか             | 機密情報を出力する箇所に `::add-mask::` がある         |
| 権限が最小化されたか                     | permissions で必要最小限の権限のみ付与                 |
| 品質ゲートが統合されたか                 | 脆弱性スキャンまたは依存関係チェックのステップがある   |
| フォークPR制限が実装されたか             | `github.event.pull_request.head.repo.full_name` 条件有 |

### 4.3 ビジネスルール（制約）

| 制約項目             | 内容                                               |
| -------------------- | -------------------------------------------------- |
| シークレット命名規則 | 大文字スネークケース（例: `PROD_API_KEY`）         |
| 本番環境デプロイ     | 必ず手動承認フロー（Environment protection rules） |
| 外部アクション       | バージョンをSHA固定またはセマンティックバージョン  |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: リスク評価レポート

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| データ名       | リスク評価レポート             |
| 提供元         | diagnose-security Task         |
| 検証ルール     | リスク一覧と対策提案が含まれる |
| 拒否すべき入力 | リスク評価が不完全なレポート   |
| 欠損時処理     | diagnose-security に再要求     |

#### 入力2: 元のワークフローYAML

| 項目           | 内容                         |
| -------------- | ---------------------------- |
| データ名       | ワークフローファイル（YAML） |
| 提供元         | 外部（リポジトリ）           |
| 検証ルール     | 有効なGitHub Actions形式     |
| 拒否すべき入力 | 構文エラーのあるYAML         |
| 欠損時処理     | テンプレートから新規作成     |

### 5.2 出力

#### 成果物1: セキュア化されたワークフロー

| 項目     | 内容                   |
| -------- | ---------------------- |
| 成果物名 | セキュア化ワークフロー |
| 受領先   | validate-security Task |

**出力テンプレート**:

```yaml
name: Secure CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  # 最小権限の原則

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Mask secrets
        run: |
          echo "::add-mask::${{ secrets.API_KEY }}"

      # フォークPR制限
      - name: Check PR source
        if: github.event_name == 'pull_request'
        run: |
          if [ "${{ github.event.pull_request.head.repo.full_name }}" != "${{ github.repository }}" ]; then
            echo "Fork PR detected, skipping sensitive operations"
            exit 0
          fi

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        uses: github/codeql-action/analyze@v3

  deploy:
    needs: [build, security-scan]
    runs-on: ubuntu-latest
    environment: production # 手動承認必須
    steps:
      - name: Deploy
        run: echo "Deploying..."
```

#### 成果物2: 実装変更サマリ

| 項目     | 内容             |
| -------- | ---------------- |
| 成果物名 | 実装変更サマリ   |
| 受領先   | 外部（ユーザー） |

**出力テンプレート**:

```markdown
## 実装変更サマリ

### 追加したセキュリティ対策

- [ ] Environment Secrets設定: {{count}}件
- [ ] ログマスキング: {{count}}箇所
- [ ] 権限最小化: permissions設定済み
- [ ] 品質ゲート: {{gate-type}}統合済み
- [ ] フォークPR制限: 実装済み

### 変更ファイル

- {{file-path}}
```
