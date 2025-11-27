# ロールバック手順

## 概要

アップグレードで問題が発生した場合に、
安全かつ迅速にシステムを以前の状態に戻すための手順を定義します。

## ロールバックの種類

### 1. 即時ロールバック（開発環境）

**条件**:
- ローカル開発環境での問題
- コミット前
- 他者に影響なし

**手順**:
```bash
# package.json と ロックファイルを元に戻す
git checkout HEAD -- package.json pnpm-lock.yaml

# node_modulesを再インストール
rm -rf node_modules
pnpm install

# 動作確認
pnpm test
```

### 2. ブランチロールバック（PR前）

**条件**:
- フィーチャーブランチでの問題
- PR作成前
- mainブランチに影響なし

**手順**:
```bash
# アップグレード前のコミットを確認
git log --oneline -10

# 特定のコミットに戻す
git reset --hard <commit-hash>

# または、特定ファイルのみを戻す
git checkout <commit-hash> -- package.json pnpm-lock.yaml
pnpm install
```

### 3. PRロールバック（マージ前）

**条件**:
- PRがレビュー中
- CIで問題が発見
- マージ前

**手順**:
```bash
# PRブランチをリセット
git fetch origin
git reset --hard origin/main

# 変更を再適用（問題のあるアップグレードを除く）
# ...
```

### 4. マージ後ロールバック

**条件**:
- PRがマージ済み
- 本番デプロイ前に問題発見
- 他のPRがマージされていない

**手順**:
```bash
# リバートコミットを作成
git revert <merge-commit-hash> -m 1

# または、マージを取り消し
git reset --hard <commit-before-merge>
git push --force-with-lease origin main  # 注意: 履歴が変わる
```

### 5. 本番ロールバック（緊急）

**条件**:
- 本番環境で問題発生
- 即座の対応が必要
- ダウンタイムを最小化

**手順**:
```bash
# 1. 問題のあるコミットをリバート
git revert HEAD --no-edit

# 2. テスト（最小限）
pnpm test --bail

# 3. 即座にデプロイ
# デプロイコマンドを実行

# 4. 後続で根本原因を調査
```

## 自動ロールバックの設定

### GitHub Actionsでの自動ロールバック

```yaml
name: Auto Rollback

on:
  workflow_dispatch:
    inputs:
      commit_to_revert:
        description: 'Commit hash to revert'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"

      - name: Revert Commit
        run: |
          git revert ${{ github.event.inputs.commit_to_revert }} --no-edit

      - name: Push Revert
        run: git push origin main
```

### デプロイ失敗時の自動ロールバック

```yaml
name: Deploy with Rollback

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Deploy
        id: deploy
        run: |
          # デプロイスクリプト
          ./deploy.sh
        continue-on-error: true

      - name: Health Check
        id: health
        run: |
          # ヘルスチェック
          curl -f https://api.example.com/health || exit 1
        continue-on-error: true

      - name: Rollback on Failure
        if: steps.deploy.outcome == 'failure' || steps.health.outcome == 'failure'
        run: |
          echo "Deployment failed, rolling back..."
          git revert HEAD --no-edit
          git push origin main
          ./deploy.sh
```

## ロールバック判断基準

### 即座にロールバックすべき場合

| 指標 | 閾値 |
|-----|-----|
| エラーレート | >5% |
| レスポンスタイム | 2倍以上 |
| 500エラー | 発生 |
| セキュリティアラート | 発生 |
| クリティカル機能の障害 | 発生 |

### ロールバック判断フロー

```
問題検出
  │
  ▼
ユーザー影響があるか？ ─Yes→ 即時ロールバック
  │No
  ▼
修正可能か？（30分以内）─No→ ロールバック
  │Yes
  ▼
修正を試行
  │
  ▼
修正成功？ ─No→ ロールバック
  │Yes
  ▼
モニタリング継続
```

## ロールバック後の対応

### 1. 原因調査

```bash
# 変更内容の確認
git diff <before-upgrade> <after-upgrade> -- package.json

# 依存関係の変更を確認
pnpm why <problematic-package>

# ログの確認
# アプリケーションログ、エラーログを確認
```

### 2. 修正計画の策定

```markdown
## ロールバック後の修正計画

### 原因
<!-- 問題の根本原因 -->

### 影響
<!-- 影響を受けた機能やユーザー -->

### 修正方針
<!-- 問題を解決するためのアプローチ -->

### 再試行の条件
<!-- 再度アップグレードを試行する条件 -->
```

### 3. 再アップグレードの準備

```bash
# 問題のあったパッケージのCHANGELOGを確認
# ...

# テストを追加
# ...

# 段階的なアプローチを検討
# ...
```

## 予防措置

### 1. 事前のロールバックテスト

```bash
# 定期的にロールバック手順をテスト
# 1. テスト用ブランチを作成
git checkout -b test-rollback

# 2. 何かをコミット
git commit --allow-empty -m "test commit"

# 3. ロールバックを実行
git revert HEAD --no-edit

# 4. 動作確認
pnpm install
pnpm test

# 5. テストブランチを削除
git checkout main
git branch -D test-rollback
```

### 2. ロールバックポイントの作成

```bash
# アップグレード前にタグを作成
git tag -a pre-upgrade-$(date +%Y%m%d) -m "Before dependency upgrade"

# ロールバック時に使用
git checkout pre-upgrade-20251127
```

### 3. 段階的デプロイ

```yaml
# カナリアデプロイの設定例
deploy:
  strategy: canary
  canary:
    steps:
      - setWeight: 10
      - pause: { duration: 5m }
      - setWeight: 50
      - pause: { duration: 10m }
      - setWeight: 100
```

## チェックリスト

### ロールバック前
- [ ] 問題の症状を記録したか？
- [ ] 影響範囲を特定したか？
- [ ] ロールバック対象を特定したか？
- [ ] チームに通知したか？

### ロールバック中
- [ ] 正しいコミットにリバートしているか？
- [ ] テストを実行したか？
- [ ] デプロイが成功したか？

### ロールバック後
- [ ] システムが正常に動作しているか？
- [ ] 原因調査を開始したか？
- [ ] インシデントレポートを作成したか？
- [ ] 再発防止策を検討したか？
