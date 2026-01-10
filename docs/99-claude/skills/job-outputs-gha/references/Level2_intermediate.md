# Level 2: 実装パターンと事例

## 概要

このドキュメントでは、実務で頻繁に使用されるジョブ出力の実装パターンと、
具体的な事例を通じて実践的な知識を提供します。

## 実装パターン

### パターン1: 複数出力の定義

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      commit-sha: ${{ steps.version.outputs.sha }}
      build-time: ${{ steps.version.outputs.time }}
      artifact-url: ${{ steps.upload.outputs.url }}
    steps:
      - id: version
        run: |
          echo "version=$(cat VERSION)" >> $GITHUB_OUTPUT
          echo "sha=${{ github.sha }}" >> $GITHUB_OUTPUT
          echo "time=$(date -Iseconds)" >> $GITHUB_OUTPUT

      - id: upload
        run: echo "url=https://example.com/artifact" >> $GITHUB_OUTPUT
```

### パターン2: 条件付き出力

```yaml
jobs:
  check:
    runs-on: ubuntu-latest
    outputs:
      should-deploy: ${{ steps.check.outputs.deploy }}
    steps:
      - id: check
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "deploy=true" >> $GITHUB_OUTPUT
          else
            echo "deploy=false" >> $GITHUB_OUTPUT
          fi

  deploy:
    runs-on: ubuntu-latest
    needs: check
    if: needs.check.outputs.should-deploy == 'true'
    steps:
      - run: echo "Deploying to production..."
```

### パターン3: JSON 出力

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.config.outputs.json }}
    steps:
      - id: config
        run: |
          config='{"env":"production","replicas":3,"region":"us-east-1"}'
          echo "json=$config" >> $GITHUB_OUTPUT

  deploy:
    runs-on: ubuntu-latest
    needs: prepare
    steps:
      - run: |
          config='${{ needs.prepare.outputs.config }}'
          env=$(echo $config | jq -r .env)
          replicas=$(echo $config | jq -r .replicas)
          echo "Deploying to $env with $replicas replicas"
```

## 実務事例

### 事例1: ビルド・テスト・デプロイパイプライン

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      image-tag: ${{ steps.build.outputs.tag }}
    steps:
      - id: version
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT

      - id: build
        run: |
          tag="myapp:${{ steps.version.outputs.version }}"
          docker build -t $tag .
          echo "tag=$tag" >> $GITHUB_OUTPUT

  test:
    runs-on: ubuntu-latest
    needs: build
    outputs:
      test-result: ${{ steps.test.outputs.result }}
      coverage: ${{ steps.test.outputs.coverage }}
    steps:
      - id: test
        run: |
          # テスト実行
          echo "result=passed" >> $GITHUB_OUTPUT
          echo "coverage=85" >> $GITHUB_OUTPUT

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]
    if: needs.test.outputs.test-result == 'passed'
    steps:
      - run: |
          echo "Deploying ${{ needs.build.outputs.image-tag }}"
          echo "Test coverage: ${{ needs.test.outputs.coverage }}%"
```

### 事例2: マルチ環境デプロイ

```yaml
jobs:
  determine-environment:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.env.outputs.name }}
      deploy-url: ${{ steps.env.outputs.url }}
    steps:
      - id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "name=production" >> $GITHUB_OUTPUT
            echo "url=https://prod.example.com" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "name=staging" >> $GITHUB_OUTPUT
            echo "url=https://staging.example.com" >> $GITHUB_OUTPUT
          else
            echo "name=development" >> $GITHUB_OUTPUT
            echo "url=https://dev.example.com" >> $GITHUB_OUTPUT
          fi

  deploy:
    runs-on: ubuntu-latest
    needs: determine-environment
    environment: ${{ needs.determine-environment.outputs.environment }}
    steps:
      - run: echo "Deploying to ${{ needs.determine-environment.outputs.deploy-url }}"
```

### 事例3: 動的ジョブ生成

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.matrix.outputs.value }}
    steps:
      - id: matrix
        run: |
          # ディレクトリから動的にマトリックスを生成
          matrix=$(ls -d services/* | jq -R -s -c 'split("\n")[:-1]')
          echo "value=$matrix" >> $GITHUB_OUTPUT

  build:
    runs-on: ubuntu-latest
    needs: prepare
    strategy:
      matrix:
        service: ${{ fromJSON(needs.prepare.outputs.matrix) }}
    steps:
      - run: echo "Building ${{ matrix.service }}"
```

## デバッグパターン

### デバッグ用出力の追加

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      data: ${{ steps.process.outputs.data }}
    steps:
      - id: process
        run: |
          data="some-value"
          echo "data=$data" >> $GITHUB_OUTPUT
          echo "::debug::Output data set to: $data"  # デバッグログ

  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - name: Debug outputs
        run: |
          echo "Received data: ${{ needs.job1.outputs.data }}"
          echo "::debug::Data type: $(echo '${{ needs.job1.outputs.data }}' | jq -r type)"
```

## エラーハンドリングパターン

### 出力の存在確認

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      optional-data: ${{ steps.check.outputs.data }}
    steps:
      - id: check
        run: |
          if [ some-condition ]; then
            echo "data=value" >> $GITHUB_OUTPUT
          fi
          # 条件に合わない場合、出力は空文字列

  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - name: Use output safely
        run: |
          data="${{ needs.job1.outputs.optional-data }}"
          if [ -z "$data" ]; then
            echo "No data provided, using default"
            data="default-value"
          fi
          echo "Using data: $data"
```

## パフォーマンス最適化

### 並列実行の活用

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.config.outputs.json }}
    steps:
      - id: config
        run: echo 'json={"key":"value"}' >> $GITHUB_OUTPUT

  # これらのジョブは並列実行される
  build-frontend:
    runs-on: ubuntu-latest
    needs: prepare
    steps:
      - run: echo "Building frontend with ${{ needs.prepare.outputs.config }}"

  build-backend:
    runs-on: ubuntu-latest
    needs: prepare
    steps:
      - run: echo "Building backend with ${{ needs.prepare.outputs.config }}"

  # 両方の完了を待つ
  deploy:
    runs-on: ubuntu-latest
    needs: [build-frontend, build-backend, prepare]
    steps:
      - run: echo "Deploying with ${{ needs.prepare.outputs.config }}"
```

## ベストプラクティス

1. **出力名の命名規則**: ケバブケース（kebab-case）を使用
2. **型の一貫性**: 同じ出力は常に同じ型を返す
3. **デフォルト値**: オプション出力には空文字列チェックを実装
4. **デバッグログ**: 開発時は `::debug::` で出力値を記録
5. **JSON形式**: 複雑なデータ構造は JSON で表現

## よくある問題と解決策

| 問題                 | 原因                     | 解決策                           |
| -------------------- | ------------------------ | -------------------------------- |
| 出力が空文字列       | ステップIDが間違っている | steps.{id}.outputs.{name} を確認 |
| 出力が参照できない   | needs が設定されていない | needs: job-name を追加           |
| JSON が壊れている    | シングルクォートが必要   | jq -c でコンパクトJSON生成       |
| 条件分岐が動作しない | 型が一致しない           | 文字列比較 '==' を使用           |

## 次のステップ

- [Level 3: マトリックス戦略と出力集約](Level3_advanced.md)
- [出力参照パターン](output-consumption.md)
- [条件付き出力パターン](conditional-outputs.md)
