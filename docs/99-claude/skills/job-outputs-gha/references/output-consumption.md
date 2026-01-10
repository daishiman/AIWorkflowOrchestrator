# 出力参照パターン

## 概要

このドキュメントでは、ジョブ出力を後続ジョブで参照・利用する
様々なパターンを解説します。

## 基本的な参照方法

### 単一ジョブからの参照

```yaml
jobs:
  producer:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=1.0.0" >> $GITHUB_OUTPUT

  consumer:
    runs-on: ubuntu-latest
    needs: producer
    steps:
      # 式として参照
      - run: echo "バージョン: ${{ needs.producer.outputs.version }}"

      # 環境変数として使用
      - run: echo "VERSION=${{ needs.producer.outputs.version }}" >> $GITHUB_ENV

      # 条件分岐で使用
      - if: needs.producer.outputs.version != ''
        run: echo "バージョンが設定されています"
```

### 複数ジョブからの参照

```yaml
jobs:
  build:
    outputs:
      image: ${{ steps.build.outputs.image }}

  test:
    outputs:
      coverage: ${{ steps.test.outputs.coverage }}

  deploy:
    needs: [build, test]
    steps:
      - run: |
          echo "イメージ: ${{ needs.build.outputs.image }}"
          echo "カバレッジ: ${{ needs.test.outputs.coverage }}%"
```

## 様々なコンテキストでの使用

### ステップ条件での使用

```yaml
jobs:
  consumer:
    needs: producer
    steps:
      - name: 条件付き実行
        if: needs.producer.outputs.should-run == 'true'
        run: echo "実行されました"
```

### 環境変数への設定

```yaml
jobs:
  consumer:
    needs: producer
    steps:
      - name: 環境変数に設定
        run: |
          echo "API_VERSION=${{ needs.producer.outputs.version }}" >> $GITHUB_ENV

      - name: 環境変数を使用
        run: |
          echo "APIバージョン: $API_VERSION"
```

### GitHub environment での使用

```yaml
jobs:
  setup:
    outputs:
      environment: ${{ steps.env.outputs.name }}

  deploy:
    needs: setup
    environment: ${{ needs.setup.outputs.environment }}
    steps:
      - run: echo "デプロイ先: ${{ needs.setup.outputs.environment }}"
```

## JSON出力の処理

### fromJSON による変換

```yaml
jobs:
  producer:
    outputs:
      config: ${{ steps.config.outputs.json }}
    steps:
      - id: config
        run: |
          echo 'json={"replicas":3,"memory":"4Gi"}' >> $GITHUB_OUTPUT

  consumer:
    needs: producer
    steps:
      # jq で処理
      - run: |
          config='${{ needs.producer.outputs.config }}'
          replicas=$(echo "$config" | jq -r '.replicas')
          echo "レプリカ数: $replicas"

      # fromJSON で直接アクセス
      - run: |
          echo "メモリ: ${{ fromJSON(needs.producer.outputs.config).memory }}"
```

### 配列としての使用

```yaml
jobs:
  producer:
    outputs:
      services: '["api", "web", "worker"]'

  consumer:
    needs: producer
    strategy:
      matrix:
        service: ${{ fromJSON(needs.producer.outputs.services) }}
    steps:
      - run: echo "サービス: ${{ matrix.service }}"
```

## 出力の検証

### 必須出力のチェック

```yaml
jobs:
  consumer:
    needs: producer
    steps:
      - name: 出力の検証
        run: |
          version="${{ needs.producer.outputs.version }}"
          if [ -z "$version" ]; then
            echo "エラー: バージョンが設定されていません"
            exit 1
          fi
          echo "バージョン検証OK: $version"
```

### 型の検証

```yaml
jobs:
  consumer:
    needs: producer
    steps:
      - name: JSON出力の検証
        run: |
          config='${{ needs.producer.outputs.config }}'
          if ! echo "$config" | jq -e . > /dev/null 2>&1; then
            echo "エラー: 無効なJSON形式"
            exit 1
          fi
          echo "JSON検証OK"
```

## エラーハンドリング

### 安全なデフォルト値

```yaml
jobs:
  consumer:
    needs: producer
    steps:
      - run: |
          # 空の場合はデフォルト値を使用
          version="${{ needs.producer.outputs.version || 'unknown' }}"
          echo "バージョン: $version"
```

### 失敗したジョブの出力

```yaml
jobs:
  producer:
    outputs:
      status: ${{ steps.check.outputs.status }}

  consumer:
    needs: producer
    if: always() # producer が失敗しても実行
    steps:
      - run: |
          status="${{ needs.producer.outputs.status }}"
          result="${{ needs.producer.result }}"
          echo "ステータス: $status, 結果: $result"
```

## ベストプラクティス

1. **明示的な needs**: 出力を参照する際は必ず needs を設定
2. **空チェック**: オプション出力は必ず空チェック
3. **型変換**: JSON は fromJSON で安全に変換
4. **エラーハンドリング**: 必須出力が欠損した場合の処理を実装
5. **デバッグ出力**: 開発時は受け取った値をログに出力
