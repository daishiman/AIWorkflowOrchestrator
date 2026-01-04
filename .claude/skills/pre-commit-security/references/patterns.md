# 検出パターン設計ガイド

## 概要

効果的なシークレット検出パターンを設計し、誤検知を最小化するためのガイド。正規表現ベース、エントロピーベース、コンテキストベースの検出手法とホワイトリスト戦略をカバーする。

## パターン設計原則

### 1. 正規表現ベースパターン

**基本構造**:

```regex
(キーワード)\s*[:=]\s*["']?(値パターン)["']?
```

**解説**:

- `(キーワード)`: 変数名や識別子（`api_key`, `password`など）
- `\s*`: 空白文字（0個以上）
- `[:=]`: 代入演算子
- `["']?`: 引用符（オプショナル）
- `(値パターン)`: 実際のシークレット値の形式

**例**:

```regex
# Generic API Key
(api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']

# OpenAI Key
sk-proj-[a-zA-Z0-9]{48}

# Anthropic Key
sk-ant-api03-[a-zA-Z0-9_-]{95}

# Password
(password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']
```

### 2. エントロピーベース検出

**目的**: 高ランダム性の文字列を検出（機械生成シークレット）

**パターン**:

```regex
# Base64 (40文字以上)
[a-zA-Z0-9+/]{40,}={0,2}

# Hex (64文字以上)
[a-f0-9]{64,}

# 高エントロピー英数字（32文字以上）
[a-zA-Z0-9]{32,}
```

**注意点**:

- 誤検知が多い（通常の長い文字列も検出）
- ホワイトリストと組み合わせて使用必須
- コンテキスト（変数名など）と組み合わせると精度向上

**改善例**:

```regex
# キーワード付きBase64
(secret|token|key)\s*[:=]\s*["'][a-zA-Z0-9+/]{40,}={0,2}["']
```

### 3. コンテキストベース検出

**目的**: 周辺コードの文脈を考慮して検出

**パターン例**:

```regex
# 接続文字列内のパスワード
(mysql|postgres|mongodb)://[^:]+:([^@]+)@

# Authorization ヘッダー
(authorization|auth)\s*[:=]\s*["']Bearer\s+[a-zA-Z0-9._-]+["']

# 環境変数設定
export\s+(AWS_SECRET_ACCESS_KEY|OPENAI_API_KEY)\s*=\s*["']?[^"'\s]+["']?
```

**メリット**:

- 誤検知が少ない
- シークレットの用途が明確

**デメリット**:

- パターンが複雑
- 検出漏れの可能性

### 4. プロバイダー固有パターン

**設計方針**: 各クラウドプロバイダーの公式形式に準拠

**AWS**:

```regex
# Access Key ID（必ず"AKIA"で始まる）
AKIA[0-9A-Z]{16}

# Secret Access Key（40文字のBase64風）
[a-zA-Z0-9/+=]{40}
```

**OpenAI**:

```regex
# 現在の形式（sk-proj-で始まる）
sk-proj-[a-zA-Z0-9]{48}

# レガシー形式
sk-[a-zA-Z0-9]{48}
```

**Anthropic**:

```regex
sk-ant-api03-[a-zA-Z0-9_-]{95}
```

**Stripe**:

```regex
# Live Key（本番環境）
sk_live_[0-9a-zA-Z]{24,}

# Test Key（開発環境）
sk_test_[0-9a-zA-Z]{24,}
```

**GitHub**:

```regex
# Personal Access Token (classic)
ghp_[a-zA-Z0-9]{36}

# Fine-grained PAT
github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}
```

**参照**: See [detection-pattern-library.md](detection-pattern-library.md) - 包括的なパターン集

## ホワイトリスト戦略

### 除外すべき文字列

**テスト・サンプル用語**:

- "example"
- "sample"
- "test"
- "mock"
- "fixture"
- "dummy"
- "placeholder"
- "your-api-key-here"
- "replace-with"
- "changeme"

**設定例（git-secrets）**:

```bash
git secrets --add --allowed 'example'
git secrets --add --allowed 'sample'
git secrets --add --allowed 'test'
git secrets --add --allowed 'mock'
```

**設定例（gitleaks）**:

```toml
[allowlist]
regexes = [
  "example",
  "sample",
  "test",
  "mock",
  "fixture",
  "dummy"
]
```

### 除外すべきファイルパス

**ドキュメント・テスト用ファイル**:

- `.env.example`
- `.env.template`
- `tests/fixtures/`
- `tests/mocks/`
- `docs/examples/`
- `README.md`
- `CONTRIBUTING.md`

**設定例（git-secrets）**:

```bash
git secrets --add --allowed '.env.example'
git secrets --add --allowed 'tests/fixtures/'
```

**設定例（gitleaks）**:

```toml
[allowlist]
paths = [
  ".env.example",
  ".env.template",
  "tests/fixtures/",
  "tests/mocks/",
  "docs/examples/",
  "README.md"
]
```

### コンテキストベースホワイトリスト

**コメント内のサンプル**:

```regex
# コメント行を除外（git-secretsは未対応、gitleaksのみ）
# Example: OPENAI_API_KEY=sk-proj-example...
```

