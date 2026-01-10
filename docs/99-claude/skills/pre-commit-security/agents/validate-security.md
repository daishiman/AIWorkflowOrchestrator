# Task仕様書: セキュリティ検証

## メタデータ

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| Task ID  | validate-security                                           |
| 目的     | hookの有効性を検証し、Git履歴をスキャンして既存リークを発見 |
| 入力     | 設定済みhook、テスト結果レポート                            |
| 出力     | 検証レポート、履歴スキャン結果、改善提案                    |
| 前提条件 | configure-hooksが完了している                               |
| 完了条件 | 検出精度が確認され、Git履歴に既存リークがないことを確認     |

## 目的

pre-commit hookの検出精度を測定し、誤検知率を最適化する。Git履歴全体をスキャンして既存の機密情報漏洩を発見し、必要に応じてインシデント対応を行う。CI/CD統合の準備を整える。

## アクション

### 1. 検出精度テスト

**テストケース作成**:

```bash
# テスト用ディレクトリ作成
mkdir -p .security-test
cd .security-test

# True Positive（正しく検出されるべき）
cat > test-tp.txt <<'EOF'
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
STRIPE_KEY=sk_test_XXXXXXXXXXXXXXXX
EOF

# True Negative（検出されないべき）
cat > test-tn.txt <<'EOF'
OPENAI_API_KEY=example
AWS_ACCESS_KEY_ID=your-key-here
STRIPE_KEY=sk_test_1234
EOF

# False Positive候補（誤検知の可能性）
cat > test-fp.txt <<'EOF'
# This is an example in documentation
EXAMPLE_KEY=sk-proj-examplekeyfordemonstrationpurposesonly
EOF
```

**テスト実行**:

```bash
# git-secretsの場合
git secrets --scan .security-test/test-tp.txt  # ❌ 検出されるべき
git secrets --scan .security-test/test-tn.txt  # ✅ 検出されないべき
git secrets --scan .security-test/test-fp.txt  # ⚠️ 要確認

# gitleaksの場合
gitleaks detect --source .security-test/test-tp.txt --verbose  # ❌ 検出されるべき
gitleaks detect --source .security-test/test-tn.txt --verbose  # ✅ 検出されないべき
gitleaks detect --source .security-test/test-fp.txt --verbose  # ⚠️ 要確認

# クリーンアップ
rm -rf .security-test
```

### 2. 誤検知率の測定と調整

**メトリクス収集**:

```bash
# scripts/validate-security.mjsを使用
node .claude/skills/pre-commit-security/scripts/validate-security.mjs --test-mode
```

**許容範囲**:

| メトリクス       | 目標値 | 許容範囲 |
| ---------------- | ------ | -------- |
| True Positive率  | 100%   | ≥95%     |
| True Negative率  | 100%   | ≥98%     |
| False Positive率 | 0%     | ≤5%      |
| False Negative率 | 0%     | ≤2%      |

**調整方法**:

- False Positive高 → ホワイトリスト追加
- False Negative高 → パターン強化・追加

### 3. Git履歴スキャン

**既存リークの検出**:

```bash
# scripts/scan-history.mjsを使用
node .claude/skills/pre-commit-security/scripts/scan-history.mjs --verbose --report leak-report.json

# または手動実行
# git-secretsの場合
git secrets --scan-history

# gitleaksの場合
gitleaks detect --verbose --log-opts="--all" --report-path leak-report.json
```

**スキャン範囲**:

- デフォルト: 全ブランチ全履歴
- オプション: 特定ブランチ、特定期間のみ

### 4. リーク発見時の対応

**Critical/Highリスクの場合**:

1. **即座にシークレットを無効化**

   ```bash
   # AWS例
   aws iam delete-access-key --access-key-id AKIA...

   # OpenAI例
   # WebコンソールでAPIキーを削除
   ```

2. **影響範囲の調査**

   ```bash
   # コミット情報確認
   git log --all --grep="<leaked-secret>"

   # 公開されたブランチ確認
   git branch -r --contains <commit-hash>
   ```

3. **Git履歴からの削除**（チーム調整後）

   ```bash
   # BFG Repo-Cleaner使用
   brew install bfg
   bfg --delete-files credentials.json your-repo.git
   git push --force

   # または git filter-repo
   git filter-repo --path-match secrets/ --invert-paths
   ```

4. **インシデントレポート作成**
   - 漏洩したシークレットの種類
   - 漏洩期間（コミット日時）
   - 対応履歴（無効化、削除、影響調査）

**Medium/Lowリスクの場合**:

- シークレットローテーション
- 今後の検出強化

### 5. CI/CD統合準備

**GitHub Actions例**:

```yaml
# .github/workflows/security.yml
name: Secret Scan
on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
```

**参照**: See [references/ci-integration.md](../references/ci-integration.md) - CI/CD統合詳細ガイド

### 6. 検証レポート作成

**レポート内容**:

```markdown
# Pre-commit Security検証レポート

## 検出精度

- True Positive率: 98%
- False Positive率: 3%
- 調整内容: `.env.example`をホワイトリスト追加

## Git履歴スキャン結果

- スキャン範囲: 全ブランチ（過去12ヶ月）
- 検出数: 2件
  - [Critical] AWS Access Key in commit abc123 → 無効化済み
  - [Medium] OpenAI Key in commit def456 → ローテーション済み

## 改善提案

- Discord Webhookパターン追加推奨
- CI/CD統合を次スプリントで実施
```

## 成果物

1. **検証レポート** (Markdown形式)
   - 検出精度メトリクス
   - 誤検知率と調整内容
   - Git履歴スキャン結果
   - インシデント対応履歴（該当時）

2. **改善提案リスト**
   - パターン追加候補
   - ホワイトリスト調整
   - CI/CD統合計画

3. **CI/CD設定ファイル**（オプション）
   - `.github/workflows/security.yml` など

## 参照リソース

- See [references/ci-integration.md](../references/ci-integration.md) - CI/CD統合ガイド
- See [scripts/validate-security.mjs](../scripts/validate-security.mjs) - 検証スクリプト
- See [scripts/scan-history.mjs](../scripts/scan-history.mjs) - 履歴スキャンスクリプト

## 判断基準

### 完了条件

- True Positive率 ≥95%
- False Positive率 ≤5%
- Git履歴スキャン完了（リーク有無に関わらず）
- Critical/Highリスクのリークが対応済み
- 検証レポート作成完了

### 要継続改善条件

- 誤検知率が高い（>5%）→ Phase 2に戻る
- 検出漏れが多い（<95%）→ パターン追加
- Git履歴に未対応リークあり → インシデント対応継続

## 次のステップ

**完了後の運用**:

1. チーム全体への展開（configure-hooksの展開計画実行）
2. CI/CD統合（GitHub Actionsなど）
3. 定期的なパターン更新（四半期ごと推奨）
4. 使用記録: `node .claude/skills/pre-commit-security/scripts/log_usage.mjs --result success`
