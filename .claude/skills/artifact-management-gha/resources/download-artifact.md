# Download Artifact 詳細

## actions/download-artifact@v4

### 基本構文

```yaml
- uses: actions/download-artifact@v4
  with:
    name: artifact-name          # オプション: 特定のアーティファクト名（省略時は全て）
    path: path/to/destination    # オプション: ダウンロード先（デフォルト: カレントディレクトリ）
    pattern: artifact-*          # オプション: パターンマッチング
    merge-multiple: false        # オプション: 複数アーティファクトをマージ
```

## ダウンロードパターン

### 単一アーティファクトダウンロード

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: ./dist
```

### 全アーティファクトダウンロード

```yaml
# nameを省略すると全てダウンロード
- uses: actions/download-artifact@v4
  with:
    path: ./artifacts
```

### パターンマッチング

```yaml
# 特定パターンにマッチするアーティファクトをダウンロード
- uses: actions/download-artifact@v4
  with:
    pattern: build-*
    path: ./builds
```

### 複数アーティファクトのマージ

```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: test-results-*
    merge-multiple: true  # 全て同じディレクトリにマージ
    path: ./all-test-results
```

## クロスジョブアクセス

### 同一ワークフロー内

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build  # buildジョブ完了後に実行
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: ./dist
      - name: Test
        run: pnpm test
```

### 複数ジョブ依存

```yaml
jobs:
  build:
    steps:
      - uses: actions/upload-artifact@v4
        with:
          name: app
          path: build/

  test-unit:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: app

  test-e2e:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: app

  deploy:
    needs: [test-unit, test-e2e]
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: app
```

## クロスワークフローアクセス

### GitHub API経由

```yaml
- name: Download artifact from another workflow
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    # 最新の成功したワークフローからアーティファクトをダウンロード
    gh run download --repo ${{ github.repository }} --name build-output
```

### workflow_run トリガー

```yaml
# .github/workflows/deploy.yml
on:
  workflow_run:
    workflows: ["Build"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          run-id: ${{ github.event.workflow_run.id }}
```

## 実践例

### マトリックスビルドのダウンロード

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - name: Build
        run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # 全プラットフォームのビルドをダウンロード
      - uses: actions/download-artifact@v4
        with:
          pattern: build-*
          path: ./all-builds
      - name: Test all builds
        run: |
          ls -R all-builds/
          # 各ビルドをテスト
```

### 条件付きダウンロード

```yaml
- name: Download production build
  if: github.ref == 'refs/heads/main'
  uses: actions/download-artifact@v4
  with:
    name: prod-build

- name: Download debug build
  if: github.ref != 'refs/heads/main'
  uses: actions/download-artifact@v4
  with:
    name: debug-build
```

### 再利用可能ワークフローでのダウンロード

```yaml
# .github/workflows/reusable-deploy.yml
on:
  workflow_call:
    inputs:
      artifact-name:
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: ${{ inputs.artifact-name }}
      - name: Deploy
        run: ./deploy.sh
```

## パス構造

### デフォルト構造

```yaml
# アップロード時
- uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: dist/

# ダウンロード時（pathを省略）
- uses: actions/download-artifact@v4
  with:
    name: my-artifact
# 結果: ./my-artifact/dist/ にダウンロード
```

### カスタムパス

```yaml
# ダウンロード先を指定
- uses: actions/download-artifact@v4
  with:
    name: my-artifact
    path: ./custom-location
# 結果: ./custom-location/ にダウンロード
```

### 複数アーティファクトの構造

```yaml
# 個別ディレクトリに配置（デフォルト）
- uses: actions/download-artifact@v4
  with:
    pattern: build-*
    path: ./builds
# 結果:
# ./builds/build-ubuntu/
# ./builds/build-windows/
# ./builds/build-macos/

# 同じディレクトリにマージ
- uses: actions/download-artifact@v4
  with:
    pattern: build-*
    merge-multiple: true
    path: ./builds
# 結果: ./builds/ に全てマージ
```

## パフォーマンス最適化

### 必要なアーティファクトのみダウンロード

```yaml
# 悪い例: 全てダウンロード
- uses: actions/download-artifact@v4

# 良い例: 必要なもののみ
- uses: actions/download-artifact@v4
  with:
    name: required-build
```

### 並列ダウンロード

```yaml
- name: Download artifacts in parallel
  uses: actions/download-artifact@v4
  with:
    pattern: build-*
    path: ./builds
# 内部的に並列ダウンロードされる
```

## トラブルシューティング

### エラー: "Artifact not found"

**原因**: アーティファクトが存在しないか、保持期間が過ぎた

**解決策**:
1. アップロードジョブが成功したか確認
2. アーティファクト名が正しいか確認
3. 保持期間内か確認

```yaml
- name: Check if artifact exists
  id: check-artifact
  continue-on-error: true
  uses: actions/download-artifact@v4
  with:
    name: build-output

- name: Build if artifact not found
  if: steps.check-artifact.outcome == 'failure'
  run: pnpm run build
```

### エラー: "Permission denied"

**原因**: クロスワークフローアクセス時の権限不足

**解決策**:
```yaml
permissions:
  actions: read  # アーティファクト読み取りに必要
  contents: read
```

### 警告: "Artifact download is slow"

**原因**: アーティファクトサイズが大きい

**解決策**:
1. 必要なファイルのみアップロード
2. アップロード時に圧縮レベルを上げる
3. 複数の小さいアーティファクトに分割

## ベストプラクティス

### エラーハンドリング

```yaml
- name: Try download artifact
  id: download
  continue-on-error: true
  uses: actions/download-artifact@v4
  with:
    name: optional-artifact

- name: Handle missing artifact
  if: steps.download.outcome == 'failure'
  run: echo "Artifact not found, using defaults"
```

### 条件付き実行

```yaml
# 特定ブランチのみダウンロード
- name: Download production artifact
  if: github.ref == 'refs/heads/main'
  uses: actions/download-artifact@v4
  with:
    name: prod-build

# PR のみダウンロード
- name: Download PR preview
  if: github.event_name == 'pull_request'
  uses: actions/download-artifact@v4
  with:
    name: pr-preview-${{ github.event.pull_request.number }}
```

### 検証とログ

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: ./dist

- name: Verify downloaded artifact
  run: |
    echo "Downloaded files:"
    ls -lah dist/

    # サイズチェック
    if [ $(du -sm dist/ | cut -f1) -gt 100 ]; then
      echo "Warning: Artifact is larger than 100MB"
    fi

    # 必須ファイルチェック
    if [ ! -f dist/index.js ]; then
      echo "Error: Missing index.js"
      exit 1
    fi
```

## 参考リンク

- [actions/download-artifact - GitHub Marketplace](https://github.com/marketplace/actions/download-a-build-artifact)
- [Downloading workflow artifacts](https://docs.github.com/en/actions/managing-workflow-runs/downloading-workflow-artifacts)
- [Using artifacts to share data between jobs](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts#passing-data-between-jobs-in-a-workflow)
