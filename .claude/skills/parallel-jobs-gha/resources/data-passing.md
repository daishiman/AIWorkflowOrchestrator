# Data Passing Between Jobs - GitHub Actions

GitHub Actionsのジョブ間データ受け渡しの詳細ガイド。

## データ受け渡しの方法

GitHub Actionsでは、主に2つの方法でジョブ間でデータを受け渡します:

1. **Outputs**: 文字列データ（環境変数、設定値など）
2. **Artifacts**: ファイル（ビルド成果物、レポートなど）

## Outputsを使用したデータ受け渡し

### 基本パターン

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      output1: ${{ steps.step1.outputs.value }}
    steps:
      - id: step1
        run: echo "value=hello" >> $GITHUB_OUTPUT

  job2:
    needs: job1
    runs-on: ubuntu-latest
    steps:
      - run: echo "Output from job1: ${{ needs.job1.outputs.output1 }}"
```

**ポイント**:
- `steps.<step_id>.outputs.<name>`でステップのoutputを参照
- `needs.<job_id>.outputs.<name>`で他ジョブのoutputを参照

### 複数Outputsの定義

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      commit: ${{ steps.commit.outputs.sha }}
      timestamp: ${{ steps.timestamp.outputs.time }}
    steps:
      - uses: actions/checkout@v4

      - id: version
        run: echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - id: commit
        run: echo "sha=${GITHUB_SHA::7}" >> $GITHUB_OUTPUT

      - id: timestamp
        run: echo "time=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Version: ${{ needs.build.outputs.version }}"
          echo "Commit: ${{ needs.build.outputs.commit }}"
          echo "Timestamp: ${{ needs.build.outputs.timestamp }}"
```

### JSON Outputsの受け渡し

```yaml
jobs:
  matrix-prep:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo 'matrix={"include":[{"os":"ubuntu-latest","node":"18"},{"os":"windows-latest","node":"20"}]}' >> $GITHUB_OUTPUT

  build:
    needs: matrix-prep
    runs-on: ${{ matrix.os }}
    strategy:
      matrix: ${{ fromJson(needs.matrix-prep.outputs.matrix) }}
    steps:
      - run: echo "Building on ${{ matrix.os }} with Node ${{ matrix.node }}"
```

### 複雑なデータの受け渡し

```yaml
jobs:
  analyze:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.coverage.outputs.percentage }}
      files-changed: ${{ steps.files.outputs.count }}
      test-results: ${{ steps.test.outputs.status }}
    steps:
      - uses: actions/checkout@v4

      - id: coverage
        run: |
          COVERAGE=$(npm test -- --coverage | grep "All files" | awk '{print $10}')
          echo "percentage=$COVERAGE" >> $GITHUB_OUTPUT

      - id: files
        run: |
          COUNT=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} | wc -l)
          echo "count=$COUNT" >> $GITHUB_OUTPUT

      - id: test
        run: |
          if npm test; then
            echo "status=passed" >> $GITHUB_OUTPUT
          else
            echo "status=failed" >> $GITHUB_OUTPUT
          fi

  report:
    needs: analyze
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Test Coverage: ${{ needs.analyze.outputs.coverage }}%"
          echo "Files Changed: ${{ needs.analyze.outputs.files-changed }}"
          echo "Test Status: ${{ needs.analyze.outputs.test-results }}"
```

## Artifactsを使用したファイル受け渡し

### 基本パターン

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - run: npm test
```

### 複数Artifactsの受け渡し

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      # ビルド成果物
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

      # テストカバレッジレポート
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      # ログファイル
      - uses: actions/upload-artifact@v4
        with:
          name: build-logs
          path: logs/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/

      - run: npm run deploy

  report:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - run: npm run report:coverage
```

### Artifactのパス指定

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      # 特定ファイルのみアップロード
      - uses: actions/upload-artifact@v4
        with:
          name: bundle
          path: |
            dist/*.js
            dist/*.css
            dist/assets/

      # 除外パターンの使用
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            dist/
            !dist/**/*.map
            !dist/**/*.test.js
```

### Artifact保持期間の設定

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      # 短期間保持（7日）
      - uses: actions/upload-artifact@v4
        with:
          name: logs
          path: logs/
          retention-days: 7

      # 長期間保持（90日）
      - uses: actions/upload-artifact@v4
        with:
          name: release-build
          path: dist/
          retention-days: 90
```

## 高度なパターン

### パターン1: ビルドマトリックスからの集約

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}-node${{ matrix.node }}
          path: dist/

  aggregate:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # すべてのArtifactsをダウンロード
      - uses: actions/download-artifact@v4

      - run: |
          echo "Aggregating builds..."
          ls -R
