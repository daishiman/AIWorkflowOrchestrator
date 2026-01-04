# Level 1: ジョブ出力の基礎概念

## 概要

GitHub Actionsのジョブ出力は、ワークフロー内のジョブ間でデータを共有するための仕組みです。
このドキュメントでは、ジョブ出力の基本概念と基礎的な使用方法を説明します。

## ジョブ出力とは

### 定義

ジョブ出力（Job Outputs）は、あるジョブで生成されたデータを、
同じワークフロー内の別のジョブに渡すための仕組みです。

### 主な用途

- ビルドバージョン番号の共有
- テスト結果の伝播
- デプロイURL の共有
- 条件分岐の判定結果の共有

## 基本構文

### outputs の定義

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      output1: ${{ steps.step1.outputs.test }}
      output2: ${{ steps.step2.outputs.result }}
    steps:
      - id: step1
        run: echo "test=hello" >> $GITHUB_OUTPUT
      - id: step2
        run: echo "result=success" >> $GITHUB_OUTPUT
```

### outputs の参照

```yaml
jobs:
  job1:
    # ... outputs 定義

  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - run: echo "Output1: ${{ needs.job1.outputs.output1 }}"
      - run: echo "Output2: ${{ needs.job1.outputs.output2 }}"
```

## 重要な概念

### needs キーワード

- `needs` は依存関係を定義するキーワード
- `needs: job1` と指定することで、job1 が完了してから job2 が実行される
- needs がないと、ジョブは並列実行され、outputs を参照できない

### GITHUB_OUTPUT

- 環境変数 `GITHUB_OUTPUT` はステップの出力を設定するためのファイルパス
- `echo "key=value" >> $GITHUB_OUTPUT` の形式で出力を設定
- deprecated な `::set-output` コマンドは使用しない（セキュリティリスク）

### DAG 構造

- ワークフローのジョブ依存関係は DAG（有向非巡回グラフ）を形成する必要がある
- 循環依存（job1 → job2 → job1）は不可能
- 並列実行可能なジョブは needs を設定しない

## 基本的な例

### 例1: ビルドバージョンの共有

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - id: version
        run: echo "version=$(date +%Y%m%d%H%M%S)" >> $GITHUB_OUTPUT

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

### 例2: テスト結果の伝播

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      passed: ${{ steps.test.outputs.result }}
    steps:
      - id: test
        run: |
          # テスト実行
          if [ $? -eq 0 ]; then
            echo "result=true" >> $GITHUB_OUTPUT
          else
            echo "result=false" >> $GITHUB_OUTPUT
          fi

  report:
    runs-on: ubuntu-latest
    needs: test
    if: needs.test.outputs.passed == 'true'
    steps:
      - run: echo "Tests passed!"
```

## よくある間違い

### 間違い1: needs なしで出力を参照

```yaml
# ❌ 間違い
jobs:
  job1:
    outputs:
      data: ${{ steps.step1.outputs.data }}
    steps:
      - id: step1
        run: echo "data=value" >> $GITHUB_OUTPUT

  job2:
    # needs が欠落
    steps:
      - run: echo "${{ needs.job1.outputs.data }}" # エラー
```

### 間違い2: set-output の使用

```yaml
# ❌ deprecated
steps:
  - run: echo "::set-output name=data::value"

# ✅ 正しい
steps:
  - run: echo "data=value" >> $GITHUB_OUTPUT
```

### 間違い3: 環境変数との混同

```yaml
# ❌ 環境変数はジョブ間で共有されない
jobs:
  job1:
    steps:
      - run: echo "DATA=value" >> $GITHUB_ENV

  job2:
    needs: job1
    steps:
      - run: echo "$DATA" # 空文字列
```

## ベストプラクティス

1. **明示的な needs 設定**: 出力を参照するジョブには必ず needs を設定
2. **GITHUB_OUTPUT の使用**: set-output は使用しない
3. **型の明確化**: 出力が文字列、真偽値、数値のどれかを明確にする
4. **デバッグログ**: 開発時は出力値を echo でログに出力して確認

## 次のステップ

- [Level 2: 実装パターンと事例](Level2_intermediate.md)
- [条件付き出力パターン](conditional-outputs.md)
- [needs依存関係詳細](needs-dependencies.md)
