---
name: infrastructure-as-code
description: |
  Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。
  環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。

  専門分野:
  - 宣言的構成管理: あるべき状態をコードで定義
  - 環境変数設計: 開発/ステージング/本番環境の構成管理
  - Secret管理: セキュアなクレデンシャル管理
  - Railway統合: Railway CLIとGit統合による自動デプロイ

  使用タイミング:
  - Railway構成を設計・最適化する時
  - 環境変数とSecretの管理戦略を設計する時
  - 複数環境間の構成差分を最小化する時
  - ローカル開発環境とクラウド環境を同期する時

  Use proactively when users need to manage environment variables,
  configure Railway deployments, or implement infrastructure as code practices.
version: 1.0.0
---

# Infrastructure as Code

## 概要

このスキルは、Kief Morrisの『Infrastructure as Code』の原則に基づき、
インフラストラクチャ構成をコードとして管理し、再現可能で一貫性のある環境を実現します。

**主要な価値**:
- インフラ構成の宣言的定義と自動化
- 環境間の構成差分の最小化
- セキュアなSecret管理
- 変更の追跡と監査可能性

**対象ユーザー**:
- Railway上でアプリケーションをデプロイするDevOps
- 環境変数管理を最適化したい開発者
- インフラ構成のコード化を実現したいチーム

## リソース構造

```
infrastructure-as-code/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── iac-principles.md                      # IaC原則と理論
│   ├── environment-variables.md               # 環境変数設計パターン
│   ├── secrets-management.md                  # Secret管理ベストプラクティス
│   └── railway-integration.md                 # Railway統合詳細
├── scripts/
│   └── validate-env.mjs                       # 環境変数検証スクリプト
└── templates/
    ├── railway-json-template.json             # railway.json テンプレート
    └── env-example-template.txt               # .env.example テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# IaC原則と理論
cat .claude/skills/infrastructure-as-code/resources/iac-principles.md

# 環境変数設計パターン
cat .claude/skills/infrastructure-as-code/resources/environment-variables.md

# Secret管理ベストプラクティス
cat .claude/skills/infrastructure-as-code/resources/secrets-management.md

# Railway統合詳細
cat .claude/skills/infrastructure-as-code/resources/railway-integration.md
```

### スクリプト実行

```bash
# 環境変数の検証
node .claude/skills/infrastructure-as-code/scripts/validate-env.mjs .env.example .env
```

### テンプレート参照

```bash
# railway.json テンプレート
cat .claude/skills/infrastructure-as-code/templates/railway-json-template.json

# .env.example テンプレート
cat .claude/skills/infrastructure-as-code/templates/env-example-template.txt
```

## いつ使うか

### シナリオ1: Railway構成の設計

**状況**: 新しいプロジェクトをRailwayにデプロイしたい

**適用条件**:
- [ ] Next.js/Node.jsアプリケーション
- [ ] GitHub連携でのデプロイ
- [ ] 環境変数の設定が必要

**期待される成果**: 再現可能なrailway.json構成

### シナリオ2: 環境変数管理の最適化

**状況**: 開発/ステージング/本番で環境変数がバラバラ

**適用条件**:
- [ ] 複数環境が存在
- [ ] 環境ごとの設定差分が管理困難
- [ ] Secret漏洩リスクがある

**期待される成果**: 一元管理された環境変数戦略

### シナリオ3: ローカル開発環境の同期

**状況**: ローカルと本番で動作が異なる

**適用条件**:
- [ ] 環境変数の設定漏れがある
- [ ] .envファイルの手動管理
- [ ] 本番環境との乖離

**期待される成果**: Railway CLIによる環境同期

## ワークフロー

### Phase 1: 現状分析と要件定義

**目的**: 現在のインフラ構成を理解し、IaC化の要件を定義

**ステップ**:
1. **現在の構成確認**:
   - 使用中のサービス（Railway, Neon等）
   - 環境変数の一覧
   - Secret情報の所在

2. **環境の特定**:
   - 開発環境
   - ステージング環境
   - 本番環境

**判断基準**:
- [ ] すべてのサービスが特定されているか？
- [ ] 環境変数が一覧化されているか？
- [ ] Secret情報の管理方法が把握されているか？

**リソース**: `resources/iac-principles.md`

### Phase 2: 環境変数設計

**目的**: 環境変数の分類と管理戦略を設計

**ステップ**:
1. **変数の分類**:
   - 機密情報（Secret）: API Key, Token
   - 環境固有: DATABASE_URL, API_ENDPOINT
   - 共通設定: NODE_ENV, LOG_LEVEL

2. **管理場所の決定**:
   - GitHub Secrets: CI/CD用
   - Railway Variables: デプロイ用
   - .env.example: ドキュメント用