**gitleaks設定**:

```toml
[allowlist]
regexes = [
  "^\\s*#.*",  # コメント行
  "^\\s*//.*"  # JavaScriptコメント
]
```

## パターンテスト手法

### 1. 単体テスト

**True Positive（検出されるべき）**:

```bash
# テストファイル作成
echo 'API_KEY="sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEF"' > test-tp.txt

# スキャン
git secrets --scan test-tp.txt  # ❌ エラーで終了すべき
gitleaks detect --source test-tp.txt --verbose  # ❌ リーク検出すべき

# クリーンアップ
rm test-tp.txt
```

**True Negative（検出されないべき）**:

```bash
# テストファイル作成
echo 'API_KEY="example"' > test-tn.txt

# スキャン
git secrets --scan test-tn.txt  # ✅ 成功すべき
gitleaks detect --source test-tn.txt --verbose  # ✅ リーク検出しないべき

# クリーンアップ
rm test-tn.txt
```

### 2. 誤検知率の測定

**メトリクス**:
| メトリクス | 計算式 | 目標値 |
| ------------------- | ------------------------------------- | ------ |
| True Positive率 | TP / (TP + FN) | ≥95% |
| True Negative率 | TN / (TN + FP) | ≥98% |
| False Positive率 | FP / (FP + TN) | ≤5% |
| False Negative率 | FN / (FN + TP) | ≤2% |

**測定スクリプト例**:

```bash
# scripts/validate-security.mjsを使用
node .claude/skills/pre-commit-security/scripts/validate-security.mjs --test-mode
```

## パターン管理のベストプラクティス

### 1. バージョン管理

**git-secretsの場合**:

```bash
# パターンリストをエクスポート
git secrets --list > .git-secrets-patterns.txt

# リポジトリに含める（チーム共有）
git add .git-secrets-patterns.txt
```

**gitleaksの場合**:

```toml
# .gitleaks.toml をリポジトリに含める
git add .gitleaks.toml
```

### 2. 定期的な更新

**更新タイミング**:

- 新しいクラウドサービス導入時
- APIキー形式変更時（例: OpenAI sk → sk-proj-）
- 四半期ごとの定期レビュー

**更新手順**:

1. 新しいパターンを追加
2. テストケースで検証
3. チームに展開
4. CI/CDの設定を更新

### 3. ドキュメント化

**記録すべき情報**:

- パターンの目的（どのシークレットを検出するか）
- 追加日時
- 追加理由（インシデント対応、新サービス導入など）
- 誤検知対応履歴

**例**:

```toml
# .gitleaks.toml
[[rules]]
id = "openai-api-key"
description = "OpenAI API Key - 2024-03-15追加（OpenAI導入に伴う）"
regex = '''sk-proj-[a-zA-Z0-9]{48}'''
tags = ["api-key", "openai"]
# 2024-05-10: sk-proj-形式に更新（APIキー形式変更）
```

## トラブルシューティング

### 誤検知が多い

**原因**:

- エントロピーベースパターンが広範すぎる
- ホワイトリストが不十分

**対策**:

1. 誤検知パターンを特定

   ```bash
   # 誤検知の例を記録
   echo "FP_EXAMPLE=..." >> false-positives.txt
   ```

2. ホワイトリストに追加

   ```bash
   git secrets --add --allowed '<pattern>'
   ```

3. パターンを限定化

   ```regex
   # 修正前（広範すぎ）
   [a-zA-Z0-9]{32,}

   # 修正後（キーワード付き）
   (secret|token|key)\s*[:=]\s*["'][a-zA-Z0-9]{32,}["']
   ```

### 検出漏れがある

**原因**:

- パターンが厳格すぎる
- 新しいシークレット形式に未対応

**対策**:

1. 検出漏れの例を分析

   ```bash
   # 実際のシークレット形式を確認
   echo "<leaked-secret>" | grep -oE '[a-zA-Z0-9_-]+'
   ```

2. パターンを追加・修正

   ```bash
   git secrets --add '<new-pattern>'
   ```

3. テストケースに追加
   ```bash
   # True Positiveテストに追加
   echo '<leaked-secret>' > test-new-pattern.txt
   git secrets --scan test-new-pattern.txt
   ```

### パフォーマンスが遅い

**原因**:

- 複雑な正規表現
- 大規模リポジトリでの全履歴スキャン

**対策**:

1. 差分のみスキャン

   ```bash
   # commit前の差分のみ
   gitleaks protect --staged
   ```

2. パターンを最適化

   ```regex
   # 修正前（バックトラッキング多）
   (api[_-]?key|apikey)\s*[:=]\s*["'].*["']

   # 修正後（具体的な文字クラス）
   (api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']
   ```

3. CI/CDで並列実行
   ```yaml
   jobs:
     gitleaks:
       strategy:
         matrix:
           path: [src/, tests/, config/]
       steps:
         - run: gitleaks detect --source ${{ matrix.path }}
   ```

## 次のステップ

- **チーム展開**: See [deployment.md](deployment.md)
- **CI/CD統合**: See [ci-integration.md](ci-integration.md)
- **パターンライブラリ**: See [detection-pattern-library.md](detection-pattern-library.md)