```

### パターン2: キャッシュとArtifactsの併用

```yaml
jobs:
  dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # キャッシュで依存関係を共有
      - uses: actions/cache@v4
        id: cache
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - if: steps.cache.outputs.cache-hit != 'true'
        run: npm ci

  build:
    needs: dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # キャッシュから依存関係を復元
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - run: npm run build

      # Artifactでビルド成果物を共有
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # キャッシュから依存関係を復元
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      # Artifactからビルド成果物を取得
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - run: npm test
```

### パターン3: 条件付きArtifactダウンロード

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - run: npm run deploy:staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - run: npm run deploy:production
```

### パターン4: Outputsによる動的Artifact名

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact-name: ${{ steps.name.outputs.name }}
    steps:
      - uses: actions/checkout@v4

      - id: name
        run: |
          VERSION=$(node -p "require('./package.json').version")
          NAME="build-v${VERSION}-${GITHUB_SHA::7}"
          echo "name=$NAME" >> $GITHUB_OUTPUT

      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ steps.name.outputs.name }}
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: ${{ needs.build.outputs.artifact-name }}
          path: dist/

      - run: npm run deploy
```

## ベストプラクティス

### 1. Outputsの使用

✅ **良い例**: 小さなデータ（文字列、数値）

```yaml
outputs:
  version: ${{ steps.version.outputs.version }}
  status: ${{ steps.test.outputs.status }}
```

❌ **悪い例**: 大きなデータ（ファイル内容）

```yaml
outputs:
  file-content: ${{ steps.read.outputs.content }}  # 大きすぎる
```

### 2. Artifactsの使用

✅ **良い例**: ファイルとバイナリ

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist/
```

❌ **悪い例**: 単純な文字列

```yaml
- run: echo "version=1.0.0" > version.txt
- uses: actions/upload-artifact@v4
  with:
    name: version
    path: version.txt  # Outputsを使うべき
```

### 3. Artifact名の命名規則

✅ **良い例**: 明確で一意な名前

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-${{ matrix.os }}-node${{ matrix.node }}
    path: dist/
```

❌ **悪い例**: 曖昧な名前

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: output  # 曖昧
    path: dist/
```

### 4. 不要なファイルの除外

✅ **良い例**: 必要なファイルのみ

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: |
      dist/
      !dist/**/*.map
      !dist/**/*.test.js
```

❌ **悪い例**: すべてのファイル

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: all
    path: .  # 巨大なArtifact
```

## パフォーマンス最適化

### 1. Artifact圧縮

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      # 圧縮してからアップロード
      - run: tar -czf dist.tar.gz dist/

      - uses: actions/upload-artifact@v4
        with:
          name: dist-compressed
          path: dist.tar.gz

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist-compressed

      - run: tar -xzf dist.tar.gz
      - run: npm run deploy
```

### 2. 並列Artifactアップロード

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      # 並列アップロード（GitHub Actionsが自動的に並列化）
      - uses: actions/upload-artifact@v4
        with:
          name: frontend
          path: dist/frontend/

      - uses: actions/upload-artifact@v4
        with:
          name: backend
          path: dist/backend/

      - uses: actions/upload-artifact@v4
        with:
          name: docs
          path: dist/docs/
```

### 3. キャッシュの優先使用

依存関係など、変更頻度が低いデータはArtifactsよりキャッシュを使用:

```yaml
# ✅ 良い例: キャッシュ使用
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# ❌ 悪い例: Artifact使用
- uses: actions/upload-artifact@v4
  with:
    name: node_modules
    path: node_modules/  # 非効率
```

## トラブルシューティング

### Outputが空になる

**原因**: `GITHUB_OUTPUT`への書き込み失敗

```yaml
# ❌ 間違い
- run: echo "value=hello"

# ✅ 正しい
- run: echo "value=hello" >> $GITHUB_OUTPUT
```

### Artifactが見つからない

**原因**: アップロード前にダウンロード試行

```yaml
# ✅ 正しい依存関係
jobs:
  build:
    steps:
      - uses: actions/upload-artifact@v4

  test:
    needs: build  # 重要: needsで依存関係を明示
    steps:
      - uses: actions/download-artifact@v4
```

### Artifactサイズ制限

**制限**: 単一Artifact最大10GB、ワークフロー合計最大50GB

**解決**: 不要なファイルを除外、圧縮を使用

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: |
      dist/
      !dist/**/*.map
      !dist/**/node_modules/
```

---

**関連リソース**:
- [job-dependencies.md](./job-dependencies.md) - ジョブ依存関係管理
- [templates/parallel-workflow.yaml](../templates/parallel-workflow.yaml) - 実装例
