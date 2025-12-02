# GitHub Actions トラブルシューティングガイド

GitHub Actionsワークフローの一般的なエラーパターンと解決策を体系的に整理したガイドです。

## 1. 権限エラー (Permission Denied)

### 1.1 GITHUB_TOKEN 権限不足

**エラーメッセージ**:
```
Error: Resource not accessible by integration
Error: Permission denied
403 Forbidden
```

**原因**: GITHUB_TOKENに必要な権限が付与されていない

**解決策A: ジョブレベルで権限を設定**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write        # リポジトリへの書き込み
      pull-requests: write   # PRへの書き込み
      issues: write          # Issueへの書き込み
      packages: write        # パッケージ公開
    steps:
      - name: Deploy
        run: |
          # デプロイコマンド
```

**解決策B: ワークフローレベルで権限を設定**

```yaml
name: Deploy

on: [push]

permissions:
  contents: write
  deployments: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        # ...
```

**解決策C: リポジトリ設定を確認**

1. Settings → Actions → General
2. "Workflow permissions" セクション
3. "Read and write permissions" を選択
4. "Allow GitHub Actions to create and approve pull requests" にチェック

**権限スコープリファレンス**:

| スコープ | 用途 |
|---------|------|
| `contents: write` | コード、タグ、リリースの作成/更新 |
| `pull-requests: write` | PRの作成、コメント、マージ |
| `issues: write` | Issueの作成、コメント、クローズ |
| `packages: write` | GitHub Packagesへの公開 |
| `deployments: write` | デプロイメント作成 |
| `pages: write` | GitHub Pagesへのデプロイ |

### 1.2 ファイルシステム権限エラー

**エラーメッセージ**:
```
Permission denied: '/path/to/file'
EACCES: permission denied
```

**原因**: ファイル/ディレクトリのパーミッション不足

**解決策**:

```yaml
- name: Fix permissions
  run: |
    chmod +x ./scripts/deploy.sh
    chmod -R 755 ./build/

- name: Run script
  run: ./scripts/deploy.sh
```

## 2. キャッシュエラー (Cache Miss)

### 2.1 キャッシュがヒットしない

**エラーメッセージ**:
```
Cache not found for input keys: ...
```

**原因A: キャッシュキーの不一致**

**解決策**: キーを確認
```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    # ハッシュが一致するか確認
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

**原因B: キャッシュの有効期限切れ**

- GitHubのキャッシュは7日間で自動削除
- 解決策: restore-keys でフォールバック

```yaml
- name: Cache with fallback
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
      ${{ runner.os }}-
```

**原因C: パスが間違っている**

**解決策**: 正しいパスを指定

```yaml
# Node.js
path: ~/.pnpm
# または
path: node_modules

# Python
path: ~/.cache/pip

# Rust
path: |
  ~/.cargo/bin/
  ~/.cargo/registry/index/
  ~/.cargo/registry/cache/
  ~/.cargo/git/db/
  target/
```

### 2.2 キャッシュサイズ超過

**エラーメッセージ**:
```
Cache size exceeded limit of 10GB
```

**解決策A: キャッシュ対象を絞る**

```yaml
- name: Cache only essential
  uses: actions/cache@v4
  with:
    # 必要最小限のみキャッシュ
    path: |
      ~/.pnpm
      !~/.pnpm/_logs
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
```

**解決策B: 複数のキャッシュに分割**

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: node_modules
    key: deps-${{ hashFiles('package-lock.json') }}

- name: Cache build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: build-${{ github.sha }}
```

## 3. タイムアウトエラー

### 3.1 ジョブタイムアウト

**エラーメッセージ**:
```
The job running on runner ... has exceeded the maximum execution time of 360 minutes.
```

**原因**: ジョブが6時間（デフォルト）を超過

**解決策A: タイムアウトを延長**

```yaml
jobs:
  long-running:
    runs-on: ubuntu-latest
    timeout-minutes: 480  # 8時間（最大35日）
    steps:
      - name: Long task
        run: |
          # 長時間かかるタスク
```

**解決策B: ジョブを分割**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: pnpm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: pnpm test
```

### 3.2 ステップタイムアウト

**解決策**: ステップごとにタイムアウトを設定

```yaml
- name: Install dependencies
  timeout-minutes: 10
  run: pnpm install

- name: Run tests
  timeout-minutes: 30
  run: pnpm test
```

### 3.3 ネットワークタイムアウト

**エラーメッセージ**:
```
curl: (28) Operation timed out
pnpm ERR! network request timed out
```

**解決策**: リトライ処理を追加

```yaml
- name: Download with retry
  run: |
    for i in {1..3}; do
      curl -f -L -o file.tar.gz https://example.com/file.tar.gz && break
      echo "Retry $i/3..."
      sleep 5
    done
```

## 4. シークレットエラー

### 4.1 シークレットが見つからない

**エラーメッセージ**:
```
Warning: The secret MY_SECRET is not defined
```

**原因A: シークレットが未設定**

**解決策**: シークレットを設定

```bash
# CLI経由
gh secret set MY_SECRET --body "secret_value"

# または手動
# Settings → Secrets and variables → Actions → New repository secret
```

**原因B: スコープの問題**

- **リポジトリシークレット**: そのリポジトリのみ
- **環境シークレット**: 特定の環境でのみ使用可能
- **Organizationシークレット**: 複数リポジトリで共有

