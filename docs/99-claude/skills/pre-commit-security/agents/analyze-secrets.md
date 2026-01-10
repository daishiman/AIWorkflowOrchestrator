# Task仕様書: 機密情報パターン分析

## メタデータ

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| Task ID  | analyze-secrets                                              |
| 目的     | プロジェクトで検出すべき機密情報パターンを特定・優先順位付け |
| 入力     | コードベース、使用サービス一覧、環境変数設定                 |
| 出力     | 検出パターン仕様、リスク評価レポート                         |
| 前提条件 | プロジェクトのGitリポジトリにアクセス可能                    |
| 完了条件 | 検出すべきシークレットの種類と優先度が明確化されている       |

## 目的

プロジェクトで使用するクラウドサービス・API・データベース接続情報を洗い出し、pre-commit hookで検出すべき機密情報パターンを特定する。リスク評価に基づいて検出パターンの優先度を決定する。

## アクション

### 1. プロジェクトの機密情報調査

**実行内容**:

```bash
# 環境変数ファイルの確認
cat .env.example 2>/dev/null || echo "No .env.example found"

# package.jsonから使用サービスを推測
cat package.json | grep -E "(aws|openai|anthropic|stripe|mongodb|mysql|redis)" || true

# 設定ファイルの確認
ls -la config/ 2>/dev/null || true
```

**質問事項**:

- どのクラウドプロバイダーを使用していますか？（AWS、GCP、Azure等）
- どのSaaS APIを使用していますか？（OpenAI、Anthropic、Stripe等）
- データベース接続文字列を使用していますか？（MySQL、PostgreSQL、MongoDB等）
- Webhook URLを使用していますか？（Discord、Slack等）
- 証明書・秘密鍵を使用していますか？（SSL、SSH、PGP等）

### 2. 既存コードベースのスキャン

**実行内容**:

```bash
# 潜在的なシークレット候補を検索
grep -r -E "(api[_-]?key|password|secret|token|auth)" --include="*.ts" --include="*.js" --include="*.json" . | head -20
```

**確認ポイント**:

- ハードコードされたシークレットは存在するか？
- 環境変数から読み込む設計になっているか？
- テストフィクスチャにモックシークレットが含まれているか？

### 3. リスク評価

**評価基準**:

| リスクレベル | 説明                         | 例                            |
| ------------ | ---------------------------- | ----------------------------- |
| Critical     | 本番環境へのフルアクセス権限 | AWS Secret Access Key         |
| High         | 課金・データアクセスが可能   | Stripe Live Key、DB接続文字列 |
| Medium       | 限定的なアクセス権限         | OpenAI API Key                |
| Low          | 開発・テスト環境のみアクセス | Stripe Test Key               |

### 4. 検出パターン仕様の作成

**出力形式**:

```markdown
# 検出パターン仕様

## 優先度: Critical

- AWS Access Key ID: `AKIA[0-9A-Z]{16}`
- AWS Secret Access Key: `[a-zA-Z0-9/+=]{40}`

## 優先度: High

- OpenAI API Key: `sk-proj-[a-zA-Z0-9]{48}`
- Anthropic API Key: `sk-ant-api03-[a-zA-Z0-9_-]{95}`
- Stripe Live Key: `sk_live_[0-9a-zA-Z]{24,}`

## 優先度: Medium

- Discord Webhook: `https://discord\.com/api/webhooks/\d+/[a-zA-Z0-9_-]+`

## ホワイトリスト

- ファイル: `.env.example`, `tests/fixtures/`, `docs/examples/`
- 文字列: "example", "sample", "test", "mock"
```

## 成果物

1. **検出パターン仕様書** (Markdown形式)
   - 優先度別のパターンリスト
   - ホワイトリスト定義

2. **リスク評価レポート** (Markdown形式)
   - 各シークレットのリスクレベル
   - 既存リークの有無

## 参照リソース

- See [references/detection-pattern-library.md](../references/detection-pattern-library.md) - パターンテンプレート集
- See [references/basics.md](../references/basics.md) - ツール選択基準

## 判断基準

### 進めてよい条件

- プロジェクトで使用する主要サービスを特定できた
- 少なくとも3種類以上の検出パターンを定義できた
- ホワイトリスト戦略を策定できた

### 追加調査が必要な条件

- 使用サービスが不明確
- 環境変数の設計が未整備
- テストフィクスチャが実際のシークレット形式と同じ

## 次のTask

**Task**: configure-hooks (agents/configure-hooks.md)

**引継ぎ内容**:

- 検出パターン仕様書
- リスク評価レポート
- ホワイトリスト定義