**判断基準**:
- [ ] すべての変数が分類されているか？
- [ ] 管理場所が決定しているか？
- [ ] .env.exampleが更新されているか？

**リソース**: `resources/environment-variables.md`

### Phase 3: Railway構成の実装

**目的**: railway.jsonによる宣言的構成

**ステップ**:
1. **railway.json作成**:
   - ビルドコマンド設定
   - スタートコマンド設定
   - 再起動ポリシー設定

2. **環境変数の設定**:
   - Neon Plugin連携（DATABASE_URL）
   - Railway Secrets設定
   - Railway Variables設定

**判断基準**:
- [ ] railway.jsonが作成されているか？
- [ ] 環境変数がRailwayに設定されているか？
- [ ] Neon連携が構成されているか？

**リソース**: `resources/railway-integration.md`

### Phase 4: 検証とドキュメント

**目的**: 構成の検証とメンテナンス可能なドキュメント作成

**ステップ**:
1. **動作検証**:
   - ローカル開発での動作確認
   - Railway CLI経由での変数確認
   - デプロイ動作確認

2. **ドキュメント更新**:
   - .env.example更新
   - README更新
   - 変更履歴記録

**判断基準**:
- [ ] ローカルと本番で同一動作か？
- [ ] ドキュメントが最新か？

## 核心知識

### IaCの4原則

1. **宣言的定義**: あるべき状態をコードで記述
2. **べき等性**: 何度実行しても同じ結果
3. **バージョン管理**: すべての変更を追跡
4. **不変インフラ**: 変更ではなく再構築

### 環境変数の分類

| 種別 | 例 | 管理場所 |
|------|-----|---------|
| 機密情報 | API_KEY, DB_PASSWORD | GitHub Secrets, Railway Secrets |
| 環境固有 | DATABASE_URL, API_ENDPOINT | Railway Variables |
| 共通設定 | NODE_ENV, LOG_LEVEL | railway.json, .env |

### Railway構成要素

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

詳細は `resources/railway-integration.md` を参照

## ベストプラクティス

### すべきこと

1. **Secretはコードに含めない**:
   - ✅ 環境変数経由で注入
   - ✅ .env.exampleにダミー値
   - ✅ .gitignoreに.envを追加

2. **環境差分を最小化**:
   - ✅ 同一構成を全環境に適用
   - ✅ 環境固有設定は環境変数で
   - ✅ Railway CLIでローカルと同期

3. **構成をコード管理**:
   - ✅ railway.jsonをリポジトリに含める
   - ✅ 変更はPR経由でレビュー
   - ✅ 変更履歴を追跡

### 避けるべきこと

1. **ハードコードSecret**:
   - ❌ コード内に直接記述
   - ❌ コミット履歴に残す
   - ❌ ログに出力

2. **手動構成**:
   - ❌ 管理画面での手動設定のみ
   - ❌ ドキュメント化されていない設定
   - ❌ 再現不可能な構成

## トラブルシューティング

### 問題1: ローカルと本番で動作が異なる

**症状**: ローカルでは動作するが、本番で動作しない

**原因**:
- 環境変数の設定漏れ
- 環境変数の値が異なる

**解決策**:
1. Railway CLIで環境変数を確認
2. .env.exampleと比較
3. 不足分を設定

### 問題2: Secret漏洩の疑い

**症状**: APIキーやトークンがログに出力された

**原因**:
- 環境変数をechoしている
- エラーメッセージに含まれている

**解決策**:
1. 即座にSecretをローテーション
2. コードから直接参照を排除
3. ログ出力を見直し

### 問題3: デプロイが失敗する

**症状**: Railway上でビルドまたは起動が失敗

**原因**:
- 環境変数の未設定
- railway.jsonの構文エラー
- ビルドコマンドの誤り

**解決策**:
1. Railway Logsで詳細確認
2. 環境変数一覧を確認
3. railway.jsonを検証

## 関連スキル

- **ci-cd-pipelines** (`.claude/skills/ci-cd-pipelines/SKILL.md`): CI/CDパイプライン設計
- **deployment-strategies** (`.claude/skills/deployment-strategies/SKILL.md`): デプロイ戦略
- **monitoring-alerting** (`.claude/skills/monitoring-alerting/SKILL.md`): モニタリング

## メトリクス

### 環境変数カバレッジ

**目標**: 100%（すべての必要変数が設定済み）

### 構成変更追跡率

**目標**: 100%（すべての変更がコード経由）

### Secret漏洩インシデント

**目標**: 0件

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - Railway統合とIaC原則 |

## 参考文献

- **『Infrastructure as Code』** Kief Morris著
  - Chapter 1: What Is Infrastructure as Code?
  - Chapter 6: Building Servers as Code

- **Railway Documentation**
  - https://docs.railway.app/