**解決策**: 正しいスコープで設定

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 環境シークレットを使用
    steps:
      - name: Deploy
        run: |
          echo "Deploying with ${{ secrets.PROD_KEY }}"
```

### 4.2 シークレットがフォークで使えない

**原因**: フォークからのPRではシークレットにアクセスできない（セキュリティ上の理由）

**解決策A: pull_request_target を使用（注意）**

```yaml
on:
  pull_request_target:  # フォークからもシークレットにアクセス可能

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ⚠️ セキュリティリスクあり - 慎重に使用
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
```

**解決策B: シークレット不要のワークフローを設計**

```yaml
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test without secrets
        run: pnpm test
```

## 5. チェックアウトエラー

### 5.1 リポジトリが見つからない

**エラーメッセージ**:
```
Error: Repository not found
```

**原因**: プライベートリポジトリへのアクセス権限不足

**解決策**: Personal Access Token (PAT) を使用

```yaml
- name: Checkout private repo
  uses: actions/checkout@v4
  with:
    repository: org/private-repo
    token: ${{ secrets.PAT }}
```

### 5.2 サブモジュールのチェックアウト失敗

**解決策**: サブモジュールを含めてチェックアウト

```yaml
- name: Checkout with submodules
  uses: actions/checkout@v4
  with:
    submodules: recursive
    token: ${{ secrets.PAT }}  # プライベートサブモジュール用
```

## 6. 依存関係エラー

### 6.1 依存関係のインストール失敗

**エラーメッセージ**:
```
pnpm ERR! 404 Not Found
pip install error: No matching distribution found
```

**解決策A: レジストリを確認**

```yaml
- name: Configure pnpm registry
  run: |
    echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc

- name: Install dependencies
  run: pnpm install
```

**解決策B: バージョンを固定**

```yaml
- name: Install specific version
  run: |
    pnpm install react@18.2.0
    pip install requests==2.28.0
```

### 6.2 バージョン互換性エラー

**解決策**: Node.jsバージョンを明示的に指定

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm ci
```

## 7. ビルドエラー

### 7.1 メモリ不足

**エラーメッセージ**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
JavaScript heap out of memory
```

**解決策A: Node.jsヒープサイズを増やす**

```yaml
- name: Build with more memory
  run: NODE_OPTIONS="--max_old_space_size=4096" pnpm run build
  env:
    NODE_OPTIONS: --max_old_space_size=4096
```

**解決策B: より大きなランナーを使用**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest-large  # GitHub Enterpriseで利用可能
    steps:
      - name: Build
        run: pnpm run build
```

### 7.2 ディスク容量不足

**エラーメッセージ**:
```
No space left on device
```

**解決策**: 不要なファイルを削除

```yaml
- name: Free disk space
  run: |
    sudo rm -rf /usr/share/dotnet
    sudo rm -rf /opt/ghc
    sudo rm -rf /usr/local/share/boost
    df -h

- name: Build
  run: pnpm run build
```

## 8. アーティファクトエラー

### 8.1 アーティファクトがアップロードできない

**エラーメッセージ**:
```
Error: Unable to upload artifact
```

**原因A: ファイルが存在しない**

**解決策**: ファイル存在確認

```yaml
- name: Build
  run: pnpm run build

- name: Check artifact
  run: |
    if [ ! -d "dist" ]; then
      echo "::error::Build directory not found"
      exit 1
    fi
    ls -la dist/

- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/
    if-no-files-found: error
```

**原因B: サイズ超過**

- 最大10GB（リポジトリ全体）
- 単一アーティファクト推奨: 1GB未満

**解決策**: アーティファクトを圧縮

```yaml
- name: Compress artifact
  run: tar -czf build.tar.gz dist/

- name: Upload compressed
  uses: actions/upload-artifact@v4
  with:
    name: build
    path: build.tar.gz
```

## 9. マトリックスビルドエラー

### 9.1 マトリックスの一部が失敗

**解決策**: continue-on-errorを使用

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
  fail-fast: false  # 他のジョブを継続

jobs:
  test:
    runs-on: ubuntu-latest
    continue-on-error: ${{ matrix.node == '22' }}  # Node.js 22は実験的
    strategy:
      matrix:
        node: ${{ matrix.node }}
```

### 9.2 マトリックスの組み合わせ爆発

**解決策**: excludeで不要な組み合わせを除外

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20]
    exclude:
      - os: macos-latest
        node: 18  # macOSではNode.js 18をスキップ
```

## 10. セルフホストランナーエラー

### 10.1 ランナーがオフライン

**エラーメッセージ**:
```
No runners online with the labels: self-hosted
```

**解決策**: ランナーの状態確認

```bash
# ランナーサービス確認
sudo systemctl status actions.runner.*

# ランナーログ確認
tail -f /path/to/runner/_diag/Runner_*.log
```

### 10.2 ランナーのディスク容量不足

**解決策**: 定期的なクリーンアップ

```yaml
- name: Clean runner workspace
  run: |
    cd ${{ runner.workspace }}
    ls -la
    # 古いワークスペースを削除
    find . -type d -mtime +7 -exec rm -rf {} +
```

---

**関連リソース**:
- [debug-logging.md](./debug-logging.md): デバッグログ有効化ガイド
- [diagnostic-commands.md](./diagnostic-commands.md): 診断コマンドリファレンス
