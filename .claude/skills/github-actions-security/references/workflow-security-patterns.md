# GitHub Actions Workflow Security Patterns

## セキュアなワークフロー設計

### パターン1: 最小権限トークン

```yaml
permissions:
  contents: read # コード読み取りのみ
  pull-requests: read # PR読み取りのみ
  # write権限は最小限に
```

**デフォルトは危険**:

```yaml
# ❌ 避ける: デフォルトのpermissions（広すぎる）
# permissions: write-all（暗黙的）

# ✅ 推奨: 明示的に最小権限を指定
permissions:
  contents: read
```

### パターン2: フォークPR制限

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    # フォークからのPRではSecretを使用しない
    if: github.event.pull_request.head.repo.full_name == github.repository

    steps:
      - uses: actions/checkout@v4
      - env:
          API_KEY: ${{ secrets.API_KEY }} # フォークPRでは空
        run: pnpm test
```

### パターン3: 依存関係の固定（Pinning）

```yaml
# ❌ 危険: タグ指定（可変）
- uses: actions/checkout@v4

# ✅ 推奨: SHAハッシュ指定（不変）
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

**理由**: タグは移動可能、SHAは不変で改ざん検知可能

## Secret露出防止パターン

### パターン1: 環境変数のみ使用

```yaml
# ✅ 正しい: envで注入
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh

# ❌ 間違い: コマンドライン引数（ログに露出）
- name: Deploy
  run: ./deploy.sh ${{ secrets.API_KEY }}
```

### パターン2: ファイル化禁止

```yaml
# ❌ 危険: Secretをファイルに書き込み
- run: echo "${{ secrets.API_KEY }}" > api-key.txt

# ✅ 安全: メモリ内のみ使用
- env:
    API_KEY: ${{ secrets.API_KEY }}
  run: ./script.sh # スクリプト内で$API_KEYを使用
```

### パターン3: アーティファクト除外

```yaml
# ❌ 危険
- run: cp .env artifact/
- uses: actions/upload-artifact@v4
  with:
    path: artifact/ # .envが含まれる！

# ✅ 安全
- run: cp config.json artifact/ # 非機密のみ
- uses: actions/upload-artifact@v4
  with:
    path: artifact/
```

## 環境保護パターン

### パターン1: 承認制デプロイ

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      # 環境設定で承認者を設定済み

    steps:
      - name: Deploy
        run: ./deploy.sh
```

**GitHub環境設定**:

```
Settings → Environments → production
→ Required reviewers: @devops-team
→ Wait timer: 5 minutes
```

### パターン2: ブランチ制限

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    # mainブランチのみ
    if: github.ref == 'refs/heads/main'

    environment: production

    steps:
      - name: Deploy
        run: ./deploy.sh
```

### パターン3: 手動トリガーのみ

```yaml
on:
  workflow_dispatch: # 手動実行のみ
    inputs:
      environment:
        required: true
        type: choice
        options: [staging, production]

jobs:
  deploy:
    environment: ${{ github.event.inputs.environment }}
```

## CI/CD品質ゲートパターン

### パターン1: 連鎖ゲート

```yaml
jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: gitleaks/gitleaks-action@v2

  lint:
    needs: secret-scan # secret-scan成功後のみ
    steps:
      - run: pnpm run lint

  test:
    needs: lint # lint成功後のみ
    steps:
      - run: pnpm test

  deploy:
    needs: [secret-scan, lint, test] # すべて成功後のみ
```

### パターン2: 失敗時の停止

```yaml
deploy:
  needs: test
  if: success() # 前ジョブ成功時のみ実行
```

### パターン3: 必須チェック

```
Branch protection rules（main）:
✅ Require status checks to pass
   - secret-scan
   - lint
   - test
   - build
```

## 通知パターン

### パターン1: 成功/失敗通知

```yaml
- name: Notify
  if: always() # 成功・失敗両方
  env:
    WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
  run: |
    STATUS="${{ job.status }}"
    COLOR=$([[ "$STATUS" == "success" ]] && echo "3066993" || echo "15158332")

    curl -X POST "$WEBHOOK" -H "Content-Type: application/json" -d "{
      \"embeds\": [{
        \"title\": \"$STATUS\",
        \"color\": $COLOR
      }]
    }"
```

### パターン2: 環境別通知先

```yaml
- name: Notify
  env:
    WEBHOOK: ${{ github.environment == 'production' && secrets.PROD_WEBHOOK || secrets.DEV_WEBHOOK }}
  run: curl -X POST "$WEBHOOK" -d "{\"content\":\"Deployed\"}"
```

## Secret Rotation統合

### パターン1: Rotation検証ワークフロー

```yaml
name: Validate Secrets

on:
  schedule:
    - cron: "0 0 * * 0" # 毎週日曜

jobs:
  validate:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Test Secrets
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          # データベース接続確認
          psql "$DATABASE_URL" -c "SELECT 1"

          # API Key確認
          curl -H "Authorization: Bearer $API_KEY" https://api.example.com/test
```

### パターン2: Rotation通知

```yaml
- name: Rotation Reminder
  if: failure()
  run: |
    echo "::warning::Secret validation failed - rotation may be needed"
```

## セキュリティベストプラクティス

1. **permissions最小化**: 必要な権限のみ指定
2. **依存関係固定**: SHAハッシュでpin
3. **フォーク制限**: フォークPRでSecretを使用しない
4. **環境分離**: Environment Secretsを使用
5. **承認制デプロイ**: 本番は必ず承認
6. **ログマスキング確認**: Secretがログに露出しないか確認
7. **アーティファクト保護**: Secretを含むファイルをアップロードしない
