# Level 3: マトリックス戦略と出力集約

## 概要

このドキュメントでは、マトリックス戦略を使用した複雑なワークフローと、
複数ジョブからの出力を効率的に集約する高度なパターンを解説します。

## マトリックス戦略の基本

### 動的マトリックス生成

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set.outputs.matrix }}
    steps:
      - id: set
        run: |
          # ディレクトリから動的に生成
          matrix=$(ls -d packages/* | jq -R -s -c 'split("\n")[:-1]')
          echo "matrix=$matrix" >> $GITHUB_OUTPUT

  build:
    needs: prepare
    strategy:
      matrix:
        package: ${{ fromJSON(needs.prepare.outputs.matrix) }}
    steps:
      - run: echo "ビルド中: ${{ matrix.package }}"
```

### マトリックス出力の制限

マトリックスジョブの `outputs` には重要な制限があります：

- 最後に完了したジョブの出力のみが取得可能
- 全マトリックスの結果が必要な場合はアーティファクトを使用

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu, windows, macos]
    outputs:
      # 警告: 最後のジョブの結果のみ
      result: ${{ steps.build.outputs.result }}
    steps:
      - id: build
        run: echo "result=${{ matrix.os }}-done" >> $GITHUB_OUTPUT
```

## 出力集約パターン

### パターン1: アーティファクトによる集約

```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [api, web, worker]
    steps:
      - name: ビルド結果を保存
        run: |
          mkdir -p results
          echo "status=success" > results/${{ matrix.service }}.json
          echo "version=1.0.0" >> results/${{ matrix.service }}.json

      - uses: actions/upload-artifact@v4
        with:
          name: result-${{ matrix.service }}
          path: results/

  aggregate:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: result-*
          merge-multiple: true
          path: all-results

      - name: 集約処理
        run: |
          for f in all-results/*.json; do
            echo "=== $(basename $f) ==="
            cat "$f"
          done
```

### パターン2: JSON配列での集約

```yaml
jobs:
  prepare:
    outputs:
      services: '["api", "web", "worker"]'

  build:
    needs: prepare
    strategy:
      matrix:
        service: ${{ fromJSON(needs.prepare.outputs.services) }}
    steps:
      - id: result
        run: |
          result='{"service":"${{ matrix.service }}","status":"success"}'
          echo "json=$result" >> $GITHUB_OUTPUT

      - uses: actions/upload-artifact@v4
        with:
          name: json-${{ matrix.service }}
          path: |
            echo '${{ steps.result.outputs.json }}' > result.json

  merge:
    needs: build
    outputs:
      all-results: ${{ steps.merge.outputs.json }}
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: json-*
          merge-multiple: true

      - id: merge
        run: |
          results=$(cat *.json | jq -s '.')
          echo "json=$results" >> $GITHUB_OUTPUT
```

## 条件付きマトリックス

### 特定条件での実行制御

```yaml
jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            deploy: true
          - os: windows-latest
            deploy: false
          - os: macos-latest
            deploy: false
    steps:
      - run: echo "ビルド中: ${{ matrix.os }}"

  deploy:
    needs: build
    if: contains(needs.build.outputs.*, 'deploy=true')
    steps:
      - run: echo "デプロイ実行"
```

## パフォーマンス最適化

### 並列実行の最大化

```yaml
jobs:
  # 独立したジョブは並列実行
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: echo "リント実行"

  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "テスト実行"

  # 両方の完了を待つ
  deploy:
    needs: [lint, test]
    steps:
      - run: echo "デプロイ"
```

### fail-fast の制御

```yaml
jobs:
  build:
    strategy:
      fail-fast: false # 他のジョブが失敗しても継続
      matrix:
        os: [ubuntu, windows, macos]
    steps:
      - run: echo "ビルド中"
```

## ベストプラクティス

1. **マトリックス出力の制限を理解**: 全結果が必要ならアーティファクトを使用
2. **fail-fast の意図的な設定**: デバッグ時は false、本番は true
3. **動的マトリックス**: 柔軟性が必要な場合に活用
4. **並列実行の最大化**: 独立したジョブは needs を設定しない

## 次のステップ

- [Level 4: 最適化とトラブルシューティング](Level4_expert.md)
- [出力参照パターン](output-consumption.md)
